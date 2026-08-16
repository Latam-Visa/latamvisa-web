"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { UploadCloud, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createUploadUrls } from '../_actions/create-upload-urls'
import { FormField } from '../../turismo-usa/_components/FormField'

export interface TranslatedDoc {
  nombre_original: string
  storage_path: string
}

interface UploadItem {
  id: string
  name: string
  status: 'uploading' | 'success' | 'error'
  errorMessage?: string
}

const MAX_SIZE = 50 * 1024 * 1024

interface Props {
  applicationId: string
  value: TranslatedDoc[]
  onChange: (docs: TranslatedDoc[]) => void
  onUploadStateChange?: (isUploading: boolean, hasError: boolean) => void
}

export function TranslatedDocsUploader({ applicationId, value, onChange, onUploadStateChange }: Props) {
  const [items, setItems] = useState<UploadItem[]>([])
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    const isUploading = items.some((item) => item.status === 'uploading')
    const hasError = items.some((item) => item.status === 'error')
    onUploadStateChange?.(isUploading, hasError)
  }, [items, onUploadStateChange])

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      setItems((prev) => [
        ...prev,
        ...fileRejections.map((r) => ({
          id: `${r.file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: r.file.name,
          status: 'error' as const,
          errorMessage: r.errors[0]?.code === 'file-too-large' ? 'Supera los 50MB.' : 'Solo se aceptan archivos PDF.',
        })),
      ])
    }

    if (acceptedFiles.length === 0) return

    const pendingIds = acceptedFiles.map((f, i) => `${f.name}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`)
    setItems((prev) => [
      ...prev,
      ...acceptedFiles.map((f, i) => ({ id: pendingIds[i], name: f.name, status: 'uploading' as const })),
    ])

    try {
      const { success, targets, error } = await createUploadUrls(
        applicationId,
        acceptedFiles.map((f) => ({ name: f.name, size: f.size }))
      )

      if (!success || !targets) {
        setItems((prev) => prev.map((item) =>
          pendingIds.includes(item.id) ? { ...item, status: 'error', errorMessage: error || 'No se pudo preparar la subida.' } : item
        ))
        return
      }

      const supabase = createClient()
      const uploadedDocs: TranslatedDoc[] = []

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        const target = targets[i]
        const itemId = pendingIds[i]

        try {
          const { error: uploadError } = await supabase.storage
            .from('documentos-originales')
            .uploadToSignedUrl(target.path, target.token, file)

          if (uploadError) throw uploadError

          uploadedDocs.push({ nombre_original: file.name, storage_path: target.path })
          setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, status: 'success' } : item)))
        } catch (err: any) {
          console.error('[TRANSLATED_DOCS_UPLOAD]', err)
          setItems((prev) => prev.map((item) =>
            item.id === itemId ? { ...item, status: 'error', errorMessage: 'Error al subir el archivo.' } : item
          ))
        }
      }

      if (uploadedDocs.length > 0) {
        onChange([...valueRef.current, ...uploadedDocs])
      }
    } catch (err: any) {
      console.error('[TRANSLATED_DOCS_PREP]', err)
      setItems((prev) => prev.map((item) =>
        pendingIds.includes(item.id) ? { ...item, status: 'error', errorMessage: 'Ocurrió un error inesperado.' } : item
      ))
    }
  }, [applicationId, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE,
    multiple: true,
  })

  const handleRemove = (item: UploadItem) => {
    if (item.status === 'success') {
      const doc = valueRef.current.find((d) => d.nombre_original === item.name)
      if (doc) onChange(valueRef.current.filter((d) => d.storage_path !== doc.storage_path))
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  return (
    <FormField
      label="Documentos para traducir (opcional)"
      name="translated_docs"
      hint="Sube tus documentos en PDF para que nuestro equipo prepare la traducción oficial."
    >
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[160px]
          ${isDragActive ? 'border-[#C8FF00] bg-[#F4FFC4]' : 'border-[#C8FF00] bg-[#F5F5F0] hover:border-[#C8FF00]/60'}`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="bg-[#1A1A1A] text-[#C8FF00] rounded-full p-3 inline-block mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-[#0A0A0A] font-medium mb-1">Haz clic o arrastra tus PDFs aquí</p>
          <p className="text-[#A3A3A3] text-sm">Solo PDF, hasta 50MB cada uno. Puedes subir varios a la vez.</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#E5E5E5] shrink-0 flex items-center justify-center">
                {item.status === 'uploading' && <RefreshCw className="w-5 h-5 text-[#3D5A00] animate-spin" />}
                {item.status === 'success' && <CheckCircle2 className="w-5 h-5 text-[#3D5A00]" />}
                {item.status === 'error' && <AlertCircle className="w-5 h-5 text-[#DC2626]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#0A0A0A] font-medium truncate">{item.name}</div>
                {item.status === 'uploading' && <p className="text-[#A3A3A3] text-sm">Subiendo...</p>}
                {item.status === 'success' && <p className="text-[#3D5A00] text-sm">Subido correctamente</p>}
                {item.status === 'error' && <p className="text-[#DC2626] text-sm">{item.errorMessage}</p>}
              </div>
              {item.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="text-sm font-medium text-[#DC2626] hover:text-[#B91C1C] flex items-center gap-1 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </FormField>
  )
}
