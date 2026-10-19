/* Estado de la carga inmediata de documentos. Funciones puras: el hook
   useCargaLote las usa para decidir qué subir y qué mostrar. */

export type EstadoCarga = 'revisando' | 'en_cola' | 'subiendo' | 'cargado' | 'repetido' | 'error'

export interface ItemCarga {
  key: string
  nombre: string
  bytes: number
  estado: EstadoCarga
  hash?: string
  progreso: number // 0..1, bytes subidos reales
  error?: string
  // Repetido: 'tanda' = otro archivo de esta pantalla; 'lote' = ya estaba en el lote.
  motivoRepetido?: 'tanda' | 'lote'
  nombreAnterior?: string | null
  docId?: string // fila de documentos_lote, cuando quedó cargado
}

// Subidas simultáneas. Más que esto ahoga el navegador y la conexión.
export const MAX_SUBIDAS_PARALELAS = 3

/* Keys de los que deben arrancar ya: los primeros "en_cola", en orden de
   llegada, hasta llenar los cupos libres. */
export function siguientesASubir(items: ItemCarga[], max = MAX_SUBIDAS_PARALELAS): string[] {
  const libres = max - items.filter((i) => i.estado === 'subiendo').length
  if (libres <= 0) return []
  return items.filter((i) => i.estado === 'en_cola').slice(0, libres).map((i) => i.key)
}

/* Otro archivo de la lista ya tiene este contenido (y cuenta: no es un
   repetido ni un error). */
export function hashEnLista(items: ItemCarga[], hash: string, excepto: string): string | null {
  const otro = items.find(
    (i) => i.key !== excepto && i.hash === hash && i.estado !== 'repetido' && i.estado !== 'error',
  )
  return otro ? otro.nombre : null
}

export function resumenCarga(items: ItemCarga[]) {
  const cargados = items.filter((i) => i.estado === 'cargado').length
  const enCurso = items.filter((i) => i.estado === 'revisando' || i.estado === 'en_cola' || i.estado === 'subiendo').length
  return { cargados, enCurso, total: cargados + enCurso }
}
