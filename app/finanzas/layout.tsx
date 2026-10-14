import type { Metadata } from 'next'
import Link from 'next/link'
import { AVISO_LEGAL } from './_components/ui'

export const metadata: Metadata = {
  title: 'Finanzas | LATAM VISA',
  description: 'Organiza tu plata semana a semana.',
  keywords: null,
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
  alternates: { canonical: null },
}

export default function FinanzasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0d2b0d] font-funnel flex flex-col">
      <header className="bg-white border-b border-[#0d2b0d]/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/finanzas" className="flex items-center gap-2 min-h-[44px]">
            <img src="/logo.png" alt="LATAM VISA" className="h-8 w-auto" />
            <span className="font-monument text-xs uppercase tracking-wide text-[#2F4A00]">Finanzas</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">{children}</main>
      <footer className="border-t border-[#0d2b0d]/10 py-5 px-4 text-center text-xs text-[#0d2b0d]/70">{AVISO_LEGAL}</footer>
    </div>
  )
}
