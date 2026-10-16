"use server"

import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { firmarDescarga } from '@/lib/traducciones/dispatch'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/* URLs frescas para "Descargar carpeta". Las que vienen con la página pueden
   haber vencido si la pestaña quedó abierta más de una hora, así que se
   firman de nuevo al hacer clic, con el mismo helper (y el mismo `bucket` por
   fila) que la descarga individual. */
export async function urlsDescargaDocumentos(
  ids: string[],
): Promise<{ success: boolean; error?: string; archivos: { id: string; nombre: string; url: string | null }[] }> {
  // middleware.ts ya protege /admin; esto es por si la acción se llama desde otro lado.
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  if (!envPassword || cookies().get('admin_auth')?.value !== envPassword) {
    return { success: false, error: 'Sesión vencida. Vuelve a entrar al admin.', archivos: [] }
  }

  const validos = Array.from(new Set(ids)).filter((id) => UUID.test(id)).slice(0, 100)
  if (validos.length === 0) return { success: true, archivos: [] }

  const { data: rows, error } = await supabaseAdmin
    .from('documentos_traducidos')
    .select('id, storage_path, bucket, nombre_archivo, nombre_original')
    .in('id', validos)

  if (error) {
    console.error('[DOCUMENTOS] Error leyendo filas para el zip:', error)
    return { success: false, error: 'No pudimos preparar la descarga.', archivos: [] }
  }

  const archivos = await Promise.all(
    (rows || []).map(async (row) => ({
      id: row.id,
      nombre: row.nombre_archivo || row.nombre_original || row.id,
      url: (await firmarDescarga(row)) ?? null,
    })),
  )
  return { success: true, archivos }
}
