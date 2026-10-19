import { sanitizePdfFile } from '@/lib/pdf-sanitize'

/* Un documento repetido se reconoce por el SHA-256 de su contenido, no por el
   nombre: los clientes renombran y vuelven a descargar el mismo extracto. Se
   hashea el archivo YA SANEADO, para que el hash corresponda exactamente a los
   bytes que se suben a Storage. */

export interface ArchivoPreparado {
  archivo: File // ya saneado: es lo que se sube
  nombre: string
  bytes: number
  hash: string
}

export interface ArchivoOmitido {
  nombre: string
  bytes: number
  hash: string
  motivo: 'tanda' | 'lote'
  // Nombre con el que entró la primera vez (solo motivo 'lote').
  nombreAnterior?: string | null
}

export interface SeleccionArchivos {
  nuevos: ArchivoPreparado[]
  omitidos: ArchivoOmitido[]
}

export const SELECCION_VACIA: SeleccionArchivos = { nuevos: [], omitidos: [] }

export const HASH_VALIDO = /^[0-9a-f]{64}$/

export async function sha256Hex(datos: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', datos)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function prepararArchivo(original: File): Promise<ArchivoPreparado> {
  const limpio = await sanitizePdfFile(original)
  return {
    archivo: limpio,
    nombre: original.name,
    bytes: limpio.size,
    hash: await sha256Hex(await limpio.arrayBuffer()),
  }
}

/* Parte una tanda en nuevos y omitidos. `yaElegidos` son los hashes que ya
   están en la lista de esta pantalla; `enLote` los que ya existen en
   documentos_lote (hash -> nombre con que entraron). Función pura. */
export function separarTanda(
  tanda: ArchivoPreparado[],
  yaElegidos: Iterable<string>,
  enLote: Map<string, string>,
): SeleccionArchivos {
  const vistos = new Set(yaElegidos)
  const nuevos: ArchivoPreparado[] = []
  const omitidos: ArchivoOmitido[] = []

  for (const a of tanda) {
    const base = { nombre: a.nombre, bytes: a.bytes, hash: a.hash }
    if (enLote.has(a.hash)) {
      omitidos.push({ ...base, motivo: 'lote', nombreAnterior: enLote.get(a.hash) ?? null })
    } else if (vistos.has(a.hash)) {
      omitidos.push({ ...base, motivo: 'tanda' })
    } else {
      vistos.add(a.hash)
      nuevos.push(a)
    }
  }
  return { nuevos, omitidos }
}
