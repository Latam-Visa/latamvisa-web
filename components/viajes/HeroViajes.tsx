'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'
import MenuOverlay from './MenuOverlay'

/* 01 — Hero con video de fondo (estilo editorial "Travel Sensations"):
   video en bucle silenciado a pantalla completa, un velo sutil para
   legibilidad, y el contenido centrado y compacto: eyebrow + título serif
   "EUROPA" + subtítulo + CTA azul cielo que baja al cotizador. */

export default function HeroViajes() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Respeta reduced-motion: deja el poster quieto en vez del bucle. Se decide
  // tras el montaje (nunca en SSR) para no cambiar el árbol entre server y
  // cliente.
  useEffect(() => {
    if (prefersReducedMotion()) videoRef.current?.pause()
  }, [])

  const bajarACotizar = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('cotiza')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section
        id="hero"
        aria-label="EUROPA — 1 viaje, 2 vacaciones"
        className="viajes-hero-video"
      >
        <video
          ref={videoRef}
          className="viajes-hero-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/viajes/amanecer-barcelona-poster.jpg"
        >
          <source src="/viajes/amanecer-barcelona.mp4" type="video/mp4" />
        </video>

        <div aria-hidden className="viajes-hero-scrim" />

        {/* ARRIBA IZQUIERDA — logo */}
        <Link
          href="/"
          aria-label="LATAM Travel — inicio"
          className="absolute left-0 top-0 z-20 flex items-center"
          style={{ padding: 'clamp(24px, 3vw, 44px)' }}
        >
          <Image
            src="/logo-lt-travel-white.png"
            alt="LATAM Travel"
            width={961}
            height={121}
            priority
            className="h-3 w-auto object-contain md:h-[17px]"
          />
        </Link>

        {/* ARRIBA DERECHA — menú (píldora) */}
        <div className="absolute right-0 top-0 z-20 flex items-center" style={{ padding: 'clamp(20px, 3vw, 40px)' }}>
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="viajes-menu-pill"
          >
            Menú
            <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" aria-hidden>
              <circle cx="2" cy="2" r="1.6" />
              <circle cx="2" cy="8" r="1.6" />
              <circle cx="2" cy="14" r="1.6" />
            </svg>
          </button>
        </div>

        {/* CENTRO — eyebrow + título serif + subtítulo + CTA */}
        <div className="viajes-hero-center">
          <p className="viajes-hero-eyebrow">1 viaje, 2 vacaciones</p>
          <h1 className="viajes-hero-serif-title">Europa</h1>
          <p className="viajes-hero-sub">
            Vuela de Australia a Latinoamérica y conoce Europa en el camino. Un país a la ida y otro a la vuelta.
          </p>
          <a
            href="#cotiza"
            onClick={bajarACotizar}
            className="viajes-cta viajes-cta-sky"
            style={{ marginTop: '2rem' }}
          >
            Cotiza tu viaje
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* ABAJO DERECHA — coordenadas del lugar del video */}
        <div className="viajes-coords">
          <span>41.3888, 2.1590</span>
          <br />
          <span className="viajes-coords-place">Amanecer · Barcelona</span>
        </div>
      </section>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusTo={menuBtnRef} />
    </>
  )
}
