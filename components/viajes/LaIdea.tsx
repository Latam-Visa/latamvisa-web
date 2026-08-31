'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'

/* 02 — La idea. Fondo papel, una sola frase grande. Nada más en pantalla. */

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
      {/* starts hidden; useReveal fades it to full and the muted tone comes
          from the colour, not opacity, so the reveal can't fight it */}
      <p className="viajes-label" data-reveal style={{ opacity: 0, color: 'rgba(11,42,74,0.55)' }}>
        01 / La idea
      </p>

      <h2
        id="la-idea-title"
        className="viajes-display mt-10"
        data-reveal
        style={{ opacity: 0, maxWidth: '16ch' }}
      >
        Vas pa&apos; Latam… pero puedes hacer una parada en Europa.
      </h2>
    </section>
  )
}
