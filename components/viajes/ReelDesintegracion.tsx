'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'

/* 01 — Reel de desintegración (/viajes). Paneles de video HORIZONTALES
   apilados (España → Barcelona → París → Niza), proporción a lo ancho y 80svh
   de alto (se ven ~2 por pantalla, ref IMG_4923). Al hacer scroll, cada panel
   se DESINTEGRA en partículas mientras sale por arriba y el siguiente sube
   (algoritmo del demo de Sikriti Dakua, capturando el póster con el mismo
   recorte cover). Bajo prefers-reduced-motion quedan apilados sin efecto.
   Sin emojis, solo Tailwind + .reel-*. */

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
    const createdShards: HTMLCanvasElement[] = []

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      const cards = Array.from(reel.querySelectorAll<HTMLElement>('.reel-card'))
      const N = cards.length
      if (!N) return
      const visuals = cards.map((c) => c.querySelector<HTMLElement>('.reel-visual')!)
      const shardLayers = cards.map((c) => c.querySelector<HTMLElement>('.reel-shards')!)
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
        { threshold: 0.15 },
      )
      videos.forEach((v) => io!.observe(v))

      const small = window.innerWidth < 700
      const COUNT = small ? 30 : 44
      const CAPW = small ? 320 : 460

      const buildFor = async (idx: number): Promise<HTMLCanvasElement[]> => {
        const poster = videos[idx].getAttribute('poster') || ''
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.src = poster
        await img.decode().catch(() => {})
        if (cancelled) return []
        const rect = visuals[idx].getBoundingClientRect()
        const aspect = rect.width && rect.height ? rect.width / rect.height : 16 / 9
        const W = CAPW
        const H = Math.max(1, Math.round(CAPW / aspect))
        const base = document.createElement('canvas')
        base.width = W
        base.height = H
        const bctx = base.getContext('2d')!
        // recorte "cover" idéntico al object-fit: cover del video
        const iw = img.naturalWidth || W
        const ih = img.naturalHeight || H
        const scale = Math.max(W / iw, H / ih)
        const dw = iw * scale
        const dh = ih * scale
        bctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
        const imageData = bctx.getImageData(0, 0, W, H)

        const buffers: ImageData[] = []
        for (let i = 0; i < COUNT; i++) buffers.push(bctx.createImageData(W, H))

        const REPEAT = 2
        for (let x = 0; x < W; x++) {
          for (let y = 0; y < H; y++) {
            for (let l = 0; l < REPEAT; l++) {
              const index = (x + y * W) * 4
              let di = Math.floor((COUNT * (Math.random() + (2 * x) / W)) / 3)
              if (di > COUNT - 1) di = COUNT - 1
              const d = buffers[di].data
              d[index] = imageData.data[index]
              d[index + 1] = imageData.data[index + 1]
              d[index + 2] = imageData.data[index + 2]
              d[index + 3] = imageData.data[index + 3]
            }
          }
        }

        const list: HTMLCanvasElement[] = []
        buffers.forEach((buf) => {
          const c = document.createElement('canvas')
          c.width = W
          c.height = H
          c.getContext('2d')!.putImageData(buf, 0, 0)
          c.className = 'reel-shard'
          shardLayers[idx].appendChild(c)
          createdShards.push(c)
          list.push(c)
        })
        return list
      }

      const shardLists: HTMLCanvasElement[][] = []
      for (let k = 0; k < N - 1; k++) {
        shardLists[k] = await buildFor(k)
        if (cancelled) return
      }

      gsap.set(shardLayers, { autoAlpha: 0 })
      gsap.set(visuals, { autoAlpha: 1 })

      gsapCtx = gsap.context(() => {
        for (let k = 0; k < N - 1; k++) {
          const list = shardLists[k] || []
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: cards[k],
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          })
          // ver el video un momento antes de que empiece a desintegrarse
          tl.to({}, { duration: 0.28 })
          tl.set(visuals[k], { autoAlpha: 0 })
          tl.set(shardLayers[k], { autoAlpha: 1 })
          list.forEach((shard, i) => {
            const angle = (Math.random() - 0.5) * 2 * Math.PI
            const rot = 30 * (Math.random() - 0.5)
            tl.to(
              shard,
              {
                duration: 0.72,
                rotation: rot,
                x: 90 * Math.sin(angle),
                y: 90 * Math.cos(angle),
                autoAlpha: 0,
                ease: 'power2.out',
              },
              0.28 + (i / Math.max(list.length, 1)) * 0.5,
            )
          })
        }
      }, reel)

      ScrollTrigger.refresh()
    }

    run()

    return () => {
      cancelled = true
      io?.disconnect()
      gsapCtx?.revert()
      createdShards.forEach((c) => c.remove())
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
                      className="justify-self-start font-['PPMonumentExtended'] text-[7px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[8px] sm:tracking-[0.25em] md:text-[10px]"
                    >
                      Promociones
                    </a>
                    <span className="justify-self-center text-center font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.2em] text-white/90 sm:text-[8px] sm:tracking-[0.3em] md:text-[10px]">
                      La vida es una sola
                    </span>
                    <a
                      href="#destinos"
                      onClick={irA('destinos')}
                      className="justify-self-end font-['PPMonumentExtended'] text-[7px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[8px] sm:tracking-[0.25em] md:text-[10px]"
                    >
                      Destinos
                    </a>
                  </nav>

                  {/* Logo centrado */}
                  <div className="pointer-events-auto absolute inset-0 flex items-center justify-center px-16 sm:px-24">
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

                  {/* Frase emocional */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
                    <p className="max-w-[32ch] translate-y-10 text-center font-['PPMonumentExtended'] text-[10px] font-light leading-relaxed tracking-[0.04em] text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.55)] sm:max-w-[44ch] sm:translate-y-12 sm:text-[12px] md:translate-y-14 md:text-sm">
                      Prefiero llegar a viejo lleno de historias que contar, no solo de plata.
                    </p>
                  </div>

                  {/* Micro-textos a los extremos */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 md:pl-14">
                    <span className="font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
                      Latinoamérica
                    </span>
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 md:pr-14">
                    <span className="font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
                      Travel
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Índice + país */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6 md:p-10">
                    <span className="font-['PPMonumentExtended'] text-[11px] font-light uppercase tracking-[0.3em] text-white/70 sm:text-xs">
                      {v.indice} / 03
                    </span>
                    <span className="font-['PPMonumentExtended'] text-[11px] font-light uppercase tracking-[0.3em] text-white/70 sm:text-xs">
                      {v.pais}
                    </span>
                  </div>

                  {/* Nombre + línea */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 md:p-12">
                    <h2 className="font-['PPMonumentExtended'] font-black uppercase leading-[0.9] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.5)] text-[14vw] sm:text-[11vw] lg:text-[7.5vw]">
                      {v.ciudad}
                    </h2>
                    <p className="max-w-[28ch] font-['PPMonumentExtended'] text-xs font-light uppercase tracking-[0.2em] text-white/80 sm:text-sm">
                      {v.linea}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-2 font-['PPMonumentExtended'] text-[10px] font-light uppercase tracking-[0.3em] text-white/75 sm:text-xs">
                      <span className="inline-block h-1.5 w-1.5 bg-[#C8FF00]" aria-hidden />
                      {v.esquina}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="reel-shards" aria-hidden />
          </article>
        ))}
      </div>
    </section>
  )
}
