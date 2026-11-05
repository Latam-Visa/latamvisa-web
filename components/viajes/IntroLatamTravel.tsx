'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { prefersReducedMotion, stopLenis, startLenis } from '@/lib/lenis'

/* Intro de /viajes (loader estilo Osmo "Willem"): el wordmark LATAM | TRAVEL
   se parte, una caja con las imágenes de los destinos crece DESDE EL CENTRO
   hasta llenar la pantalla, y el logo de LATAM Travel aparece del centro.
   Luego se desvanece y revela el hero (ReelDesintegracion) debajo.

   - Se muestra UNA VEZ por sesión (sessionStorage) para no repetirlo en cada
     navegación; borra la clave para volver a verlo.
   - Bajo prefers-reduced-motion no se monta: la página carga directa al hero.
   - Estructura en .intro-* (app/globals.css); GSAP anima width/height/opacity. */

const START = 'LATAM'
const END = 'TRAVEL'

// Base = España (queda al final); las "extra" ciclan y se desvanecen encima.
const IMG_BASE = '/viajes/panels/espana-poster.jpg'
const IMG_EXTRA = [
  '/viajes/panels/barcelona-poster.jpg',
  '/viajes/panels/paris-poster.jpg',
  '/viajes/panels/niza-poster.jpg',
]

export default function IntroLatamTravel() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [montado, setMontado] = useState(true)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let yaVisto = false
    try {
      yaVisto = sessionStorage.getItem('viajes-intro') === '1'
    } catch {}
    if (yaVisto || prefersReducedMotion()) {
      setMontado(false)
      return
    }

    window.scrollTo(0, 0)
    document.body.style.overflow = 'hidden'
    stopLenis()

    let cancelled = false
    let ctx: { revert: () => void } | null = null

    const finish = () => {
      try {
        sessionStorage.setItem('viajes-intro', '1')
      } catch {}
      document.body.style.overflow = ''
      startLenis()
      setMontado(false)
    }

    ;(async () => {
      const { gsap } = await import('gsap')
      if (cancelled) return
      ctx = gsap.context(() => {
        const q = gsap.utils.selector(root)
        const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' }, onComplete: finish })

        // Las letras suben a su lugar
        tl.from(q('.intro-letter'), { yPercent: 100, stagger: 0.02, duration: 1.0 })
          // La caja se abre entre las palabras
          .fromTo(q('.intro-box'), { width: '0em' }, { width: '1em', duration: 1.0 }, '<0.8')
          // Ciclo de imágenes de destino (Barcelona → París → Niza → España)
          .fromTo(
            q('.intro-cover-extra'),
            { opacity: 1 },
            { opacity: 0, duration: 0.05, ease: 'none', stagger: 0.45 },
            '-=0.1',
          )
          // La caja crece DESDE EL CENTRO hasta llenar la pantalla (sobre-cubre
          // un poco para que no asome borde ni los restos de las letras)
          .to(q('.intro-box'), { width: '106vw', height: '106dvh', duration: 1.6 }, '<0.7')
          // El logo aparece del centro cuando la imagen ya casi llenó
          .fromTo(
            q('.intro-logo img'),
            { opacity: 0, scale: 0.72 },
            { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' },
            '>-0.55',
          )
          // Beat de pantalla llena + logo
          .to({}, { duration: 0.7 })
          // Revela el hero
          .to(root, { opacity: 0, duration: 0.8, ease: 'power2.inOut' })
      }, root)
    })()

    return () => {
      cancelled = true
      ctx?.revert()
      document.body.style.overflow = ''
      startLenis()
    }
  }, [])

  if (!montado) return null

  return (
    <div ref={rootRef} className="intro-root" aria-hidden>
      <div className="intro-h1 font-['PPMonumentExtended']">
        <div className="intro-start">
          {START.split('').map((c, i) => (
            <span key={`s${i}`} className="intro-letter">
              {c}
            </span>
          ))}
        </div>

        <div className="intro-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="intro-cover-extra is--1" src={IMG_EXTRA[0]} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="intro-cover-extra is--2" src={IMG_EXTRA[1]} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="intro-cover-extra is--3" src={IMG_EXTRA[2]} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="intro-cover" src={IMG_BASE} alt="" />
        </div>

        <div className="intro-end">
          {END.split('').map((c, i) => (
            <span key={`e${i}`} className="intro-letter">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="intro-logo">
        <Image
          src="/logo-lt-travel-white.png"
          alt="LATAM Travel"
          width={961}
          height={121}
          priority
          className="h-6 w-auto object-contain md:h-10"
        />
      </div>
    </div>
  )
}
