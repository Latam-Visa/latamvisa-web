import type { Metadata } from 'next'
import Link from 'next/link'
import { WHATSAPP, enlace } from './_componentes/ui'

export const metadata: Metadata = {
  title: 'Tu cuenta | LATAM VISA',
  description: 'Tu solicitud de visa con LATAM VISA.',
  keywords: null,
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
  alternates: { canonical: null },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0d2b0d] font-funnel flex flex-col overflow-x-hidden">
      <header className="bg-white border-b border-[#0d2b0d]/10">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center min-h-[44px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="LATAM VISA" className="h-10 w-auto" />
          </Link>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className={`text-sm ${enlace}`}>
            ¿Necesitas ayuda?
          </a>
        </div>
      </header>
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8 sm:py-12">{children}</main>
      <footer className="border-t border-[#0d2b0d]/10 py-5 px-4 text-center text-xs text-[#0d2b0d]/60">
        LATAM VISA · Brisbane, Australia · Tus datos se guardan cifrados y solo los ve nuestro equipo.
      </footer>
    </div>
  )
}
