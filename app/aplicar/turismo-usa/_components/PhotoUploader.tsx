import { useState, useCallback, useRef } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import imageCompression from 'browser-image-compression'
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { FormField } from './FormField'

interface PhotoUploaderProps {
  name: string
  label: string
  hint?: string
  required?: boolean
  specsList?: string[]
}

export function PhotoUploader({ name, label, hint, required, specsList }: PhotoUploaderProps) {
  const { control } = useFormContext()
  const { field, fieldState } = useController({ name, control })
  
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showSpecs, setShowSpecs] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setErrorMsg('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Formato inválido. Solo JPG, PNG, o WEBP.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('El archivo original supera los 10MB.')
      return
    }

    setIsCompressing(true)
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: 'image/jpeg'
      }
      const compressedFile = await imageCompression(file, options)
      
      const reader = new FileReader()
      reader.readAsDataURL(compressedFile)
      reader.onloadend = () => {
        field.onChange(reader.result as string)
        setFileName(file.name)
        setFileSize(compressedFile.size)
        setIsCompressing(false)
      }
    } catch (error) {
      console.error(error)
      setErrorMsg('Error comprimiendo la imagen.')
      setIsCompressing(false)
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
          <button
            type="button"
            onClick={() => setShowSpecs(!showSpecs)}
            className="flex items-center gap-2 text-sm text-[#C8FF00] hover:text-[#A8D900] transition-colors"
          >
            {showSpecs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Ver requisitos de la foto
          </button>
          {showSpecs && (
            <ul className="mt-2 pl-5 list-disc text-sm text-[#525252] space-y-1 bg-[#F5F5F0] p-4 rounded-lg border border-[#E5E5E5]">
              {specsList.map((spec, idx) => (
                <li key={idx}>{spec}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!field.value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[200px]
            ${isDragging ? 'border-[#C8FF00] bg-[#F4FFC4]' : 'border-[#C8FF00]/30 bg-[#F5F5F0] hover:border-[#C8FF00]/60 hover:bg-[#F5F5F0]'}`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {isCompressing ? (
            <div className="text-center text-[#C8FF00]">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
              <p className="font-medium">Optimizando imagen...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-[#1A1A1A] text-[#C8FF00] rounded-full p-4 inline-block mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-[#0A0A0A] font-medium text-lg mb-1">Haz clic o arrastra tu foto aquí</p>
              <p className="text-[#A3A3A3] text-sm">JPEG, PNG, WEBP hasta 10MB</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-[#E5E5E5] shrink-0 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[#0A0A0A] font-medium mb-1">
              <ImageIcon className="w-4 h-4 text-[#C8FF00]" />
              <span className="truncate max-w-[200px]">{fileName || 'Imagen cargada'}</span>
            </div>
            {fileSize > 0 && <p className="text-[#A3A3A3] text-sm mb-4">{(fileSize / 1024).toFixed(1)} KB (Optimizada)</p>}
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={triggerSelect}
                className="px-4 py-2 text-sm font-medium border border-[#E5E5E5] rounded-lg text-[#0A0A0A] hover:border-[#C8FF00] hover:text-[#C8FF00] transition-colors"
              >
                Cambiar foto
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-medium border border-[#E5E5E5] rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#DC2626]/30 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </FormField>
  )
}
