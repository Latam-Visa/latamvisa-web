'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'
import { useScramble } from './useScramble'
import { WHATSAPP_HREF } from './whatsapp'

/* 05 — Cotiza tu trip. PLACEHOLDER.
   Campos deshabilitados a propósito: no hay estado ni endpoint todavía, y un
   formulario que acepta texto y no lo manda a ningún lado es peor que uno
   que dice claramente que aún no está listo. La ruta que sí funciona es
   WhatsApp, justo debajo. */

const CAMPOS = ['Tu nombre', 'Desde qué ciudad sales', 'A qué país de Latam vas', 'Fechas aproximadas']

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

      <form
        data-reveal
        aria-label="Cotización de Euro Trip (próximamente)"
        onSubmit={(e) => e.preventDefault()}
        className="mt-12"
        style={{
          opacity: 0,
          maxWidth: '760px',
          backgroundColor: 'var(--viajes-paper)',
          borderRadius: '18px',
          padding: '28px',
        }}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {CAMPOS.map((campo) => (
            <label key={campo} className="flex flex-col gap-2">
              <span className="viajes-label" data-scramble style={{ color: 'rgba(11,42,74,0.65)' }}>{campo}</span>
              <input
                type="text"
                disabled
                className="viajes-body"
                style={{
                  height: '52px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(11,42,74,0.18)',
                  backgroundColor: 'rgba(168,200,232,0.22)',
                  color: 'var(--viajes-ink)',
                  cursor: 'not-allowed',
                  maxWidth: 'none',
                }}
              />
            </label>
          ))}
        </div>

        <p className="viajes-label mt-7" data-scramble style={{ color: 'rgba(11,42,74,0.45)' }}>
          Formulario en construcción
        </p>

        <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="viajes-cta mt-5">
          <span data-scramble>Cotizar por WhatsApp</span>
        </a>
      </form>
    </section>
  )
}
