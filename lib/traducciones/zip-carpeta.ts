import { urlsDescargaDocumentos } from '@/app/admin/_actions/documentos-actions'

/* "Familia Pérez" + "Travel Document" -> "Familia_Perez_Travel_Document.zip" */
export function nombreZip(cliente: string, carpeta: string): string {
  const limpiar = (t: string) =>
    t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return `${limpiar(cliente) || 'Cliente'}_${limpiar(carpeta) || 'Carpeta'}.zip`
}

// Dos archivos con el mismo nombre se pisarían dentro del zip.
function nombreUnico(nombre: string, usados: Set<string>): string {
  if (!usados.has(nombre)) return usados.add(nombre), nombre
  const punto = nombre.lastIndexOf('.')
  const base = punto > 0 ? nombre.slice(0, punto) : nombre
  const ext = punto > 0 ? nombre.slice(punto) : ''
  let i = 2
  while (usados.has(`${base} (${i})${ext}`)) i++
  const final = `${base} (${i})${ext}`
  usados.add(final)
  return final
}

/* Baja los documentos en el navegador, uno por uno para poder mostrar "3/9",
   y descarga el zip con los que sí bajaron. Devuelve los nombres que faltaron;
   lanza solo si no se pudo armar nada. */
export async function descargarCarpetaZip(
  ids: string[],
  nombreArchivoZip: string,
  onProgreso: (hechos: number, total: number) => void,
): Promise<{ faltaron: string[] }> {
  const res = await urlsDescargaDocumentos(ids)
  if (!res.success) throw new Error(res.error || 'No pudimos preparar la descarga.')

  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const usados = new Set<string>()
  const faltaron: string[] = []
  // Documentos que la consulta no devolvió (borrados entre medio) también faltan.
  const total = ids.length
  faltaron.push(...ids.filter((id) => !res.archivos.some((a) => a.id === id)).map(() => 'documento eliminado'))

  let hechos = 0
  onProgreso(hechos, total)
  for (const archivo of res.archivos) {
    try {
      if (!archivo.url) throw new Error('sin archivo')
      const r = await fetch(archivo.url)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      zip.file(nombreUnico(archivo.nombre, usados), await r.blob())
    } catch (err) {
      console.error('[ZIP] No bajó', archivo.nombre, err)
      faltaron.push(archivo.nombre)
    }
    hechos += 1
    onProgreso(hechos, total)
  }

  if (usados.size === 0) throw new Error('No se pudo bajar ningún archivo de esta carpeta.')

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivoZip
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)

  return { faltaron }
}
