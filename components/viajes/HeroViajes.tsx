'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'

/* 01 — Hero cinematográfico (ref: Latam Travel Website references / IMG_4923).
   Video horizontal (España, amanecer) como tarjeta bordeada y redondeada que
   cubre 3/4 de pantalla; el cuarto inferior deja asomar el primer panel.
   Barra superior: Promociones (izq) · "la vida es una sola" (centro) · Destinos
   (der). Logo pequeño centrado con dos micro-textos a los extremos:
   Latinoamérica (izq) · Travel (der). Sin emojis, solo Tailwind. */

export default function HeroViajes() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) videoRef.current?.pause()
  }, [])

  const irA = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      aria-label="LATAM Travel — la vida es una sola"
      className="h-[75svh] w-full bg-[#0a0a0a] p-4 md:p-6"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[22px] border-[1.5px] border-white/30 md:rounded-[30px]">
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

        {/* Velo para legibilidad de los textos (el logo es un badge blanco y se lee solo) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/55" />

        {/* Barra superior: Promociones · la vida es una sola · Destinos */}
        <nav
          aria-label="Navegación"
          className="absolute inset-x-0 top-0 z-20 grid grid-cols-3 items-center p-5 md:p-7"
        >
          <a
            href="#cotiza"
            onClick={irA('cotiza')}
            className="justify-self-start font-['PPMonumentExtended'] text-[8px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[10px] sm:tracking-[0.25em] md:text-xs"
          >
            Promociones
          </a>
          <span className="justify-self-center text-center font-['PPMonumentExtended'] text-[8px] font-light uppercase tracking-[0.2em] text-white/90 sm:text-[10px] sm:tracking-[0.3em] md:text-xs">
            La vida es una sola
          </span>
          <a
            href="#destinos"
            onClick={irA('destinos')}
            className="justify-self-end font-['PPMonumentExtended'] text-[8px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[10px] sm:tracking-[0.25em] md:text-xs"
          >
            Destinos
          </a>
        </nav>

        {/* Logo pequeño centrado (ancho y alto) */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-16 sm:px-24">
          <Link href="/" aria-label="LATAM Travel — inicio" className="flex items-center">
            <Image
              src="/logo-lt-travel-white.png"
              alt="LATAM Travel"
              width={961}
              height={121}
              priority
              className="h-4 w-auto object-contain md:h-5"
            />
          </Link>
        </div>

        {/* Micro-textos a los extremos, alineados con el logo */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-5 md:pl-14">
          <span className="font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
            Latinoamérica
          </span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-5 md:pr-14">
          <span className="font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
            Travel
          </span>
        </div>
      </div>
    </section>
  )
}
