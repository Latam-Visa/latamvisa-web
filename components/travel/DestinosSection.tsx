'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CONTACT } from '@/lib/constants'

/* /viajes — editorial white layout: a stack of full-bleed destination cards,
   each revealed through a pixel-mosaic dissolve as it scrolls into view.
   Deliberately plain: white page, black type, the photography carries it. */

type Destino = {
  slug: string
  country: string
  kicker: string
  line: string
}

const DESTINOS: Destino[] = [
  { slug: 'espana',   country: 'España',   kicker: 'Escala en Europa', line: 'Ritmo, comida y calles que se recorren sin afán.' },
  { slug: 'francia',  country: 'Francia',  kicker: 'Escala en Europa', line: 'Historia, arquitectura y una parada que se siente como un viaje aparte.' },
  { slug: 'italia',   country: 'Italia',   kicker: 'Escala en Europa', line: 'Pueblos costeros, historia viva y la calma del Mediterráneo.' },
  { slug: 'portugal', country: 'Portugal', kicker: 'Escala en Europa', line: 'Costa, luz y ciudades hechas para caminar despacio.' },
]

const whatsappHref = (msg: string) =>
  `https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`

const MONO: React.CSSProperties = {
  fontFamily: "'FunnelDisplay', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
}

/* ── One destination card ───────────────────────────────────────────────
   The mosaic is a grid of solid white cells sitting on top of the photo.
   Each cell gets a random threshold; as the card scrolls up through the
   viewport, cells whose threshold is below the current progress are hidden,
   so the image dissolves in block by block instead of fading.

   Only the cells that actually change state are touched on each frame
   (cells are pre-sorted by threshold and we track how many are revealed),
   so a scroll tick writes a handful of styles, not the whole grid. */
