"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { dispatchTraduccion, type DispatchDoc } from '@/lib/traducciones/dispatch'
import {
  construirNombreEnStorage,
  extForMimeType,
  nombreOriginalDesdePath,
  PAIS_TRADUCCION_DEFAULT,
  PAISES_TRADUCCION,
  VISA_APPLICATIONS_BUCKET,
} from '@/lib/traducciones/shared'

const PAISES_VALIDOS = new Set<string>(PAISES_TRADUCCION.map((p) => p.value))

/* Carpeta del lote dentro de `visa-applications`. El prefijo `manual/` separa
   estas subidas de las del formulario público, que van bajo `<pais>/`. */
function carpetaLote(loteId: string) {
  return `manual/${loteId}`
}

export async function crearLote(input: {
  nombre_cliente: string
  pais: string
  notas: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const nombre = input.nombre_cliente?.trim()
  if (!nombre) return { success: false, error: 'El nombre del cliente es obligatorio.' }

  const pais = PAISES_VALIDOS.has(input.pais) ? input.pais : PAIS_TRADUCCION_DEFAULT

  const { data, error } = await supabaseAdmin
    .from('lotes_traduccion')
    .insert({ nombre_cliente: nombre, pais, notas: input.notas?.trim() || null })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[TRADUCCIONES] Error creando lote:', error)
    return { success: false, error: 'No pudimos crear la traducción. Intenta de nuevo.' }
  }

  revalidatePath('/admin/traducciones')
  revalidatePath('/admin')
  return { success: true, id: data.id }
}

/* Signed upload URL por archivo: el navegador sube directo a Supabase en vez
   de mandar el archivo por una server action. Así el admin ve progreso real y
   no chocamos con el límite de tamaño del body de las server actions, que con
   PDFs escaneados se supera fácil. */
export async function getLoteUploadUrl(
  loteId: string,
  fileType: string,
  nombreOriginal: string,
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const base = nombreOriginal || `documento.${extForMimeType(fileType)}`
    const path = `${carpetaLote(loteId)}/${construirNombreEnStorage(uuidv4(), base)}`

    const { data, error } = await supabaseAdmin
      .storage
      .from(VISA_APPLICATIONS_BUCKET)
      .createSignedUploadUrl(path)

    if (error || !data) {
      console.error('[TRADUCCIONES] Error generando upload URL:', error)
      return { success: false, error: 'No se pudo generar la URL de subida.' }
    }

    return { success: true, url: data.signedUrl, path }
  } catch (err: any) {
    console.error('[TRADUCCIONES] getLoteUploadUrl:', err)
    return { success: false, error: 'Ocurrió un error preparando la subida.' }
  }
}

/* Paso 5 aislado, para poder reintentarlo solo. Regenera las signed URLs de
   24h cada vez, así que un reintento tardío sigue sirviendo. */
export async function enviarLoteAn8n(
  loteId: string,
  docs: DispatchDoc[],
): Promise<{ success: boolean; error?: string; enviados: number }> {
  if (docs.length === 0) return { success: false, error: 'No hay documentos para enviar.', enviados: 0 }

  const { data: lote, error } = await supabaseAdmin
    .from('lotes_traduccion')
    .select('id, pais')
    .eq('id', loteId)
    .single()

  if (error || !lote) return { success: false, error: 'No encontramos la traducción.', enviados: 0 }

  const result = await dispatchTraduccion(loteId, lote.pais || PAIS_TRADUCCION_DEFAULT, docs)

  revalidatePath(`/admin/traducciones/${loteId}`)
  return { success: result.ok, error: result.error, enviados: result.enviados }
}

/* Reintento desde el detalle, donde ya no tenemos en memoria la lista de
   archivos: se reconstruye leyendo la carpeta del lote en Storage. */
export async function reenviarLote(
  loteId: string,
): Promise<{ success: boolean; error?: string; enviados: number }> {
  const { data: archivos, error } = await supabaseAdmin
    .storage
    .from(VISA_APPLICATIONS_BUCKET)
    .list(carpetaLote(loteId), { limit: 100 })

  if (error) {
    console.error('[TRADUCCIONES] Error listando archivos del lote:', error)
    return { success: false, error: 'No pudimos leer los archivos del lote.', enviados: 0 }
  }

  const docs: DispatchDoc[] = (archivos || [])
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => ({
      storage_path: `${carpetaLote(loteId)}/${f.name}`,
      nombre_original: nombreOriginalDesdePath(f.name),
    }))

  if (docs.length === 0) {
    return { success: false, error: 'Este lote no tiene archivos subidos.', enviados: 0 }
  }

  return enviarLoteAn8n(loteId, docs)
}

export async function actualizarLote(
  loteId: string,
  campos: { nombre_cliente?: string; notas?: string },
): Promise<{ success: boolean; error?: string }> {
  const update: Record<string, any> = { updated_at: new Date().toISOString() }

  if (campos.nombre_cliente !== undefined) {
    const nombre = campos.nombre_cliente.trim()
    if (!nombre) return { success: false, error: 'El nombre del cliente no puede quedar vacío.' }
    update.nombre_cliente = nombre
  }
  if (campos.notas !== undefined) update.notas = campos.notas.trim() || null

  const { error } = await supabaseAdmin.from('lotes_traduccion').update(update).eq('id', loteId)

  if (error) {
    console.error('[TRADUCCIONES] Error actualizando lote:', error)
    return { success: false, error: 'No pudimos guardar los cambios.' }
  }

  revalidatePath('/admin/traducciones')
  revalidatePath(`/admin/traducciones/${loteId}`)
  return { success: true }
}

export async function eliminarLote(loteId: string): Promise<{ success: boolean; error?: string }> {
  /* Se borra todo lo del lote: los archivos originales que subió el admin, las
     filas de documentos que escribió n8n y por último el lote. Las
     traducciones viven en otro bucket y las borra n8n con su propia retención;
     acá solo se quita lo que este panel creó. */
  const { data: archivos } = await supabaseAdmin
    .storage
    .from(VISA_APPLICATIONS_BUCKET)
    .list(carpetaLote(loteId), { limit: 100 })

  if (archivos && archivos.length > 0) {
    await supabaseAdmin
      .storage
      .from(VISA_APPLICATIONS_BUCKET)
      .remove(archivos.map((f) => `${carpetaLote(loteId)}/${f.name}`))
  }

  await supabaseAdmin.from('documentos_traducidos').delete().eq('application_id', loteId)

  const { error } = await supabaseAdmin.from('lotes_traduccion').delete().eq('id', loteId)
  if (error) {
    console.error('[TRADUCCIONES] Error eliminando lote:', error)
    return { success: false, error: 'No pudimos eliminar la traducción.' }
  }

  revalidatePath('/admin/traducciones')
  revalidatePath('/admin')
  return { success: true }
}
