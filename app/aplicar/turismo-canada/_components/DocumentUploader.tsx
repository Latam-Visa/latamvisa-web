import { useState, useCallback, useRef, useEffect } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import imageCompression from 'browser-image-compression'
import { UploadCloud, File as FileIcon, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { FormField } from '../../turismo-usa/_components/FormField' // Reuse USA form field
import { getUploadUrl } from '../_actions/get-upload-url'
import { sanitizePdfFile } from '@/lib/pdf-sanitize'
import { convertirHeicAJpeg, esHeic, mensajeArchivoGrande } from '@/lib/aplicaciones/archivos-cliente'

interface DocumentUploaderProps {
  name: string
  label: string
  hint?: string
  required?: boolean
  specsList?: string[]
  multiple?: boolean
}

// Mismo límite que el bucket visa-applications de Supabase.
const MAX_BYTES = 50 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export function DocumentUploader({ name, label, hint, required, specsList, multiple = false }: DocumentUploaderProps) {
  const { control } = useFormContext()
  const { field, fieldState } = useController({ name, control })
  
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fileDetails, setFileDetails] = useState<{name: string, size: number, path: string}[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (original: File) => {
    setErrorMsg('')
    // Antes de subir nada: el tamaño se avisa con el peso real del archivo.
    if (original.size > MAX_BYTES) {
      setErrorMsg(mensajeArchivoGrande(original, MAX_BYTES))
      return
    }
    if (!esHeic(original) && !ALLOWED_TYPES.includes(original.type)) {
      setErrorMsg('Formato inválido. Sube JPG, PNG, WEBP, HEIC (iPhone), PDF o DOCX.')
      return
    }

    setIsUploading(true)
    try {
      // Fotos de iPhone (HEIC/HEIF) se convierten a JPEG antes de subirlas.
      let file = original
      try {
        file = await convertirHeicAJpeg(original)
      } catch {
        throw new Error('No pudimos convertir esta foto de iPhone. Toma una captura de pantalla de la foto o súbela como PDF.')
      }
      let fileToUpload = file

      // Compress only if it's an image
      if (file.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
          fileType: 'image/jpeg'
        }
        fileToUpload = await imageCompression(file, options)
      } else if (file.type === 'application/pdf') {
        fileToUpload = await sanitizePdfFile(file)
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
      if (multiple) {
        const currentVals = Array.isArray(field.value) ? field.value : (field.value ? [field.value] : [])
        field.onChange([...currentVals, path])
        setFileDetails(prev => [...prev, { name: file.name, size: fileToUpload.size, path }])
      } else {
        field.onChange(path)
        setFileDetails([{ name: file.name, size: fileToUpload.size, path }])
      }
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

  const handleRemove = (pathToRemove?: string) => {
    if (multiple && pathToRemove) {
      const currentVals = Array.isArray(field.value) ? field.value : []
      const newVals = currentVals.filter(p => p !== pathToRemove)
      field.onChange(newVals.length > 0 ? newVals : undefined)
      setFileDetails(prev => prev.filter(f => f.path !== pathToRemove))
    } else {
      field.onChange('')
      setFileDetails([])
    }
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

      {(!field.value || (multiple && (!Array.isArray(field.value) || field.value.length < 5))) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[160px]
            ${isDragging ? 'border-[#C8FF00] bg-[#F4FFC4]' : 'border-[#C8FF00] bg-[#F5F5F0] hover:border-[#C8FF00]/60 hover:bg-[#F5F5F0]'}`}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
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
              <div className="bg-[#1A1A1A] text-[#C8FF00] rounded-full p-3 inline-block mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-[#0A0A0A] font-medium mb-1">Haz clic o arrastra tu archivo aquí</p>
              <p className="text-[#A3A3A3] text-sm">PDF, DOC, DOCX, JPG, PNG, HEIC (iPhone) hasta 50MB</p>
            </div>
          )}
        </div>
      )}
      
      {field.value && (Array.isArray(field.value) ? field.value.length > 0 : true) && (
        <div className="mt-4 space-y-3">
          {(multiple && Array.isArray(field.value) ? field.value : [field.value]).map((val, idx) => {
            const detail = fileDetails.find(d => d.path === val) || { name: `Documento cargado exitosamente ${idx + 1}`, size: 0, path: val }
            return (
              <div key={idx} className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-white border border-[#E5E5E5] shrink-0 flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-[#3D5A00]" />
                </div>
                <div className="flex-1">
                  <div className="text-[#0A0A0A] font-medium mb-1 truncate max-w-[200px] sm:max-w-[400px]">
                    {detail.name}
                  </div>
                  {detail.size > 0 && <p className="text-[#A3A3A3] text-sm mb-2">{(detail.size / 1024).toFixed(1)} KB</p>}
                  
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => handleRemove(val)}
                      className="text-sm font-medium text-[#DC2626] hover:text-[#B91C1C] flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </FormField>
  )
}
