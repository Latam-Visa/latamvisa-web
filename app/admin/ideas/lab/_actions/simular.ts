"use server"

import Anthropic from '@anthropic-ai/sdk'
import { AI_MODELS } from '@/lib/constants'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Reporte, SimularInput } from '../_components/types'

/* Simula un PANEL de personas reaccionando a una idea de negocio (estilo
   MiroFish, pero propio y seguro). Usa Claude con "tool use" para forzar una
   salida JSON estructurada (el Reporte). Guarda el resultado en Supabase si la
   tabla `ideas_lab` existe (si no, devuelve el reporte igual con guardado:false). */

// Esquema JSON que Claude DEBE rellenar (garantiza salida estructurada).
const REPORTE_TOOL: Anthropic.Tool = {
  name: 'reporte_panel',
  description: 'Entrega el resultado de simular un panel de personas reaccionando a la idea.',
  input_schema: {
    type: 'object',
    properties: {
      veredicto: { type: 'string', description: 'Veredicto en una sola frase, directo y honesto.' },
      confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
      adopcionPct: { type: 'integer', minimum: 0, maximum: 100, description: 'Cuántos del público objetivo lo considerarían en serio (%).' },
      conversionPct: { type: 'integer', minimum: 0, maximum: 100, description: 'Cuántos realmente comprarían con el enganche correcto (%).' },
      resumen: { type: 'string', description: '2-3 frases con la lectura general.' },
      personas: {
        type: 'array',
        minItems: 6,
        maxItems: 10,
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
        type: 'array',
        minItems: 3,
        maxItems: 6,
        items: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            interes: { type: 'string', enum: ['alto', 'medio', 'bajo'] },
            nota: { type: 'string' },
          },
          required: ['nombre', 'interes', 'nota'],
        },
      },
      objeciones: { type: 'array', items: { type: 'string' }, description: 'Principales objeciones a resolver.' },
      sensibilidadPrecio: { type: 'string', description: 'Cómo pesa el precio y cómo enmarcarlo.' },
      mensajes: { type: 'array', items: { type: 'string' }, description: 'Ángulos de mensaje/copys que mejor convierten.' },
      riesgos: { type: 'array', items: { type: 'string' } },
    },
    required: ['veredicto', 'confianza', 'adopcionPct', 'conversionPct', 'resumen', 'personas', 'segmentos', 'objeciones', 'sensibilidadPrecio', 'mensajes', 'riesgos'],
  },
}

export type SimularResultado =
  | { ok: true; reporte: Reporte; guardado: boolean; id?: string }
  | { ok: false; error: string }

export async function simularIdea(input: SimularInput): Promise<SimularResultado> {
  try {
    const titulo = (input.titulo || '').trim()
    const descripcion = (input.descripcion || '').trim()
    if (titulo.length < 3) return { ok: false, error: 'Dale un título a la idea.' }
    if (descripcion.length < 10) return { ok: false, error: 'Describe la idea con un poco más de detalle.' }

    if (!process.env.ANTHROPIC_API_KEY) {
      return { ok: false, error: 'Falta ANTHROPIC_API_KEY en el servidor.' }
    }

    const nPersonas = Math.min(9, Math.max(6, input.nPersonas || 7))
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const system = `Eres un MOTOR DE SIMULACIÓN DE MERCADO para LATAM VISA Travel, una agencia de viajes y visas que atiende a LATINOS QUE VIVEN EN AUSTRALIA (muchos vuelan a Latinoamérica para visitar familia, sobre todo entre diciembre y febrero).

Tu trabajo: ante una IDEA de negocio/oferta, simular un PANEL REALISTA de ~${nPersonas} personas representativas del público objetivo y predecir cómo reaccionarían. Luego agregas los resultados en un reporte accionable.

Reglas:
- Sé REALISTA y HONESTO, no complaciente. Incluye escépticos, gente sin plata, familias, solteros, mayores, estudiantes — variados por ciudad (Sídney, Melbourne, Brisbane, Perth, etc.), edad, ingreso y situación familiar.
- Razona como comportamiento humano plausible (plata, tiempo, días libres, hijos, nostalgia, logística, visas). NO inventes estadísticas de fuentes; tus números son ESTIMADOS de la simulación.
- adopcionPct = quiénes lo considerarían en serio; conversionPct = quiénes realmente comprarían (siempre menor).
- Da ángulos de mensaje concretos (copys) que funcionarían, y las objeciones reales a resolver.
- SÉ CONCISO para responder rápido: exactamente ${nPersonas} personas; cada "razon" en 1-2 frases; "objecion" y "queLoConvenceria" en una frase; "resumen" en 2 frases; listas de 3-5 ítems cortos.
- Responde SIEMPRE en español y SOLO llamando a la herramienta reporte_panel.`

    const userContent = `IDEA A SIMULAR
Título: ${titulo}
Descripción: ${descripcion}
Público objetivo: ${(input.publico || 'Latinos que viven en Australia').trim()}
Precio / oferta: ${(input.precio || 'No especificado').trim()}

Simula el panel y entrega el reporte.`

    const msg = await anthropic.messages.create({
      model: AI_MODELS.generation,
      max_tokens: 3200,
      temperature: 0.85,
      tools: [REPORTE_TOOL],
      tool_choice: { type: 'tool', name: 'reporte_panel' },
      system,
      messages: [{ role: 'user', content: userContent }],
    })

    const block = msg.content.find((b: any) => b.type === 'tool_use') as any
    if (!block || !block.input) {
      return { ok: false, error: 'El modelo no devolvió un reporte válido. Intenta de nuevo.' }
    }
    const reporte = block.input as Reporte

    // Guardar historial (si la tabla existe). Nunca romper por esto.
    let guardado = false
    let id: string | undefined
    try {
      const { data, error } = await supabaseAdmin
        .from('ideas_lab')
        .insert({
          titulo,
          descripcion,
          publico: (input.publico || '').trim() || null,
          precio: (input.precio || '').trim() || null,
          resultado: reporte,
          veredicto: reporte.veredicto,
          adopcion: reporte.adopcionPct,
        })
        .select('id')
        .single()
      if (!error && data) {
        guardado = true
        id = data.id as string
      }
    } catch {
      // tabla ausente u otro problema de persistencia: seguimos sin guardar
    }

    return { ok: true, reporte, guardado, id }
  } catch (error: any) {
    console.error('simularIdea error:', error)
    return { ok: false, error: error?.message || 'Algo falló al simular. Intenta de nuevo.' }
  }
}

export async function eliminarIdea(id: string): Promise<{ ok: boolean }> {
  try {
    await supabaseAdmin.from('ideas_lab').delete().eq('id', id)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
