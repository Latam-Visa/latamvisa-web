'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'
import MenuOverlay from './MenuOverlay'
import { useScramble } from './useScramble'

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
        <span className="block" data-scramble>Latam</span>
        <span className="block" data-scramble>Travel</span>
      </p>

      {/* línea de 1px que crece desde el centro hacia abajo */}
      <span
        ref={lineRef}
        className="my-8 block"
        style={{ width: '1px', height: '84px', backgroundColor: '#FFFFFF', opacity: 0.55, transformOrigin: 'top center' }}
      />

      <p className="viajes-label" style={{ color: '#FFFFFF', opacity: 0.8, letterSpacing: '0.2em', textAlign: 'center' }}>
        <span data-scramble>LATAM Travel — 1 viaje, 2 vacaciones.</span>
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
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // El wordmark corre su propia timeline; este hook cubre el resto de
  // textos del hero (bordes y CTA circular).
  useScramble(sectionRef)

  useEffect(() => {
    const seen = sessionStorage.getItem(INTRO_FLAG) === '1'
    if (seen || prefersReducedMotion()) setIntroDone(true)
    setIntroResolved(true)
  }, [])

  useEffect(() => {
    if (introDone) sessionStorage.setItem(INTRO_FLAG, '1')
  }, [introDone])

  /* ScrambleText sobre el wordmark, en cuanto el hero queda a la vista.
     ScrambleTextPlugin viene en el propio paquete gsap (build de Club, igual
     que SplitText), así que se importa de ahí y no del CDN — una dependencia
     externa menos y misma versión que el resto de la animación. */
  useEffect(() => {
    if (!introDone) return
    const l1 = line1Ref.current
    const l2 = line2Ref.current
    if (!l1 || !l2) return
    if (prefersReducedMotion()) return // el HTML ya trae el texto final

    let cancelled = false
    let tl: gsap.core.Timeline | null = null

    const run = async () => {
      const [{ gsap }, mod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrambleTextPlugin'),
      ])
      if (cancelled) return

      const ScrambleTextPlugin = (mod as any).ScrambleTextPlugin ?? (mod as any).default
      gsap.registerPlugin(ScrambleTextPlugin)

      // Mismo ritmo que useScramble: la resolución izquierda-a-derecha se
      // lee letra por letra al alargar el tween y bajar `speed`.
      tl = gsap.timeline()
      tl.to(l1, { duration: 3, scrambleText: { text: 'Latam', chars: 'upperCase', speed: 0.15 } })
        .to(l2, { duration: 3, scrambleText: { text: 'Travel', chars: 'upperCase', speed: 0.15 } }, 0.45)
    }

    run()

    return () => {
      cancelled = true
      tl?.kill()
      // El plugin reescribe el contenido mientras corre; si desmontamos a
      // media animación hay que dejar el texto definitivo, no el revuelto.
      if (l1) l1.textContent = 'Latam'
      if (l2) l2.textContent = 'Travel'
    }
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
        ref={sectionRef}
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
          <span data-scramble>Menú</span>
          <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" aria-hidden>
            <circle cx="2" cy="2" r="1.6" />
            <circle cx="2" cy="8" r="1.6" />
            <circle cx="2" cy="14" r="1.6" />
          </svg>
        </button>

        {/* CENTRO — wordmark + línea de borde a borde */}
        <div className="absolute inset-x-0 z-10" style={{ top: '26%' }}>
          {/* El texto final va en el HTML: si el JS no corre o hay
              reduced-motion, el wordmark se lee igual. El scramble solo lo
              reescribe encima. */}
          <h1 className="viajes-wordmark">
            <span ref={line1Ref} className="block">Latam</span>
            <span ref={line2Ref} className="block">Travel</span>
          </h1>

          <div
            /* "un poco más centrados": se separan de los bordes. El padding
               crece con el ancho en vez de quedarse en los 32px del borde. */
            className="mt-6 flex items-baseline justify-between"
            style={{ paddingLeft: 'clamp(20px, 7vw, 140px)', paddingRight: 'clamp(20px, 7vw, 140px)' }}
          >
            <span className="viajes-hero-edge" data-scramble>1 viaje</span>
            <span className="viajes-hero-edge" data-scramble>2 vacaciones</span>
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
              <span className="block" data-scramble>Mira países</span>
              <span className="block" data-scramble>disponibles</span>
            </span>
          </span>
        </a>
      </section>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusTo={menuBtnRef} />
    </>
  )
}
