"use client"

import { useRef, useState } from 'react'
import { UploadCloud, X, Check, Loader2, RotateCw } from 'lucide-react'
import { MAX_FILES_POR_LOTE, formatFileSize } from '@/lib/traducciones/shared'
import { resumenCarga, type ItemCarga } from '@/lib/traducciones/cola-carga'
import { useCargaLote } from './useCargaLote'

const ACCEPT = 'application/pdf,image/jpeg,image/png'

function FilaCarga({ item, onQuitar, onReintentar }: { item: ItemCarga; onQuitar: () => void; onReintentar: () => void }) {
  const repetido = item.estado === 'repetido'
  const nota = repetido
    ? item.nombreAnterior && item.nombreAnterior !== item.nombre
        ? `se omite · ya subido como “${item.nombreAnterior}”`
        : 'se omite · ya subido'
    : null

  return (
    <li className="h-8 flex items-center gap-2 px-2 -mx-2 rounded-md hover:bg-[#F5F5F0]">
      <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
        <span
          className={`min-w-0 truncate ${repetido ? 'shrink-0 max-w-[55%] text-[12px] text-[#6B6B6B]' : 'text-[13px] text-[#0A0A0A]'}`}
          title={item.nombre}
        >
          {item.nombre}
        </span>
        {nota && <span className="min-w-0 truncate text-[12px] text-[#A3A3A3]" title={nota}>· {nota}</span>}
        {item.estado === 'error' && (
          <span className="min-w-0 truncate text-[12px] text-red-700" title={item.error}>· {item.error}</span>
        )}
        {item.estado === 'cargado' && item.error && (
          <span className="min-w-0 truncate text-[12px] text-red-700" title={item.error}>· {item.error}</span>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2 text-[12px] text-[#6B6B6B] tabular-nums">
        {(item.estado === 'revisando' || item.estado === 'en_cola') && <span>En cola</span>}
        {item.estado === 'subiendo' && (
          <>
            <span
              className="w-16 sm:w-28 h-1 rounded-full bg-[#E5E5E5] overflow-hidden"
              role="progressbar"
              aria-label={`Subiendo ${item.nombre}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(item.progreso * 100)}
            >
              <span className="block h-full bg-[#C8FF00] transition-[width] duration-200" style={{ width: `${Math.round(item.progreso * 100)}%` }} />
            </span>
            <span className="w-8 text-right">{Math.round(item.progreso * 100)}%</span>
          </>
        )}
        {item.estado === 'cargado' && (
          <>
            <span className="hidden sm:inline">{formatFileSize(item.bytes)}</span>
            <Check className="w-3.5 h-3.5 text-[#2F4A00]" aria-label="Cargado" />
          </>
        )}
        {item.estado === 'error' && (
          <button
            type="button"
            onClick={onReintentar}
            className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px] text-[#0A0A0A] hover:bg-[#F5F5F0]"
          >
            <RotateCw className="w-3 h-3" />
            Reintentar
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onQuitar}
        aria-label={
          item.estado === 'subiendo' ? `Cancelar subida de ${item.nombre}` : item.estado === 'cargado' ? `Borrar ${item.nombre}` : `Quitar ${item.nombre}`
        }
        title={item.estado === 'subiendo' ? 'Cancelar' : item.estado === 'cargado' ? 'Borrar' : 'Quitar'}
        className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-[#6B6B6B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </li>
  )
}

/* Zona de arrastre + lista + barra "Ya terminé". Los archivos suben solos al
   soltarlos; el único clic que importa es decir que ya terminó, y eso lo
   resuelve el servidor (POST /api/traducciones/[id]/enviar). */
export function CargaDocumentos({
  obtenerLoteId,
  antesDeSoltar,
  pendientesPrevios = [],
  antesDeEnviar,
  onEnviado,
}: {
  // Crea el lote si hace falta (en /nueva) y devuelve su id.
  obtenerLoteId: () => Promise<string>
  // Mensaje si todavía no se puede soltar (p. ej. falta el nombre del cliente).
  antesDeSoltar?: () => string | null
  /* Ids de filas cargadas en otra visita y nunca enviadas: "Ya terminé" también
     las manda. Son ids y no un número porque la página se refresca sola mientras
     traduce, y un conteo del servidor incluiría lo que se está subiendo ahora. */
  pendientesPrevios?: string[]
  // Corre justo antes de "Ya terminé" (p. ej. guardar el país elegido en /nueva).
  antesDeEnviar?: (loteId: string) => Promise<void>
  onEnviado: (enviados: number, loteId: string) => void
}) {
  const { items, aviso, agregar, quitar, reintentar, limpiar } = useCargaLote(obtenerLoteId)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { cargados, enCurso, total } = resumenCarga(items)
  const paraEnviar = new Set([...pendientesPrevios, ...items.flatMap((i) => (i.estado === 'cargado' && i.docId ? [i.docId] : []))]).size
  const omitidos = items.filter((i) => i.estado === 'repetido').length

  const soltar = (lista: FileList | File[]) => {
    const bloqueo = antesDeSoltar?.()
    if (bloqueo) return setError(bloqueo)
    setError('')
    agregar(lista)
  }

  const terminar = async () => {
    setEnviando(true)
    setError('')
    try {
      const loteId = await obtenerLoteId()
      await antesDeEnviar?.(loteId)
      const res = await fetch(`/api/traducciones/${loteId}/enviar`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No pudimos enviar a traducir.')
      limpiar()
      onEnviado(json.enviados || 0, loteId)
    } catch (err: any) {
      setError(`${err?.message || 'No pudimos enviar a traducir.'} Los archivos siguen cargados: puedes intentar otra vez.`)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!enviando) setIsDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (!enviando && e.dataTransfer.files?.length) soltar(e.dataTransfer.files)
        }}
        onClick={() => !enviando && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (enviando) return
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() }
        }}
        role="button"
        tabIndex={enviando ? -1 : 0}
        aria-label="Seleccionar documentos para traducir"
        className={`border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center justify-center text-center transition-colors ${
          enviando
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
          disabled={enviando}
          onChange={(e) => {
            if (e.target.files?.length) soltar(e.target.files)
            e.target.value = ''
          }}
          className="hidden"
        />
        <div className="bg-[#E4F5C6] text-[#2F4A00] rounded-full p-2.5 mb-2">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-[#0A0A0A] font-medium mb-0.5 text-sm">
          {items.length > 0 ? 'Puedes seguir arrastrando más documentos' : 'Arrastra los documentos aquí: se suben solos'}
        </p>
        <p className="text-[#6B6B6B] text-xs">PDF, JPG o PNG · hasta {MAX_FILES_POR_LOTE} archivos por tanda · máx. 50 MB cada uno</p>
      </div>

      {(error || aviso) && <p role="alert" className="mt-2 text-xs text-[#DC2626] break-words">{error || aviso}</p>}

      {items.length > 0 && (
        <section className="mt-3">
          <h4 className="my-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
            Documentos ({cargados} cargados{enCurso > 0 ? ` · ${enCurso} en curso` : ''}{omitidos > 0 ? ` · ${omitidos} se omiten` : ''})
          </h4>
          <ul className="space-y-0.5">
            {items.map((item) => (
              <FilaCarga key={item.key} item={item} onQuitar={() => quitar(item.key)} onReintentar={() => reintentar(item.key)} />
            ))}
          </ul>
        </section>
      )}

      {paraEnviar > 0 && (
        <>
          {/* Espacio para que la barra fija no tape la última fila. */}
          <div className="h-24 sm:h-20" aria-hidden />
          <div className="fixed inset-x-0 bottom-0 z-30 bg-white border-t border-[#E5E5E5] shadow-[0_-6px_20px_-12px_rgba(0,0,0,0.18)]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="flex-1 min-w-0 text-[13px] text-[#525252]">
                <span className="font-semibold text-[#0A0A0A]">
                  {paraEnviar} {paraEnviar === 1 ? 'documento cargado' : 'documentos cargados'}
                </span>
                <span className="hidden sm:inline"> · puedes seguir arrastrando más</span>
              </p>
              <button
                type="button"
                onClick={terminar}
                disabled={enCurso > 0 || enviando}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-[13px] font-bold bg-[#C8FF00] text-[#2F4A00] hover:bg-[#b8ef00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {(enCurso > 0 || enviando) && <Loader2 className="w-4 h-4 animate-spin" />}
                {enviando
                  ? 'Enviando a traducir…'
                  : enCurso > 0
                    ? `Subiendo ${cargados} de ${total}…`
                    : `Ya terminé · Traducir ${paraEnviar}`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
