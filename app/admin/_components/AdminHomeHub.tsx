"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ClipboardList, Lightbulb, ArrowRight } from 'lucide-react'

interface AdminHomeHubProps {
  solicitudesCount: number
  ideasPendingCount: number
}

export function AdminHomeHub({ solicitudesCount, ideasPendingCount }: AdminHomeHubProps) {
  const cards = [
    {
      href: '/admin/solicitudes',
      icon: ClipboardList,
      title: 'Solicitudes',
      subtitle: 'Revisa y gestiona las solicitudes de visa',
      count: solicitudesCount,
      countLabel: solicitudesCount === 1 ? 'solicitud' : 'solicitudes',
    },
    {
      href: '/admin/ideas',
      icon: Lightbulb,
      title: 'Ideas & Tareas',
      subtitle: 'Captura ideas y organiza lo que sigue',
      count: ideasPendingCount,
      countLabel: 'pendientes',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.href}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href={card.href} className="group block h-full min-h-[44px]">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full min-h-[220px] flex flex-col gap-6 bg-white rounded-[24px] border border-[#E5E5E5] p-7 sm:p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] group-hover:shadow-[0_16px_36px_-10px_rgba(47,74,0,0.16)] group-hover:border-[#D9EFB0] transition-[box-shadow,border-color] duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F2FBDD] to-[#E4F5C6] flex items-center justify-center shrink-0">
                <card.icon className="w-6 h-6 text-[#2F4A00]" />
              </div>

              <div className="flex-1">
                <h2 className="font-[PPMonumentExtended] text-xl sm:text-2xl text-[#0d2b0d] mb-2">{card.title}</h2>
                <p className="text-sm text-[#6B6B6B] font-funnel leading-relaxed">{card.subtitle}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-[#C8FF00] text-[#2F4A00] text-xs font-bold px-3 py-1.5 rounded-full">
                  {card.count} {card.countLabel}
                </span>
                <span className="w-9 h-9 rounded-full bg-[#F5F5F0] flex items-center justify-center group-hover:bg-[#C8FF00] transition-colors">
                  <ArrowRight className="w-4 h-4 text-[#0A0A0A] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
