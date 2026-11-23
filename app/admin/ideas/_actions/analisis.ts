"use server"

import Anthropic from '@anthropic-ai/sdk'
import { cookies } from 'next/headers'
import { AI_MODELS } from '@/lib/constants'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Reporte } from '../lab/_components/types'

/* Conecta el board de Ideas con el Laboratorio: ante una tarjeta del board,
   primero CLASIFICA si es una oferta a clientes que tenga sentido validar con
   un panel; si lo es, simula el panel (igual que el lab) y guarda el reporte.
   Se persiste en la tabla `ideas_lab` (que ya existe) marcando source:'board' y
   el taskId dentro del JSON `resultado`, así no hace falta migrar el esquema. */

function esAdmin(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  return Boolean(envPassword) && cookies().get('admin_auth')?.value === envPassword
}

const TOOL: Anthropic.Tool = {
  name: 'analisis_idea',
  description: 'Clasifica si la idea es una oferta a clientes y, si lo es, entrega el reporte del panel simulado.',
  input_schema: {
    type: 'object',
    properties: {
      aplica: { type: 'boolean', description: 'true SOLO si la idea es una oferta/producto/servicio/campaña dirigida a CLIENTES que tenga sentido validar con un panel de consumidores. false si es una tarea interna (desarrollo, admin, automatización, infra, procesos).' },
      motivoNoAplica: { type: 'string', description: 'Si aplica=false: una frase corta explicando por qué no es una oferta a clientes.' },
      veredicto: { type: 'string', description: 'Veredicto en una sola frase, directo y honesto.' },
      confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
      adopcionPct: { type: 'integer', minimum: 0, maximum: 100 },
      conversionPct: { type: 'integer', minimum: 0, maximum: 100 },
      resumen: { type: 'string', description: '2-3 frases con la lectura general.' },
      personas: {
        type: 'array', minItems: 6, maxItems: 10,
        items: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            perfil: { type: 'string', description: 'Edad, ciudad, ocupación, situación familiar, ingreso aprox.' },
            voto: { type: 'string', enum: ['sí', 'no', 'quizás'] },
            razon: { type: 'string' },
            objecion: { type: 'string' },
            queLoConvenceria: { type: 'string' },
          },
          required: ['nombre', 'perfil', 'voto', 'razon'],
        },
      },
      segmentos: {
        type: 'array', minItems: 3, maxItems: 6,
        items: {
          type: 'object',
          properties: { nombre: { type: 'string' }, interes: { type: 'string', enum: ['alto', 'medio', 'bajo'] }, nota: { type: 'string' } },
          required: ['nombre', 'interes', 'nota'],
        },
      },
      objeciones: { type: 'array', items: { type: 'string' } },
      sensibilidadPrecio: { type: 'string' },
      mensajes: { type: 'array', items: { type: 'string' } },
      riesgos: { type: 'array', items: { type: 'string' } },
    },
    required: ['aplica'],
  },
}

export type AnalizarInput = { taskId: string; title: string; description?: string | null; category?: string | null }
export type AnalizarResultado =
  | { ok: true; aplica: false; motivo: string }
  | { ok: true; aplica: true; reporte: Reporte }
  | { ok: false; error: string }

const PANEL_KEYS: (keyof Reporte)[] = ['veredicto', 'confianza', 'adopcionPct', 'conversionPct', 'resumen', 'personas', 'segmentos', 'objeciones', 'sensibilidadPrecio', 'mensajes', 'riesgos']

