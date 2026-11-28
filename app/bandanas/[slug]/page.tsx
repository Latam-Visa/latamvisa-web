import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LEMA, precio } from '@/lib/bandanas/config'
import { buscarBandana } from '@/lib/bandanas/datos'
import { Galeria } from './Galeria'
import { Comprar } from './Comprar'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await buscarBandana(params.slug)
  return p ? { title: `${p.name} · Bandanas LATAM VISA`, description: p.description || LEMA } : {}
}

export default async function BandanaPage({ params }: { params: { slug: string } }) {
  const p = await buscarBandana(params.slug)
  if (!p) notFound()
  return (
    <div className="bg-[#F3F1EC] text-black">
      <div className="mx-auto grid max-w-[1200px] lg:grid-cols-[1.3fr_1fr] lg:gap-10 lg:px-10 lg:py-10">
        <Galeria images={p.images} name={p.name} />
        <div className="bg-white px-5 py-7 lg:self-start lg:px-8">
          <h1 className="text-[20px]">{p.name}</h1>
          <p className="mt-1 text-[18px] font-bold">{precio(p.price_aud)}</p>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-black/70">{p.description || LEMA}</p>
          <Comprar productId={p.id} price={Number(p.price_aud)} />
        </div>
      </div>
    </div>
  )
}
