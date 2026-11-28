import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Pago cancelado · Bandanas LATAM VISA', robots: { index: false } }

export default function CanceladoPage({ searchParams }: { searchParams: { d?: string } }) {
  const slug = searchParams.d && /^[a-z0-9-]+$/.test(searchParams.d) ? searchParams.d : ''
  return (
    <section className="mx-auto max-w-[520px] px-5 py-20 text-center">
      <h1 className="font-monument font-black text-[30px] uppercase leading-tight sm:text-[42px]">Pago cancelado</h1>
      <p className="mt-6 text-[16px] text-white/80">No se te cobró nada. Tu bandana sigue ahí.</p>
      <Link href={slug ? `/bandanas/${slug}` : '/bandanas'} className="mt-10 inline-block bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black">Volver</Link>
    </section>
  )
}
