'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { CONTACT } from '@/lib/constants'

const InstagramIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

function NavCol({ label, children, delay }: { label: string; children: React.ReactNode; delay: number }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} className="flex flex-col gap-2.5"
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <span className="font-funnel font-black text-[11px] uppercase tracking-[0.35em] mb-1" style={{ color: '#2A3A00' }}>
        {label}
      </span>
      {children}
    </motion.div>
  )
}

const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const brandRef  = useRef(null)
  const brandInView = useInView(brandRef, { once: true, margin: '-40px' })
  const linkClass = 'font-funnel font-semibold text-sm hover:opacity-60 hover:translate-x-1 transition-all duration-200 inline-block'

  useEffect(() => {
    const init = async () => {
      const { gsap }           = await import('gsap')
      const { ScrollTrigger }  = await import('gsap/ScrollTrigger')
      const { MorphSVGPlugin } = await import('gsap/MorphSVGPlugin')
      gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin)

      // Bordes FIJOS en y=0 — centro solo sube, nunca baja
      const center   = 'M0,0 C0,0,569,0,1139,0 C1709,0,2278,0,2278,0 V683 H0 Z'
      const up       = 'M0,0 C0,0,569,-280,1139,-280 C1709,-280,2278,0,2278,0 V683 H0 Z'
      const upMed    = 'M0,0 C0,0,569,-140,1139,-140 C1709,-140,2278,0,2278,0 V683 H0 Z'
      const upSmall  = 'M0,0 C0,0,569,-65,1139,-65 C1709,-65,2278,0,2278,0 V683 H0 Z'
      const upTiny   = 'M0,0 C0,0,569,-25,1139,-25 C1709,-25,2278,0,2278,0 V683 H0 Z'
      const upMicro  = 'M0,0 C0,0,569,-8,1139,-8 C1709,-8,2278,0,2278,0 V683 H0 Z'

      ScrollTrigger.create({
        trigger: footerRef.current,
        start: 'top bottom',
        toggleActions: 'play pause resume reverse',
        onEnter: () => {
          gsap.timeline({ overwrite: true })
            .set('#footer-bouncy-path', { morphSVG: center })
            .to('#footer-bouncy-path', { duration: 0.65, morphSVG: up,      ease: 'power2.out'   })
            .to('#footer-bouncy-path', { duration: 0.50, morphSVG: center,  ease: 'power2.inOut' })
            .to('#footer-bouncy-path', { duration: 0.42, morphSVG: upMed,   ease: 'power2.out'   })
            .to('#footer-bouncy-path', { duration: 0.38, morphSVG: center,  ease: 'power2.inOut' })
            .to('#footer-bouncy-path', { duration: 0.32, morphSVG: upSmall, ease: 'power2.out'   })
            .to('#footer-bouncy-path', { duration: 0.28, morphSVG: center,  ease: 'power2.inOut' })
            .to('#footer-bouncy-path', { duration: 0.22, morphSVG: upTiny,  ease: 'power2.out'   })
            .to('#footer-bouncy-path', { duration: 0.20, morphSVG: center,  ease: 'power2.inOut' })
            .to('#footer-bouncy-path', { duration: 0.15, morphSVG: upMicro, ease: 'power2.out'   })
            .to('#footer-bouncy-path', { duration: 0.18, morphSVG: center,  ease: 'power2.inOut' })
        },
      })
    }
    init()
  }, [])

  return (
    <footer
      id="contacto"
      ref={footerRef}
      className="relative z-10 -mt-[1px]"
      style={{ background: 'linear-gradient(to right, #FFFFFF 0%, #FFFFFF 33%, #d4ff40 66%, #C8FF00 100%)', minHeight: '50vh' }}
    >
      {/* ── SVG wave como fondo completo del footer ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2278 683"
          style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            {/* Gradiente diagonal exacto del codepen, verde neon del logo */}
            <linearGradient id="footer-grad" x1="0" y1="0" x2="2278" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0.0"  stopColor="#FFFFFF" />
              <stop offset="0.33" stopColor="#FFFFFF" />
              <stop offset="0.66" stopColor="#d4ff40" />
              <stop offset="1.0"  stopColor="#C8FF00" />
            </linearGradient>
          </defs>
          <path
            id="footer-bouncy-path"
            fill="url(#footer-grad)"
            d="M0,0 C0,0,569,0,1139,0 C1709,0,2278,0,2278,0 V683 H0 Z"
          />
        </svg>
        {/* Noise — color-dodge como el codepen */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: NOISE, backgroundSize: '200px 200px',
          mixBlendMode: 'color-dodge', opacity: 0.55,
        }} />
      </div>

      {/* ── Contenido encima del gradiente ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-10 pb-0">
        <div className="flex flex-col md:flex-row md:items-start gap-6 pb-2 border-b border-black/10">

          <motion.div ref={brandRef} className="flex flex-col gap-3 shrink-0 md:w-60"
            initial={{ opacity: 0, y: 28 }} animate={brandInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 1.3 }} className="self-start">
              <Image src="/logo.png" alt="LATAM VISA" width={640} height={180}
                className="h-20 w-auto object-contain"
                style={{ filter: 'none' }}
              />
            </motion.div>
            <p className="font-funnel font-semibold text-sm leading-relaxed max-w-[260px]" style={{ color: '#1A2A00' }}>
              Visas de turismo para Australia, USA, Japón, UK y Canadá. Visa estudiante para Australia. Atendemos toda Latinoamérica.
            </p>
          </motion.div>

          <div className="flex gap-8 md:gap-14 flex-wrap md:ml-auto items-start">
            <NavCol label="Servicios" delay={0.1}>
              <Link href="#servicios" className={linkClass} style={{ color: '#1A2A00' }}>Visa Turismo</Link>
              <Link href="#servicios" className={linkClass} style={{ color: '#1A2A00' }}>Visa Estudiante</Link>
              <Link href="#evaluacion" className={linkClass} style={{ color: '#1A2A00' }}>Evalúa tu Perfil</Link>
            </NavCol>
            <NavCol label="Proceso" delay={0.18}>
              <Link href="#proceso" className={linkClass} style={{ color: '#1A2A00' }}>Cómo Trabajamos</Link>
              <Link href="#paises" className={linkClass} style={{ color: '#1A2A00' }}>Países</Link>
              <Link href="#evaluacion" className={linkClass} style={{ color: '#1A2A00' }}>Evaluación</Link>
            </NavCol>
            <NavCol label="Contacto" delay={0.26}>
              <a href={`mailto:${CONTACT.email}`} className={linkClass} style={{ color: '#1A2A00' }}>{CONTACT.email}</a>
              <a href={`https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '')}`} className={linkClass} style={{ color: '#1A2A00' }}>{CONTACT.whatsapp}</a>
            </NavCol>

            {/* Social icons — right side */}
            <motion.div
              className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-4 md:pt-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            >
              <motion.a href="https://www.instagram.com/latamvisausa/" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram" style={{ color: '#1A2A00' }}
                className="hover:opacity-60 transition-opacity p-2 border border-[#1A2A00]/20 rounded-lg hover:border-[#1A2A00]/50 transition-all duration-200"
                whileHover={{ scale: 1.15, y: -2 }} transition={{ duration: 0.2 }}>
                <InstagramIcon />
              </motion.a>
              <motion.a href="https://www.facebook.com/profile.php?id=61563009909169" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook" style={{ color: '#1A2A00' }}
                className="hover:opacity-60 transition-opacity p-2 border border-[#1A2A00]/20 rounded-lg hover:border-[#1A2A00]/50 transition-all duration-200"
                whileHover={{ scale: 1.15, y: -2 }} transition={{ duration: 0.2 }}>
                <FacebookIcon />
              </motion.a>
            </motion.div>
          </div>
        </div>

        <div className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <span className="font-funnel font-black text-xs uppercase tracking-widest" style={{ color: '#2A3A00' }}>
            © 2026 LATAM VISA®
          </span>
          <span className="font-funnel text-xs md:text-right" style={{ color: '#2A3A00' }}>
            Asesoría profesional sujeta a decisiones migratorias. No garantizamos aprobaciones.
          </span>
        </div>
      </div>
    </footer>
  )
}
