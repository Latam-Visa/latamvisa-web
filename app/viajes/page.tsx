import type { Metadata } from 'next'
import { Play } from 'lucide-react'

export const metadata: Metadata = {
  title: 'LATAM TRAVELING — Viajes inteligentes antes de ver a tu gente',
  description: 'Latinoamérica es el fuego de la hora. Descubre destinos pensados para tu próximo viaje con LATAM TRAVELING.',
}

const destinations = ['Francia', 'Italia', 'España']

export default function ViajesPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] font-funnel">
      <nav className="flex items-center justify-between gap-2 px-5 py-5 sm:px-8 sm:py-6">
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#2F4A00] sm:text-sm">
          Destinos
        </span>

        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border-[1.6px] border-[#1a3300] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1a3300] sm:px-4 sm:py-2 sm:text-xs">
          <span className="h-2 w-2 shrink-0 bg-[#C8FF00]" aria-hidden />
          Latam Traveling
        </span>

        <span className="text-right text-[11px] font-bold uppercase tracking-wide text-[#2F4A00] sm:text-sm">
          Viaje con amigos
        </span>
      </nav>

      <section className="relative mx-4 mb-8 rounded-[18px] bg-[#C8FF00] px-6 pb-14 pt-20 sm:mx-8 sm:px-10 sm:pb-20 sm:pt-16">
        <div
          className="absolute right-4 top-4 flex h-11 w-16 flex-col items-center justify-center gap-1 rounded-xl bg-[#0d2b0d] sm:right-8 sm:top-8 sm:h-16 sm:w-24"
          aria-hidden
        >
          <Play className="h-3.5 w-3.5 fill-white text-white sm:h-4 sm:w-4" />
          <span className="text-[8px] font-medium uppercase tracking-wide text-white/70 sm:text-[10px]">
            video
          </span>
        </div>

        <div className="mx-auto flex max-w-[620px] flex-col items-center text-center">
          <span className="text-sm font-bold text-[#2F4A00]">why ↑ not?</span>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3a5200] sm:text-sm">
            Latinoamérica es el fuego de la hora.
          </p>
          <h1 className="font-monument mt-6 text-[clamp(1.875rem,8vw,5rem)] font-black uppercase leading-[0.92] tracking-tight text-[#1a3300]">
            Haz un viaje inteligente antes de ver a tu gente…
          </h1>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {destinations.map((destination) => (
              <span
                key={destination}
                className="rounded-full border-[1.6px] border-[#1a3300] px-5 py-2 text-sm font-semibold text-[#1a3300]"
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
