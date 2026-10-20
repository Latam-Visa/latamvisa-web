// Piezas visuales del portal del cliente, en la línea de latamvisatravel.com.
// Neón solo como fondo de botones; nunca fondos negros en botones ni campos.

export const foco =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F4A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF7]'
export const btnPrimario = `inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8FF00] text-[#0d2b0d] font-bold text-base px-4 min-h-[48px] hover:bg-[#b8ef00] disabled:opacity-60 motion-safe:transition-colors ${foco}`
export const btnSecundario = `inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-[#0d2b0d]/15 text-[#0d2b0d] font-semibold text-base px-4 min-h-[48px] hover:border-[#0d2b0d]/40 disabled:opacity-60 motion-safe:transition-colors ${foco}`
export const campo = `w-full rounded-xl bg-white border border-[#0d2b0d]/20 text-[#0d2b0d] placeholder:text-[#0d2b0d]/40 px-3 min-h-[48px] text-base ${foco}`
export const etiqueta = 'block text-sm font-semibold text-[#0d2b0d] mb-1.5'
export const tarjeta = 'rounded-2xl bg-white border border-[#0d2b0d]/10 shadow-sm'
export const titulo = 'font-monument uppercase text-[#0d2b0d] leading-tight break-words'
export const enlace = `font-semibold text-[#2F4A00] underline underline-offset-2 hover:text-[#0d2b0d] ${foco}`
export const avisoError = 'rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'
export const avisoOk = 'rounded-xl border border-[#2F4A00]/20 bg-[#F4FBE0] p-4 text-sm text-[#2F4A00] font-semibold'

export const WHATSAPP = '61426779734'
