"use client"

import { useState } from 'react'

export function CopyText({ text }: { text: string }) {
  const [estado, setEstado] = useState('Copy as text')
  return (
    <section className="rounded-2xl border border-[#E8E8E3] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#0d2b0d]">Summary for Max</h2>
        <button
          onClick={async () => {
            try { await navigator.clipboard.writeText(text); setEstado('Copied') } catch { setEstado('Select and copy manually') }
          }}
          className="rounded-xl bg-[#C8FF00] px-4 py-2 text-xs font-bold text-[#0d2b0d]">{estado}</button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap font-funnel text-sm leading-relaxed text-[#2A2A24]">{text}</pre>
    </section>
  )
}
