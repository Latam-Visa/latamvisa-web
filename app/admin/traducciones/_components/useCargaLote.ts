"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { ALLOWED_UPLOAD_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILES_POR_LOTE } from '@/lib/traducciones/shared'
import { prepararArchivo } from '@/lib/traducciones/preparar-archivos'
import { hashEnLista, siguientesASubir, type ItemCarga } from '@/lib/traducciones/cola-carga'
import { eliminarDocumentoCargado, getLoteUploadUrl, hashesEnLote, registrarDocumentoLote } from '../_actions/traducciones-actions'

/* Carga inmediata: cada archivo que se suelta se sanea, se hashea, se revisa
   contra el lote y, si es nuevo, se sube a Storage y se registra en
   documentos_lote con enviado_at NULL. Máximo 3 subidas en paralelo; el resto
   espera "En cola". Nada se manda a n8n acá: eso es "Ya terminé", en el
   servidor (POST /api/traducciones/[id]/enviar). */

/* PUT a la signed upload URL con progreso real (bytes subidos). fetch no
   expone el progreso de subida; XMLHttpRequest sí, y además se puede abortar. */
function putConProgreso(url: string, archivo: File, onProgreso: (p: number) => void, registrar: (xhr: XMLHttpRequest) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    registrar(xhr)
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', archivo.type || 'application/octet-stream')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgreso(e.loaded / e.total)
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`El servidor de archivos respondió ${xhr.status}.`)))
    xhr.onerror = () => reject(new Error('Se cortó la conexión.'))
    xhr.onabort = () => reject(new DOMException('Cancelado', 'AbortError'))
    xhr.send(archivo)
  })
}

let contador = 0

