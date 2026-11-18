"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { StaffingNav } from './StaffingNav'

export function StaffingHeader({
  title,
  subtitle,
  kicker,
  right,
}: {
  title: string
  subtitle?: string
  kicker?: string
  right?: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[22px] border border-[#E8E8E3] bg-[#0d2b0d] px-5 py-5 sm:px-7 sm:py-6">
        {/* Aurora sutil en movimiento */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#C8FF00] opacity-25 blur-3xl"
          animate={{ x: [0, 30, -10, 0], y: [0, 20, -10, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-[-6rem] h-56 w-56 rounded-full bg-[#2F7A4A] opacity-30 blur-3xl"
          animate={{ x: [0, -20, 15, 0], y: [0, -15, 10, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              href="/admin"
              aria-label="Volver al inicio del admin"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              {kicker && (
                <span className="mb-1 inline-block rounded-full bg-[#C8FF00]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#C8FF00]">
                  {kicker}
                </span>
              )}
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="font-[PPMonumentExtended] text-[22px] leading-none text-white sm:text-[26px]"
              >
                {title}
              </motion.h1>
              {subtitle && <p className="mt-2 max-w-md text-[13px] leading-snug text-white/60">{subtitle}</p>}
            </div>
          </div>
          {right && <div className="relative z-10 flex flex-wrap items-center gap-2">{right}</div>}
        </div>
      </div>

      <StaffingNav />
    </div>
  )
}
