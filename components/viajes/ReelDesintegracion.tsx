'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'

/* 01 — Reel de videos (/viajes). Paneles HORIZONTALES apilados (España →
   Barcelona → París → Niza): se ven DOS por pantalla (mitad y mitad) con borde
   y gap, como la referencia IMG_4923. Transición fluida: parallax cinematográfico
   — el video se desplaza despacio dentro de su marco al hacer scroll, dando
   profundidad y un paso suave de un video al siguiente. Bajo prefers-reduced-
   motion quedan quietos y apilados. Sin emojis, solo Tailwind + .reel-*. */

type Panel = {
  src: string
  poster: string
  ciudad: string
  pais?: string
  indice?: string
  linea?: string
  esquina?: string
  hero?: boolean
}

const PANELES: Panel[] = [
  { src: '/viajes/panels/espana.mp4', poster: '/viajes/panels/espana-poster.jpg', ciudad: 'España', hero: true },
  { src: '/viajes/panels/barcelona.mp4', poster: '/viajes/panels/barcelona-poster.jpg', ciudad: 'Barcelona', pais: 'España', indice: '01', linea: 'donde el viaje empieza a sentirse', esquina: 'Gaudí · Mediterráneo' },
  { src: '/viajes/panels/paris.mp4', poster: '/viajes/panels/paris-poster.jpg', ciudad: 'París', pais: 'Francia', indice: '02', linea: 'una escala que vale un viaje', esquina: 'Sena · Luz' },
  { src: '/viajes/panels/niza.mp4', poster: '/viajes/panels/niza-poster.jpg', ciudad: 'Niza', pais: 'Côte d’Azur', indice: '03', linea: 'el Mediterráneo antes de volver a casa', esquina: 'Riviera · Atardecer' },
]

export default function ReelDesintegracion() {
  const reelRef = useRef<HTMLElement>(null)

  const irA = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const reel = reelRef.current
    if (!reel) return

    if (prefersReducedMotion()) {
      reel.querySelectorAll('video').forEach((v) => v.pause())
      return
    }

    let cancelled = false
    let gsapCtx: { revert: () => void } | null = null
    let io: IntersectionObserver | null = null

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      const cards = Array.from(reel.querySelectorAll<HTMLElement>('.reel-card'))
      if (!cards.length) return
      const videos = cards.map((c) => c.querySelector<HTMLVideoElement>('video')!)

      // Reproducir solo los videos visibles
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const v = e.target as HTMLVideoElement
            if (e.isIntersecting) v.play().catch(() => {})
            else v.pause()
          })
        },
        { threshold: 0.1 },
      )
      videos.forEach((v) => io!.observe(v))

      // Parallax: cada video se desplaza suave dentro de su marco con el scroll
      gsapCtx = gsap.context(() => {
        cards.forEach((card, i) => {
          gsap.fromTo(
            videos[i],
            { yPercent: 8 },
            {
              yPercent: -8,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        })
      }, reel)

      ScrollTrigger.refresh()
    }

    run()

    return () => {
      cancelled = true
      io?.disconnect()
      gsapCtx?.revert()
    }
  }, [])

  return (
    <section
      id="hero"
      ref={reelRef}
      aria-label="LATAM Travel — la vida es una sola"
      className="reel-root"
    >
      <div className="reel-stage">
        {PANELES.map((v) => (
          <article key={v.ciudad} className="reel-card">
            <div className="reel-visual">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={v.poster}
                aria-hidden
              >
                <source src={v.src} type="video/mp4" />
              </video>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/55" />

              {v.hero ? (
                <>
                  {/* Barra superior */}
                  <nav
                    aria-label="Navegación"
                    className="pointer-events-auto absolute inset-x-0 top-0 grid grid-cols-3 items-center p-5 md:p-7"
                  >
                    <a
                      href="#cotiza"
                      onClick={irA('cotiza')}
                      className="justify-self-start font-[family-name:var(--font-viajes-geo)] text-[7px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[8px] sm:tracking-[0.25em] md:text-[10px]"
                    >
                      Promociones
                    </a>
                    <Link href="/" aria-label="LATAM Travel — inicio" className="flex items-center justify-self-center">
                      <Image
                        src="/logo-lt-travel-white.png"
                        alt="LATAM Travel"
                        width={961}
                        height={121}
                        priority
                        className="h-3.5 w-auto object-contain md:h-[18px]"
                      />
                    </Link>
                    <a
                      href="#destinos"
                      onClick={irA('destinos')}
                      className="justify-self-end font-[family-name:var(--font-viajes-geo)] text-[7px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[8px] sm:tracking-[0.25em] md:text-[10px]"
                    >
                      Destinos
                    </a>
                  </nav>

                  {/* Velo radial para que el titular amarillo contraste */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_62%_at_center,rgba(0,0,0,0.5),transparent_76%)]" />

                  {/* Titular mixto (serif + script + sans) en amarillo cálido */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-6 text-center text-[#EBD48A] [text-shadow:0_2px_22px_rgba(0,0,0,0.6)]">
                    <span className="font-[family-name:var(--font-viajes-serif)] italic leading-none tracking-wide text-[clamp(15px,2.3vw,28px)]">
                      un viaje,
                    </span>
                    <span className="font-[family-name:var(--font-viajes-script)] leading-[0.95] text-[clamp(40px,7.6vw,96px)]">
                      dos vacaciones
                    </span>
                    <span className="mt-1 font-[family-name:var(--font-viajes-geo)] font-bold uppercase leading-none tracking-[0.04em] text-[clamp(17px,3vw,40px)]">
                      un solo vuelo
                    </span>
                  </div>

                  {/* Micro-textos a los extremos */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center pl-5 sm:flex md:pl-14">
                    <span className="font-[family-name:var(--font-viajes-geo)] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
                      Latinoamérica
                    </span>
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-5 sm:flex md:pr-14">
                    <span className="font-[family-name:var(--font-viajes-geo)] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
                      Travel
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Índice + país */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-8">
                    <span className="font-[family-name:var(--font-viajes-geo)] text-[10px] font-light uppercase tracking-[0.3em] text-white/70 sm:text-[11px]">
                      {v.indice} / 03
                    </span>
                    <span className="font-[family-name:var(--font-viajes-geo)] text-[10px] font-light uppercase tracking-[0.3em] text-white/70 sm:text-[11px]">
                      {v.pais}
                    </span>
                  </div>

                  {/* Nombre + línea */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 md:p-10">
                    <h2 className="font-[family-name:var(--font-viajes-geo)] font-black uppercase leading-[0.9] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.5)] text-[12vw] sm:text-[10vw] lg:text-[6.5vw]">
                      {v.ciudad}
                    </h2>
                    <p className="max-w-[28ch] font-[family-name:var(--font-viajes-geo)] text-[11px] font-light uppercase tracking-[0.2em] text-white/80 sm:text-sm">
                      {v.linea}
                    </p>
                    <span className="mt-0.5 inline-flex items-center gap-2 font-[family-name:var(--font-viajes-geo)] text-[9px] font-light uppercase tracking-[0.3em] text-white/75 sm:text-[11px]">
                      <span className="inline-block h-1.5 w-1.5 bg-[#C8FF00]" aria-hidden />
                      {v.esquina}
                    </span>
                  </div>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
