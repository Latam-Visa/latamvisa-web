"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin/staffing', label: 'Calendario' },
  { href: '/admin/staffing/needs', label: 'Turnos' },
  { href: '/admin/staffing/staff', label: 'Personal' },
  { href: '/admin/staffing/candidates', label: 'Candidatos' },
  { href: '/admin/staffing/misiones', label: 'Misiones' },
  { href: '/admin/staffing/kit', label: 'Kit' },
]

export function StaffingNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-8 overflow-x-auto border-b border-[#E6E6E1] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((t) => {
        const active = t.href === '/admin/staffing' ? pathname === t.href : pathname.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px shrink-0 border-b py-3 text-[15px] font-medium tracking-[-0.02em] transition-colors ${
              active ? 'border-[#0C0C0C] text-[#0C0C0C]' : 'border-transparent text-[#A5A7AA] hover:text-[#0C0C0C]'
            }`}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
