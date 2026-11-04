'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'
import MenuOverlay from './MenuOverlay'

/* 01 — Hero cinematográfico (ref: Latam Travel Website references / IMG_4923).
   Un video horizontal (España, amanecer) como tarjeta bordeada y redondeada
   que cubre 3/4 de pantalla; el cuarto inferior deja asomar el primer panel.
   Composición minimalista: logo centrado (ancho y alto) con dos micro-textos
   pegados a los extremos — Latinoamérica (izq) · Travel (der).
   Sin emojis, solo Tailwind. */

export default function HeroViajes() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) videoRef.current?.pause()
  }, [])

  return (
    <>
      <section
        id="hero"
        aria-label="LATAM Travel — 1 viaje, 2 vacaciones"
        className="h-[75svh] w-full bg-[#0a0a0a] p-3 md:p-4"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-white/15 md:rounded-[28px]">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/viajes/panels/espana-poster.jpg"
          >
            <source src="/viajes/panels/espana.mp4" type="video/mp4" />
          </video>

          {/* Velo para legibilidad + halo radial que levanta el logo del reflejo */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/55" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_34%_at_center,rgba(0,0,0,0.62),transparent_72%)]" />

          {/* Menú (arriba derecha) */}
          <div className="absolute right-0 top-0 z-20 p-5 md:p-7">
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className="inline-flex min-h-[40px] items-center gap-2 border border-white/70 px-4 py-2 font-['PPMonumentExtended'] text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
            >
              Menú
              <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" aria-hidden>
                <circle cx="2" cy="2" r="1.6" />
                <circle cx="2" cy="8" r="1.6" />
                <circle cx="2" cy="14" r="1.6" />
              </svg>
            </button>
          </div>

          {/* Logo centrado (ancho y alto) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center px-16 sm:px-24">
            <Link href="/" aria-label="LATAM Travel — inicio" className="flex items-center">
              <Image
                src="/logo-lt-travel-white.png"
                alt="LATAM Travel"
                width={961}
                height={121}
                priority
                className="h-auto w-[40vw] max-w-[340px] object-contain md:w-[24vw]"
              />
            </Link>
          </div>

          {/* Micro-textos a los extremos, alineados con el logo */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 md:pl-8">
            <span className="font-['PPMonumentExtended'] text-[8px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
              Latinoamérica
            </span>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-3 md:pr-8">
            <span className="font-['PPMonumentExtended'] text-[8px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
              Travel
            </span>
          </div>
        </div>
      </section>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusTo={menuBtnRef} />
    </>
  )
}