function DestinoCard({ destino, index }: { destino: Destino; index: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cellsRef = useRef<HTMLDivElement[]>([])
  const orderRef = useRef<number[]>([])
  const revealedRef = useRef(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [resolved, setResolved] = useState(false)

  const COLS = 14
  const ROWS = 18
  const TOTAL = COLS * ROWS

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    setResolved(true)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Stable shuffled reveal order — regenerated only if the grid size changes.
  if (orderRef.current.length !== TOTAL) {
    const order = Array.from({ length: TOTAL }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    orderRef.current = order
  }

  useEffect(() => {
    if (!resolved) return

    // Reduced motion: no dissolve, just show the photo.
    if (reducedMotion) {
      cellsRef.current.forEach((c) => { if (c) c.style.opacity = '0' })
      return
    }

    let ticking = false
    const update = () => {
      ticking = false
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the card's top edge is at the bottom of the viewport, 1 by the
      // time it has risen to ~45% of the viewport. The window has to close
      // well before the card reaches the top, otherwise a card that's already
      // comfortably on screen (e.g. the first one at rest) sits permanently at
      // ~94% and keeps a scatter of white cells stuck over the photo.
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.55)))

      const target = Math.round(progress * TOTAL)
      const cells = cellsRef.current
      const order = orderRef.current
      let revealed = revealedRef.current

      while (revealed < target) {
        const c = cells[order[revealed]]
        if (c) c.style.opacity = '0'
        revealed++
      }
      while (revealed > target) {
        revealed--
        const c = cells[order[revealed]]
        if (c) c.style.opacity = '1'
      }
      revealedRef.current = revealed
    }

    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    requestAnimationFrame(update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [resolved, reducedMotion, TOTAL])

  return (
    <article ref={wrapRef} style={{ marginBottom: '18px' }}>
      {/* Labels above the image, mirroring the reference layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', gap: '12px' }}>
        <span style={{ ...MONO, color: '#111111' }}>{destino.kicker}</span>
        <span style={{ ...MONO, color: '#9a9a9a' }}>{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <Image
          src={`/viajes-destinos/${destino.slug}.webp`}
          alt={`${destino.country} — escala en Europa`}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          priority={index === 0}
        />

        {/* Mosaic overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: TOTAL }, (_, i) => (
            <div
              key={i}
              ref={(el) => { if (el) cellsRef.current[i] = el }}
              style={{ backgroundColor: '#FFFFFF', opacity: 1 }}
            />
          ))}
        </div>

        {/* Country title, bottom-left over the photo */}
        <h3
          style={{
            position: 'absolute', left: '20px', right: '20px', bottom: '18px',
            margin: 0, zIndex: 2,
            fontFamily: "'PPMonumentExtended', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(30px, 8vw, 56px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            textShadow: '0 2px 24px rgba(0,0,0,0.45)',
          }}
        >
          {destino.country}
        </h3>
      </div>

      <p
        style={{
          fontFamily: "'FunnelDisplay', sans-serif",
          fontSize: '14px',
          lineHeight: 1.55,
          color: 'rgba(17,17,17,0.62)',
          margin: '12px 0 0',
          maxWidth: '38ch',
        }}
      >
        {destino.line}
      </p>
    </article>
  )
}

export default function DestinosSection() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#111111', minHeight: '100vh' }}>
      {/* ── Header ──
          position:fixed rather than sticky: globals.css sets overflow-x:hidden
          on <body>, which makes body a scroll container and silently breaks
          position:sticky for its descendants (verified — the header scrolled
          away to top:-600px). A fixed bar plus a spacer behaves correctly. */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
        }}
      >
        <Link href="/" aria-label="LATAM VISA — inicio" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.png" alt="LATAM VISA" width={300} height={84} className="h-7 w-auto object-contain" priority />
        </Link>
        <a href="#contacto" style={{ ...MONO, color: '#111111', textDecoration: 'none' }}>
          Contacto
        </a>
      </header>
      <div style={{ height: '60px' }} aria-hidden />

      {/* ── Intro ── */}
      <section style={{ padding: '48px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <p
          style={{
            fontFamily: "'FunnelDisplay', sans-serif",
            fontSize: 'clamp(16px, 4.4vw, 22px)',
            fontWeight: 500,
            lineHeight: 1.45,
            color: '#111111',
            margin: 0,
            maxWidth: '40ch',
          }}
        >
          Tu vuelo de vuelta a casa puede tener una escala en Europa.
          Nosotros te ayudamos a planearla con calma: itinerario, vuelos y
          hospedaje, sin letra pequeña.
        </p>
      </section>

      {/* ── Destinos ── */}
      <section id="destinos" style={{ padding: '0 20px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* 1 column on phones, 2 on wider screens — 4 cards land as a balanced
            2×2 instead of the orphan row a 3-up grid leaves. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10">
          {DESTINOS.map((d, i) => (
            <DestinoCard key={d.slug} destino={d} index={i} />
          ))}
        </div>
      </section>

      {/* ── Cierre ── */}
      <section
        id="contacto"
        style={{ padding: '0 20px 80px', maxWidth: '1200px', margin: '0 auto' }}
      >
        <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '40px' }}>
          <p
            style={{
              fontFamily: "'PPMonumentExtended', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(26px, 7vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#111111',
              margin: 0,
              maxWidth: '18ch',
            }}
          >
            Tu pasaporte no te define; tu plan, tu claridad y tu historia sí.
          </p>

          <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <a
              href={whatsappHref('Hola, quiero que me avisen primero cuando abra el programa de escalas en Europa.')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                backgroundColor: '#b5e533', color: '#006837',
                height: '48px', padding: '0 26px', borderRadius: '100px',
                textDecoration: 'none', ...MONO, fontSize: '12px',
              }}
            >
              Avísenme primero
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href={whatsappHref('Hola, tengo una pregunta sobre el programa de escalas en Europa.')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                border: '1px solid #D4D4D4', backgroundColor: 'transparent', color: '#111111',
                height: '48px', padding: '0 26px', borderRadius: '100px',
                textDecoration: 'none', ...MONO, fontSize: '12px',
              }}
            >
              Hablar por WhatsApp
            </a>
          </div>

          <p
            style={{
              fontFamily: "'FunnelDisplay', sans-serif",
              fontSize: '12px',
              color: 'rgba(17,17,17,0.45)',
              marginTop: '40px',
            }}
          >
            © 2026 LATAM VISA® — Consultoría de viajes. No prestamos servicios de índole migratoria oficial.
          </p>
        </div>
      </section>
    </div>
  )
}
