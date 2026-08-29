'use client'
import { useEffect, useRef, useState } from 'react'
import { CONTACT } from '@/lib/constants'

// Folder name has spaces — pre-encoded so Image()/canvas src assignment never
// has to rely on the browser's implicit encoding behavior.
const FRAME_PREFIX = '/secuencia%20video%20travel/frame_'
const FRAME_EXT = '.webp'
const TOTAL_FRAMES = 160
const FRAME_PAD = 4

const frameSrc = (i: number) => `${FRAME_PREFIX}${String(i + 1).padStart(FRAME_PAD, '0')}${FRAME_EXT}`

const whatsappHref = `https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, quiero cotizar mi viaje a Europa.')}`

export default function TravelHeroScroll() {
  const [isMobile, setIsMobile] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [reducedMotionResolved, setReducedMotionResolved] = useState(false)

  const spacerRef = useRef<HTMLDivElement>(null)
  const fixedRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coverTextRef = useRef<HTMLDivElement>(null)
  const doorTextRef = useRef<HTMLDivElement>(null)
  const cloudsTextRef = useRef<HTMLDivElement>(null)
  const caribeTextRef = useRef<HTMLDivElement>(null)
  const currentFrameRef = useRef(0)
  const spacerOffsetRef = useRef(0)
  const framesRef = useRef<HTMLImageElement[]>([])
  // Cover intro is a one-time state, not a scroll-position zone — once the user
  // scrolls past it, it stays hidden even if they scroll back up to progress 0.
  const coverDismissedRef = useRef(false)

  /* ── Resolve prefers-reduced-motion before anything renders the scroll rig ── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    setReducedMotionResolved(true)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isReady = (img: HTMLImageElement | undefined): img is HTMLImageElement =>
    !!img && img.complete && img.naturalWidth > 0

  /* Nearest *loaded* frame to `index`, searching outward in both directions.
     Without this, drawFrame simply bailed whenever the exact frame hadn't
     arrived yet, leaving the canvas showing whatever was drawn last — on a
     throttled connection that reads as the hero freezing mid-scroll for
     seconds at a time (measured: only 32 of 159 frames land within 6s at
     1.6Mbps). Falling back to the closest frame we do have keeps the
     sequence moving — slightly choppier, never stuck. */
  const nearestLoadedFrame = (index: number): HTMLImageElement | undefined => {
    const frames = framesRef.current
    if (isReady(frames[index])) return frames[index]
    for (let d = 1; d < TOTAL_FRAMES; d++) {
      const before = frames[index - d]
      if (isReady(before)) return before
      const after = frames[index + d]
      if (isReady(after)) return after
    }
    return undefined
  }

  /* ── Canvas draw — scale-to-cover, centered (keeps door/subject centered on any aspect ratio) ── */
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const img = nearestLoadedFrame(index)
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cw = canvas.width, ch = canvas.height
    const iw = img.naturalWidth, ih = img.naturalHeight
    const scale = Math.max(cw / iw, ch / ih)
    const sw = iw * scale, sh = ih * scale
    const sx = (cw - sw) / 2, sy = (ch - sh) / 2
    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, sx, sy, sw, sh)
  }

  /* ── Preload: frame 1 immediately (first paint), the other 159 only once the
     user actually starts scrolling. An earlier version used requestIdleCallback
     instead, but idle callbacks can still fire within a few hundred ms of load —
     well inside the window Lighthouse (and real Core Web Vitals) measure LCP in.
     160 concurrent requests competing with the page's own critical resources
     under throttled conditions measurably delayed LCP (confirmed: total page
     weight ballooned to ~9MB during the audit, all firing before LCP was
     recorded, dragging the mobile performance score to 76). Scroll is a
     reasonable trigger instead — frames need to be ready by the time the user
     reaches them, and there's normally a beat between page-load and active
     scrolling for this to complete in. ── */
  useEffect(() => {
    if (!reducedMotionResolved || reducedMotion) return

    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES)

    const loadFrame = (i: number) => {
      if (images[i]) return
      const img = new window.Image()
      img.src = frameSrc(i)
      // Any newly-arrived frame can improve what's on screen right now: if the
      // canvas is currently showing a fallback (nearestLoadedFrame) because the
      // exact frame wasn't ready, this redraw swaps in the better match.
      img.onload = () => drawFrame(currentFrameRef.current)
      images[i] = img
    }

    loadFrame(0)
    framesRef.current = images

    /* How many of the 160 frames to actually fetch. The full sequence is ~15MB;
       on a slow connection it simply cannot arrive in time (measured: 32 of 159
       frames in 6s at 1.6Mbps), so requesting all of them just wastes the
       user's data and bandwidth on frames they'll never see. Stride N fetches
       every Nth frame instead — a coarser but complete animation, at a
       fraction of the payload. nearestLoadedFrame covers the gaps.
       navigator.connection is Chromium-only; elsewhere we assume a fast
       connection, which is the pre-existing behavior. */
    const strideForConnection = () => {
      const conn = (navigator as any).connection
      if (!conn) return 1
      if (conn.saveData) return 8                                  // ~20 frames, ~2MB
      const t = conn.effectiveType
      if (t === 'slow-2g' || t === '2g') return 8
      if (t === '3g') return 4                                     // ~40 frames, ~4MB
      return 1
    }

    let started = false
    const loadRest = () => {
      if (started) return
      started = true
      const minStride = strideForConnection()

      /* Load in coarse-to-fine passes rather than straight index order.
         Requests are served roughly in the order they're issued, so a single
         1,2,3…160 pass means the tail of the sequence arrives last — scrubbing
         to the caribe ending on a slow link showed a mid-sequence frame for
         seconds (measured: canvas stuck on one frame from progress 0.4 to the
         end). Passing over the whole range coarsely first (every 16th, then
         8th, 4th…) means every part of the timeline has *something* close
         almost immediately, and detail fills in after. loadFrame dedupes, so
         later passes only fetch what earlier ones didn't. */
      loadFrame(TOTAL_FRAMES - 1) // caribe ending — the closing CTA sits on it
      for (let stride = 16; stride >= minStride; stride = Math.floor(stride / 2)) {
        for (let i = 1; i < TOTAL_FRAMES; i += stride) loadFrame(i)
        if (stride === minStride) break
      }
    }

    window.addEventListener('scroll', loadRest, { passive: true, once: true })
    return () => window.removeEventListener('scroll', loadRest)
  }, [reducedMotionResolved, reducedMotion])

  /* ── Canvas resize ── */
  useEffect(() => {
    if (reducedMotion) return
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawFrame(currentFrameRef.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [reducedMotion])

  /* ── Cache spacer offset ── */
  useEffect(() => {
    if (reducedMotion) return
    const cacheOffset = () => {
      if (spacerRef.current) spacerOffsetRef.current = spacerRef.current.offsetTop
    }
    cacheOffset()
    window.addEventListener('resize', cacheOffset)
    return () => window.removeEventListener('resize', cacheOffset)
  }, [reducedMotion])

  /* ── Scroll handler — maps scroll progress (0–1 across the 500vh spacer) to
     frame index and to the three text zones: puerta / nubes / caribe ── */
  useEffect(() => {
    if (reducedMotion) return
    let ticking = false

    const fadeZone = (progress: number, start: number, fadeIn: number, holdEnd: number, end: number) => {
      if (progress < start || progress > end) return 0
      if (progress < start + fadeIn) return (progress - start) / fadeIn
      if (progress < holdEnd) return 1
      return Math.max(0, 1 - (progress - holdEnd) / (end - holdEnd))
    }

    // pointerEvents:'none' stops clicks/taps on a hidden zone, but it does NOT
    // remove its links/buttons from keyboard Tab order — a keyboard user can
    // still land focus on an invisible "Cotiza tu viaje" or "Explora destinos"
    // with no visual sign of where the focus went. Toggling tabIndex alongside
    // pointerEvents keeps hidden zones out of the tab sequence entirely.
    const setZoneInteractive = (el: HTMLDivElement, interactive: boolean) => {
      el.style.pointerEvents = interactive ? 'auto' : 'none'
      el.querySelectorAll<HTMLElement>('a, button').forEach((node) => {
        node.tabIndex = interactive ? 0 : -1
      })
    }

    const update = () => {
      ticking = false
      const spacer = spacerRef.current
      const fixed = fixedRef.current
      if (!spacer || !fixed) return

      const scrollY = window.scrollY
      const spacerTop = spacerOffsetRef.current
      const spacerHeight = spacer.offsetHeight
      const vh = window.innerHeight
      const scrollable = spacerHeight - vh
      if (scrollable <= 0) return

      const progress = Math.max(0, Math.min(1, (scrollY - spacerTop) / scrollable))

      fixed.style.visibility = scrollY >= spacerTop && scrollY <= spacerTop + spacerHeight ? 'visible' : 'hidden'

      /* Frame draw — canvas stays display:none (set in JSX) until the user actually
         scrolls past frame 0. Frame 0 is exactly what the fallback <img> already
         shows, so there's no visual gap. This matters beyond cosmetics: a canvas
         has no LCP candidacy of its own, and it occludes the <img> underneath it
         for LCP purposes the instant it's revealed — confirmed directly via
         PerformanceObserver (zero LCP entries with the canvas present at opacity:0
         or opacity:1; a valid entry fires immediately once it's display:none or
         removed). Opacity alone is NOT enough — Chrome still paints a 0-opacity
         canvas as an occluding layer, so this has to be display:none specifically,
         toggled to 'block' only once real scroll begins. Canvas drawing (drawFrame)
         still works correctly while display:none — only visual rendering pauses,
         the pixel buffer keeps accepting draws. */
      const frameIndex = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1)
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex
        drawFrame(frameIndex)
      }
      if (frameIndex > 0 && canvasRef.current && canvasRef.current.style.display !== 'block') {
        canvasRef.current.style.display = 'block'
      }

      /* ZONE 0 — cover (0–0.15): full "portada" intro, visible from the first
         pixel, fades out between 0.05 and 0.15 and never comes back — once
         dismissed it stays hidden even if the user scrolls back up, since it's
         a one-time entrance rather than a scroll-position zone like the rest. */
      if (progress > 0.15) coverDismissedRef.current = true
      if (coverTextRef.current) {
        const op = coverDismissedRef.current ? 0 : fadeZone(progress, 0, 0, 0.05, 0.15)
        coverTextRef.current.style.opacity = String(op)
        coverTextRef.current.style.transform = `translateY(${(1 - op) * -20}px)`
        setZoneInteractive(coverTextRef.current, op > 0.5)
      }

      /* ZONE 1 — puerta (0–0.45): "Un viaje, dos mundos" */
      if (doorTextRef.current) {
        const op = fadeZone(progress, 0, 0.08, 0.37, 0.45)
        doorTextRef.current.style.opacity = String(op)
        doorTextRef.current.style.transform = `translateY(${(1 - op) * 16}px)`
        setZoneInteractive(doorTextRef.current, op > 0.5)
      }

      /* ZONE 2 — nubes (~0.6–0.8): campaign message */
      if (cloudsTextRef.current) {
        const op = fadeZone(progress, 0.60, 0.06, 0.74, 0.80)
        cloudsTextRef.current.style.opacity = String(op)
        cloudsTextRef.current.style.transform = `translateY(${(1 - op) * 16}px)`
        setZoneInteractive(cloudsTextRef.current, op > 0.5)
      }

      /* ZONE 3 — caribe final (0.85–1): closing line + CTA. Fades in only — it's the
         last zone, so it holds at full opacity through the end of the scroll rather
         than fading back out (fadeZone's fade-out branch divides by zero when
         holdEnd === end, which is exactly this zone's case at progress === 1). */
      if (caribeTextRef.current) {
        const op = progress < 0.85 ? 0 : Math.min(1, (progress - 0.85) / 0.07)
        caribeTextRef.current.style.opacity = String(op)
        caribeTextRef.current.style.transform = `translateY(${(1 - op) * 16}px)`
        setZoneInteractive(caribeTextRef.current, op > 0.5)
      }
    }

    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    requestAnimationFrame(update)
    return () => window.removeEventListener('scroll', onScroll)
  }, [reducedMotion])

  const hPad = isMobile ? '24px' : '100px'

  const headlineStyle: React.CSSProperties = {
    fontFamily: "'PPMonumentExtended', sans-serif",
    fontSize: isMobile ? 'clamp(28px, 9vw, 40px)' : 'clamp(36px, 4.6vw, 68px)',
    fontWeight: 900,
    lineHeight: 0.95,
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
    margin: 0,
    textShadow: '0 2px 20px rgba(0,0,0,0.55)',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  }

  const subStyle: React.CSSProperties = {
    fontFamily: "'FunnelDisplay', sans-serif",
    fontSize: isMobile ? 'clamp(14px, 4vw, 17px)' : 'clamp(16px, 1.4vw, 22px)',
    fontWeight: 400,
    lineHeight: 1.5,
    color: 'rgba(255,255,255,0.92)',
    margin: '14px 0 0',
    maxWidth: isMobile ? '100%' : '480px',
    textShadow: '0 1px 10px rgba(0,0,0,0.6)',
  }

  /* Cover-state headline runs a size step down from the per-zone headline —
     it needs to sit alongside a paragraph, CTA and card in the same viewport
     without the zones' single-message breathing room. */
  const coverHeadlineStyle: React.CSSProperties = {
    ...headlineStyle,
    fontSize: isMobile ? 'clamp(24px, 7.5vw, 32px)' : 'clamp(32px, 3.6vw, 54px)',
  }

  const coverCtaStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '22px',
    border: 'none',
    backgroundColor: '#b5e533',
    color: '#006837',
    height: '46px',
    padding: '0 26px',
    borderRadius: '100px',
    fontFamily: "'FunnelDisplay', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    textTransform: 'uppercase',
    boxShadow: '0 8px 24px -8px rgba(181,229,51,0.6)',
    cursor: 'pointer',
  }

  // Matches /postcard's frosted-glass card language (cream tint + saturated
  // blur), adapted for sitting over a photo instead of a light page bg.
  const glassCardStyle: React.CSSProperties = {
    width: '240px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(244,244,232,0.72)',
    backdropFilter: 'blur(20px) saturate(140%)',
    WebkitBackdropFilter: 'blur(20px) saturate(140%)',
    boxShadow: '0 14px 32px -14px rgba(0,0,0,0.45)',
    overflow: 'hidden',
  }

  const ctaStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '28px',
    border: '1px solid rgba(255,255,255,0.55)',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    height: '46px',
    padding: '0 26px',
    borderRadius: '100px',
    fontFamily: "'FunnelDisplay', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'all 0.35s ease',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    textTransform: 'uppercase',
  }

  /* ── prefers-reduced-motion: static frame 1, all copy always visible, no scrub ── */
  if (reducedMotionResolved && reducedMotion) {
    return (
      <section
        aria-label="Viajes: un viaje, dos mundos — escala en Europa antes de llegar a casa"
        style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', backgroundColor: '#050505' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc(0)}
          alt=""
          style={{ position: 'absolute', inset: '-1px', width: 'calc(100% + 2px)', height: 'calc(100% + 2px)', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: `120px ${hPad} 80px`, display: 'flex', flexDirection: 'column', gap: '56px' }}>
          <div>
            <h1 style={coverHeadlineStyle}>Abre la puerta a tu próximo viaje</h1>
            <p style={subStyle}>Detrás de cada puerta hay dos mundos: una escala en Europa y el regreso a casa en Latinoamérica. Itinerario, vuelos y hospedaje, con claridad de principio a fin.</p>
          </div>
          <div>
            <h2 style={headlineStyle}>Un viaje, dos mundos</h2>
            <p style={subStyle}>Descubre cómo tu vuelo de vuelta a casa puede convertirse en la mitad de una aventura.</p>
          </div>
          <div>
            <h2 style={headlineStyle}>Dos vacaciones en un solo viaje</h2>
            <p style={subStyle}>Aprovecha tu escala en Europa antes de llegar a casa — sin costo extra de vuelo.</p>
          </div>
          <div>
            <h2 style={headlineStyle}>Te llevamos de vuelta a casa</h2>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" style={{ ...ctaStyle, marginTop: '20px' }}>
              Cotiza tu viaje
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Viajes: un viaje, dos mundos — escala en Europa antes de llegar a casa" style={{ position: 'relative' }}>
      {/* Spacer — drives scroll distance across the whole frame sequence */}
      <div ref={spacerRef} style={{ height: '500vh', background: '#050505' }} />
      {/* Marker for Navbar's scroll-zone detection — mirrors the #servicios pattern used on the home hero.
          Sits in normal flow right after the spacer, so its position matches exactly where the hero ends. */}
      <div id="viajes-hero-end" style={{ height: 0 }} aria-hidden />

      {/* Fixed fullscreen hero */}
      <div
        ref={fixedRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10, pointerEvents: 'none' }}
      >
        {/* Frame-1 fallback — the actual LCP candidate. Stays uncovered (canvas
            stays display:none) until real scroll begins, so it's what the browser
            measures for Largest Contentful Paint instead of nothing.

            inset:-1px / calc(100% + 2px) is deliberate, not a mistake: an image
            sized to EXACTLY fill its viewport-sized container (inset:0, 100%/100%)
            was confirmed via direct PerformanceObserver + CDP trace testing to be
            silently excluded from LCP candidacy in Chrome — zero LCP entries fired
            at all, on this image or any other content, in a minimal reproduction
            with no other cause. A single pixel of intentional overflow (invisible
            to users, clipped by the fixed container) was the only change needed to
            make it register correctly. Kept on the canvas too, so there's no 1px
            seam when it takes over from the image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc(0)}
          alt=""
          fetchPriority="high"
          style={{ position: 'absolute', inset: '-1px', width: 'calc(100% + 2px)', height: 'calc(100% + 2px)', objectFit: 'cover', zIndex: 0 }}
        />

        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: '-1px', display: 'none', width: 'calc(100% + 2px)', height: 'calc(100% + 2px)', zIndex: 1 }}
        />

        {/* Scrim for text legibility, present throughout */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.50) 100%)',
          }}
        />

        {/* ZONE 0 — cover: full "portada" intro state, visible from the first
            pixel (opacity:1 by default below, confirmed/adjusted by the scroll
            handler on mount). Fades out for good by progress 0.15 — see
            coverDismissedRef in the scroll handler. Sits above ZONE 1 (zIndex 4
            vs 3) since their fade windows briefly overlap around 0.05–0.15. */}
        <div
          ref={coverTextRef}
          data-zone="cover"
          style={{ position: 'absolute', inset: 0, zIndex: 4, opacity: 1, pointerEvents: 'auto' }}
        >
          {/* Headline — top-left, its right edge reaches toward the door's left edge.
              Mobile wraps naturally into 2-3 lines instead of a forced break, which
              at the mobile font size lands on 2 lines on its own. */}
          <div style={{ position: 'absolute', top: isMobile ? '96px' : '20vh', left: hPad, maxWidth: isMobile ? '90%' : '46vw' }}>
            <h1 style={coverHeadlineStyle}>{isMobile ? 'Abre la puerta a tu próximo viaje' : <>Abre la puerta a<br />tu próximo viaje</>}</h1>
          </div>

          {/* Paragraph + solid CTA — bottom-left */}
          <div style={{ position: 'absolute', bottom: isMobile ? '168px' : '10vh', left: hPad, maxWidth: isMobile ? 'calc(100% - 48px)' : '500px' }}>
            <p
              style={{
                ...subStyle,
                fontSize: isMobile ? 'clamp(10.5px, 3vw, 12px)' : 'clamp(14px, 1.05vw, 16px)',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}
            >
              Detrás de cada puerta hay dos mundos: una escala en Europa y el regreso a casa en Latinoamérica. Itinerario, vuelos y hospedaje, con claridad de principio a fin.
            </p>
            <a
              href="#destinos"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('destinos')?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={coverCtaStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(181,229,51,0.75)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(181,229,51,0.6)'
              }}
            >
              Explora destinos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Destination teaser card — bottom-right, glassmorphism (matches /postcard), hidden below md */}
          {!isMobile && (
            <div style={{ position: 'absolute', bottom: '10vh', right: hPad, ...glassCardStyle }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frameSrc(34)} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontFamily: "'FunnelDisplay', sans-serif", fontSize: '13px', fontWeight: 700, color: '#006837', margin: 0 }}>
                  Escala en Europa · 7 días
                </p>
                <p style={{ fontFamily: "'FunnelDisplay', sans-serif", fontSize: '11px', fontWeight: 500, color: 'rgba(0,104,55,0.65)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Próximamente
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ZONE 1 — puerta */}
        <div
          ref={doorTextRef}
          data-zone="door"
          style={{ position: 'absolute', inset: 0, zIndex: 3, opacity: 0, pointerEvents: 'none', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center' }}
        >
          <div style={{ paddingLeft: hPad, paddingRight: isMobile ? hPad : 0, paddingBottom: isMobile ? '72px' : 0, maxWidth: isMobile ? '100%' : '640px' }}>
            <h2 style={headlineStyle}>Un viaje, dos mundos</h2>
            <p style={subStyle}>Descubre cómo tu vuelo de vuelta a casa puede convertirse en la mitad de una aventura.</p>
          </div>
        </div>

        {/* ZONE 2 — nubes: campaign message */}
        <div
          ref={cloudsTextRef}
          data-zone="clouds"
          style={{ position: 'absolute', inset: 0, zIndex: 3, opacity: 0, pointerEvents: 'none', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}
        >
          <div style={{ paddingLeft: isMobile ? hPad : 0, paddingRight: hPad, paddingBottom: isMobile ? '72px' : 0, maxWidth: isMobile ? '100%' : '900px', textAlign: isMobile ? 'left' : 'right' }}>
            <h2 style={headlineStyle}>Dos vacaciones en un solo viaje</h2>
            <p style={{ ...subStyle, marginLeft: isMobile ? 0 : 'auto' }}>Aprovecha tu escala en Europa antes de llegar a casa — sin costo extra de vuelo.</p>
          </div>
        </div>

        {/* ZONE 3 — caribe final: closing line + CTA */}
        <div
          ref={caribeTextRef}
          data-zone="caribe"
          style={{ position: 'absolute', inset: 0, zIndex: 3, opacity: 0, pointerEvents: 'none', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', textAlign: 'center' }}
        >
          <div style={{ padding: `0 ${hPad}`, paddingBottom: isMobile ? '72px' : 0 }}>
            <h2 style={headlineStyle}>Te llevamos de vuelta a casa</h2>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...ctaStyle, justifyContent: 'center', margin: '28px auto 0' }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.backgroundColor = '#C8FF00'
                el.style.borderColor = '#C8FF00'
                el.style.color = '#050505'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.backgroundColor = 'transparent'
                el.style.borderColor = 'rgba(255,255,255,0.55)'
                el.style.color = '#FFFFFF'
              }}
            >
              Cotiza tu viaje
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
