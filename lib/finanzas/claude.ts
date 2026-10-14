// Llamadas a Claude para Finanzas: leer un archivo (extracción) y escribir
// "tu análisis" (narrativa). Ambas con herramienta y esquema estrictos,
// validadas con zod y con un reintento.
//
// Privacidad: nunca se loguean contenidos, saldos ni el JSON extraído; solo
// el tipo de error. El único tercero que ve los datos es esta llamada.

import fs from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { AI_MODELS } from '@/lib/constants'
import { datosNarrativa, mencionaIA, narrativaSchema, numerosInventados, type Narrativa } from './narrativa'
import type { Plan } from './plan'

const MODELO = AI_MODELS.generation // 'claude-sonnet-4-6'

const RESTRICCION =
  'Esta herramienta solo ayuda a organizar la plata y el flujo de caja. No es asesoría financiera: ' +
  'nunca recomiendes productos financieros, inversiones, bancos, prestamistas, tarjetas de crédito, ' +
  'super funds ni marcas específicas.'

function cliente() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Falta ANTHROPIC_API_KEY')
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function logError(etapa: string, err: unknown) {
  const e = err as { status?: number; name?: string }
  console.error(`[FINANZAS] ${etapa} falló`, { status: e?.status ?? null, tipo: e?.name ?? 'Error' })
}

// ── Extracción ────────────────────────────────────────────────────────────
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const monto = z.number().finite()

export const extraccionSchema = z.object({
  cuentas: z.array(z.object({ nombre: z.string().min(1).max(120), saldo: monto, disponible: monto.nullable(), fecha: fecha.nullable() })).max(20),
  cuotas: z.array(z.object({ acreedor: z.string().min(1).max(120), fecha, monto: monto.positive() })).max(60),
  cargos_recurrentes: z
    .array(z.object({ comercio: z.string().min(1).max(120), monto: monto.positive(), frecuencia: z.enum(['semanal', 'quincenal', 'mensual', 'trimestral', 'anual']) }))
    .max(40),
  resumen_categorias: z.array(z.object({ categoria: z.string().min(1).max(60), total: monto })).max(30),
  periodo: z.object({ desde: fecha, hasta: fecha }).nullable(),
})
export type Extraccion = z.infer<typeof extraccionSchema>

const HERRAMIENTA_EXTRACCION: Anthropic.Tool = {
  name: 'registrar_datos',
  description: 'Registra los datos financieros visibles en el documento.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['cuentas', 'cuotas', 'cargos_recurrentes', 'resumen_categorias', 'periodo'],
    properties: {
      cuentas: {
        type: 'array',
        description: 'Cuentas con su saldo actual. available = disponible si aparece.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['nombre', 'saldo', 'disponible', 'fecha'],
          properties: {
            nombre: { type: 'string' },
            saldo: { type: 'number' },
            disponible: { type: ['number', 'null'] },
            fecha: { type: ['string', 'null'], description: 'Fecha del saldo, YYYY-MM-DD' },
          },
        },
      },
      cuotas: {
        type: 'array',
        description: 'Cuotas programadas de BNPL (Afterpay, StepPay, Zip…) o préstamos: una fila por cuota.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['acreedor', 'fecha', 'monto'],
          properties: { acreedor: { type: 'string' }, fecha: { type: 'string', description: 'YYYY-MM-DD' }, monto: { type: 'number' } },
        },
      },
      cargos_recurrentes: {
        type: 'array',
        description: 'Cobros que se repiten en el extracto (suscripciones, gym, celular…).',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['comercio', 'monto', 'frecuencia'],
          properties: {
            comercio: { type: 'string' },
            monto: { type: 'number' },
            frecuencia: { type: 'string', enum: ['semanal', 'quincenal', 'mensual', 'trimestral', 'anual'] },
          },
        },
      },
      resumen_categorias: {
        type: 'array',
        description: 'Solo para extractos: total gastado por categoría en el periodo.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['categoria', 'total'],
          properties: { categoria: { type: 'string' }, total: { type: 'number' } },
        },
      },
      periodo: {
        type: ['object', 'null'],
        additionalProperties: false,
        required: ['desde', 'hasta'],
        properties: { desde: { type: 'string' }, hasta: { type: 'string' } },
      },
    },
  },
}

const PROMPT_EXTRACCION =
  'Lee este pantallazo o extracto bancario (puede ser de un banco australiano o de una app BNPL) y llama a ' +
  'registrar_datos. Reglas: copia solo lo que se ve, no inventes ni estimes; montos en número positivo sin ' +
  'símbolo; fechas en YYYY-MM-DD (si el año no se ve, usa el más probable según el documento); si algo no ' +
  'aparece, deja la lista vacía o null. ' + RESTRICCION

// Algunos PDFs traen un BOM o bytes basura antes de "%PDF" y la API responde 400.
export function limpiarPdf(buf: Buffer): Buffer {
  const i = buf.subarray(0, 4096).indexOf('%PDF')
  return i > 0 ? buf.subarray(i) : buf
}

