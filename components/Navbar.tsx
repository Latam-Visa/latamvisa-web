'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
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
  // it was before. #servicios/#proceso/#paises/#contacto are homepage anchors
  // that don't exist on /viajes, so the first slot is swapped for a page-
  // appropriate "Viajes" link there instead of leaving a dead anchor link.
  const currentNavLinks = pathname === '/viajes'
    ? [{ label: 'Viajes', href: '/viajes' }, ...navLinks.slice(1)]
    : navLinks

  // The travel logo is a "knockout" mark — a solid white card with the plane
  // + wordmark cut out as transparency — designed to sit over a photo/video,
  // not over the navbar's own near-white solid background. So it only
  // replaces the standard logo while still in the transparent/over-hero
  // state; once scrolled past (solid bg), it reverts to the normal logo for
  // legibility.
  const useTravelLogo = pathname === '/viajes' && overLight

  useEffect(() => {
    // '#servicios' marks the hero-end on the homepage; '#viajes-hero-end' does the
    // same for /viajes's scroll-scrubbed hero — whichever exists on the current
    // page is used. #contacto is the footer which shows the clouds background again.
    let heroEndAbove = false // true once the hero-end marker has scrolled above the viewport top

    const updateColor = () => {
      const vh = window.innerHeight
      const scrollY = window.scrollY

      const overHero = scrollY < vh * 0.5

      const heroEndEl = document.getElementById('servicios') || document.getElementById('viajes-hero-end')

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

  // Scoped to /viajes only, so the homepage's always-transparent header (except
  // /agendar) stays pixel-identical — /viajes's hero needs a real transparent
  // -> solid transition once scrolled past, which no other page currently does.
  const headerBgClass =
    pathname === '/agendar'
      ? 'bg-white/60 backdrop-blur-xl border-b border-white/40'
      : pathname === '/viajes' && !overLight
        ? 'bg-[#FAFAF7]/95 backdrop-blur-md border-b border-[#E5E5E5]'
        : ''

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 pointer-events-auto ${headerBgClass}`}
      style={{}}
    >
      <div className="w-full py-5 relative flex items-center justify-between px-6 md:px-[100px]">
        {/* CENTER: Logo absolutely centered — same position as before */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
          {useTravelLogo ? (
            <Image
              src="/logo-lt-travel.png"
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
          <nav className="hidden md:flex items-center gap-10">
            {currentNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-500 ${textClass}`}
                style={{ fontFamily: "'PPMonumentExtended', sans-serif", fontSize: '11px', fontWeight: 700 }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT: Contact info */}
        <div className="hidden md:flex items-center gap-10">
          <a
            href="tel:+61426779734"
            className={`transition-colors duration-500 ${textClass}`}
            style={{ fontFamily: "'PPMonumentExtended', sans-serif", fontSize: '11px', fontWeight: 700 }}
          >
            +61 426 779 734
          </a>
          <a
            href="mailto:future@latamvisas.com.au"
            className={`transition-colors duration-500 ${textClass}`}
            style={{ fontFamily: '"PPMonumentExtended", sans-serif', fontSize: '10px', fontWeight: 700 }}
          >
            future@latamvisas.com.au
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 -mt-1"
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
          className="md:hidden bg-[#FAFAFA]/95 backdrop-blur-md border-t border-[#E0E0E0] px-6 py-8 flex flex-col gap-6"
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
            href="#evaluacion"
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-5 py-3 rounded-full text-xs tracking-widest uppercase bg-[#C8FF00] text-[#050505] font-bold text-center shadow-[0_4px_16px_rgba(200,255,0,0.35)] hover:bg-white hover:text-[#111111] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-all duration-300"
            style={{ fontFamily: "'FunnelDisplay', sans-serif" }}
          >
            Evalúa tu Perfil →
          </Link>
        </motion.div>
      )}
    </motion.header>
  )
}
