'use client'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/lenis'

/* 01 — Hero. Fondo tinta, una sola idea: el titular.
   Las líneas del display suben una por una desde detrás de su máscara, con
   GSAP SplitText (el proyecto tiene la build de Club, SplitText está
   disponible). Con reduced-motion el titular simplemente ya está puesto. */

const HEADLINE = '¿Y si nos pegamos dos vacaciones?'

export default function HeroViajes() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const belowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = headlineRef.current
    const below = belowRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      el.style.opacity = '1'
      if (below) below.style.opacity = '1'
      return
    }

    let ctx: { revert: () => void } | null = null
    let split: { revert: () => void } | null = null
    let cancelled = false

    const init = async () => {
      const [{ gsap }, mod] = await Promise.all([
        import('gsap'),
        import('gsap/SplitText'),
      ])
      if (cancelled) return

      const SplitText = (mod as any).SplitText ?? (mod as any).default
      gsap.registerPlugin(SplitText)

      ctx = gsap.context(() => {
        el.style.opacity = '1'

        // mask:'lines' wraps every line in its own overflow-hidden parent, so
        // the lines rise out from behind the line above instead of just
        // sliding over it.
        const s = new SplitText(el, { type: 'lines', mask: 'lines' })
        split = s

        gsap.from(s.lines, {
          yPercent: 110,
          duration: 1.05,
          ease: 'power4.out',
          stagger: 0.11,
          delay: 0.15,
        })

        if (below) {
          gsap.to(below, { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.75 })
        }
      }, el)
    }

    init()

    return () => {
      cancelled = true
      split?.revert()
      ctx?.revert()
    }
  }, [])

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="viajes-section"
      style={{ backgroundColor: 'var(--viajes-ink)', color: 'var(--viajes-paper)' }}
    >
      {/* Indicador SCROLL — borde izquierdo, vertical. Oculto en móvil, donde
          roba ancho a un titular que ya ocupa la pantalla. */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-4 top-1/2 z-20 hidden -translate-y-1/2 md:block"
      >
        <span
          className="viajes-label"
          style={{
            display: 'block',
            writingMode: 'vertical-rl',
            color: 'var(--viajes-sky)',
            opacity: 0.75,
          }}
        >
          Scroll
        </span>
      </div>

      <div className="md:pl-16">
        <h1
          id="hero-title"
          ref={headlineRef}
          className="viajes-display"
          style={{ opacity: 0, maxWidth: '14ch' }}
        >
          {HEADLINE}
        </h1>

        <div ref={belowRef} style={{ opacity: 0 }}>
          <p className="viajes-label mt-8" style={{ color: 'var(--viajes-sky)' }}>
            Una pa&apos; Europa. Otra pa&apos; Latam.
          </p>
          <p className="viajes-body mt-6" style={{ color: 'var(--viajes-paper)', opacity: 0.75 }}>
            Vuelves a Latinoamérica en diciembre. Te ayudamos a que ese vuelo
            pase por Europa: rutas, fechas e itinerario, sin letra pequeña.
          </p>
        </div>
      </div>
    </section>
  )
}