type ResultadoExtraccion = { ok: true; datos: Extraccion } | { ok: false; motivo: 'formato' | 'invalido' | 'error' }

export async function extraerArchivo(contenido: Buffer, mime: string): Promise<ResultadoExtraccion> {
  let bloque: Anthropic.ContentBlockParam
  if (mime === 'application/pdf') {
    bloque = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: limpiarPdf(contenido).toString('base64') } }
  } else if (mime === 'image/png' || mime === 'image/jpeg') {
    bloque = { type: 'image', source: { type: 'base64', media_type: mime, data: contenido.toString('base64') } }
  } else {
    return { ok: false, motivo: 'formato' } // HEIC que no se convirtió en el navegador
  }

  const anthropic = cliente()
  for (let intento = 0; intento < 2; intento++) {
    try {
      const msg = await anthropic.messages.create({
        model: MODELO,
        max_tokens: 4000,
        temperature: 0,
        tools: [HERRAMIENTA_EXTRACCION],
        tool_choice: { type: 'tool', name: HERRAMIENTA_EXTRACCION.name },
        messages: [{ role: 'user', content: [bloque, { type: 'text', text: PROMPT_EXTRACCION }] }],
      })
      const uso = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      const parsed = extraccionSchema.safeParse(uso?.input)
      if (parsed.success) return { ok: true, datos: parsed.data }
      console.error('[FINANZAS] extracción con formato inválido', { intento })
    } catch (err) {
      logError('extracción', err)
      if (intento === 1) return { ok: false, motivo: 'error' }
    }
  }
  return { ok: false, motivo: 'invalido' }
}

// ── Narrativa ─────────────────────────────────────────────────────────────
function principios(): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'lib', 'finanzas', 'principios.md'), 'utf8')
  } catch {
    return '(sin principios cargados)'
  }
}

const HERRAMIENTA_NARRATIVA: Anthropic.Tool = {
  name: 'entregar_analisis',
  description: 'Entrega el análisis corto del plan.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['esta_semana', 'riesgos', 'mensajes', 'recomendacion'],
    properties: {
      esta_semana: { type: 'string', description: 'La única cosa que importa esta semana. 1–2 frases.' },
      riesgos: { type: 'array', items: { type: 'string' }, description: '3 a 4 riesgos, en palabras simples, una frase cada uno.' },
      mensajes: {
        type: 'array',
        description: 'Hasta 3 mensajes listos para enviar (p. ej. pedirle a alguien que se le debe pasar a pagos quincenales). Vacío si no hace falta.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['para', 'texto'],
          properties: { para: { type: 'string' }, texto: { type: 'string' } },
        },
      },
      recomendacion: { type: 'string', description: 'UNA sola recomendación, no una lista de opciones.' },
    },
  },
}

function promptNarrativa(datos: unknown, rechazo?: string) {
  return [
    'Eres la voz de una herramienta de presupuesto. Escribe en español colombiano casual (tú, nunca vos), corto y directo, sin rodeos ni explicar de más.',
    RESTRICCION,
    'NÚMEROS: usa solo los montos y fechas que aparecen en el JSON, copiados tal cual (mismo formato). No sumes, restes, redondees ni calcules nada. Si un número no está en el JSON, no lo escribas.',
    'Nunca menciones inteligencia artificial, IA ni modelos: habla como "tu análisis".',
    'Estos son los principios que sigue esta herramienta. Apoya tus recomendaciones en ellos cuando apliquen, sin citar libros, autores ni inventar fuentes:',
    principios(),
    'Datos del plan (JSON):',
    JSON.stringify(datos, null, 1),
    rechazo ? `Tu respuesta anterior se rechazó: ${rechazo}. Corrígelo.` : '',
    'Llama a entregar_analisis.',
  ]
    .filter(Boolean)
    .join('\n\n')
}

export async function narrarPlan(plan: Plan): Promise<Narrativa | null> {
  const datos = datosNarrativa(plan)
  const anthropic = cliente()
  let rechazo: string | undefined
  for (let intento = 0; intento < 2; intento++) {
    try {
      const msg = await anthropic.messages.create({
        model: MODELO,
        max_tokens: 1500,
        temperature: 0.4,
        tools: [HERRAMIENTA_NARRATIVA],
        tool_choice: { type: 'tool', name: HERRAMIENTA_NARRATIVA.name },
        messages: [{ role: 'user', content: promptNarrativa(datos, rechazo) }],
      })
      const uso = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      const parsed = narrativaSchema.safeParse(uso?.input)
      if (!parsed.success) {
        rechazo = 'el formato no cumplía el esquema'
        continue
      }
      const inventados = numerosInventados(parsed.data, datos)
      if (inventados.length) {
        rechazo = `escribiste números que no están en el JSON: ${inventados.join(', ')}`
        continue
      }
      if (mencionaIA(parsed.data)) {
        rechazo = 'mencionaste inteligencia artificial'
        continue
      }
      return parsed.data
    } catch (err) {
      logError('narrativa', err)
      return null
    }
  }
  console.error('[FINANZAS] narrativa rechazada tras el reintento')
  return null
}
