'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prefersReducedMotion, scrollToId } from '@/lib/lenis'
import { whatsappHref } from './whatsapp'

// Antes del primer paint para que el estado cerrado (.reel-intro) no parpadee.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

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
  // Precio SEMILLA "una semana en Europa" (AUD, por persona). Editable a mano;
  // el número real lo afina el cotizador. Formato de display ya con separador.
  semana?: string
}

const PANELES: Panel[] = [
  { src: '/viajes/panels/espana.mp4', poster: '/viajes/panels/espana-poster.jpg', ciudad: 'España', hero: true },
  { src: '/viajes/panels/barcelona.mp4', poster: '/viajes/panels/barcelona-poster.jpg', ciudad: 'Barcelona', pais: 'España', indice: '01', linea: 'donde el viaje empieza a sentirse', esquina: 'Gaudí · Mediterráneo', semana: '1.100' },
  { src: '/viajes/panels/paris.mp4', poster: '/viajes/panels/paris-poster.jpg', ciudad: 'París', pais: 'Francia', indice: '02', linea: 'una escala que vale un viaje', esquina: 'Sena · Luz', semana: '1.450' },
  { src: '/viajes/panels/niza.mp4', poster: '/viajes/panels/niza-poster.jpg', ciudad: 'Niza', pais: 'Côte d’Azur', indice: '03', linea: 'el Mediterráneo antes de volver a casa', esquina: 'Riviera · Atardecer', semana: '1.250' },
]

