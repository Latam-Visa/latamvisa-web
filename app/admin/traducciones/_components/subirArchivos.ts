import { sanitizePdfFile } from '@/lib/pdf-sanitize'
import { getLoteUploadUrl } from '../_actions/traducciones-actions'
import type { DispatchDoc } from '@/lib/traducciones/dispatch'

export interface ProgresoSubida {
  actual: number
  total: number
  nombre: string
}

/* Sube los archivos uno por uno a `visa-applications` desde el navegador,
   igual que el DocumentUploader del formulario público: el servidor solo
   entrega la signed upload URL. Subir de a uno (y no en paralelo) es lo que
   permite mostrar "archivo N de M" real, que es lo que pide el admin cuando
   son PDFs pesados.

   Devuelve los documentos subidos y los que fallaron; el llamador decide qué
   hacer con los errores. Los archivos que sí subieron NO se borran ante un
   fallo parcial: quedan en Storage y el reintento los recoge. */
export async function subirArchivos(
  loteId: string,
  archivos: File[],
  onProgress: (p: ProgresoSubida) => void,
): Promise<{ subidos: DispatchDoc[]; fallidos: { nombre: string; error: string }[] }> {
  const subidos: DispatchDoc[] = []
  const fallidos: { nombre: string; error: string }[] = []

  for (let i = 0; i < archivos.length; i++) {
    const archivo = archivos[i]
    onProgress({ actual: i + 1, total: archivos.length, nombre: archivo.name })

    try {
      /* Algunos PDFs traen basura antes del header %PDF (BOM, CRLFs) y la API
         de Anthropic, dentro del pipeline de n8n, los rechaza. Se limpian
         ANTES de subir, igual que en el formulario. */
      const limpio = await sanitizePdfFile(archivo)

      const { success, url, path, error } = await getLoteUploadUrl(loteId, limpio.type || archivo.type, archivo.name)
      if (!success || !url || !path) throw new Error(error || 'No se pudo preparar la subida.')

      const res = await fetch(url, {
        method: 'PUT',
        body: limpio,
        headers: { 'Content-Type': limpio.type || archivo.type },
      })
      if (!res.ok) throw new Error(`El servidor de archivos respondió ${res.status}.`)

      subidos.push({ storage_path: path, nombre_original: archivo.name })
    } catch (err: any) {
      console.error('[TRADUCCIONES] Error subiendo', archivo.name, err)
      fallidos.push({ nombre: archivo.name, error: err?.message || 'Error desconocido' })
    }
  }

  return { subidos, fallidos }
}
