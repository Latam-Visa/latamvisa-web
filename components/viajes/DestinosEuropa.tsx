'use client'
import { useRef } from 'react'
import { useReveal } from './useReveal'
import { useScramble } from './useScramble'

/* 04 — Destinos. PLACEHOLDER de grid: los bloques de imagen son superficies
   planas en los colores de la campaña, listos para recibir foto real. */

const DESTINOS = ['París', 'Madrid', 'Italia', 'Lisboa']

export default function DestinosEuropa() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, '[data-reveal]', { stagger: 0.08 })
  useScramble(ref)

  return (
    <section
      id="destinos"
      ref={ref}
      aria-labelledby="destinos-title"
      className="viajes-section"
      style={{ backgroundColor: 'var(--viajes-paper)', color: 'var(--viajes-ink)' }}
    >
      <p className="viajes-label" data-reveal data-scramble style={{ opacity: 0, color: 'rgba(11,42,74,0.55)' }}>
        03 / Destinos
      </p>

      <h2
        id="destinos-title"
        className="viajes-display mt-10"
        data-reveal
        data-scramble
        style={{ opacity: 0, maxWidth: '13ch' }}
      >
        ¿Dónde te bajas?
      </h2>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-7" style={{ maxWidth: '1000px' }}>
        {DESTINOS.map((nombre) => (
          <article key={nombre} data-reveal style={{ opacity: 0 }}>
            <div
              className="flex aspect-[4/3] items-end p-5"
              style={{ backgroundColor: 'var(--viajes-sky)', borderRadius: '14px' }}
            >
              <span className="viajes-label" data-scramble style={{ color: 'rgba(11,42,74,0.5)' }}>
                Foto pendiente
              </span>
            </div>
            {/* Los nombres de destino van en script, igual que "Travel" en el
                hero: los nombres propios y evocadores llevan la cursiva, la
                copia estructural se queda en la condensada. */}
            <p
              className="viajes-script mt-4"
              data-scramble
              style={{
                fontSize: 'clamp(1.9rem, 6vw, 2.8rem)',
                lineHeight: 1.1,
              }}
            >
              {nombre}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