export default function ReelDesintegracion() {
  const reelRef = useRef<HTMLElement>(null)

  // Qué paneles tienen la franja de precio desplegada (se puede abrir cada uno).
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set())
  const toggle = (ciudad: string) =>
    setAbiertos((prev) => {
      const next = new Set(prev)
      next.has(ciudad) ? next.delete(ciudad) : next.add(ciudad)
      return next
    })

  const irA = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    scrollToId(id)
  }

  /* Entrada del hero (efecto estilo Osmo, sobre el propio hero): "Latinoamérica"
     y "Travel" suben letra por letra, el logo crece desde el centro, y la barra
     y la frase aparecen. No es un overlay: anima los elementos que ya están.
     Bajo prefers-reduced-motion no se añade .reel-intro y todo se ve directo. */
  useIsoLayoutEffect(() => {
    const reel = reelRef.current
    if (!reel || prefersReducedMotion()) return

    reel.classList.add('reel-intro')
    let cancelled = false
    let ctx: { revert: () => void } | null = null
    const limpiar = () => reel.classList.remove('reel-intro')
    // Por si GSAP tarda o falla, nunca dejar el hero oculto.
    const fallback = window.setTimeout(limpiar, 3600)

    ;(async () => {
      try {
        const { gsap } = await import('gsap')
        if (cancelled) return limpiar()
        ctx = gsap.context(() => {
          const q = gsap.utils.selector(reel)
          const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            onComplete: limpiar,
          })
          // fromTo con estado final explícito: el CSS pre-oculta/difumina
          // (anti-flash), así que un .from leería ese estado como destino.
          // ENFOQUE CINE: las palabras arrancan borrosas y apretadas, y se
          // enfocan + expanden (una tras otra). Lento y notorio.
          tl.fromTo(
            q('.reel-letter-mask'),
            { autoAlpha: 0, filter: 'blur(16px)', scaleX: 0.9 },
            { autoAlpha: 1, filter: 'blur(0px)', scaleX: 1, duration: 2.0, stagger: 0.25 },
          )
            // El logo SALE DEL CENTRO (crece) a la vez.
            .fromTo(
              q('.hero-logo'),
              { scale: 0.3, autoAlpha: 0 },
              { scale: 1, autoAlpha: 1, duration: 1.5, ease: 'expo.out' },
              '<',
            )
        }, reel)
      } catch {
        limpiar()
      }
    })()

    return () => {
      cancelled = true
      window.clearTimeout(fallback)
      ctx?.revert()
      limpiar()
    }
  }, [])

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

      // Reproducir solo los videos visibles (el hero es imagen, no tiene video)
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

      // Parallax: cada video se desplaza suave dentro de su marco con el scroll.
      // El hero (imagen) se salta: queda fijo.
      gsapCtx = gsap.context(() => {
        cards.forEach((card) => {
          const video = card.querySelector<HTMLVideoElement>('video')
          if (!video) return
          io!.observe(video)
          gsap.fromTo(
            video,
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
        {PANELES.map((v) => {
          const abierto = abiertos.has(v.ciudad)
          return (
          <article key={v.ciudad} className={`reel-card${v.hero ? ' reel-card--hero' : ''}`}>
            <div
              className={
                v.hero
                  ? 'reel-visual'
                  : 'reel-visual group cursor-pointer transition-[transform,border-color,box-shadow] duration-500 md:hover:scale-[1.012] md:hover:border-[#C8FF00]/70 md:hover:shadow-[0_0_55px_-12px_rgba(200,255,0,0.5)]'
              }
            >
              {v.hero ? (
                // El hero usa una imagen fija (cielo con nubes), no video. Se
                // encuadra con object-bottom para que las nubes (abajo) siempre
                // se vean bien en vertical. Queda estático (sin parallax).
                <Image
                  src="/viajes/cielo-nubes.jpg"
                  alt=""
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover object-bottom"
                  aria-hidden
                />
              ) : (
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
              )}

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
                      className="hero-navitem justify-self-start font-['PPMonumentExtended'] text-[7px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[8px] sm:tracking-[0.25em] md:text-[10px]"
                    >
                      Promociones
                    </a>
                    <span className="hero-navitem justify-self-center text-center font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.2em] text-white/90 sm:text-[8px] sm:tracking-[0.3em] md:text-[10px]">
                      La vida es una sola
                    </span>
                    <a
                      href="#destinos"
                      onClick={irA('destinos')}
                      className="hero-navitem justify-self-end font-['PPMonumentExtended'] text-[7px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white sm:text-[8px] sm:tracking-[0.25em] md:text-[10px]"
                    >
                      Destinos
                    </a>
                  </nav>

                  {/* Logo centrado. El contenedor NO captura clicks (si fuera
                     pointer-events-auto taparía todo el hero y mataría el nav);
                     solo el propio logo es clickeable. */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16 sm:px-24">
                    <Link href="/" aria-label="LATAM Travel — inicio" className="pointer-events-auto flex items-center">
                      <Image
                        src="/logo-lt-travel-white.png"
                        alt="LATAM Travel"
                        width={961}
                        height={121}
                        priority
                        className="hero-logo h-4 w-auto object-contain md:h-5"
                      />
                    </Link>
                  </div>

                  {/* Frase emocional */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
                    <p className="hero-phrase max-w-[32ch] translate-y-9 text-center font-['PPMonumentExtended'] text-[10px] font-light leading-relaxed tracking-[0.04em] text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.55)] sm:max-w-[44ch] sm:translate-y-10 sm:text-[12px] md:translate-y-12 md:text-sm">
                      Prefiero llegar a viejo lleno de historias que contar, no solo de plata.
                    </p>
                  </div>

                  {/* Micro-textos a los extremos: se ABREN desde su centro en
                     la entrada del hero (clip-path). */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 md:pl-14">
                    <span className="reel-letter-mask font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]">
                      Latinoamérica
                    </span>
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 md:pr-14">
                    <a
                      href="#vuelos"
                      onClick={irA('vuelos')}
                      className="reel-letter-mask pointer-events-auto font-['PPMonumentExtended'] text-[7px] font-light uppercase tracking-[0.1em] text-white/80 transition-colors hover:text-white sm:text-[10px] sm:tracking-[0.25em] md:text-[11px] md:tracking-[0.3em]"
                    >
                      Travel
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* Toca la tarjeta para desplegar la franja de precio. Cubre
                     todo el panel; los textos de arriba son pointer-events-none
                     así que el click los atraviesa. */}
                  <button
                    type="button"
                    onClick={() => toggle(v.ciudad)}
                    aria-expanded={abierto}
                    aria-label={abierto ? `Cerrar precio de ${v.ciudad}` : `Ver precio de ${v.ciudad} y cotizar`}
                    className="absolute inset-0"
                  />

                  {/* Pista de que es tocable (y realce al pasar el cursor) */}
                  <div
                    className={`pointer-events-none absolute bottom-5 right-5 z-[1] flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm transition-opacity duration-300 md:bottom-8 md:right-8 ${
                      abierto ? 'opacity-0' : 'opacity-90 md:opacity-60 md:group-hover:opacity-100'
                    }`}
                  >
                    <span className="font-['PPMonumentExtended'] text-[9px] font-light uppercase tracking-[0.2em] text-white sm:text-[10px]">
                      Ver precio
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#C8FF00]" aria-hidden>
                      <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Nombre de ciudad ARRIBA: así se alcanza a ver en el asomo
                     del panel siguiente sin tener que bajar. */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-start gap-1.5 p-5 md:gap-2 md:p-8">
                    <span className="font-['PPMonumentExtended'] text-[10px] font-light uppercase tracking-[0.3em] text-white/70 sm:text-[11px]">
                      {v.indice} / 03 · {v.pais}
                    </span>
                    <h2 className="font-[var(--font-viajes-black)] uppercase leading-[0.9] tracking-[-0.04em] text-[#F3EBA8] [text-shadow:0_2px_30px_rgba(0,0,0,0.5)] text-[10vw] sm:text-[8.5vw] lg:text-[5.4vw]">
                      {v.ciudad}
                    </h2>
                  </div>

                  {/* Línea editorial abajo */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 md:p-10">
                    <p className="max-w-[28ch] font-['PPMonumentExtended'] text-[11px] font-light uppercase tracking-[0.2em] text-white/80 sm:text-sm">
                      {v.linea}
                    </p>
                    <span className="mt-0.5 inline-flex items-center gap-2 font-['PPMonumentExtended'] text-[9px] font-light uppercase tracking-[0.3em] text-white/75 sm:text-[11px]">
                      <span className="inline-block h-1.5 w-1.5 bg-[#C8FF00]" aria-hidden />
                      {v.esquina}
                    </span>
                  </div>

                  {/* Franja de precio: sube desde abajo hasta la mitad al tocar.
                     Semitransparente (se sigue viendo el video arriba y detrás). */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute inset-x-0 bottom-0 z-10 flex h-1/2 flex-col justify-end gap-3.5 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-6 backdrop-blur-[2px] transition-[transform,opacity] duration-500 ease-out md:gap-5 md:p-9 ${
                      abierto ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(v.ciudad)}
                      aria-label="Cerrar"
                      className="absolute right-5 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors hover:border-white/60 hover:text-white md:right-7 md:top-6"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>

                    <p className="max-w-[20ch] font-['PPMonumentExtended'] text-base font-light leading-snug text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-lg md:text-xl">
                      ¿Una semana en Europa por{' '}
                      <span className="whitespace-nowrap rounded-md bg-[#C8FF00] px-2 py-0.5 font-normal text-[#0a0a0a]">
                        ${v.semana}
                      </span>
                      ?
                    </p>
                    <p className="font-['PPMonumentExtended'] text-[10px] font-light uppercase tracking-[0.25em] text-white/80 sm:text-[11px]">
                      Cotiza con nosotros
                    </p>
                    <a
                      href={whatsappHref(`Hola! Vi ${v.ciudad} en la web — ¿una semana en Europa por ~$${v.semana}? Quiero cotizar mi Euro Trip.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] font-['PPMonumentExtended'] text-[13px] font-bold uppercase tracking-[0.06em] text-white transition-transform active:scale-[0.98] sm:w-auto sm:self-start sm:px-8"
                    >
                      <WhatsAppIcon size={20} />
                      Cotiza por WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>
          </article>
          )
        })}
      </div>
    </section>
  )
}
