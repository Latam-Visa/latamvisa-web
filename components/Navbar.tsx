'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Viajes', href: '/viajes' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Países', href: '#paises' },
  { label: 'Contacto', href: '#contacto' },
]

// Single source of truth for the logo chip's box size — both logo.png and
// logo-lt-travel.png are cropped with matching internal padding ratios (see
// public/logo-lt-travel.png's regeneration), so sharing this exact token
// keeps their visible ink height identical without a page-specific magic
// number. Change it once here and both navbars scale together.
const LOGO_BOX_CLASSNAME = 'h-[70px] w-auto object-contain'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const [overLight, setOverLight] = useState(pathname !== '/agendar') // true = white text (dark/sky bg), false = dark text (light bg)

  // Scoped to /viajes only — the homepage's nav (links + logo) stays exactly as
  // it was before. The homepage's #servicios/#proceso/#paises/#contacto anchors
  // don't exist on /viajes, so this page gets its own set pointing at the real
  // sections the "Dos Vacaciones" campaign renders.
  const travelNavLinks = [
    { label: 'Viajes', href: '/viajes' },
    { label: 'La idea', href: '/viajes#la-idea' },
    { label: 'Destinos', href: '/viajes#destinos' },
    { label: 'Cotiza', href: '/viajes#cotiza' },
  ]
  const currentNavLinks = pathname === '/viajes' ? travelNavLinks : navLinks

  // /viajes only ever shows the LATAM TRAVEL mark — LATAM VISA's standard logo
  // has no place on this page, in either navbar state. Two cuts of the same
  // mark: the knockout (white, cut-out letters) reads over the hero sky, and
  // the dark cut is needed once the bar turns solid cream, where a white
  // knockout would simply vanish.
  // Both cuts share logo-lt-travel.png's exact canvas (985x455, same internal
  // padding ratio), so LOGO_BOX_CLASSNAME sizes them identically.
  const useTravelLogo = pathname === '/viajes'
  const travelLogoSrc = overLight ? '/logo-lt-travel.png' : '/logo-lt-travel-dark-nav.png'

  useEffect(() => {
    let heroEndAbove = false // true once the homepage hero-end marker has scrolled above the viewport top

    const updateColor = () => {
      const vh = window.innerHeight
      const scrollY = window.scrollY

      // /viajes has its own fixed-position scroll-scrub hero (TravelHeroScroll)
      // pinned for the full 500vh spacer. The homepage's "over hero" heuristic
      // below (scrollY < vh*0.5) fires the moment the caribe zone reaches full
      // opacity — hundreds of vh before the hero rig actually stops being
      // visible — which flipped the navbar solid while the caribe scene was
      // still on screen. #viajes-hero-end is a 0-height marker placed right
      // after the spacer, so its top crossing the viewport top is the exact
      // moment TravelHeroScroll's fixed rig goes invisible; nothing from the
      // hero renders past that point, so that's the only correct trigger.
      if (pathname === '/viajes') {
        const heroEndEl = document.getElementById('viajes-hero-end')
        const pastHero = heroEndEl ? heroEndEl.getBoundingClientRect().top <= 0 : false
        setOverLight(!pastHero)
        return
      }

      const overHero = scrollY < vh * 0.5

      const heroEndEl = document.getElementById('servicios')

      // Hero-end marker is above the viewport (we've scrolled past it)
      if (heroEndEl) {
        heroEndAbove = heroEndEl.getBoundingClientRect().bottom < 0
      }

      // Are we in the footer (clouds) zone?
      // Sky/clouds visible: over hero, or between hero and hero-end marker
      const inSkyZone = overHero ||
        (!heroEndAbove && !overHero && (!heroEndEl || heroEndEl.getBoundingClientRect().top > vh))

      setOverLight(pathname === '/agendar' ? false : inSkyZone)
    }

    window.addEventListener('scroll', updateColor, { passive: true })
    updateColor()
    return () => window.removeEventListener('scroll', updateColor)
  }, [pathname])

  const textClass = overLight
    ? 'text-white/90 hover:text-white'
    : 'text-[#111111]/90 hover:text-[#111111]'

  const barColor = overLight ? 'bg-white' : 'bg-[#111111]'

  // Bright frames (the nubes zone especially — white text over near-white
  // clouds) got thin against the translucent bar. A subtle shadow only in
  // that state — same trick the hero's own copy already uses — restores
  // separation without pushing the bar toward solid.
  const navTextStyle: React.CSSProperties | undefined =
    pathname === '/viajes' && overLight ? { textShadow: '0 1px 6px rgba(0,0,0,0.5)' } : undefined

  // Scoped to /viajes only, so the homepage's always-transparent header (except
  // /agendar) stays pixel-identical. /viajes never goes fully opaque while its
  // hero video is on screen — a soft glass tint keeps the bar readable without
  // competing with the video, and only becomes the solid cream bar once
  // scrolled past the whole 500vh hero. bg-white/15 (under the bg-white/20
  // ceiling) plus navTextStyle's shadow above is what it took for links to
  // stay legible over the brightest cloud frames. Both classes carry the same
  // backdrop-blur-md so only the background/border actually cross-fades via
  // the header's own transition-all.
  const headerBgClass =
    pathname === '/agendar'
      ? 'bg-white/60 backdrop-blur-xl border-b border-white/40'
      : pathname === '/viajes'
        ? overLight
          ? 'bg-white/15 backdrop-blur-md'
          : 'bg-[#FAFAF7]/95 backdrop-blur-md border-b border-[#E5E5E5]'
        : ''

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 pointer-events-auto ${headerBgClass}`}
      style={{}}
    >
      <div className="w-full py-5 relative flex items-center justify-between px-6 xl:px-[100px]">
        {/* CENTER: Logo absolutely centered — same position as before */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
          {useTravelLogo ? (
            <Image
              src={travelLogoSrc}
              alt="LATAM Travel"
              width={985}
              height={455}
              className={LOGO_BOX_CLASSNAME}
              priority
            />
          ) : (
            <Image
              src="/logo.png"
              alt="LATAM VISA"
              width={300}
              height={84}
              className={LOGO_BOX_CLASSNAME}
              priority
            />
          )}
        </Link>

        {/* LEFT: Nav Links */}
        <div className="flex items-center gap-10">
          <nav className="hidden xl:flex items-center gap-6">
            {currentNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-500 ${textClass}`}
                style={{ fontFamily: "'PPMonumentExtended', sans-serif", fontSize: '11px', fontWeight: 700, ...navTextStyle }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT: Contact info */}
        <div className="hidden xl:flex items-center gap-10">
          <a
            href="tel:+61426779734"
            className={`transition-colors duration-500 ${textClass}`}
            style={{ fontFamily: "'PPMonumentExtended', sans-serif", fontSize: '11px', fontWeight: 700, ...navTextStyle }}
          >
            +61 426 779 734
          </a>
          <a
            href="mailto:future@latamvisas.com.au"
            className={`transition-colors duration-500 ${textClass}`}
            style={{ fontFamily: '"PPMonumentExtended", sans-serif', fontSize: '10px', fontWeight: 700, ...navTextStyle }}
          >
            future@latamvisas.com.au
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="xl:hidden flex flex-col gap-1.5 p-2 -mt-1"
          aria-label="Menú"
        >
          <span className={`block h-px w-6 transition-all duration-300 ${barColor} ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-px w-6 transition-all duration-300 ${barColor} ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-6 transition-all duration-300 ${barColor} ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

{/* Mobile Menu — always dark since it's an overlay on light bg */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:hidden bg-[#FAFAFA]/95 backdrop-blur-md border-t border-[#E0E0E0] px-6 py-8 flex flex-col gap-6"
        >
          {currentNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-widest uppercase text-[#111111] hover:text-[#5B6A00] transition-colors"
              style={{ fontFamily: "'PPMonumentExtended', sans-serif", fontWeight: 900 }}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-4 border-t border-[#E0E0E0] flex flex-col gap-3">
            <a href="tel:+61426779734" className="text-xs text-[#111111] font-bold" style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}>
              +61 426 779 734
            </a>
            <a href="mailto:future@latamvisas.com.au" className="text-xs text-[#111111]" style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}>
              future@latamvisas.com.au
            </a>
          </div>
          <Link
            href={pathname === '/viajes' ? '/viajes#contacto' : '#evaluacion'}
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-5 py-3 rounded-full text-xs tracking-widest uppercase bg-[#C8FF00] text-[#050505] font-bold text-center shadow-[0_4px_16px_rgba(200,255,0,0.35)] hover:bg-white hover:text-[#111111] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-all duration-300"
            style={{ fontFamily: "'FunnelDisplay', sans-serif" }}
          >
            {pathname === '/viajes' ? 'Hablar por WhatsApp →' : 'Evalúa tu Perfil →'}
          </Link>
        </motion.div>
      )}
    </motion.header>
  )
}
