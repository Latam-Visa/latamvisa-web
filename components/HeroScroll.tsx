'use client'
import { useEffect, useRef, useState } from 'react'
import { FRAME_EXT, FRAME_PREFIX, TOTAL_FRAMES } from '@/lib/constants'


export default function HeroScroll() {
  const [isMobile, setIsMobile] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [reducedMotionResolved, setReducedMotionResolved] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Resolve prefers-reduced-motion before the scroll rig mounts ── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    setReducedMotionResolved(true)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const spacerRef = useRef<HTMLDivElement>(null)
  const fixedRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const sigRef = useRef<HTMLDivElement>(null)
  const textLayer1Ref = useRef<HTMLDivElement>(null)
  const textLayer2Ref = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const statementWordsRef = useRef<HTMLSpanElement[]>([])
  const topVignetteRef = useRef<HTMLDivElement>(null)
  const bottomVignetteRef = useRef<HTMLDivElement>(null)
  const currentFrameRef = useRef(0)
  const spacerOffsetRef = useRef(0)
  const framesRef = useRef<HTMLImageElement[]>([])
  const isMobileRef = useRef(false)

  /* ── Sync isMobile to ref so scroll handler can read it ── */
  useEffect(() => { isMobileRef.current = isMobile }, [isMobile])

  /* ── Preload: frame 1 immediately (first paint), the other 135 only once
     the user actually starts scrolling. Loading all 137 frames (~8.9MB)
     unconditionally on mount — as this used to do — competes with the
     page's own critical resources for bandwidth in the first second of
     load, on every visit to the homepage. Same fix already proven on
     TravelHeroScroll's identical rig; scroll is a reasonable trigger since
     frames only need to be ready by the time the user reaches them. ── */
  useEffect(() => {
    if (!reducedMotionResolved || reducedMotion) return

    const frameSrc = (i: number) => {
      // frame-001 is PNG (higher resolution), rest are JPG
      const ext = i === 1 ? '.png' : FRAME_EXT
      return `${FRAME_PREFIX}${String(i).padStart(3, '0')}${ext}`
    }

    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES)
    const loadFrame = (i: number) => {
      const img = new window.Image()
      img.src = frameSrc(i)
      img.onload = () => { if (i - 1 === currentFrameRef.current) drawFrame(i - 1) }
      images[i - 1] = img
    }

    loadFrame(1)
    framesRef.current = images

    let started = false
    const loadRest = () => {
      if (started) return
      started = true
      for (let i = 2; i <= TOTAL_FRAMES; i++) loadFrame(i)
    }

    // This page runs useSmoothScroll (Lenis), which fires a real 'scroll'
    // event of its own during initialization — confirmed via a raw listener:
    // scrollY jumps to ~1400px and immediately back to 0 on load, with no
    // user input at all. A plain once-scroll trigger fires on that, defeating
    // the whole point of deferring the load. wheel/touchstart/scroll-relevant
    // keydown are genuine user-input events Lenis never synthesizes, so they
    // don't false-trigger the way 'scroll' does here.
    const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End']
    const onKeydown = (e: KeyboardEvent) => { if (scrollKeys.includes(e.key)) loadRest() }
    const opts = { passive: true, once: true } as const
    window.addEventListener('wheel', loadRest, opts)
    window.addEventListener('touchstart', loadRest, opts)
    window.addEventListener('keydown', onKeydown, opts)
    return () => {
      window.removeEventListener('wheel', loadRest)
      window.removeEventListener('touchstart', loadRest)
      window.removeEventListener('keydown', onKeydown)
    }
  }, [reducedMotionResolved, reducedMotion])

  /* ── Canvas draw ── */
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const img = framesRef.current[index]
    if (!canvas || !img || !img.complete) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cw = canvas.width, ch = canvas.height
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    const scale = Math.max(cw / iw, ch / ih)
    const sw = iw * scale, sh = ih * scale
    const sx = (cw - sw) / 2, sy = (ch - sh) / 2
    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, sx, sy, sw, sh)
  }

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

  /* ── Scroll handler ── */
  useEffect(() => {
    if (reducedMotion) return
    let ticking = false
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

      // Canvas fades only after textLayer2 is completely gone (0.80) — long cinematic crossfade
      if (progress > 0.80) {
        const heroFade = Math.max(0, 1 - (progress - 0.80) / 0.20)
        fixed.style.opacity = String(heroFade)
        fixed.style.visibility = heroFade < 0.01 ? 'hidden' : 'visible'
      } else {
        fixed.style.visibility = 'visible'
        fixed.style.opacity = '1'
      }

      /* Frame draw */
      const frameIndex = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1)
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex
        drawFrame(frameIndex)
      }

      /* Layer 1 — expand outward + blur + fade, gone by frame 057 (0.419) */
      const convEnd = 0.419
      const convT = progress <= 0.02 ? 0 : Math.min(1, (progress - 0.02) / (convEnd - 0.02))
      const layer1Op    = 1 - convT
      const layer1Scale = 1 + convT * 0.13          // 1.0 → 1.13 (expands outward)
      const layer1Blur  = convT * 5                 // 0 → 5px blur

      if (textLayer1Ref.current) {
        textLayer1Ref.current.style.opacity   = String(layer1Op)
        textLayer1Ref.current.style.transform = `scale(${layer1Scale})`
        textLayer1Ref.current.style.filter    = `blur(${layer1Blur}px)`
      }
      // hintRef/sigRef are inside textLayer1Ref — only drive their individual translateY
      if (hintRef.current) hintRef.current.style.transform = `translateY(${convT * -14}px)`
      if (sigRef.current) sigRef.current.style.transform   = `translateY(${convT * -14}px)`

      /* CTA — hidden on mobile until 3 frames in; fades before textLayer2 exits */
      if (ctaRef.current) {
        const mobileStart = isMobileRef.current && progress < 0.025
        const ctaOp = mobileStart ? 0 : (progress > 0.70 ? Math.max(0, 1 - (progress - 0.70) / 0.06) : 1)
        ctaRef.current.style.opacity       = String(ctaOp)
        ctaRef.current.style.transform     = 'translateX(-50%)'
        ctaRef.current.style.filter        = ''
        ctaRef.current.style.pointerEvents = ctaOp < 0.1 ? 'none' : 'auto'
      }

      // Removed white overlay logic

      /* Bottom vignette — fades out alongside textLayer2 exit */
      if (bottomVignetteRef.current) {
        if (progress <= 0.72) {
          bottomVignetteRef.current.style.opacity = '1'
        } else if (progress < 0.80) {
          bottomVignetteRef.current.style.opacity = String(Math.max(0, 1 - (progress - 0.72) / 0.08))
        } else {
          bottomVignetteRef.current.style.opacity = '0'
        }
      }

      /* Top vignette — fade out when sky frames are showing (Layer 2 visible) */
      if (topVignetteRef.current) {
        if (progress <= 0.50) {
          topVignetteRef.current.style.opacity = '1'
        } else if (progress < 0.56) {
          topVignetteRef.current.style.opacity = String(1 - (progress - 0.50) / 0.06)
        } else if (progress < 0.91) {
          topVignetteRef.current.style.opacity = '0'
        } else {
          topVignetteRef.current.style.opacity = String(Math.min((progress - 0.91) / 0.06, 1))
        }
      }

      /* Layer 2 — LATAM VISA statement: appears at 0.537,
         words reveal to 0.70, held until 0.74, then fades 0.74→0.80 before canvas crossfade */
      if (textLayer2Ref.current) {
        if (progress > 0.537 && progress <= 0.74) {
          const op = Math.min((progress - 0.537) / 0.06, 1)
          textLayer2Ref.current.style.opacity = String(op)
          textLayer2Ref.current.style.transform = `translateY(${28 * (1 - op)}px)`
          textLayer2Ref.current.style.pointerEvents = op > 0.5 ? 'auto' : 'none'

          // Words reveal from 0.537 → 0.70 — all words visible before exit
          const fill = Math.max(0, Math.min(1, (progress - 0.537) / (0.70 - 0.537)))
          statementWordsRef.current.forEach((span, i) => {
            if (!span) return
            const total = statementWordsRef.current.length
            const s = i / total, e = (i + 1) / total
            if (fill >= e) span.style.opacity = '1'
            else if (fill <= s) span.style.opacity = '0.04'
            else span.style.opacity = String(0.04 + ((fill - s) / (e - s)) * 0.96)
          })
        } else if (progress > 0.74 && progress <= 0.80) {
          // Slow fade out — canvas crossfade begins at 0.80
          const op = Math.max(1 - (progress - 0.74) / 0.06, 0)
          textLayer2Ref.current.style.opacity = String(op)
          textLayer2Ref.current.style.transform = 'translateY(0)'
          textLayer2Ref.current.style.pointerEvents = 'none'
        } else if (progress > 0.80) {
          textLayer2Ref.current.style.opacity = '0'
          textLayer2Ref.current.style.pointerEvents = 'none'
        } else {
          textLayer2Ref.current.style.opacity = '0'
          textLayer2Ref.current.style.transform = 'translateY(28px)'
          textLayer2Ref.current.style.pointerEvents = 'none'
          statementWordsRef.current.forEach((w) => { if (w) w.style.opacity = '0.04' })
        }
      }
    }

    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    requestAnimationFrame(update)
    return () => window.removeEventListener('scroll', onScroll)
  }, [reducedMotion])

  const statementText = "LATAM VISA® existe porque ningún latino debería planear a ciegas su gran proyecto hacia Australia. Conocemos las mejores instituciones y el camino exacto porque lo vivimos primero. Tu consultoría en educación y viajes diseñada por latinos, para latinos — desde la elección de tu programa hasta tu llegada, de principio a fin y sin letra pequeña."
  const statementWords = statementText.split(' ')

  /* ── Shared styles ── */
  const hPad = isMobile ? '24px' : '100px'

  const headlineBase: React.CSSProperties = {
    fontFamily: "'PPMonumentExtended', sans-serif",
    fontSize: isMobile ? 'clamp(22px, 7vw, 32px)' : '4vw',
    fontWeight: 900,
    lineHeight: 0.92,
    letterSpacing: '-0.03em',
    display: 'block',
    color: '#FFFFFF',
    textShadow: '0 2px 16px rgba(188, 188, 188, 0.6)',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'PPMonumentExtended', sans-serif",
    fontSize: '8px',
    fontWeight: 300,
    letterSpacing: '0.25em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.4)',
  }

  /* ── prefers-reduced-motion: static frame 1, all copy stacked and always
     visible, no scroll-scrub rig. Mirrors the same fallback already proven
     on TravelHeroScroll — same reasoning: this hero previously had no
     reduced-motion handling at all, on the homepage's own entry point. ── */
  if (reducedMotionResolved && reducedMotion) {
    return (
      <section
        aria-label="LATAM VISA: Latinos sin fronteras"
        // 180vh, not 100vh: app/page.tsx pulls the section after the hero up
        // by -80vh (marginTop), calibrated for the animated version's long
        // fade-out. This branch has no such fade — without the extra 80vh of
        // clearance, EvaluationForm's card was overlapping this hero's own
        // copy (confirmed via screenshot at 1280px).
        style={{ position: 'relative', width: '100%', minHeight: '180vh', overflow: 'hidden', backgroundColor: '#050505' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${FRAME_PREFIX}001.png`}
          alt=""
          style={{ position: 'absolute', inset: '-1px', width: 'calc(100% + 2px)', height: 'calc(100% + 2px)', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.25) 35%, rgba(5,5,5,0.7) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: `120px ${hPad} 80px`, display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div>
            <span style={headlineBase}>Latinos</span>
            <span style={headlineBase}>Sin fronteras</span>
          </div>
          <div style={{ maxWidth: '480px' }}>
            <div
              style={{
                fontFamily: "'PPMonumentExtended', sans-serif",
                fontSize: isMobile ? '13px' : '17px',
                fontWeight: 500,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.95)',
                lineHeight: 1.45,
                marginBottom: '12px',
              }}
            >
              Donde termina tu zona de confort, empieza tu historia
            </div>
            <p style={{ fontFamily: "'PPMonumentExtended', sans-serif", fontSize: '13px', fontWeight: 350, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 }}>
              Somos la generación que no pide permiso para soñar en grande. Conectamos culturas, abrimos caminos y demostramos que ser latino es llevar un incendio en el alma y una fiesta en los pies.
            </p>
          </div>
          <p style={{ fontFamily: "'PPMonumentExtended', sans-serif", fontWeight: 700, fontSize: 'clamp(14px, 2vw, 20px)', lineHeight: 1.4, color: 'rgba(255,255,255,0.85)', maxWidth: '640px', margin: 0 }}>
            {statementText}
          </p>
          <span style={headlineBase}>El mundo nos espera</span>
          <a
            href="#evaluacion"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start',
              border: '1px solid rgba(255,255,255,0.50)', backgroundColor: 'transparent', color: '#FFFFFF',
              height: '38px', padding: '0 20px', borderRadius: '100px',
              fontFamily: "'FunnelDisplay', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
              textDecoration: 'none', whiteSpace: 'nowrap', textTransform: 'uppercase' as const,
            }}
          >
            Evalúa tu perfil
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* keyframe for scroll arrow pulse */}
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0);   opacity: 0.45; }
          50%       { transform: translateY(7px); opacity: 0.9;  }
        }
        .scroll-arrow { animation: scrollBounce 1.6s ease-in-out infinite; }
      `}</style>

      {/* Spacer — drives scroll distance */}
      <div ref={spacerRef} style={{ height: '240vh', background: 'transparent' }} />

      {/* Fixed fullscreen hero */}
      <div
        ref={fixedRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 45, pointerEvents: 'none' }}
      >
        {/* Frame-001 fallback — visible while canvas hasn't drawn yet */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/secuencia-video-principal/ezgif-frame-001.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />

        {/* Canvas — crisp frame rendering, sits above fallback img */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', zIndex: 1 }}
        />

        {/* Fade-to-green overlay — connects hero exit to the lime sections below */}
        <div
          ref={overlayRef}
          style={{ position: 'absolute', inset: 0, backgroundColor: 'transparent', opacity: 0, pointerEvents: 'none', zIndex: 2 }}
        />

        {/* Top vignette */}
        <div ref={topVignetteRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 3 }} />

        {/* Bottom vignette */}
        <div ref={bottomVignetteRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '250px', background: 'linear-gradient(to top, rgba(5,5,5,0.65) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 3 }} />

        {/* ══════════════════════════════════════
            LAYER 1 — Initial UI
        ══════════════════════════════════════ */}
        <div
          ref={textLayer1Ref}
          style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'auto' }}
        >
          {/* TOP-LEFT headline */}
          <div style={{ position: 'absolute', top: isMobile ? '10vh' : '22vh', left: hPad }}>
            <span style={headlineBase}>Latinos</span>
            <span style={headlineBase}>Sin fronteras</span>
          </div>

          {/* BOTTOM-RIGHT headline */}
          <div style={{ position: 'absolute', ...(isMobile ? { top: '50vh' } : { bottom: '25vh' }), right: hPad, textAlign: 'right' }}>
            <span style={headlineBase}>El mundo</span>
            <span style={headlineBase}>nos espera</span>
          </div>

          {/* BOTTOM-LEFT: Tagline block */}
          <div style={{ position: 'absolute', bottom: isMobile ? '30vh' : '14vh', left: hPad, maxWidth: isMobile ? `calc(100vw - 48px)` : '380px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: isMobile ? '10px' : '16px' }} />
            <div style={{
              fontFamily: "'PPMonumentExtended', sans-serif",
              fontSize: isMobile ? '13px' : '17px',
              fontWeight: 500,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.45,
              marginBottom: isMobile ? '10px' : '16px',
              textShadow: '0 1px 8px rgba(0,0,0,0.8)',
            }}>
              Donde termina tu zona de confort, empieza tu historia
            </div>
            <div style={{ width: '100%', maxWidth: '400px', height: '1px', backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: isMobile ? '10px' : '16px' }} />
            {!isMobile && (
              <p style={{
                fontFamily: "'PPMonumentExtended', sans-serif",
                fontSize: '11px',
                fontWeight: 350,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.8,
                margin: 0,
                textShadow: '0 1px 6px rgba(0,0,0,0.9)',
              }}>
                Somos la generación que no pide permiso para soñar en grande. Conectamos culturas, abrimos caminos y demostramos que ser latino es llevar un incendio en el alma y una fiesta en los pies.
              </p>
            )}
          </div>

          {/* BOTTOM-RIGHT: Scroll indicator — hidden on mobile */}
          <div
            ref={hintRef}
            style={{
              position: 'absolute',
              bottom: '64px',
              right: hPad,
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '16px',
              zIndex: 4,
            }}
          >
            <span style={labelStyle}>Scroll Down</span>
            {/* Animated arrow next to "Scroll Down" */}
            <div className="scroll-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
            {/* Vertical divider */}
            <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <span style={labelStyle}>To Start the Journey</span>
          </div>

          {/* BOTTOM-LEFT: Est. signature */}
          <div
            ref={sigRef}
            style={{ position: 'absolute', bottom: isMobile ? '20px' : '64px', left: hPad, zIndex: 4 }}
          >
            <span style={labelStyle}>Est. 2026 — LATAM VISA®</span>
          </div>
        </div>

        {/* CTA button — ALWAYS visible, outside fading layers */}
        <div
          ref={ctaRef}
          style={{
            position: 'absolute',
            bottom: isMobile ? '86px' : '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 6,
            pointerEvents: 'auto',
          }}
        >
          <a
            href="#evaluacion"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid rgba(255,255,255,0.50)',
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              height: '38px',
              padding: '0 20px',
              borderRadius: '100px',
              fontFamily: "'FunnelDisplay', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.35s ease',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = '#C8FF00'
              el.style.borderColor = '#C8FF00'
              el.style.color = '#050505'
              el.style.boxShadow = '0 4px 24px rgba(200,255,0,0.50)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = 'transparent'
              el.style.borderColor = 'rgba(255,255,255,0.55)'
              el.style.color = '#FFFFFF'
              el.style.boxShadow = 'none'
            }}
          >
            Evalúa tu perfil
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* ══════════════════════════════════════
            LAYER 2 — Statement (mid-scroll)
        ══════════════════════════════════════ */}
        <div
          ref={textLayer2Ref}
          style={{ position: 'absolute', inset: 0, zIndex: 4, opacity: 0, transform: 'translateY(20px)', pointerEvents: 'none' }}
        >

          {/* Statement text — colored by country/brand */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              padding: isMobile ? '0 24px' : '0 92px',
              textAlign: 'left',
            }}
          >
            <p style={{
              fontFamily: "'PPMonumentExtended', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(15px, 2.3vw, 36px)',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              margin: 0,
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}>
              {statementWords.map((word, i) => (
                <span
                  key={i}
                  ref={(el) => { if (el) statementWordsRef.current[i] = el }}
                  style={{
                    opacity: 0.04,
                    transition: 'opacity 0.1s ease',
                    color: '#FFFFFF',
                  }}
                >
                  {word}{' '}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
