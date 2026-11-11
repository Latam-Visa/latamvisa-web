'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'

/* 04 — Destinos. Grid de placeholders en el lenguaje oscuro, listo para foto
   real. Nombres en Archivo Black; superficie con un leve tinte azulito. */

const DESTINOS = ['París', 'Madrid', 'Italia', 'Lisboa']

export default function DestinosEuropa() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, '[data-reveal]', { stagger: 0.08 })

  return (
    <section id="destinos" ref={ref} aria-labelledby="destinos-title" className="vx-section">
      <div className="vx-inner">
        <p className="vx-eyebrow" data-reveal>
          <span className="vx-dot" aria-hidden />
          03 / Destinos
        </p>

        <h2 id="destinos-title" className="vx-title mt-7 max-w-[14ch]" data-reveal>
          ¿Dónde te <span className="vx-az">bajas?</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
          {DESTINOS.map((nombre) => (
            <article key={nombre} data-reveal className="vx-card vx-card-hover overflow-hidden">
              <div className="relative flex aspect-[16/10] items-end bg-[linear-gradient(160deg,rgba(28,122,229,0.12),rgba(28,122,229,0.02))] p-5">
                <span className="vx-muted">Foto pendiente</span>
                <span className="pointer-events-none absolute right-5 top-5 vx-dot" aria-hidden />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="font-[family-name:var(--font-viajes-black)] text-[clamp(1.6rem,4.5vw,2.3rem)] uppercase leading-none tracking-[-0.03em] text-[#111111]">
                  {nombre}
                </h3>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--vx-azul)]" aria-hidden>
                  <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
