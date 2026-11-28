import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function SalesHeader({ active }: { active: 'pipeline' | 'report' }) {
  const tabs = [
    { key: 'pipeline', href: '/admin/sales', label: 'Pipeline' },
    { key: 'report', href: '/admin/sales/report', label: 'Weekly report' },
  ]
  return (
    <header className="pt-2">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[12px] font-medium text-[#6B6D70] hover:text-[#0C0C0C]">
        <ArrowLeft className="h-3.5 w-3.5" /> Admin
      </Link>
      <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-[#6B6D70]">Colette &amp; Louis · Savoy Cleaning</p>
      <h1 className="mt-2 text-[36px] font-semibold leading-none tracking-[-0.02em] text-[#0C0C0C] sm:text-[48px]">Sales</h1>
      <nav className="mt-6 flex gap-8 border-b border-[#E6E6E1]">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href}
            className={`-mb-px border-b py-3 text-[15px] font-medium ${active === t.key ? 'border-[#0C0C0C] text-[#0C0C0C]' : 'border-transparent text-[#8A8C8F] hover:text-[#0C0C0C]'}`}>
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