export function useCargaLote(obtenerLoteIdProp: () => Promise<string>) {
  // Ref: en /nueva la función cambia con el formulario y los callbacks son estables.
  const obtenerRef = useRef(obtenerLoteIdProp)
  obtenerRef.current = obtenerLoteIdProp
  const obtenerLoteId = () => obtenerRef.current()

  const [items, setItems] = useState<ItemCarga[]>([])
  const [aviso, setAviso] = useState('')

  // Fuente de verdad síncrona para la cola; el estado de React solo pinta.
  const itemsRef = useRef<ItemCarga[]>([])
  const archivos = useRef(new Map<string, File>()) // key -> archivo (ya saneado tras revisar)
  const xhrs = useRef(new Map<string, XMLHttpRequest>())
  const cancelados = useRef(new Set<string>())
  const revisando = useRef(false)
  const porRevisar = useRef<string[]>([])

  const escribir = (siguiente: ItemCarga[]) => {
    itemsRef.current = siguiente
    setItems(siguiente)
  }
  const actualizar = (key: string, cambio: Partial<ItemCarga>) =>
    escribir(itemsRef.current.map((i) => (i.key === key ? { ...i, ...cambio } : i)))
  const sacar = (key: string) => {
    archivos.current.delete(key)
    xhrs.current.delete(key)
    escribir(itemsRef.current.filter((i) => i.key !== key))
  }
  const existe = (key: string) => itemsRef.current.some((i) => i.key === key)

  const subir = async (key: string) => {
    const archivo = archivos.current.get(key)
    const item = itemsRef.current.find((i) => i.key === key)
    if (!archivo || !item?.hash) return
    actualizar(key, { estado: 'subiendo', progreso: 0, error: undefined })

    let docId: string | undefined
    try {
      const loteId = await obtenerLoteId()
      const tipo = archivo.type || 'application/octet-stream'
      const url = await getLoteUploadUrl(loteId, tipo, item.nombre)
      if (!url.success || !url.url || !url.path) throw new Error(url.error || 'No se pudo preparar la subida.')

      await putConProgreso(url.url, archivo, (p) => existe(key) && actualizar(key, { progreso: p }), (x) => xhrs.current.set(key, x))
      xhrs.current.delete(key)

      const registro = await registrarDocumentoLote(loteId, { storage_path: url.path, hash: item.hash, nombre_original: item.nombre, bytes: item.bytes })
      if (registro.estado === 'error') throw new Error(registro.error || 'No se pudo registrar el archivo.')
      docId = registro.id

      if (cancelados.current.has(key)) {
        // Le dieron a la X justo mientras terminaba: se deshace del todo.
        if (docId) await eliminarDocumentoCargado(loteId, docId)
      } else if (registro.estado === 'repetido') {
        actualizar(key, { estado: 'repetido', motivoRepetido: 'lote', nombreAnterior: registro.nombreAnterior ?? null, progreso: 0 })
      } else {
        actualizar(key, { estado: 'cargado', progreso: 1, docId })
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError' && existe(key)) {
        console.error('[TRADUCCIONES] Error subiendo', item.nombre, err)
        actualizar(key, { estado: 'error', error: err?.message || 'No se pudo subir.', progreso: 0 })
      }
    } finally {
      cancelados.current.delete(key)
      bombear()
    }
  }

  // Arranca lo que quepa en los cupos libres. Se llama tras cada cambio de cola.
  const bombear = () => {
    for (const key of siguientesASubir(itemsRef.current)) void subir(key)
  }

  /* Sanea y hashea de a uno (30 PDFs en paralelo serían cientos de MB en
     memoria); cada archivo pasa a la cola apenas está listo, sin esperar al
     resto, así las subidas arrancan mientras se revisan los demás. */
  const revisarPendientes = async () => {
    if (revisando.current) return
    revisando.current = true
    try {
      while (porRevisar.current.length > 0) {
        const key = porRevisar.current.shift()!
        const original = archivos.current.get(key)
        if (!original || !existe(key)) continue
        try {
          const prep = await prepararArchivo(original)
          if (!existe(key)) continue
          archivos.current.set(key, prep.archivo)

          const enLista = hashEnLista(itemsRef.current, prep.hash, key)
          if (enLista) {
            actualizar(key, { hash: prep.hash, bytes: prep.bytes, estado: 'repetido', motivoRepetido: 'tanda', nombreAnterior: enLista })
            continue
          }
          actualizar(key, { hash: prep.hash, bytes: prep.bytes })

          const loteId = await obtenerLoteId()
          const res = await hashesEnLote(loteId, [prep.hash])
          if (!res.success) throw new Error(res.error)
          if (!existe(key)) continue
          const previo = res.existentes[0]
          actualizar(key, previo
            ? { estado: 'repetido', motivoRepetido: 'lote', nombreAnterior: previo.nombre_original }
            : { estado: 'en_cola' })
          bombear()
        } catch (err: any) {
          console.error('[TRADUCCIONES] Error revisando', original.name, err)
          if (existe(key)) actualizar(key, { estado: 'error', error: err?.message || 'No se pudo revisar el archivo.' })
        }
      }
    } finally {
      revisando.current = false
    }
  }

  const agregar = useCallback((lista: FileList | File[]) => {
    setAviso('')
    const rechazados: string[] = []
    const nuevos: ItemCarga[] = []
    for (const archivo of Array.from(lista)) {
      if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(archivo.type)) {
        rechazados.push(`${archivo.name} (formato no admitido)`)
        continue
      }
      if (archivo.size > MAX_FILE_SIZE_BYTES) {
        rechazados.push(`${archivo.name} (supera los 50 MB)`)
        continue
      }
      if (nuevos.length >= MAX_FILES_POR_LOTE) {
        rechazados.push(`solo caben ${MAX_FILES_POR_LOTE} archivos por tanda`)
        break
      }
      const key = `a${++contador}`
      archivos.current.set(key, archivo)
      nuevos.push({ key, nombre: archivo.name, bytes: archivo.size, estado: 'revisando', progreso: 0 })
    }
    if (rechazados.length > 0) setAviso(`No se agregaron: ${rechazados.join(', ')}.`)
    if (nuevos.length === 0) return
    // Todas las filas aparecen de una; después se revisan y suben solas.
    escribir([...itemsRef.current, ...nuevos])
    porRevisar.current.push(...nuevos.map((n) => n.key))
    void revisarPendientes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* La X. Subiendo: cancela. Cargado: borra de Storage y de documentos_lote
     (si no, su hash quedaría registrado y no se podría volver a subir). El
     resto solo sale de la lista. */
  const quitar = useCallback(async (key: string) => {
    const item = itemsRef.current.find((i) => i.key === key)
    if (!item) return
    if (item.estado === 'subiendo') {
      cancelados.current.add(key)
      xhrs.current.get(key)?.abort()
      sacar(key)
      return
    }
    if (item.estado === 'cargado' && item.docId) {
      actualizar(key, { error: undefined })
      const res = await eliminarDocumentoCargado(await obtenerLoteId(), item.docId)
      if (!res.success) return actualizar(key, { error: res.error })
    }
    sacar(key)
    bombear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reintentar = useCallback((key: string) => {
    const item = itemsRef.current.find((i) => i.key === key)
    if (!item || item.estado !== 'error') return
    if (item.hash) {
      actualizar(key, { estado: 'en_cola', error: undefined, progreso: 0 })
      bombear()
    } else {
      actualizar(key, { estado: 'revisando', error: undefined })
      porRevisar.current.push(key)
      void revisarPendientes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const limpiar = useCallback(() => {
    archivos.current.clear()
    escribir([])
  }, [])

  // Cerrar la pestaña con subidas en curso: el navegador pregunta antes.
  useEffect(() => {
    const enCurso = items.some((i) => i.estado === 'subiendo' || i.estado === 'en_cola' || i.estado === 'revisando')
    if (!enCurso) return
    const avisar = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [items])

  return { items, aviso, agregar, quitar, reintentar, limpiar }
}
