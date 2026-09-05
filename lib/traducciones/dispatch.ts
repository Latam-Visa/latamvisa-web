import { supabaseAdmin } from '@/lib/supabase/admin'
import { SIGNED_URL_TTL_SECONDS, VISA_APPLICATIONS_BUCKET } from './shared'

/* Dispara el webhook de traducción de n8n. Es la misma lógica que usa el
   último paso del formulario de Australia (_actions/submit-application.ts):
   por cada documento genera una signed URL de 24h sobre `visa-applications` y
   manda un solo POST con el lote completo.

   n8n no se toca: este módulo existe para que el admin mande exactamente el
   mismo contrato que ya consume el workflow. */

export interface DispatchDoc {
  storage_path: string
  /* El nombre que ve el humano. En el formulario público se pierde y termina
     siendo el UUID del archivo; acá sí tenemos el nombre real del archivo que
     subió el admin, y es el que n8n usa para nombrar la traducción. */
  nombre_original: string
}

export interface DispatchResult {
  ok: boolean
  error?: string
  enviados: number
}

export async function dispatchTraduccion(
  applicationId: string,
  pais: string,
  docs: DispatchDoc[],
): Promise<DispatchResult> {
  if (docs.length === 0) return { ok: true, enviados: 0 }

  const webhookUrl = process.env.N8N_DOCS_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[N8N_DOCS_WEBHOOK] N8N_DOCS_WEBHOOK_URL no está configurada.')
    return { ok: false, error: 'El webhook de n8n no está configurado en el servidor.', enviados: 0 }
  }

  const documentos = (
    await Promise.all(
      docs.map(async (doc) => {
        const { data, error } = await supabaseAdmin
          .storage
          .from(VISA_APPLICATIONS_BUCKET)
          .createSignedUrl(doc.storage_path, SIGNED_URL_TTL_SECONDS)

        if (error || !data) {
          console.error('[N8N_DOCS_WEBHOOK] Error generando signed URL:', doc.storage_path, error)
          return null
        }

        return {
          storage_path: doc.storage_path,
          signed_url: data.signedUrl,
          nombre_original: doc.nombre_original,
        }
      }),
    )
  ).filter(Boolean)

  if (documentos.length === 0) {
    return { ok: false, error: 'No se pudo generar ninguna URL de descarga para los documentos.', enviados: 0 }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: applicationId, pais, documentos }),
      /* Igual que en el formulario: n8n puede estar caído o lento y un fetch
         sin timeout dejaría colgada la petición hasta que la plataforma mate
         la función. */
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[N8N_DOCS_WEBHOOK] non-OK response:', res.status, body)
      return { ok: false, error: `n8n respondió ${res.status}. Los archivos ya están guardados, puedes reintentar.`, enviados: 0 }
    }

    console.log('[N8N_DOCS_WEBHOOK] sent OK', applicationId, documentos.length, 'documento(s)')
    return { ok: true, enviados: documentos.length }
  } catch (err: any) {
    console.error('[N8N_DOCS_WEBHOOK] fetch failed or timed out:', err?.name, err?.message || err)
    const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError'
    return {
      ok: false,
      error: timedOut
        ? 'n8n no respondió a tiempo. Los archivos ya están guardados, puedes reintentar el envío.'
        : 'No pudimos contactar a n8n. Los archivos ya están guardados, puedes reintentar el envío.',
      enviados: 0,
    }
  }
}

/* Firma las filas de `documentos_traducidos` para descarga. Cada fila dice en
   su propia columna `bucket` dónde vive el archivo: 'documentos-traducidos'
   para la traducción, 'visa-applications' para el original (pasaportes, visas
   y todo lo que no necesitó traducción). */
export async function signTranslatedRows(rows: any[]) {
  return Promise.all(
    rows.map(async (row) => {
      let downloadUrl: string | undefined
      if (row.storage_path) {
        const bucket = row.bucket || 'documentos-traducidos'
        const { data, error } = await supabaseAdmin
          .storage
          .from(bucket)
          .createSignedUrl(row.storage_path, 3600, { download: row.nombre_archivo })
        if (!error && data) downloadUrl = data.signedUrl
      }
      return {
        id: row.id,
        nombre_original: row.nombre_original,
        nombre_archivo: row.nombre_archivo,
        status: row.status || 'traducido',
        motivo: row.motivo,
        created_at: row.created_at,
        downloadUrl,
      }
    }),
  )
}
