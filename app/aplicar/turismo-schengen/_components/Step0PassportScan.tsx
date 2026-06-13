import { Loader2 } from 'lucide-react'

interface Step0PassportScanProps {
  status: 'idle' | 'uploading' | 'success' | 'error'
  error: string
  onUpload: (file: File) => void
  onSkip: () => void
}

export function Step0PassportScan({ status, error, onUpload, onSkip }: Step0PassportScanProps) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2">Primero, sube tu pasaporte</h2>
        <p className="text-[#525252]">Extraemos tus datos automáticamente para que no tengas que escribirlos a mano.</p>
      </div>

      {status === 'uploading' ? (
        <div className="flex flex-col items-center justify-center p-8 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl">
          <Loader2 className="w-10 h-10 animate-spin text-[#C8FF00] mb-4" />
          <p className="text-lg font-bold text-[#0A0A0A]">Leyendo tu pasaporte...</p>
          <p className="text-sm text-[#525252] mt-2 text-center max-w-sm">Nuestra IA está extrayendo los datos. Esto puede tomar unos segundos.</p>
        </div>
      ) : (
        <div 
          className="bg-[#F5F5F0] p-4 md:p-6 rounded-xl border-2 border-dashed border-[#C8FF00] flex flex-col md:flex-row items-center justify-between gap-4 transition-colors hover:bg-[#F5F5F0]/80"
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              onUpload(e.dataTransfer.files[0])
            }
          }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-start gap-4 flex-1">
            <div className="w-16 h-16 shrink-0 bg-[#1A1A1A] rounded-full flex items-center justify-center">
               <svg className="w-8 h-8 text-[#C8FF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
               </svg>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[#0A0A0A] font-bold mb-1">Arrastra tu archivo aquí o haz clic para subir</p>
              <p className="text-[#888] text-sm">Aceptamos imágenes (JPG, PNG) y PDF. Tamaño máximo: 5MB.</p>
            </div>
          </div>
          <label className="shrink-0 cursor-pointer bg-[#C8FF00] text-black font-bold py-3 px-6 rounded-lg hover:bg-[#B5E600] transition-colors shadow-sm whitespace-nowrap">
            Seleccionar archivo
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUpload(e.target.files[0])
                }
              }}
            />
          </label>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-[#FEF2F2] border border-[#DC2626] p-4 rounded-xl">
          <p className="text-[#DC2626] font-medium mb-4 text-center">{error || 'No pudimos leer el pasaporte. Podés continuar manualmente.'}</p>
          <div className="flex justify-center">
            <button 
              type="button"
              onClick={onSkip} 
              className="bg-white border border-[#DC2626] text-[#DC2626] font-bold py-2 px-6 rounded-lg hover:bg-[#FEF2F2] transition-colors"
            >
              Continuar sin escanear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
