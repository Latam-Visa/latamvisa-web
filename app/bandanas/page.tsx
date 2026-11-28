import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { LEMA, precio } from '@/lib/bandanas/config'
import { listarBandanas } from '@/lib/bandanas/datos'

// Los productos nuevos aparecen en un minuto como máximo.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Bandanas — Noche Latina · LATAM VISA × NOCTIVE',
  description: LEMA,
  alternates: { canonical: 'https://www.latamvisatravel.com/bandanas' },
}

export default async function BandanasPage() {
  const productos = await listarBandanas()
  return (
    <>
      <section className="px-5 pb-12 pt-8 text-center sm:pb-20 sm:pt-14">
        <h1 className="font-monument font-black text-[44px] uppercase leading-[0.95] sm:text-[88px]">Noche Latina</h1>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.3em] sm:text-[13px]">Latam Visa × Noctive</p>
        <p className="mx-auto mt-5 max-w-[420px] text-[15px] text-white/70">{LEMA}</p>
      </section>

      <section aria-label="Diseños" className="bg-[#F3F1EC] px-3 py-6 text-black sm:px-10 sm:py-12">
        {productos.length === 0 ? (
          <p className="py-20 text-center text-sm font-bold uppercase tracking-[0.2em]">Los diseños llegan pronto</p>
        ) : (
          <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
            {productos.map((p, i) => (
              <li key={p.id}>
                <Link href={`/bandanas/${p.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden">
                    {p.images[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill sizes="(min-width: 1024px) 33vw, 50vw" priority={i < 2}
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-black/40">Foto pronto</span>
                    )}
                  </div>
                  <h2 className="mt-3 text-[14px] leading-snug">{p.name}</h2>
                  <p className="text-[14px] font-bold">{precio(p.price_aud)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