export async function analizarTarea(input: AnalizarInput, opts?: { force?: boolean }): Promise<AnalizarResultado> {
  try {
    if (!esAdmin()) return { ok: false, error: 'Sesión de admin expirada.' }
    const title = (input.title || '').trim()
    if (title.length < 3) return { ok: false, error: 'La idea no tiene título.' }
    if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: 'Falta ANTHROPIC_API_KEY en el servidor.' }

    // Si ya hay análisis para esta tarea y no se fuerza, no repetir.
    if (!opts?.force) {
      const { data: prev } = await supabaseAdmin
        .from('ideas_lab')
        .select('id, resultado')
        .eq('resultado->>taskId', input.taskId)
        .limit(1)
      if (prev && prev.length) {
        const res: any = prev[0].resultado
        if (res?.aplica === false) return { ok: true, aplica: false, motivo: res.motivoNoAplica || 'No es una oferta a clientes.' }
        return { ok: true, aplica: true, reporte: res as Reporte }
      }
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const system = `Eres un MOTOR DE SIMULACIÓN DE MERCADO para LATAM VISA Travel (agencia de viajes y visas para LATINOS QUE VIVEN EN AUSTRALIA, muchos vuelan a Latinoamérica dic–feb a ver a su familia).

Primero CLASIFICA la idea:
- aplica=true SOLO si es una OFERTA/PRODUCTO/SERVICIO/CAMPAÑA dirigida a CLIENTES (algo que un cliente consideraría comprar o usar).
- aplica=false si es una tarea INTERNA (desarrollo de software, panel de admin, automatizaciones/n8n, infraestructura, procesos internos, mejoras técnicas). En ese caso rellena SOLO 'aplica' y 'motivoNoAplica' (una frase) y NADA más.

Si aplica=true, simula un PANEL REALISTA de 6-8 personas representativas del público y entrega el reporte completo. Reglas del panel:
- Realista y honesto, no complaciente. Variado por ciudad (Sídney, Melbourne, Brisbane, Perth…), edad, ingreso y situación familiar.
- adopcionPct = quiénes lo considerarían en serio; conversionPct = quiénes realmente comprarían (siempre menor). Son ESTIMADOS de la simulación, no estadísticas reales.
- Conciso: cada 'razon' 1-2 frases; 'objecion'/'queLoConvenceria' una frase; 'resumen' 2 frases; listas de 3-5 ítems cortos.
- Responde SIEMPRE en español y SOLO llamando a la herramienta analisis_idea.`

    const userContent = `IDEA DEL BOARD
Título: ${title}
Descripción: ${(input.description || '').trim() || '(sin descripción)'}
Categoría: ${(input.category || 'General').trim()}

Clasifica y, si aplica, simula el panel.`

    const msg = await anthropic.messages.create({
      model: AI_MODELS.generation,
      max_tokens: 3200,
      temperature: 0.85,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'analisis_idea' },
      system,
      messages: [{ role: 'user', content: userContent }],
    })

    const block = msg.content.find((b: any) => b.type === 'tool_use') as any
    if (!block?.input) return { ok: false, error: 'El modelo no devolvió un análisis válido.' }
    const out = block.input as any

    // La columna descripcion es NOT NULL en ideas_lab → nunca null.
    const descripcion = (input.description || '').trim() || '(sin descripción)'

    if (out.aplica === false || !PANEL_KEYS.every((k) => out[k] != null)) {
      const motivo = (out.motivoNoAplica || 'No es una oferta a clientes.').trim()
      await guardar(title, descripcion, { source: 'board', taskId: input.taskId, aplica: false, motivoNoAplica: motivo }, null, null, opts?.force)
      return { ok: true, aplica: false, motivo }
    }

    const reporte: Reporte = {
      veredicto: out.veredicto, confianza: out.confianza, adopcionPct: out.adopcionPct, conversionPct: out.conversionPct,
      resumen: out.resumen, personas: out.personas, segmentos: out.segmentos, objeciones: out.objeciones,
      sensibilidadPrecio: out.sensibilidadPrecio, mensajes: out.mensajes, riesgos: out.riesgos || [],
    }
    await guardar(title, descripcion, { ...reporte, source: 'board', taskId: input.taskId }, reporte.veredicto, reporte.adopcionPct, opts?.force)
    return { ok: true, aplica: true, reporte }
  } catch (error: any) {
    console.error('analizarTarea error:', error)
    return { ok: false, error: error?.message || 'Algo falló al analizar.' }
  }
}

async function guardar(titulo: string, descripcion: string | null, resultado: any, veredicto: string | null, adopcion: number | null, force?: boolean) {
  try {
    if (force) {
      await supabaseAdmin.from('ideas_lab').delete().eq('resultado->>taskId', resultado.taskId)
    }
    await supabaseAdmin.from('ideas_lab').insert({ titulo, descripcion, publico: null, precio: null, resultado, veredicto, adopcion })
  } catch {
    // persistencia no crítica
  }
}
