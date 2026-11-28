import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Gracias · Bandanas LATAM VISA', robots: { index: false } }

export default function GraciasPage() {
  return (
    <section className="mx-auto max-w-[520px] px-5 py-20 text-center">
      <h1 className="font-monument font-black text-[34px] uppercase leading-tight sm:text-[48px]">¡Gracias, parce!</h1>
      <p className="mt-6 text-[16px] leading-relaxed text-white/80">Recibimos tu preorden. La entrega estimada es de 4 a 6 semanas. Si no se produce, te devolvemos el 100%.</p>
      <p className="mt-3 text-[14px] text-white/60">¿Dudas con tu pedido? Escríbenos a future@latamvisas.com.au con el correo que usaste al pagar.</p>
      <Link href="/bandanas" className="mt-10 inline-block bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black">Volver a las bandanas</Link>
    </section>
  )
}
