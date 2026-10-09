import { COPY_PAGINA } from '@/lib/cotizaciones/contenido'

// Misma nota de seguridad que /agendar, con el verde de texto de marca.
export function NotaSeguridad() {
  return (
    <div className="p-5 rounded-xl bg-white border border-[#0d2b0d]/10 flex items-center gap-4">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F4A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <p className="font-iceland text-[11px] text-[#0d2b0d] font-bold uppercase tracking-widest leading-relaxed">
        {COPY_PAGINA.seguridad[0]} <br />
        {COPY_PAGINA.seguridad[1]}
      </p>
    </div>
  )
}
