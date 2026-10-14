// Piezas visuales de Finanzas. Neón solo como fondo de botones/insignias,
// nunca fondos negros en botones, campos ni cajas de texto.

export const foco =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F4A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF7]'
export const btnPrimario = `inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8FF00] text-[#0d2b0d] font-bold text-sm px-4 min-h-[44px] hover:bg-[#b8ef00] disabled:opacity-50 motion-safe:transition-colors ${foco}`
export const btnSecundario = `inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-[#0d2b0d]/15 text-[#0d2b0d] font-semibold text-sm px-4 min-h-[44px] hover:border-[#0d2b0d]/40 disabled:opacity-50 motion-safe:transition-colors ${foco}`
export const btnPeligro = `inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-sm px-4 min-h-[44px] hover:bg-red-100 disabled:opacity-50 ${foco}`
export const campo = `w-full rounded-xl bg-white border border-[#0d2b0d]/15 text-[#0d2b0d] px-3 min-h-[44px] text-base ${foco}`
export const etiqueta = 'block text-sm font-semibold text-[#0d2b0d] mb-1.5'
export const tarjeta = 'rounded-2xl bg-white border border-[#0d2b0d]/10'
export const titulo = 'font-monument uppercase text-[#0d2b0d]'

export function Chips<T extends string>({
  opciones,
  valor,
  onChange,
  etiquetaGrupo,
}: {
  opciones: { valor: T; label: string }[]
  valor: T | null | undefined
  onChange: (v: T) => void
  etiquetaGrupo: string
}) {
  return (
    <div role="radiogroup" aria-label={etiquetaGrupo} className="flex flex-wrap gap-2">
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          onClick={() => onChange(o.valor)}
          className={`rounded-full px-4 min-h-[44px] text-sm font-semibold border ${foco} ${
            valor === o.valor ? 'bg-[#C8FF00] border-[#2F4A00]/40 text-[#0d2b0d]' : 'bg-white border-[#0d2b0d]/15 text-[#0d2b0d] hover:border-[#0d2b0d]/40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export const FRECUENCIA_LABEL: Record<string, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual',
  unico: 'Una vez',
}

export const AVISO_LEGAL = 'Esta herramienta te ayuda a organizar tu plata. No es asesoría financiera.'
