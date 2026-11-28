import Image from 'next/image'
import Link from 'next/link'

export default function BandanasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#13261B] font-funnel text-white">
      <header className="flex items-center justify-center gap-3 px-5 py-4">
        <Link href="/" aria-label="LATAM VISA, ir al inicio" className="py-3">
          <Image src="/bandanas/logo-latam.png" alt="LATAM VISA" width={600} height={90} priority className="h-[8px] w-auto sm:h-[10px]" />
        </Link>
        <span aria-hidden="true" className="h-4 w-px bg-[#F5F1E6]/70" />
        <Link href="/bandanas" aria-label="NOCTIVE, ir a las bandanas" className="py-3">
          <Image src="/bandanas/logo-noctive.png" alt="NOCTIVE" width={867} height={132} priority className="h-[7px] w-auto sm:h-[8px]" />
        </Link>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/15 px-5 py-8 text-center text-[12px] text-white/60">
        LATAM VISA × NOCTIVE · Envíos solo dentro de Australia ·{' '}
        <a href="mailto:future@latamvisas.com.au" className="underline">future@latamvisas.com.au</a>
      </footer>
    </div>
  )
}
