import { getLoteUploadUrl, registrarDocumentoLote } from '../_actions/traducciones-actions'
import type { DispatchDoc } from '@/lib/traducciones/dispatch'
import type { ArchivoPreparado } from '@/lib/traducciones/preparar-archivos'

export interface ProgresoSubida {
  actual: number
  total: number
  nombre: string
}

export interface ResultadoSubida {
  subidos: DispatchDoc[]
  // Otra subida registró el mismo contenido entre que se eligió y se subió.
  repetidos: { nombre: string; nombreAnterior: string | null }[]
  fallidos: { nombre: string; error: string }[]
}

/* Sube los archivos uno por uno a `visa-applications` desde el navegador,
   igual que el DocumentUploader del formulario público: el servidor solo
   entrega la signed upload URL. Subir de a uno (y no en paralelo) es lo que
   permite mostrar "archivo N de M" real, que es lo que pide el admin cuando
   son PDFs pesados.

   Llegan ya saneados y con su hash (ver DocumentosPicker / prepararArchivo):
   lo que se sube son exactamente los bytes que se hashearon. Cada archivo
   subido se registra en documentos_lote; solo los registrados van a n8n.

   Los archivos que sí subieron NO se borran ante un fallo parcial: quedan en
   Storage y el reintento los recoge. */
export async function subirArchivos(
  loteId: string,
  archivos: ArchivoPreparado[],
  onProgress: (p: ProgresoSubida) => void,
): Promise<ResultadoSubida> {
  const resultado: ResultadoSubida = { subidos: [], repetidos: [], fallidos: [] }

  for (let i = 0; i < archivos.length; i++) {
    const { archivo, nombre, hash, bytes } = archivos[i]
    onProgress({ actual: i + 1, total: archivos.length, nombre })

    try {
      const tipo = archivo.type || 'application/octet-stream'
      const { success, url, path, error } = await getLoteUploadUrl(loteId, tipo, nombre)
      if (!success || !url || !path) throw new Error(error || 'No se pudo preparar la subida.')

      const res = await fetch(url, { method: 'PUT', body: archivo, headers: { 'Content-Type': tipo } })
      if (!res.ok) throw new Error(`El servidor de archivos respondió ${res.status}.`)

      const registro = await registrarDocumentoLote(loteId, { storage_path: path, hash, nombre_original: nombre, bytes })
      if (registro.estado === 'repetido') {
        resultado.repetidos.push({ nombre, nombreAnterior: registro.nombreAnterior ?? null })
        continue
      }
      if (registro.estado === 'error') throw new Error(registro.error || 'No se pudo registrar el archivo.')

      resultado.subidos.push({ storage_path: path, nombre_original: nombre })
    } catch (err: any) {
      console.error('[TRADUCCIONES] Error subiendo', nombre, err)
      resultado.fallidos.push({ nombre, error: err?.message || 'Error desconocido' })
    }
  }

  return resultado
}
