import Link from 'next/link'
import { BANNER_PREVENTA } from '@/lib/bandanas/config'

export default function BandanasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black font-funnel text-white">
      <p className="sticky top-0 z-30 bg-white px-4 py-2.5 text-center text-[12px] font-bold leading-snug text-black">{BANNER_PREVENTA}</p>
      <header className="flex items-center justify-between px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] sm:px-10">
        <Link href="/" className="py-2 hover:underline">← Latam Visa</Link>
        <Link href="/bandanas" className="py-2 hover:underline">Bandanas</Link>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/15 px-5 py-8 text-center text-[12px] text-white/60">
        LATAM VISA × NOCTIVE · Envíos solo dentro de Australia ·{' '}
        <a href="mailto:future@latamvisas.com.au" className="underline">future@latamvisas.com.au</a>
      </footer>
    </div>
  )
}
