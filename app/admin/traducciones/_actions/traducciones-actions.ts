"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { dispatchTraduccion, type DispatchDoc } from '@/lib/traducciones/dispatch'
import { HASH_VALIDO } from '@/lib/traducciones/preparar-archivos'
import {
  construirNombreEnStorage,
  extForMimeType,
  nombreOriginalDesdePath,
  PAIS_TRADUCCION_DEFAULT,
  PAISES_TRADUCCION,
  prefijoStorage,
  VISA_APPLICATIONS_BUCKET,
  type Destino,
} from '@/lib/traducciones/shared'

const PAISES_VALIDOS = new Set<string>(PAISES_TRADUCCION.map((p) => p.value))

/* Carpeta de un lote dentro de `visa-applications`. Lo que es específico del
   lote (reenvío, borrado) sigue usando este atajo; lo genérico pasa por
   `prefijoStorage(destino)`. */
function carpetaLote(loteId: string) {
  return prefijoStorage({ tipo: 'lote', id: loteId })
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
export async function getUploadUrl(
  destino: Destino,
  fileType: string,
  nombreOriginal: string,
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  if (!UUID.test(destino.id)) return { success: false, error: 'Destino inválido.' }
  try {
    const base = nombreOriginal || `documento.${extForMimeType(fileType)}`
    const path = `${prefijoStorage(destino)}/${construirNombreEnStorage(uuidv4(), base)}`

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/* Hashes de esta tanda que ya existen en el lote (hash -> nombre con que
   entraron). Sirve para mostrar "se omiten" antes de subir nada. */
export async function hashesExistentes(
  destino: Destino,
  hashes: string[],
): Promise<{ success: boolean; existentes: { hash: string; nombre_original: string }[]; error?: string }> {
  if (!UUID.test(destino.id)) return { success: false, existentes: [], error: 'Destino inválido.' }
  const validos = Array.from(new Set(hashes)).filter((h) => HASH_VALIDO.test(h)).slice(0, 200)
  if (validos.length === 0) return { success: true, existentes: [] }

  /* El dedup se hace solo contra lo que el admin ya subió a este destino
     (filas de documentos_lote con application_id = destino.id). Para una
     solicitud, los documentos del formulario público no están en esta tabla,
     así que no interfieren: solo se evita re-subir dos veces el mismo archivo
     del admin. */
  const { data, error } = await supabaseAdmin
    .from('documentos_lote')
    .select('hash, nombre_original')
    .eq('application_id', destino.id)
    .in('hash', validos)

  if (error) {
    console.error('[TRADUCCIONES] Error consultando hashes existentes:', error)
    return { success: false, existentes: [], error: 'No pudimos revisar qué documentos ya se subieron.' }
  }
  return { success: true, existentes: data || [] }
}

/* Registra en documentos_lote un archivo que ya se subió a Storage. Si el
   índice único (application_id, hash) lo rechaza — otra subida del mismo
   archivo ganó la carrera —, no es un error: se borra lo que se subió y se
   informa como repetido. Cualquier otro fallo también borra el archivo, para
   que todo lo que hay en Storage esté registrado (si no, no se detectaría
   como repetido la próxima vez). */
export async function registrarDocumento(
  destino: Destino,
  doc: { storage_path: string; hash: string; nombre_original: string; bytes: number },
): Promise<{ estado: 'registrado' | 'repetido' | 'error'; nombreAnterior?: string | null; error?: string }> {
  if (!UUID.test(destino.id) || !HASH_VALIDO.test(doc.hash) || !doc.storage_path.startsWith(`${prefijoStorage(destino)}/`)) {
    return { estado: 'error', error: 'Datos de subida inválidos.' }
  }

  const { error } = await supabaseAdmin.from('documentos_lote').insert({
    application_id: destino.id,
    storage_path: doc.storage_path,
    hash: doc.hash,
    nombre_original: doc.nombre_original,
    bytes: doc.bytes,
  })
  if (!error) return { estado: 'registrado' }

  await supabaseAdmin.storage.from(VISA_APPLICATIONS_BUCKET).remove([doc.storage_path])

  if (error.code === '23505') {
    const { data } = await supabaseAdmin
      .from('documentos_lote')
      .select('nombre_original')
      .eq('application_id', destino.id)
      .eq('hash', doc.hash)
      .maybeSingle()
    return { estado: 'repetido', nombreAnterior: data?.nombre_original ?? null }
  }

  console.error('[TRADUCCIONES] Error registrando documento del lote:', error)
  return { estado: 'error', error: 'No se pudo registrar el archivo.' }
}

/* Paso 5 aislado, para poder reintentarlo solo. Regenera las signed URLs de
   24h cada vez, así que un reintento tardío sigue sirviendo.

   El `pais` y el `origen` del webhook dependen del destino: un lote lee su país
   de lotes_traduccion y va como 'formulario' (no cambia el comportamiento
   existente); una solicitud trae su país en el destino y va como 'admin', para
   que n8n marque esas filas y la ficha pueda etiquetarlas. */
export async function enviarAn8n(
  destino: Destino,
  docs: DispatchDoc[],
): Promise<{ success: boolean; error?: string; enviados: number }> {
  if (docs.length === 0) return { success: false, error: 'No hay documentos para enviar.', enviados: 0 }
  if (!UUID.test(destino.id)) return { success: false, error: 'Destino inválido.', enviados: 0 }

  let pais: string
  let origen: 'admin' | 'formulario'

  if (destino.tipo === 'lote') {
    const { data: lote, error } = await supabaseAdmin
      .from('lotes_traduccion')
      .select('id, pais')
      .eq('id', destino.id)
      .single()

    if (error || !lote) return { success: false, error: 'No encontramos la traducción.', enviados: 0 }
    pais = lote.pais || PAIS_TRADUCCION_DEFAULT
    origen = 'formulario'
  } else {
    pais = destino.pais || PAIS_TRADUCCION_DEFAULT
    origen = 'admin'
  }

  const result = await dispatchTraduccion(destino.id, pais, docs, origen)

  revalidatePath(
    destino.tipo === 'lote' ? `/admin/traducciones/${destino.id}` : `/admin/applications/${destino.id}`,
  )
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

  return enviarAn8n({ tipo: 'lote', id: loteId }, docs)
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
  await supabaseAdmin.from('documentos_lote').delete().eq('application_id', loteId)

  const { error } = await supabaseAdmin.from('lotes_traduccion').delete().eq('id', loteId)
  if (error) {
    console.error('[TRADUCCIONES] Error eliminando lote:', error)
    return { success: false, error: 'No pudimos eliminar la traducción.' }
  }

  revalidatePath('/admin/traducciones')
  revalidatePath('/admin')
  return { success: true }
}
