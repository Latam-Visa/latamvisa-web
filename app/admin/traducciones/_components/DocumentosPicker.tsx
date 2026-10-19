"use client"

import { useRef, useState } from 'react'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import { ALLOWED_UPLOAD_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILES_POR_LOTE, formatFileSize } from '@/lib/traducciones/shared'
import { prepararArchivo, separarTanda, type ArchivoPreparado, type SeleccionArchivos } from '@/lib/traducciones/preparar-archivos'
import { hashesEnLote } from '../_actions/traducciones-actions'

const ACCEPT = 'application/pdf,image/jpeg,image/png'

/* Selector de archivos con drag & drop. Solo elige y lista: la subida la
   dispara el formulario que lo contiene, para que el progreso se muestre junto
   al botón de envío.

   Al soltar los archivos los sanea y calcula su SHA-256 (ver
   prepararArchivo), descarta los repetidos dentro de la misma tanda y, si hay
   `loteId`, los que ya están en el lote. Así nada se traduce dos veces. */
export function DocumentosPicker({
  seleccion,
  onChange,
  loteId,
  disabled,
}: {
  seleccion: SeleccionArchivos
  onChange: (seleccion: SeleccionArchivos) => void
  // Lote existente ("Agregar más documentos"); sin él, solo se deduplica la tanda.
  loteId?: string
  disabled?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [revisando, setRevisando] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { nuevos, omitidos } = seleccion

  const agregar = async (lista: FileList | File[]) => {
    setError('')
    const validos: File[] = []
    const rechazados: string[] = []

    for (const archivo of Array.from(lista)) {
      if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(archivo.type)) {
        rechazados.push(`${archivo.name} (formato no admitido)`)
        continue
      }
      if (archivo.size > MAX_FILE_SIZE_BYTES) {
        rechazados.push(`${archivo.name} (supera los 50 MB)`)
        continue
      }
      validos.push(archivo)
    }
    if (inputRef.current) inputRef.current.value = ''

    if (validos.length > 0) {
      setRevisando(true)
      try {
        const preparados = await Promise.all(validos.map(prepararArchivo))

        let enLote = new Map<string, string>()
        if (loteId) {
          const res = await hashesEnLote(loteId, preparados.map((p) => p.hash))
          if (!res.success) throw new Error(res.error)
          enLote = new Map(res.existentes.map((e) => [e.hash, e.nombre_original]))
        }

        const tanda = separarTanda(preparados, nuevos.map((n) => n.hash), enLote)

        const cabe = Math.max(0, MAX_FILES_POR_LOTE - nuevos.length)
        if (tanda.nuevos.length > cabe) {
          rechazados.push(`solo caben ${MAX_FILES_POR_LOTE} archivos por envío`)
          tanda.nuevos.splice(cabe)
        }

        onChange({ nuevos: [...nuevos, ...tanda.nuevos], omitidos: [...omitidos, ...tanda.omitidos] })
      } catch (err: any) {
        console.error('[TRADUCCIONES] Error revisando archivos:', err)
        rechazados.push(err?.message || 'no pudimos revisar los archivos, intenta de nuevo')
      } finally {
        setRevisando(false)
      }
    }

    if (rechazados.length > 0) setError(`No se agregaron: ${rechazados.join(', ')}.`)
  }

  const quitar = (archivo: ArchivoPreparado) => {
    setError('')
    onChange({ nuevos: nuevos.filter((n) => n !== archivo), omitidos })
  }

  const bloqueado = disabled || revisando
  const lleno = nuevos.length >= MAX_FILES_POR_LOTE
  const soloRepetidos = nuevos.length === 0 && omitidos.some((o) => o.motivo === 'lote')

  return (
    <div>
      {!lleno && (
        <div
          onDragOver={(e) => { e.preventDefault(); if (!bloqueado) setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            if (!bloqueado && e.dataTransfer.files?.length) agregar(e.dataTransfer.files)
          }}
          onClick={() => !bloqueado && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (bloqueado) return
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() }
          }}
          role="button"
          tabIndex={bloqueado ? -1 : 0}
          aria-label="Seleccionar documentos para traducir"
          aria-busy={revisando}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-colors min-h-[150px] ${
            bloqueado
              ? 'border-[#E5E5E5] bg-[#FAFAF7] cursor-not-allowed opacity-60'
              : isDragging
                ? 'border-[#C8FF00] bg-[#F4FFC4] cursor-pointer'
                : 'border-[#C8FF00] bg-[#F5F5F0] hover:bg-[#F4FFC4] cursor-pointer'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            disabled={bloqueado}
            onChange={(e) => e.target.files?.length && agregar(e.target.files)}
            className="hidden"
          />
          <div className="bg-[#E4F5C6] text-[#2F4A00] rounded-full p-3 mb-3">
            {revisando ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <p className="text-[#0A0A0A] font-medium mb-1 text-sm">
            {revisando ? 'Revisando archivos…' : 'Haz clic o arrastra los documentos aquí'}
          </p>
          <p className="text-[#A3A3A3] text-xs">
            PDF, JPG o PNG · hasta {MAX_FILES_POR_LOTE} archivos · máx. 50 MB cada uno
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-[#DC2626] break-words">{error}</p>}

      {soloRepetidos && (
        <p role="status" className="mt-3 px-3 py-2 rounded-lg bg-[#F5F5F0] border border-[#E5E5E5] text-[13px] text-[#525252]">
          Estos documentos ya estaban en el lote, no hay nada nuevo que traducir.
        </p>
      )}

      {nuevos.length > 0 && (
        <section className="mt-3">
          <h4 className="my-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
            Se van a subir ({nuevos.length})
          </h4>
          <ul className="space-y-1">
            {nuevos.map((archivo) => (
              <li key={archivo.hash} className="h-8 flex items-center gap-2 px-2 -mx-2 rounded-md hover:bg-[#F5F5F0]">
                <span className="flex-1 min-w-0 truncate text-[13px] text-[#0A0A0A]" title={archivo.nombre}>
                  {archivo.nombre}
                </span>
                <span className="shrink-0 text-[12px] text-[#6B6B6B] tabular-nums">{formatFileSize(archivo.bytes)}</span>
                <button
                  type="button"
                  onClick={() => quitar(archivo)}
                  disabled={bloqueado}
                  aria-label={`Quitar ${archivo.nombre}`}
                  title="Quitar"
                  className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-[#6B6B6B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-40"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {omitidos.length > 0 && (
        <section className="mt-3">
          <h4 className="my-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
            {loteId ? 'Ya están en el lote, se omiten' : 'Repetidos, se omiten'} ({omitidos.length})
          </h4>
          <ul className="space-y-0.5">
            {omitidos.map((o, i) => {
              const nota =
                o.motivo === 'tanda'
                  ? 'repetido en esta selección'
                  : o.nombreAnterior && o.nombreAnterior !== o.nombre
                    ? `ya subido como “${o.nombreAnterior}”`
                    : 'ya subido'
              return (
                <li key={`${o.hash}-${i}`} className="h-6 flex items-baseline gap-1.5 min-w-0 text-[12px] text-[#6B6B6B]">
                  <span className="shrink-0 max-w-[60%] truncate" title={o.nombre}>{o.nombre}</span>
                  <span className="min-w-0 truncate text-[#A3A3A3]" title={nota}>· {nota}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
