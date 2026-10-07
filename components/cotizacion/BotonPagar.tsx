'use client'

import { useState } from 'react'

// El formulario solo envía la server action ligada al token; el monto del
// botón es únicamente visual.
export function BotonPagar({ action, label }: { action: () => Promise<void>; label: string }) {
  const [enviando, setEnviando] = useState(false)

  return (
    <form action={action} onSubmit={() => setEnviando(true)}>
      <button
        type="submit"
        disabled={enviando}
        className="w-full min-h-[56px] px-5 py-4 rounded-xl bg-[#C8FF00] text-[#0d2b0d] font-monument uppercase tracking-wide text-sm sm:text-base hover:bg-[#b8ef00] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-wait"
      >
        {enviando ? 'Conectando checkout seguro…' : label}
      </button>
    </form>
  )
}
