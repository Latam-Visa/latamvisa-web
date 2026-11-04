'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion } from '@/lib/lenis'

/* 01 — Reel de desintegración (/viajes). Cuatro videos en tarjetas 4:5
   (España → Barcelona → París → Niza). Al hacer scroll, cada tarjeta se
   DESINTEGRA en partículas (algoritmo del demo de Sikriti Dakua, capturando el
   póster con el mismo recorte "cover" del video) revelando la siguiente.
   El efecto se construye en el cliente; bajo prefers-reduced-motion las
   tarjetas quedan apiladas y scrolleables. Sin emojis, solo Tailwind + .reel-*. */

type Video = {
  src: string
  poster: string
  ciudad: string
  pais?: string
  indice?: string
  linea?: string
  esquina?: string
  hero?: boolean
}

const VIDEOS: Video[] = [
  { src: '/viajes/panels/espana.mp4', poster: '/viajes/panels/espana-poster.jpg', ciudad: 'España', hero: true },
  { src: '/viajes/panels/barcelona.mp4', poster: '/viajes/panels/barcelona-poster.jpg', ciudad: 'Barcelona', pais: 'España', indice: '01', linea: 'donde el viaje empieza a sentirse', esquina: 'Gaudí · Mediterráneo' },
  { src: '/viajes/panels/paris.mp4', poster: '/viajes/panels/paris-poster.jpg', ciudad: 'París', pais: 'Francia', indice: '02', linea: 'una escala que vale un viaje', esquina: 'Sena · Luz' },
  { src: '/viajes/panels/niza.mp4', poster: '/viajes/panels/niza-poster.jpg', ciudad: 'Niza', pais: 'Côte d’Azur', indice: '03', linea: 'el Mediterráneo antes de volver a casa', esquina: 'Riviera · Atardecer' },
]

export default function ReelDesintegracion() {
  const reelRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const irA = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const reel = reelRef.current
    const stage = stageRef.current
    if (!reel || !stage) return

    if (prefersReducedMotion()) {
      reel.querySelectorAll('video').forEach((v) => v.pause())
      return
    }

    let cancelled = false
    let gsapCtx: { revert: () => void } | null = null
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

      cards.forEach((c, i) => { c.style.zIndex = String(N - i) })
      reel.setAttribute('data-active', 'true')

      const small = window.innerWidth < 700
      const COUNT = small ? 28 : 40
      const CAPW = small ? 220 : 300

      const buildFor = async (idx: number): Promise<HTMLCanvasElement[]> => {
        const poster = videos[idx].getAttribute('poster') || ''
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.src = poster
        await img.decode().catch(() => {})
        if (cancelled) return []
        const W = CAPW
        const H = Math.round((CAPW * 5) / 4)
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

      const playRange = (k: number) => {
        videos.forEach((v, i) => {
          if (i === k || i === k + 1) v.play().catch(() => {})
          else v.pause()
        })
      }
      playRange(0)

      gsapCtx = gsap.context(() => {
        const scrollLen = (N - 1) * window.innerHeight * 1.25
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: reel,
            start: 'top top',
            end: `+=${scrollLen}`,
            scrub: 1,
            pin: stage,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        for (let k = 0; k < N - 1; k++) {
          const hold = `t${k}`
          tl.addLabel(hold)
          tl.call(() => playRange(k), [], hold)
          tl.to({}, { duration: 1 }) // mantener la tarjeta visible

          const br = `b${k}`
          tl.addLabel(br)
          tl.set(visuals[k], { autoAlpha: 0 }, br)
          tl.set(shardLayers[k], { autoAlpha: 1 }, br)

          const list = shardLists[k] || []
          list.forEach((shard, i) => {
            const angle = (Math.random() - 0.5) * 2 * Math.PI
            const rot = 30 * (Math.random() - 0.5)
            tl.to(
              shard,
              {
                duration: 1.4,
                rotation: rot,
                x: 90 * Math.sin(angle),
                y: 90 * Math.cos(angle),
                autoAlpha: 0,
                ease: 'power2.out',
              },
              `${br}+=${(i / Math.max(list.length, 1)) * 0.9}`,
            )
          })
        }

        tl.call(() => playRange(N - 1), [], '>')
        tl.to({}, { duration: 1 }) // hold final en la última tarjeta
      }, reel)

      ScrollTrigger.refresh()
    }

    run()

    return () => {
      cancelled = true
      gsapCtx?.revert()
      createdShards.forEach((c) => c.remove())
      reel.removeAttribute('data-active')
    }
  }, [])

  return (
    <section
      id="hero"
      ref={reelRef}
      aria-label="LATAM Travel — la vida es una sola"
      className="reel-root"
    >
      <div ref={stageRef} className="reel-stage">
        {VIDEOS.map((v) => (
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
                    className="pointer-events-auto absolute inset-x-0 top-0 grid grid-cols-3 items-center p-4 md:p-5"
                  >
                    <a
                      href="#cotiza"
                      onClick={irA('cotiza')}
                      className="justify-self-start font-['PPMonumentExtended'] text-[7px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[8px] sm:tracking-[0.2em] md:text-[10px]"
                    >
                      Promociones
                    </a>
                    <span className="justify-self-center text-center font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.15em] text-white/90 sm:text-[8px] sm:tracking-[0.25em] md:text-[10px]">
                      La vida es una sola
                    </span>
                    <a
                      href="#destinos"
                      onClick={irA('destinos')}
                      className="justify-self-end font-['PPMonumentExtended'] text-[7px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[8px] sm:tracking-[0.2em] md:text-[10px]"
                    >
                      Destinos
                    </a>
                  </nav>

                  {/* Logo centrado */}
                  <div className="pointer-events-auto absolute inset-0 flex items-center justify-center px-10">
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
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
                    <p className="max-w-[24ch] translate-y-9 text-center font-['PPMonumentExtended'] text-[9px] font-light leading-relaxed tracking-[0.03em] text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.55)] sm:max-w-[26ch] sm:translate-y-10 sm:text-[11px] md:translate-y-12">
                      Prefiero llegar a viejo lleno de historias que contar, no solo de plata.
                    </p>
                  </div>

                  {/* Micro-textos a los extremos */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 md:pl-6">
                    <span className="font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[9px] sm:tracking-[0.2em]">
                      Latinoamérica
                    </span>
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 md:pr-6">
                    <span className="font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[9px] sm:tracking-[0.2em]">
                      Travel
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Índice + país */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-5">
                    <span className="font-['PPMonumentExtended'] text-[8px] font-light uppercase tracking-[0.25em] text-white/70 sm:text-[10px]">
                      {v.indice} / 03
                    </span>
                    <span className="font-['PPMonumentExtended'] text-[8px] font-light uppercase tracking-[0.25em] text-white/70 sm:text-[10px]">
                      {v.pais}
                    </span>
                  </div>

                  {/* Nombre + línea */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-4 md:p-6">
                    <h2 className="font-['PPMonumentExtended'] text-[34px] font-black uppercase leading-[0.9] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] sm:text-[48px] md:text-[56px]">
                      {v.ciudad}
                    </h2>
                    <p className="max-w-[24ch] font-['PPMonumentExtended'] text-[9px] font-light uppercase tracking-[0.18em] text-white/80 sm:text-[11px]">
                      {v.linea}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-2 font-['PPMonumentExtended'] text-[8px] font-light uppercase tracking-[0.25em] text-white/70 sm:text-[10px]">
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
