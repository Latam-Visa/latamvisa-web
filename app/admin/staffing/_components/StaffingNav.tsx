"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, Users, UserPlus, Megaphone } from 'lucide-react'

const TABS = [
  { href: '/admin/staffing', label: 'Calendario', icon: CalendarDays },
  { href: '/admin/staffing/needs', label: 'Turnos', icon: Clock },
  { href: '/admin/staffing/staff', label: 'Personal', icon: Users },
  { href: '/admin/staffing/candidates', label: 'Candidatos', icon: UserPlus },
  { href: '/admin/staffing/kit', label: 'Kit', icon: Megaphone },
]

export function StaffingNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-2xl border border-[#E8E8E3] bg-white/70 p-1.5 backdrop-blur-sm">
      {TABS.map((t) => {
        const active = t.href === '/admin/staffing' ? pathname === t.href : pathname.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-colors ${active ? 'text-[#0d2b0d]' : 'text-[#9A9A94] hover:text-[#2F4A00]'}`}
          >
            {active && (
              <motion.span
                layoutId="staffing-tab"
                className="absolute inset-0 rounded-xl bg-[#C8FF00]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <t.icon className={`relative z-10 h-[15px] w-[15px] ${active ? 'text-[#2F4A00]' : ''}`} />
            <span className="relative z-10">{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
