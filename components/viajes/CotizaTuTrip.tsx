'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'
import { useScramble } from './useScramble'
import CotizadorDosVacaciones from './CotizadorDosVacaciones'

/* 05 — Cotiza tu trip. El encabezado conserva el lenguaje de la página; el
   formulario va sin animaciones (una pregunta por pantalla), y al final
   muestra el rango aproximado que calcula el servidor. */

export default function CotizaTuTrip() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  useScramble(ref)

  return (
    <section
      id="cotiza"
      ref={ref}
      aria-labelledby="cotiza-title"
      className="viajes-section"
      style={{ backgroundColor: 'var(--viajes-sky)', color: 'var(--viajes-ink)' }}
    >
      <p className="viajes-label" data-reveal data-scramble style={{ opacity: 0, color: 'rgba(11,42,74,0.6)' }}>
        04 / Cotiza tu trip
      </p>

      <h2
        id="cotiza-title"
        className="viajes-display mt-10"
        data-reveal
        data-scramble
        style={{ opacity: 0, maxWidth: '14ch' }}
      >
        Cuéntanos y armamos el plan
      </h2>

      <CotizadorDosVacaciones />
    </section>
  )
}
