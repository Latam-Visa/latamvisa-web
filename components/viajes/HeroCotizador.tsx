'use client'
import { useEffect, useRef, useState } from 'react'
import { scrollToId } from '@/lib/lenis'

/* Cotizador-gancho del hero (/viajes). Vive dentro del primer panel del reel
   (el cielo con nubes). El cliente arma su ruta real entre Australia y su país
   de Latinoamérica (Desde → Hacia); al elegir, se DESPLIEGA la idea que vende
   la campaña "Dos Vacaciones": de paso, en la mitad del camino, puede hacer
   escala en Europa. El CTA baja al cotizador grande (#cotiza).

   Tipografía chica para no competir con el logo ni la frase. Micro-efectos
   (entrada, hover, pop, swap) por CSS (.hc-*), apagados bajo
   prefers-reduced-motion. Sin emojis. */

const AUSTRALIA = 'Australia'

// Países de Latinoamérica (origen o destino, según el otro extremo).
const LATAM = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México', 'Nicaragua',
  'Panamá', 'Paraguay', 'Perú', 'República Dominicana', 'Uruguay', 'Venezuela',
] as const

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
    className={`shrink-0 text-[#9fc6f5] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    aria-hidden
  >
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Arrow = ({ cls = '' }: { cls?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cls} aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function HeroCotizador() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [origen, setOrigen] = useState<string>(AUSTRALIA)
  const [destino, setDestino] = useState<string>('Colombia')
  const [open, setOpen] = useState<null | 'origen' | 'destino'>(null)

  // La ruta es siempre Australia ⇄ Latinoamérica. El destino se ajusta al
  // extremo opuesto del origen (nunca ambos del mismo lado).
  useEffect(() => {
    if (origen === AUSTRALIA) {
      if (!LATAM.includes(destino as (typeof LATAM)[number])) setDestino('Colombia')
    } else if (destino !== AUSTRALIA) {
      setDestino(AUSTRALIA)
    }
  }, [origen, destino])

  // Cerrar el desplegable al hacer click afuera.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null)
    }
    window.addEventListener('mousedown', onDoc)
    return () => window.removeEventListener('mousedown', onDoc)
  }, [open])

  const origenOpts: string[] = [AUSTRALIA, ...LATAM]
  const destinoOpts: string[] = origen === AUSTRALIA ? [...LATAM] : [AUSTRALIA]

  const verPrecios = (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(null)
    scrollToId('cotiza')
  }

  return (
    <div
      ref={rootRef}
      className="hc-rise pointer-events-auto absolute bottom-5 left-1/2 z-[3] flex w-[min(92vw,640px)] -translate-x-1/2 flex-col items-center gap-3 md:bottom-8 md:gap-4"
    >
      {/* Barra Desde → Hacia */}
      <div className="relative flex items-center gap-0.5 rounded-full border border-white/30 bg-white/[0.14] px-2 py-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md md:gap-1.5 md:px-3">
        <Field
          label="Salida"
          value={origen}
          open={open === 'origen'}
          onToggle={() => setOpen((o) => (o === 'origen' ? null : 'origen'))}
        />
        {open === 'origen' && (
          <Menu opts={origenOpts} value={origen} align="left" onPick={(v) => { setOrigen(v); setOpen(null) }} />
        )}

        <Arrow cls="mx-1 shrink-0 text-[#1C7AE5] md:mx-1.5" />

        <Field
          label="Destino"
          value={destino}
          open={open === 'destino'}
          onToggle={() => setOpen((o) => (o === 'destino' ? null : 'destino'))}
        />
        {open === 'destino' && (
          <Menu opts={destinoOpts} value={destino} align="right" onPick={(v) => { setDestino(v); setOpen(null) }} />
        )}
      </div>

      {/* La idea que se vende: escala en Europa a mitad de camino.
         Se re-anima en cada cambio de selección. */}
      <div key={`${origen}-${destino}`} className="hc-reveal flex flex-col items-center gap-2.5 text-center">
        {/* Ruta: origen → Europa (escala, resaltada) → destino */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 md:gap-x-3">
          <Node>{origen}</Node>
          <Arrow cls="h-3 w-3 shrink-0 text-white/45" />
          <span className="relative inline-flex items-center gap-1.5 rounded-full border border-[#F3EBA8]/50 bg-[#F3EBA8]/10 px-2.5 py-1">
            <span className="font-['PPMonumentExtended'] text-[9.5px] font-light uppercase tracking-[0.16em] text-[#F7F0C5] md:text-[11px]">Europa</span>
            <span className="font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.22em] text-[#F3EBA8]/85 md:text-[8px]">escala</span>
          </span>
          <Arrow cls="h-3 w-3 shrink-0 text-white/45" />
          <Node>{destino}</Node>
        </div>

        {/* Pitch persuasivo + CTA */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <p className="max-w-[40ch] font-['PPMonumentExtended'] text-[9.5px] font-light leading-relaxed tracking-[0.04em] text-white/80 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)] md:text-[11px]">
            Camino a <b className="font-normal text-white">{destino}</b>, haz escala en{' '}
            <b className="font-normal text-[#F3EBA8]">Europa</b> — dos vacaciones, un solo vuelo.
          </p>
          <a
            href="#cotiza"
            onClick={verPrecios}
            className="group/cta inline-flex items-center gap-2 rounded-full bg-[#1C7AE5] px-4 py-2 font-['PPMonumentExtended'] text-[9.5px] font-light uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1468c9] hover:shadow-[0_10px_26px_-8px_rgba(28,122,229,0.8)] md:text-[11px]"
          >
            Ver precios
            <Arrow cls="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  )
}

function Node({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-['PPMonumentExtended'] text-[9.5px] font-light uppercase tracking-[0.16em] text-white/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)] md:text-[11px]">
      {children}
    </span>
  )
}

function Field({ label, value, open, onToggle }: { label: string; value: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${label}: ${value}. Cambiar`}
      className="group/f relative flex min-w-[118px] flex-col items-start gap-0.5 rounded-2xl px-3 py-1.5 transition-colors duration-300 hover:bg-white/10 md:min-w-[150px] md:px-4"
    >
      <span className="font-['PPMonumentExtended'] text-[7.5px] font-light uppercase tracking-[0.28em] text-white/55 md:text-[8.5px]">
        {label}
      </span>
      <span className="flex w-full items-center justify-between gap-2">
        <span key={value} className="hc-val truncate font-['PPMonumentExtended'] text-[12px] font-light tracking-[0.01em] text-white md:text-[14px]">
          {value}
        </span>
        <Chevron open={open} />
      </span>
      {/* Subrayado neón que crece al pasar/abrir */}
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-1 left-3 h-px bg-[#1C7AE5] transition-all duration-300 md:left-4 ${
          open ? 'w-[calc(100%-1.5rem)]' : 'w-0 group-hover/f:w-[calc(100%-1.5rem)]'
        }`}
      />
    </button>
  )
}

function Menu({ opts, value, align, onPick }: { opts: string[]; value: string; align: 'left' | 'right'; onPick: (v: string) => void }) {
  return (
    <div
      className={`hc-pop hc-scroll absolute bottom-[calc(100%+12px)] z-10 max-h-[244px] min-w-[190px] overflow-y-auto rounded-2xl border border-white/15 bg-[#0b1322]/92 p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl ${
        align === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      {opts.map((o) => {
        const on = o === value
        return (
          <button
            key={o}
            type="button"
            onClick={() => onPick(o)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left font-['PPMonumentExtended'] text-[12.5px] font-light transition-colors ${
              on ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/[0.07] hover:text-white'
            }`}
          >
            {o}
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${on ? 'bg-[#1C7AE5]' : 'bg-transparent'}`} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
