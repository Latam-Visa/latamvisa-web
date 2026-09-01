'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'
import MenuOverlay from './MenuOverlay'

/* 01 — Hero. Estructura tomada de la referencia (intro breve, wordmark
   gigante centrado, línea de borde a borde, CTA circular), con marca propia. */

const INTRO_FLAG = 'viajes-intro-seen'
const RING_R = 139 // radio del círculo de 280px con stroke de 1px
const RING_LEN = 2 * Math.PI * RING_R

function Intro({ onDone }: { onDone: () => void }) {
  const lineRef = useRef<HTMLSpanElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let ctx: { revert: () => void } | null = null

    const run = async () => {
      const { gsap } = await import('gsap')
      if (cancelled) return
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ onComplete: onDone })
        tl.fromTo(lineRef.current, { scaleY: 0 }, { scaleY: 1, duration: 0.75, ease: 'power2.out' })
          .to({}, { duration: 0.45 }) // se sostiene ~1.2s en total
          .to(rootRef.current, { yPercent: -100, duration: 0.75, ease: 'power3.inOut' })
      }, rootRef)
    }
    run()

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [onDone])

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--viajes-ink)' }}
    >
      <p className="viajes-wordmark" style={{ fontSize: 'clamp(2.5rem, 9vw, 7rem)' }}>
        Latam
        <br />
        Travel
      </p>

      {/* línea de 1px que crece desde el centro hacia abajo */}
      <span
        ref={lineRef}
        className="my-8 block"
        style={{ width: '1px', height: '84px', backgroundColor: '#FFFFFF', opacity: 0.55, transformOrigin: 'top center' }}
      />

      <p className="viajes-label" style={{ color: '#FFFFFF', opacity: 0.8, letterSpacing: '0.2em', textAlign: 'center' }}>
        LATAM Travel — 1 viaje, 2 vacaciones.
      </p>
    </div>
  )
}

export default function HeroViajes() {
  /* La intro se pinta ya en el HTML del servidor para que nadie vea el hero
     antes de tiempo; en el cliente se decide si corre o se descarta al
     instante (reduced-motion, o ya vista en esta sesión). */
  const [introDone, setIntroDone] = useState(false)
  const [introResolved, setIntroResolved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const ringRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const seen = sessionStorage.getItem(INTRO_FLAG) === '1'
    if (seen || prefersReducedMotion()) setIntroDone(true)
    setIntroResolved(true)
  }, [])

  useEffect(() => {
    if (introDone) sessionStorage.setItem(INTRO_FLAG, '1')
  }, [introDone])

  // El anillo se dibuja al entrar en viewport
  useEffect(() => {
    const el = ringRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.dataset.drawn = 'true' },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const goToDestinos = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('destinos')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {introResolved && !introDone && <Intro onDone={() => setIntroDone(true)} />}

      <section
        id="hero"
        aria-label="LATAM Travel — 1 viaje, 2 vacaciones"
        className="relative w-full overflow-hidden"
        style={{ height: '100svh', backgroundColor: 'var(--viajes-ink)' }}
      >
        <Image
          src="/viajes-hero.webp"
          alt="Una puerta abierta sobre el mar en calma"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />

        {/* Solo para que el logo y el menú se lean */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0"
          style={{ height: '40%', background: 'linear-gradient(180deg, rgba(11,42,74,0.45) 0%, rgba(11,42,74,0) 100%)' }}
        />

        {/* ARRIBA IZQUIERDA — logo */}
        <Link
          href="/"
          aria-label="LATAM Travel — inicio"
          className="absolute left-0 top-0 z-20 flex items-center"
          style={{ padding: '32px' }}
        >
          {/* Recorte ajustado a la placa: el PNG con padding rendía solo
              ~10.6px de marca visible dentro de una caja de 40px. */}
          <Image
            src="/logo-lt-travel-white.png"
            alt="LATAM Travel"
            width={961}
            height={121}
            priority
            className="h-3.5 w-auto object-contain md:h-5"
          />
        </Link>

        {/* ARRIBA DERECHA — menú */}
        <button
          ref={menuBtnRef}
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          className="viajes-label absolute right-0 top-0 z-20 flex items-center gap-2"
          style={{
            padding: '32px',
            color: '#FFFFFF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.2em',
            minHeight: '44px',
          }}
        >
          Menú
          <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" aria-hidden>
            <circle cx="2" cy="2" r="1.6" />
            <circle cx="2" cy="8" r="1.6" />
            <circle cx="2" cy="14" r="1.6" />
          </svg>
        </button>

        {/* CENTRO — wordmark + línea de borde a borde */}
        <div className="absolute inset-x-0 z-10" style={{ top: '26%' }}>
          <h1 className="viajes-wordmark">
            Latam
            <br />
            Travel
          </h1>

          <div
            className="mt-6 flex items-baseline justify-between"
            style={{ paddingLeft: '32px', paddingRight: '32px' }}
          >
            <span className="viajes-hero-edge">1 viaje</span>
            <span className="viajes-hero-edge">2 vacaciones</span>
          </div>
        </div>

        {/* CTA circular en la mitad inferior */}
        <a
          href="#destinos"
          onClick={goToDestinos}
          className="viajes-ring-cta absolute left-1/2 z-10 flex -translate-x-1/2 items-center justify-center"
          style={{ bottom: '7%' }}
          aria-label="Mira países disponibles"
        >
          <span className="relative flex items-center justify-center" style={{ width: 'var(--ring-size)', height: 'var(--ring-size)' }}>
            <span
              className="viajes-ring-fill absolute inset-0"
              style={{ borderRadius: '50%' }}
            />
            <svg
              ref={ringRef}
              className="viajes-ring absolute inset-0"
              viewBox="0 0 280 280"
              style={{ ['--ring-len' as string]: RING_LEN }}
              aria-hidden
            >
              <circle cx="140" cy="140" r={RING_R} fill="none" stroke="#FFFFFF" strokeWidth="1" />
            </svg>
            <span
              className="viajes-label relative text-center"
              style={{ color: '#FFFFFF', fontSize: '12px', letterSpacing: '0.15em', lineHeight: 1.7 }}
            >
              Mira países
              <br />
              disponibles
            </span>
          </span>
        </a>
      </section>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusTo={menuBtnRef} />
    </>
  )
}
