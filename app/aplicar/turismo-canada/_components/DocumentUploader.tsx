import { useState, useCallback, useRef, useEffect } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import imageCompression from 'browser-image-compression'
import { UploadCloud, File as FileIcon, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { FormField } from '../../turismo-usa/_components/FormField' // Reuse USA form field
import { getUploadUrl } from '../_actions/get-upload-url'

interface DocumentUploaderProps {
  name: string
  label: string
  hint?: string
  required?: boolean
  specsList?: string[]
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export function DocumentUploader({ name, label, hint, required, specsList }: DocumentUploaderProps) {
  const { control } = useFormContext()
  const { field, fieldState } = useController({ name, control })
  
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setErrorMsg('')
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Formato inválido. Sube JPG, PNG, WEBP, PDF o DOCX.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('El archivo supera los 50MB.')
      return
    }

    setIsUploading(true)
    try {
      let fileToUpload = file
      
      // Compress only if it's an image
      if (file.type.startsWith('image/') && file.type !== 'image/heic') {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
          fileType: 'image/jpeg'
        }
        fileToUpload = await imageCompression(file, options)
      }
      
      // Get signed URL
      const { success, url, path, error } = await getUploadUrl(fileToUpload.type)
      if (!success || !url || !path) {
        throw new Error(error || 'Error al obtener URL de subida')
      }

      // Upload file directly to Supabase via PUT
      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: fileToUpload,
        headers: {
          'Content-Type': fileToUpload.type
        }
      })

      if (!uploadRes.ok) {
        throw new Error('Error al subir el archivo')
      }

      // Success
      field.onChange(path)
      setFileName(file.name)
      setFileSize(fileToUpload.size)
    } catch (error: any) {
      console.error(error)
      setErrorMsg(error.message || 'Error procesando el archivo.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleRemove = () => {
    field.onChange('')
    setFileName('')
    setFileSize(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const triggerSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <FormField label={label} name={name} required={required} hint={hint} error={fieldState.error?.message || errorMsg}>
      {specsList && specsList.length > 0 && (
        <div className="mb-3">
          <ul className="pl-5 list-disc text-sm text-[#0A0A0A] space-y-1 bg-[#F5F5F0] p-4 rounded-lg border border-[#3D5A00]/20">
            {specsList.map((spec, idx) => (
              <li key={idx}>{spec}</li>
            ))}
          </ul>
        </div>
      )}

      {!field.value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[160px]
            ${isDragging ? 'border-[#2F4A00] bg-[#F4FFC4]' : 'border-[#2F4A00] bg-[#F5F5F0] hover:border-[#2F4A00]/60 hover:bg-[#F5F5F0]'}`}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/heic"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="text-center text-[#3D5A00]">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
              <p className="font-medium">Subiendo archivo...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-[#1A1A1A] text-[#2F4A00] rounded-full p-3 inline-block mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-[#0A0A0A] font-medium mb-1">Haz clic o arrastra tu archivo aquí</p>
              <p className="text-[#A3A3A3] text-sm">PDF, DOC, DOCX, JPG, PNG hasta 50MB</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-white border border-[#E5E5E5] shrink-0 flex items-center justify-center">
            <FileIcon className="w-8 h-8 text-[#3D5A00]" />
          </div>
          <div className="flex-1">
            <div className="text-[#0A0A0A] font-medium mb-1 truncate max-w-[200px] sm:max-w-[400px]">
              {fileName || 'Documento cargado exitosamente'}
            </div>
            {fileSize > 0 && <p className="text-[#A3A3A3] text-sm mb-2">{(fileSize / 1024).toFixed(1)} KB</p>}
            
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm font-medium text-[#DC2626] hover:text-[#B91C1C] flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </FormField>
  )
}
