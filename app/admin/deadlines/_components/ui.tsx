import { COLOR_CATEGORIA, ETIQUETA_CATEGORIA, type CategoriaBloque, type Categoria, type Slot } from '@/lib/deadlines/routine'
import type { Fecha } from '@/lib/deadlines/dates'

export interface Tarea {
  id: string
  due_date: Fecha
  slot: Slot
  category: Categoria
  title: string
  notes: string | null
  done: boolean
}

export type Resultado = { ok: true } | { ok: false; error: string }

// Foco visible en todo control (teclado).
export const foco =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F4A00] focus-visible:ring-offset-2 focus-visible:ring-offset-white'

// Botones: neón como fondo o blanco con borde. Nunca fondos negros.
export const btnPrimario = `inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C8FF00] text-[#0d2b0d] font-bold text-sm px-3 min-h-[40px] hover:bg-[#b8ef00] disabled:opacity-50 motion-safe:transition-colors ${foco}`
export const btnSecundario = `inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-[#0d2b0d]/15 text-[#0d2b0d] font-semibold text-sm px-3 min-h-[40px] hover:border-[#0d2b0d]/40 disabled:opacity-50 motion-safe:transition-colors ${foco}`
export const btnPeligro = `inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold text-sm px-3 min-h-[40px] hover:bg-red-100 ${foco}`
export const campo = `w-full rounded-lg bg-white border border-[#0d2b0d]/15 text-[#0d2b0d] px-3 min-h-[44px] text-base sm:text-sm ${foco}`
export const tarjeta = 'rounded-2xl bg-white border border-[#0d2b0d]/10'

export function Swatch({ categoria, size = 10 }: { categoria: CategoriaBloque; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-[3px]"
      style={{ width: size, height: size, backgroundColor: COLOR_CATEGORIA[categoria] }}
      title={ETIQUETA_CATEGORIA[categoria]}
    />
  )
}
