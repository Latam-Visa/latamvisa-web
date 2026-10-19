import { supabaseAdmin } from '@/lib/supabase/admin'
import { dispatchTraduccion } from './dispatch'
import { PAIS_TRADUCCION_DEFAULT } from './shared'

export interface ResultadoEnvio {
  ok: boolean
  enviados: number
  error?: string
}

/* "Ya terminé": manda a n8n todo lo cargado y todavía sin enviar
   (documentos_lote.enviado_at IS NULL). Corre en el servidor, así que una vez
   que respondió, cerrar la pestaña ya no importa.

   Las filas se RESERVAN primero (enviado_at = now() en un solo UPDATE que
   devuelve lo que tomó) y recién después se dispara el webhook. Así un doble
   clic o dos pestañas no mandan los mismos archivos dos veces: el segundo
   UPDATE ya no encuentra pendientes. Si n8n falla, se devuelven a NULL para
   que se puedan reintentar. */
export async function enviarPendientes(loteId: string): Promise<ResultadoEnvio> {
  const { data: lote, error: errorLote } = await supabaseAdmin
    .from('lotes_traduccion')
    .select('id, pais')
    .eq('id', loteId)
    .maybeSingle()
  if (errorLote) return { ok: false, enviados: 0, error: 'No pudimos leer la traducción.' }
  if (!lote) return { ok: false, enviados: 0, error: 'No encontramos la traducción.' }

  const ahora = new Date().toISOString()
  const { data: tomadas, error } = await supabaseAdmin
    .from('documentos_lote')
    .update({ enviado_at: ahora })
    .eq('application_id', loteId)
    .is('enviado_at', null)
    .select('id, storage_path, nombre_original')

  if (error) {
    console.error('[TRADUCCIONES] Error reservando pendientes:', error)
    return { ok: false, enviados: 0, error: 'No pudimos preparar el envío.' }
  }
  if (!tomadas || tomadas.length === 0) return { ok: true, enviados: 0 }

  // Mismo contrato de siempre: signed URLs de 24h dentro de dispatchTraduccion.
  const resultado = await dispatchTraduccion(
    loteId,
    lote.pais || PAIS_TRADUCCION_DEFAULT,
    tomadas.map((t) => ({ storage_path: t.storage_path, nombre_original: t.nombre_original })),
  )

  if (!resultado.ok) {
    const { error: errorRevertir } = await supabaseAdmin
      .from('documentos_lote')
      .update({ enviado_at: null })
      .in('id', tomadas.map((t) => t.id))
      .eq('enviado_at', ahora)
    if (errorRevertir) console.error('[TRADUCCIONES] Error devolviendo pendientes tras fallo de n8n:', errorRevertir)
    return { ok: false, enviados: 0, error: resultado.error || 'No pudimos avisarle a n8n.' }
  }

  return { ok: true, enviados: resultado.enviados }
}
