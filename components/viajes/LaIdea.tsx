'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'

/* 02 — La idea, como mapa de ruta: Australia → Europa → Sudamérica.
   Explica el "1 viaje, 2 vacaciones" de un vistazo. Fondo papel, título en
   serif editorial (igual que el hero), y tres paradas conectadas por la ruta
   de vuelo (horizontal en desktop, vertical en móvil). */

const PARADAS = [
  { emoji: '🇦🇺', titulo: 'Australia', texto: 'Sales desde Sydney, Brisbane o Melbourne.' },
  { emoji: '🏛️', titulo: 'Europa', texto: 'Haces escala: un país a la ida y otro a la vuelta. Esta es tu 2ª vacación.', destacado: true },
  { emoji: '🌎', titulo: 'Sudamérica', texto: 'Llegas a tu país: Chile, Argentina, Perú, Brasil o Colombia.' },
]

export default function LaIdea() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section
      id="la-idea"
      ref={ref}
      aria-labelledby="la-idea-title"
      className="viajes-section"
      style={{ backgroundColor: 'var(--viajes-paper)', color: 'var(--viajes-ink)' }}
    >
      <p className="viajes-label" data-reveal style={{ opacity: 0, color: 'rgba(11,42,74,0.55)' }}>
        01 / La idea
      </p>

      <h2
        id="la-idea-title"
        className="viajes-serif mt-8"
        data-reveal
        style={{ opacity: 0, maxWidth: '18ch', fontWeight: 500, lineHeight: 1.05, fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
      >
        El mismo vuelo, dos vacaciones en el camino.
      </h2>

      <p className="viajes-body mt-6" data-reveal style={{ opacity: 0, maxWidth: '46ch' }}>
        Volando de Australia a Latinoamérica, tu ruta puede hacer escala en Europa. Un país a la ida, otro a la vuelta — sin pagar dos viajes.
      </p>

      {/* Mapa de ruta */}
      <div className="viajes-ruta-mapa mt-14" data-reveal style={{ opacity: 0 }} role="list" aria-label="Ruta del viaje">
        {PARADAS.map((p, i) => (
          <div key={p.titulo} className="viajes-ruta-wrap" role="listitem">
            <div className="viajes-ruta-stop">
              <span className={`viajes-ruta-badge${p.destacado ? ' viajes-ruta-badge--on' : ''}`} aria-hidden>{p.emoji}</span>
              <p className="viajes-ruta-stop-titulo">{p.titulo}</p>
              <p className="viajes-ruta-stop-texto">{p.texto}</p>
            </div>
            {i < PARADAS.length - 1 && (
              <div className="viajes-ruta-conector" aria-hidden>
                <span className="viajes-ruta-linea" />
                <span className="viajes-ruta-plane">✈️</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
