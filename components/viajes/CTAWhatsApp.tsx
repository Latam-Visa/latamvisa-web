'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'
import { useScramble } from './useScramble'
import { WHATSAPP_HREF } from './whatsapp'

/* 06 — Cierre. Fondo tinta, un solo acento neón en toda la pantalla. */

export default function CTAWhatsApp() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  useScramble(ref)

  return (
    <section
      id="contacto"
      ref={ref}
      aria-labelledby="contacto-title"
      className="viajes-section"
      style={{ backgroundColor: 'var(--viajes-ink)', color: 'var(--viajes-paper)' }}
    >
      <p className="viajes-label" data-reveal data-scramble style={{ opacity: 0, color: 'var(--viajes-sky)' }}>
        05 / Hablemos
      </p>

      <h2
        id="contacto-title"
        className="viajes-display mt-10"
        data-reveal
        data-scramble
        style={{ opacity: 0, maxWidth: '12ch' }}
      >
        ¿Hacemos números?
      </h2>

      <p className="viajes-body mt-8" data-reveal data-scramble="body" style={{ opacity: 0, color: 'rgba(242,240,233,0.75)' }}>
        Escríbenos y te contamos cómo quedaría tu Euro Trip antes de aterrizar
        en Latam. Respondemos nosotros, no un bot.
      </p>

      <div data-reveal style={{ opacity: 0 }}>
        <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="viajes-cta mt-10">
          <span data-scramble>Escríbenos por WhatsApp</span>
        </a>
      </div>
    </section>
  )
}
