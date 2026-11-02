'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'
import MenuOverlay from './MenuOverlay'

/* 01 — Hero cinematográfico, oscuro, estilo editorial (ref: Latam Travel
   Website references). Tres columnas verticales de video (Barcelona · París ·
   Niza), un velo oscuro controlado para legibilidad, y el título LATAM TRAVEL
   en PP Monument Extended cruzando por encima. Sin emojis, solo Tailwind. */

const COLUMNAS = [
  { src: '/viajes/hero/sagrada-barcelona.mp4', poster: '/viajes/hero/sagrada-barcelona-poster.jpg', ciudad: 'Barcelona' },
  { src: '/viajes/hero/eiffel-paris.mp4', poster: '/viajes/hero/eiffel-paris-poster.jpg', ciudad: 'París' },
  { src: '/viajes/hero/atardecer-niza.mp4', poster: '/viajes/hero/atardecer-niza-poster.jpg', ciudad: 'Niza' },
]

export default function HeroViajes() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Respeta reduced-motion: deja los posters quietos en vez del bucle.
  useEffect(() => {
    if (!prefersReducedMotion()) return
    sectionRef.current?.querySelectorAll('video').forEach((v) => v.pause())
  }, [])

  const bajarACotizar = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('cotiza')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="hero"
        aria-label="LATAM Travel — 1 viaje, 2 vacaciones"
        className="relative h-[100svh] w-full overflow-hidden bg-[#0a0a0a]"
      >
        {/* Tres columnas de video */}
        <div className="absolute inset-0 flex">
          {COLUMNAS.map((col) => (
            <div
              key={col.ciudad}
              className="relative flex-1 overflow-hidden border-l border-white/10 first:border-l-0"
            >
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={col.poster}
              >
                <source src={col.src} type="video/mp4" />
              </video>
              {/* base oscura para la etiqueta de ciudad */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="absolute inset-x-0 bottom-6 text-center font-['PPMonumentExtended'] text-[10px] font-light uppercase tracking-[0.3em] text-white/85 sm:text-xs">
                {col.ciudad}
              </span>
            </div>
          ))}
        </div>

        {/* Velo global para que el título se lea sobre cualquier fotograma */}
        <div className="pointer-events-none absolute inset-0 bg-black/40" />

        {/* Barra superior: logo + menú */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-6 md:p-10">
          <Link href="/" aria-label="LATAM Travel — inicio" className="flex items-center">
            <Image
              src="/logo-lt-travel-white.png"
              alt="LATAM Travel"
              width={961}
              height={121}
              priority
              className="h-3 w-auto object-contain md:h-[17px]"
            />
          </Link>

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

        {/* Centro: eyebrow + título + CTA */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <p className="font-['PPMonumentExtended'] text-[10px] font-light uppercase tracking-[0.4em] text-white/80 sm:text-xs">
            Europa — Sudamérica · 2026
          </p>

          <h1 className="mt-5 font-['PPMonumentExtended'] font-black uppercase leading-[0.92] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.5)]">
            <span className="block text-[15vw] sm:text-[11vw] lg:text-[8.5vw]">Latam</span>
            <span className="block text-[15vw] sm:text-[11vw] lg:text-[8.5vw]">Travel</span>
          </h1>

          <p className="mt-6 font-['PPMonumentExtended'] text-xs font-light uppercase tracking-[0.25em] text-white/85 sm:text-sm">
            1 viaje, 2 vacaciones
          </p>

          <a
            href="#cotiza"
            onClick={bajarACotizar}
            className="pointer-events-auto mt-8 inline-flex min-h-[48px] items-center gap-2 bg-[#C8FF00] px-7 font-['PPMonumentExtended'] text-[11px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a] transition-transform hover:-translate-y-0.5"
          >
            Cotiza tu viaje
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusTo={menuBtnRef} />
    </>
  )
}
