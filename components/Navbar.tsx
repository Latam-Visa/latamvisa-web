'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Países', href: '#paises' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [overLight, setOverLight] = useState(true) // true = white text (dark/sky bg), false = dark text (light bg)

  useEffect(() => {
    // #servicios is the first opaque section — once it enters the viewport we leave the sky zone
    // #contacto is the footer which shows the clouds background again
    let serviciosAbove = false // true once servicios has scrolled above the viewport top

    const updateColor = () => {
      const vh = window.innerHeight
      const scrollY = window.scrollY

      const overHero = scrollY < vh * 0.5

      const serviciosEl = document.getElementById('servicios')
      const contactoEl  = document.getElementById('contacto')

      // Servicios is above the viewport (we've scrolled past it)
      if (serviciosEl) {
        serviciosAbove = serviciosEl.getBoundingClientRect().bottom < 0
      }

      // Are we in the footer (clouds) zone?
      const overFooter = contactoEl
        ? contactoEl.getBoundingClientRect().top < vh
        : false

      // Sky/clouds visible: over hero, or between hero and servicios
      const inSkyZone = overHero ||
        (!serviciosAbove && !overHero && (!serviciosEl || serviciosEl.getBoundingClientRect().top > vh))

      setOverLight(inSkyZone)
    }

    window.addEventListener('scroll', updateColor, { passive: true })
    updateColor()
    return () => window.removeEventListener('scroll', updateColor)
  }, [])

  const textClass = overLight
    ? 'text-white/90 hover:text-white'
    : 'text-[#111111]/90 hover:text-[#111111]'

  const barColor = overLight ? 'bg-white' : 'bg-[#111111]'

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 pointer-events-auto"
      style={{}}
    >
      <div className="w-full py-5 relative flex items-center justify-between px-6 md:px-[100px]">
        {/* CENTER: Logo absolutely centered */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <Image
            src="/logo.png"
            alt="LATAM VISA"
            width={200}
            height={56}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* LEFT: Nav Links */}
        <div className="flex items-center gap-10">
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
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
            style={{ fontFamily: "'PPMonumentExtended', sans-serif", fontSize: '10px', fontWeight: 700 }}
          >
            +61 426 779 734
          </a>
          <a
            href="mailto:future@latamvisas.com.au"
            className={`transition-colors duration-500 ${textClass}`}
            style={{ fontFamily: '"PPMonumentExtended", sans-serif', fontSize: '8px', fontWeight: 700 }}
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-xs tracking-widest uppercase text-[#111111]/50 hover:text-[#111111] transition-colors"
              style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-4 border-t border-[#E0E0E0] flex flex-col gap-3">
            <a href="tel:+61426779734" className="text-xs text-[#111111]/50" style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}>
              +61 426 779 734
            </a>
            <a href="mailto:future@latamvisas.com.au" className="text-xs text-[#111111]/50" style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}>
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
