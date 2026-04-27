// components/TraduccionToggle.tsx

'use client'


interface TraduccionToggleProps {
  conTraduccion: boolean
  onChange: (value: boolean) => void
  precioSin: number
  precioCon: number
  currencySymbol: string
}

export default function TraduccionToggle({
  conTraduccion,
  onChange,
  precioSin,
  precioCon,
  currencySymbol,
}: TraduccionToggleProps) {
  const diferencia = precioCon - precioSin

  return (
    <div className="w-full">
      <h3 className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold mb-4">
        ¿NECESITAS TRADUCCIÓN DE DOCUMENTOS?
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Opción: Sin traducción */}
        <button
          onClick={() => onChange(false)}
          className={`
            relative p-4 rounded-xl border-2 transition-all duration-300 text-left
            ${!conTraduccion
              ? 'bg-[#C8FF00] border-[#5B6A00] shadow-md'
              : 'bg-white border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="font-iceland text-[10px] uppercase tracking-widest text-[#5B6A00] font-bold mb-1">
            No necesito
          </div>
          <div className="font-monument text-sm uppercase tracking-tight text-[#111111] mb-2 leading-tight">
            Sin traducción
          </div>
          <div className="font-funnel text-base font-bold text-[#111111]">
            {currencySymbol}{precioSin}
          </div>
        </button>

        {/* Opción: Con traducción */}
        <button
          onClick={() => onChange(true)}
          className={`
            relative p-4 rounded-xl border-2 transition-all duration-300 text-left
            ${conTraduccion
              ? 'bg-[#C8FF00] border-[#5B6A00] shadow-md'
              : 'bg-white border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="font-iceland text-[10px] uppercase tracking-widest text-[#5B6A00] font-bold mb-1">
            Sí necesito
          </div>
          <div className="font-monument text-sm uppercase tracking-tight text-[#111111] mb-2 leading-tight">
            Con traducción
          </div>
          <div className="font-funnel text-base font-bold text-[#111111]">
            {currencySymbol}{precioCon}
            <span className="font-funnel text-xs text-[#5B6A00] ml-1">
              (+{currencySymbol}{diferencia})
            </span>
          </div>
        </button>
      </div>

      <p className="font-funnel text-xs text-[#666666] mt-3 leading-relaxed">
        💡 Si tus documentos ya están en inglés, no necesitas traducción.
        Si están en español u otro idioma, te recomendamos incluir el servicio de traducción.
      </p>
    </div>
  )
}
