'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'

/* 02 — Comparativo de vuelos. Dos rutas enfrentadas, mismo lenguaje oscuro.
   Sin tiempos ni precios: los datos reales entran después. */

const RUTAS = [
  {
    etiqueta: 'La de siempre',
    titulo: 'Australia → Latam',
    escalas: ['Sídney / Brisbane', 'Conexión de horas', 'Bogotá / Lima / Santiago'],
  },
  {
    etiqueta: 'La de dos vacaciones',
    titulo: 'Australia → Europa → Latam',
    escalas: ['Sídney / Brisbane', 'Unos días en Europa', 'Bogotá / Lima / Santiago'],
    destacada: true,
  },
]

export default function ComparativoVuelos() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section id="vuelos" ref={ref} aria-labelledby="vuelos-title" className="vx-section">
      <div className="vx-inner">
        <p className="vx-eyebrow" data-reveal>
          <span className="vx-dot" aria-hidden />
          02 / Las rutas
        </p>

        <h2 id="vuelos-title" className="vx-title mt-7 max-w-[14ch]" data-reveal>
          Mira cómo se ve <span className="vx-az">tu vuelo</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">
          {RUTAS.map((ruta) => (
            <article
              key={ruta.titulo}
              data-reveal
              className={`vx-card p-7 md:p-8 ${ruta.destacada ? 'vx-card--on' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="vx-muted text-[color:var(--vx-azul)]">{ruta.etiqueta}</p>
                {ruta.destacada && <span className="vx-dot" aria-hidden />}
              </div>

              <p className="mt-5 font-[family-name:var(--font-viajes-black)] text-[clamp(1.35rem,3.4vw,1.9rem)] uppercase leading-[1.05] tracking-[-0.02em] text-white">
                {ruta.titulo}
              </p>

              <ol className="mt-6 flex flex-col gap-3">
                {ruta.escalas.map((escala) => (
                  <li key={escala} className="vx-body flex items-center gap-3">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--vx-azul)]" aria-hidden />
                    {escala}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>

        <p className="vx-muted mt-10" data-reveal>
          Datos por confirmar
        </p>
      </div>
    </section>
  )
}
