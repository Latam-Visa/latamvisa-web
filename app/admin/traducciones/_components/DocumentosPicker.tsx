"use client"

import { useRef, useState } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { ALLOWED_UPLOAD_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILES_POR_LOTE, formatFileSize } from '@/lib/traducciones/shared'

const ACCEPT = 'application/pdf,image/jpeg,image/png'

/* Selector de archivos con drag & drop. Solo elige y lista: la subida la
   dispara el formulario que lo contiene, para que el progreso se muestre junto
   al botón de envío. */
export function DocumentosPicker({
  archivos,
  onChange,
  disabled,
}: {
  archivos: File[]
  onChange: (archivos: File[]) => void
  disabled?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const agregar = (lista: FileList | File[]) => {
    setError('')
    const nuevos: File[] = []
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
      // Mismo nombre y mismo tamaño: es el archivo que ya está en la lista.
      const yaEsta =
        archivos.some((a) => a.name === archivo.name && a.size === archivo.size) ||
        nuevos.some((a) => a.name === archivo.name && a.size === archivo.size)
      if (yaEsta) continue
      nuevos.push(archivo)
    }

    const total = archivos.length + nuevos.length
    if (total > MAX_FILES_POR_LOTE) {
      const cabe = Math.max(0, MAX_FILES_POR_LOTE - archivos.length)
      rechazados.push(`solo caben ${MAX_FILES_POR_LOTE} archivos por traducción`)
      nuevos.splice(cabe)
    }

    if (rechazados.length > 0) setError(`No se agregaron: ${rechazados.join(', ')}.`)
    if (nuevos.length > 0) onChange([...archivos, ...nuevos])
    if (inputRef.current) inputRef.current.value = ''
  }

  const quitar = (index: number) => {
    setError('')
    onChange(archivos.filter((_, i) => i !== index))
  }

  const lleno = archivos.length >= MAX_FILES_POR_LOTE

  return (
    <div>
      {!lleno && (
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            if (!disabled && e.dataTransfer.files?.length) agregar(e.dataTransfer.files)
          }}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (disabled) return
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() }
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Seleccionar documentos para traducir"
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-colors min-h-[150px] ${
            disabled
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
            disabled={disabled}
            onChange={(e) => e.target.files?.length && agregar(e.target.files)}
            className="hidden"
          />
          <div className="bg-[#E4F5C6] text-[#2F4A00] rounded-full p-3 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-[#0A0A0A] font-medium mb-1 text-sm">Haz clic o arrastra los documentos aquí</p>
          <p className="text-[#A3A3A3] text-xs">
            PDF, JPG o PNG · hasta {MAX_FILES_POR_LOTE} archivos · máx. 50 MB cada uno
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-[#DC2626] break-words">{error}</p>}

      {archivos.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-[#6B6B6B]">
            {archivos.length} de {MAX_FILES_POR_LOTE} archivos
          </p>
          {archivos.map((archivo, i) => (
            <div
              key={`${archivo.name}-${archivo.size}-${i}`}
              className="bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl p-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E5E5] shrink-0 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#3D5A00]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0A0A0A] font-medium truncate" title={archivo.name}>
                  {archivo.name}
                </p>
                <p className="text-xs text-[#A3A3A3]">{formatFileSize(archivo.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => quitar(i)}
                disabled={disabled}
                aria-label={`Quitar ${archivo.name}`}
                className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
