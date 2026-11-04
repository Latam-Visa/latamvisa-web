'use client'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/lenis'

/* 02 — Paneles de ciudades, apilados y cinematográficos (ref: IMG_4923).
   Cada ciudad es un video horizontal a pantalla, con su nombre grande, una
   línea poética y marcas de esquina tipo editorial. Los videos se reproducen
   solo cuando entran en viewport (IntersectionObserver) para no cargar los
   cuatro a la vez. Sin emojis, solo Tailwind. */

const CIUDADES = [
  {
    ciudad: 'Barcelona',
    pais: 'España',
    indice: '01',
    linea: 'donde el viaje empieza a sentirse',
    esquina: 'Gaudí · Mediterráneo',
    src: '/viajes/panels/barcelona.mp4',
    poster: '/viajes/panels/barcelona-poster.jpg',
  },
  {
    ciudad: 'París',
    pais: 'Francia',
    indice: '02',
    linea: 'una escala que vale un viaje',
    esquina: 'Sena · Luz',
    src: '/viajes/panels/paris.mp4',
    poster: '/viajes/panels/paris-poster.jpg',
  },
  {
    ciudad: 'Niza',
    pais: 'Côte d’Azur',
    indice: '03',
    linea: 'el Mediterráneo antes de volver a casa',
    esquina: 'Riviera · Atardecer',
    src: '/viajes/panels/niza.mp4',
    poster: '/viajes/panels/niza-poster.jpg',
  },
]

export default function PanelesCiudades() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const quieto = prefersReducedMotion()
    const videos = Array.from(rootRef.current?.querySelectorAll('video') ?? [])

    if (quieto) {
      videos.forEach((v) => v.removeAttribute('data-src'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            const lazy = v.getAttribute('data-src')
            if (lazy && !v.src) {
              v.src = lazy
              v.load()
            }
            v.play().catch(() => {})
          } else {
            v.pause()
          }
        })
      },
      { threshold: 0.35 },
    )

    videos.forEach((v) => io.observe(v))
    return () => io.disconnect()
  }, [])

  return (
    <div ref={rootRef} className="space-y-3 bg-[#0a0a0a] px-3 pb-3 md:space-y-4 md:px-4 md:pb-4">
      {CIUDADES.map((c) => (
        <section
          key={c.ciudad}
          aria-label={`${c.ciudad}, ${c.pais}`}
          className="relative h-[82svh] w-full overflow-hidden rounded-[20px] border border-white/15 md:h-[88svh] md:rounded-[28px]"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="none"
            poster={c.poster}
            data-src={c.src}
            aria-hidden
          />

          {/* Velo para legibilidad del texto */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/65" />

          {/* Índice + país (arriba) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6 md:p-10">
            <span className="font-['PPMonumentExtended'] text-[11px] font-light uppercase tracking-[0.3em] text-white/70 sm:text-xs">
              {c.indice} / 03
            </span>
            <span className="font-['PPMonumentExtended'] text-[11px] font-light uppercase tracking-[0.3em] text-white/70 sm:text-xs">
              {c.pais}
            </span>
          </div>

          {/* Nombre de ciudad + línea (centro-abajo) */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 md:p-12">
            <h2 className="font-['PPMonumentExtended'] font-black uppercase leading-[0.9] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.5)] text-[16vw] sm:text-[12vw] lg:text-[8vw]">
              {c.ciudad}
            </h2>
            <p className="max-w-[28ch] font-['PPMonumentExtended'] text-xs font-light uppercase tracking-[0.2em] text-white/80 sm:text-sm">
              {c.linea}
            </p>
            <span className="mt-1 inline-flex items-center gap-2 font-['PPMonumentExtended'] text-[10px] font-light uppercase tracking-[0.3em] text-white/75 sm:text-xs">
              <span className="inline-block h-1.5 w-1.5 bg-[#C8FF00]" aria-hidden />
              {c.esquina}
            </span>
          </div>
        </section>
      ))}
    </div>
  )
}
