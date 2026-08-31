'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'

/* 03 — Comparativo de vuelos. PLACEHOLDER.
   Solo la estructura: dos rutas enfrentadas. Sin tiempos ni precios — los
   datos reales entran después, e inventarlos aquí sería prometer algo que
   todavía no podemos sostener. */

const RUTAS = [
  { etiqueta: 'La de siempre', titulo: 'Australia → Latam', escalas: ['Sídney / Brisbane', 'Conexión de horas', 'Bogotá / Lima / Santiago'] },
  { etiqueta: 'La de dos vacaciones', titulo: 'Australia → Europa → Latam', escalas: ['Sídney / Brisbane', 'Unos días en Europa', 'Bogotá / Lima / Santiago'], destacada: true },
]

export default function ComparativoVuelos() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section
      id="vuelos"
      ref={ref}
      aria-labelledby="vuelos-title"
      className="viajes-section"
      style={{ backgroundColor: 'var(--viajes-sky)', color: 'var(--viajes-ink)' }}
    >
      <p className="viajes-label" data-reveal style={{ opacity: 0, color: 'rgba(11,42,74,0.6)' }}>
        02 / Las rutas
      </p>

      <h2
        id="vuelos-title"
        className="viajes-display mt-10"
        data-reveal
        style={{ opacity: 0, maxWidth: '13ch' }}
      >
        Mira cómo se ve tu vuelo
      </h2>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10" style={{ maxWidth: '1000px' }}>
        {RUTAS.map((ruta) => (
          <article
            key={ruta.titulo}
            data-reveal
            style={{
              opacity: 0,
              backgroundColor: 'var(--viajes-paper)',
              border: ruta.destacada ? '2px solid var(--viajes-ink)' : '1px solid rgba(11,42,74,0.18)',
              borderRadius: '18px',
              padding: '28px',
            }}
          >
            <p className="viajes-label" style={{ color: 'rgba(11,42,74,0.6)' }}>{ruta.etiqueta}</p>
            <p
              className="mt-4"
              style={{
                fontFamily: 'var(--font-viajes-display), sans-serif',
                fontSize: 'clamp(1.4rem, 4.5vw, 2rem)',
                lineHeight: 1,
                textTransform: 'uppercase',
              }}
            >
              {ruta.titulo}
            </p>
            <ol className="mt-6 flex flex-col gap-3">
              {ruta.escalas.map((escala) => (
                <li key={escala} className="viajes-body" style={{ fontSize: '15px' }}>
                  {escala}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <p className="viajes-label mt-10" data-reveal style={{ opacity: 0, color: 'rgba(11,42,74,0.45)' }}>
        Datos por confirmar
      </p>
    </section>
  )
}
