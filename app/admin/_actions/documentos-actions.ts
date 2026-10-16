"use server"

import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { firmarDescarga } from '@/lib/traducciones/dispatch'
import { carpetasDePais } from '@/lib/traducciones/shared'

const SESION_VENCIDA = 'Sesión vencida. Vuelve a entrar al admin.'

// middleware.ts ya protege /admin; esto es por si una acción se llama desde otro lado.
function adminAutenticado(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  return Boolean(envPassword) && cookies().get('admin_auth')?.value === envPassword
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/* URLs frescas para "Descargar carpeta". Las que vienen con la página pueden
   haber vencido si la pestaña quedó abierta más de una hora, así que se
   firman de nuevo al hacer clic, con el mismo helper (y el mismo `bucket` por
   fila) que la descarga individual. */
export async function urlsDescargaDocumentos(
  ids: string[],
): Promise<{ success: boolean; error?: string; archivos: { id: string; nombre: string; url: string | null }[] }> {
  if (!adminAutenticado()) return { success: false, error: SESION_VENCIDA, archivos: [] }

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

/* "Mover a…": guarda la carpeta elegida a mano en `carpeta_manual`, que
   siempre gana sobre la de n8n y sobre el mapeo automático. null la borra y
   el documento vuelve a clasificarse solo. `carpeta` (la de n8n) no se toca. */
export async function moverDocumento(
  docId: string,
  carpeta: string | null,
  paisPorDefecto?: string | null,
): Promise<{ success: boolean; error?: string }> {
  if (!adminAutenticado()) return { success: false, error: SESION_VENCIDA }
  if (!UUID.test(docId)) return { success: false, error: 'Documento inválido.' }

  const { data: fila, error: errorFila } = await supabaseAdmin
    .from('documentos_traducidos')
    .select('id, pais')
    .eq('id', docId)
    .single()
  if (errorFila || !fila) return { success: false, error: 'No encontramos ese documento.' }

  const carpetas = carpetasDePais(fila.pais || paisPorDefecto)
  if (!carpetas) return { success: false, error: 'Este país no usa carpetas.' }
  if (carpeta !== null && !carpetas.includes(carpeta)) return { success: false, error: 'Carpeta inválida.' }

  const { error } = await supabaseAdmin.from('documentos_traducidos').update({ carpeta_manual: carpeta }).eq('id', docId)
  if (error) {
    console.error('[DOCUMENTOS] Error moviendo documento:', error)
    // Pasa si todavía no se corrió supabase/clasificacion_docs.sql.
    if (/carpeta_manual/.test(error.message || '')) {
      return { success: false, error: 'Falta la columna carpeta_manual: corre supabase/clasificacion_docs.sql.' }
    }
    return { success: false, error: 'No pudimos mover el documento.' }
  }
  return { success: true }
}
