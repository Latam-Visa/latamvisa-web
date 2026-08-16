import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import localFont from 'next/font/local'

// Loaded locally (Condensed/Light variant, not the site-wide Extended/static
// weights from app/fonts.ts), same pattern as app/postcard/page.tsx.
const ppMonumentCondensedLight = localFont({
  src: '../../public/fonts/PPMonument/PPMonumentCondensed-Light.otf',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LATAM TRAVELING — Viajes inteligentes antes de ver a tu gente',
  description: 'Latinoamérica es el fuego de la hora. Descubre destinos pensados para tu próximo viaje con LATAM TRAVELING.',
}

const destinations = ['Francia', 'Italia', 'España']

export default function ViajesPage() {
  return (
    <main className="min-h-screen bg-[#C8FF00] font-funnel">
      <nav className="relative flex items-center justify-between gap-2 px-5 py-5 sm:px-8 sm:py-6">
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#1a3300] sm:text-sm">
          Destinos
        </span>

        <Link href="/" className="absolute left-1/2 flex -translate-x-1/2 items-center">
          <Image
            src="/logo.png"
            alt="LATAM VISA"
            width={300}
            height={84}
            className="h-11 w-auto object-contain sm:h-12"
            priority
          />
        </Link>

        <span className="text-right text-[11px] font-bold uppercase tracking-wide text-[#1a3300] sm:text-sm">
          Viaje con amigos
        </span>
      </nav>

      <section
        className="relative mx-4 mb-4 overflow-hidden rounded-[18px] bg-[#C8FF00] px-6 pb-14 pt-20 sm:mx-8 sm:px-10 sm:pb-20 sm:pt-16"
        style={{ height: '90vh', minHeight: '520px' }}
      >
        {/* Video background — #C8FF00 on the section above stays as the fallback
            behind it if the video fails to load or autoplay is blocked. */}
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        >
          <source src="/viajes/hero.mp4" type="video/mp4" />
        </video>

        {/* Dark scrim for text legibility over the video */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(180deg, rgba(10,20,10,0.25), rgba(10,20,10,0.55))' }}
          aria-hidden
        />

        <div className="relative z-[2] mx-auto flex h-full w-full flex-col items-center justify-center text-center">
          <div className="mx-auto flex max-w-[620px] flex-col items-center">
            <span className="text-sm font-bold text-white">why ↑ not?</span>
            <p className={`${ppMonumentCondensedLight.className} mt-2 text-xs uppercase tracking-[0.14em] text-white sm:text-sm`}>
              Latinoamérica es el fuego de la hora.
            </p>
          </div>

          <h1 className="font-monument mt-6 w-full whitespace-nowrap text-[clamp(1.1rem,6.4vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tight">
            <span className="text-white">LATAM</span>
            <span className="text-[#C8FF00]">X</span>
            <span className="text-white">EUROPA</span>
          </h1>

          <div className="mt-8 flex max-w-[620px] flex-wrap items-center justify-center gap-3">
            {destinations.map((destination) => (
              <span
                key={destination}
                className="rounded-full border-[1.6px] border-[#FAFAF7] px-5 py-2 text-sm font-semibold text-[#FAFAF7]"
              >
                {destination}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
