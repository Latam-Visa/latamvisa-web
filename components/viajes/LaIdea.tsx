'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'

/* 01 — La idea, como mapa de ruta: Australia → Europa → Sudamérica.
   Mismo lenguaje que el hero: oscuro, blanco + azulito, Archivo Black en el
   título y PP Monument Extended en etiquetas/cuerpo. Sin emojis: las paradas
   usan un avión en SVG y marcadores tipográficos. */

const PlaneIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16Z" />
  </svg>
)

const PARADAS = [
  { kicker: '01', titulo: 'Australia', texto: 'Sales desde Sídney, Brisbane o Melbourne.' },
  { kicker: '02', titulo: 'Europa', texto: 'Haces escala: un país a la ida y otro a la vuelta. Esta es tu 2ª vacación.', destacado: true },
  { kicker: '03', titulo: 'Sudamérica', texto: 'Llegas a tu país: Chile, Argentina, Perú, Brasil o Colombia.' },
]

export default function LaIdea() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section id="la-idea" ref={ref} aria-labelledby="la-idea-title" className="vx-section">
      <div className="vx-inner">
        <p className="vx-eyebrow" data-reveal>
          <span className="vx-dot" aria-hidden />
          01 / La idea
        </p>

        <h2 id="la-idea-title" className="vx-title mt-7 max-w-[20ch]" data-reveal>
          El mismo vuelo, <span className="vx-az">dos vacaciones</span> en el camino.
        </h2>

        <p className="vx-body mt-6 max-w-[48ch]" data-reveal>
          Volando de Australia a Latinoamérica, tu ruta puede hacer escala en Europa.
          Un país a la ida, otro a la vuelta — sin pagar dos viajes.
        </p>

        {/* Mapa de ruta */}
        <div
          className="mt-16 flex flex-col items-stretch gap-4 md:mt-20 md:flex-row md:items-stretch md:gap-5"
          data-reveal
          role="list"
          aria-label="Ruta del viaje"
        >
          {PARADAS.map((p, i) => (
            <div key={p.titulo} className="contents" role="listitem">
              <article
                className={`vx-card flex-1 p-6 md:p-7 ${p.destacado ? 'vx-card--on' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border font-['PPMonumentExtended'] text-[10px] font-light tracking-[0.1em] ${
                      p.destacado
                        ? 'border-transparent bg-[var(--vx-azul)] text-white'
                        : 'border-black/20 text-black/60'
                    }`}
                  >
                    {p.kicker}
                  </span>
                  {p.destacado && (
                    <span className="vx-muted text-[color:var(--vx-azul)]">
                      2ª vacación
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-viajes-black)] text-[clamp(1.5rem,4vw,2.1rem)] uppercase leading-none tracking-[-0.02em] text-[#111111]">
                  {p.titulo}
                </h3>
                <p className="vx-body mt-3 max-w-[32ch]">{p.texto}</p>
              </article>

              {i < PARADAS.length - 1 && (
                <div
                  className="flex items-center justify-center py-1 md:px-1 md:py-0"
                  aria-hidden
                >
                  <span className="hidden h-px flex-1 bg-black/10 md:block" />
                  <PlaneIcon className="h-5 w-5 rotate-90 text-[var(--vx-azul)] md:rotate-0" />
                  <span className="hidden h-px flex-1 bg-black/10 md:block" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
