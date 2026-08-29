'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CONTACT } from '@/lib/constants'

/* /viajes — editorial white layout: full-width destination posters, each
   revealed through a pixel-mosaic dissolve as it scrolls into view. */

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
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
}

const HEADER_H = 78

/* ── One destination poster ─────────────────────────────────────────────
   The mosaic is a grid of solid white cells over the photo. Each cell gets a
   random threshold; as the card rises through the viewport, cells below the
   current progress are hidden, so the image dissolves in block by block.
   Cells are pre-sorted by threshold and only the ones that change state are
   written per frame, so a scroll tick touches a handful of styles. */
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
      // well before the card reaches the top, otherwise a card already
      // comfortably on screen sits at ~94% and keeps white cells stuck on it.
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
    <article ref={wrapRef} style={{ marginBottom: '56px' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <Image
          src={`/viajes-destinos/${destino.slug}.webp`}
          alt={`${destino.country} — escala en Europa`}
          fill
          sizes="(max-width: 900px) 100vw, 860px"
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

        {/* Labels sit on the photo, as in the reference layout */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '18px 20px', gap: '12px',
          }}
        >
          <span style={{ ...MONO, fontSize: 'clamp(13px, 3.6vw, 17px)', color: '#FFFFFF', textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}>
            {destino.kicker}
          </span>
          <span style={{ ...MONO, fontSize: 'clamp(13px, 3.6vw, 17px)', color: '#FFFFFF', textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h3
          style={{
            position: 'absolute', left: '20px', right: '20px', bottom: '20px',
            margin: 0, zIndex: 2,
            fontFamily: "'PPMonumentExtended', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(38px, 11vw, 78px)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            textShadow: '0 2px 26px rgba(0,0,0,0.45)',
          }}
        >
          {destino.country}
        </h3>
      </div>

      <p
        style={{
          fontFamily: "'FunnelDisplay', sans-serif",
          fontSize: '15px',
          lineHeight: 1.55,
          color: 'rgba(17,17,17,0.62)',
          margin: '14px 0 0',
          maxWidth: '42ch',
        }}
      >
        {destino.line}
      </p>
    </article>
  )
}

export default function DestinosSection() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the dropdown on Escape — a menu you can't dismiss by keyboard is a
  // trap for anyone not using a pointer.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const menuLinks = [
    { label: 'Destinos', href: '#destinos' },
    { label: 'Contacto', href: '#contacto' },
    { label: 'LATAM VISA', href: '/' },
  ]

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#111111', minHeight: '100vh' }}>
      {/* ── Header ──
          position:fixed rather than sticky: globals.css sets overflow-x:hidden
          on <body>, which makes body a scroll container and silently breaks
          position:sticky for its descendants (verified — the header scrolled
          away to top:-600px). A fixed bar plus a spacer behaves correctly. */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
          backgroundColor: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
        }}
      >
        <Link href="/" aria-label="LATAM TRAVEL — inicio" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo-lt-travel-dark.png"
            alt="LATAM TRAVEL"
            width={961}
            height={121}
            className="h-[30px] md:h-[34px] w-auto object-contain"
            priority
          />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="travel-menu"
          style={{
            ...MONO,
            fontSize: 'clamp(15px, 4.2vw, 19px)',
            color: '#111111',
            background: 'none',
            border: 'none',
            padding: '4px 2px',
            cursor: 'pointer',
          }}
        >
          {menuOpen ? 'Cerrar' : 'Menú'}
        </button>
      </header>

      {/* Dropdown panel */}
      {menuOpen && (
        <div
          id="travel-menu"
          style={{
            position: 'fixed', top: `${HEADER_H}px`, left: 0, right: 0, zIndex: 39,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E5E5',
            padding: '10px 20px 26px',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}
        >
          {menuLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'PPMonumentExtended', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(24px, 7vw, 34px)',
                letterSpacing: '-0.02em',
                color: '#111111',
                textDecoration: 'none',
                padding: '8px 0',
              }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={whatsappHref('Hola, quiero saber más sobre las escalas en Europa.')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: '14px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              backgroundColor: '#b5e533', color: '#006837',
              height: '50px', borderRadius: '100px', textDecoration: 'none',
              ...MONO, fontSize: '13px',
            }}
          >
            WhatsApp
          </a>
        </div>
      )}

      <div style={{ height: `${HEADER_H}px` }} aria-hidden />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 20px' }}>
        {/* ── Intro ── */}
        <section style={{ padding: '36px 0 44px' }}>
          <p
            style={{
              fontFamily: "'FunnelDisplay', sans-serif",
              fontSize: 'clamp(17px, 4.6vw, 23px)',
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
        <section id="destinos" style={{ scrollMarginTop: `${HEADER_H + 12}px` }}>
          {DESTINOS.map((d, i) => (
            <DestinoCard key={d.slug} destino={d} index={i} />
          ))}
        </section>

        {/* ── Footer ── */}
        <footer id="contacto" style={{ scrollMarginTop: `${HEADER_H + 12}px`, paddingBottom: '72px' }}>
          <Image
            src="/logo-lt-travel-dark.png"
            alt="LATAM TRAVEL"
            width={961}
            height={121}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />

          <div style={{ borderTop: '1px solid #111111', margin: '34px 0 40px' }} />

          <div
            style={{
              fontFamily: "'FunnelDisplay', sans-serif",
              fontSize: '15px',
              lineHeight: 1.75,
              color: '#111111',
            }}
          >
            <p style={{ margin: 0 }}>LATAM VISA® — Consultoría de viajes</p>
            <p style={{ margin: 0, color: 'rgba(17,17,17,0.6)' }}>Brisbane, Australia · Atendemos toda Latinoamérica</p>

            <p style={{ margin: '22px 0 0' }}>
              <a href={`mailto:${CONTACT.email}`} style={{ color: '#111111', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                {CONTACT.email}
              </a>
            </p>
            <p style={{ margin: '10px 0 0' }}>
              <a href={whatsappHref('Hola, tengo una pregunta sobre el programa de escalas en Europa.')} target="_blank" rel="noopener noreferrer" style={{ color: '#111111', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                {CONTACT.whatsapp}
              </a>
            </p>

            <div style={{ display: 'flex', gap: '20px', margin: '26px 0 0' }}>
              <a href="https://www.instagram.com/latamvisausa/" target="_blank" rel="noopener noreferrer" style={{ ...MONO, fontSize: '13px', color: '#111111', textDecoration: 'underline', textUnderlineOffset: '3px' }}>IG</a>
              <a href="https://www.facebook.com/profile.php?id=61563009909169" target="_blank" rel="noopener noreferrer" style={{ ...MONO, fontSize: '13px', color: '#111111', textDecoration: 'underline', textUnderlineOffset: '3px' }}>FB</a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '34px 0 0' }}>
              <Link href="#destinos" style={{ ...MONO, fontSize: '13px', color: '#111111', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Destinos</Link>
              <Link href="/" style={{ ...MONO, fontSize: '13px', color: '#111111', textDecoration: 'underline', textUnderlineOffset: '3px' }}>LATAM VISA</Link>
            </div>

            <p style={{ margin: '38px 0 0', fontSize: '12px', color: 'rgba(17,17,17,0.45)' }}>
              © 2026 LATAM VISA® — No prestamos servicios de índole migratoria oficial.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
