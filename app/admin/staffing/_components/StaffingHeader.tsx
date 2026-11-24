"use client"

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { StaffingNav } from './StaffingNav'

// Cabecera minimalista: etiqueta pequeña con mucho espaciado, título grande con
// tracking apretado, subtítulo con aire y una línea fina como único adorno.
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
    <header className="pt-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[-0.01em] text-[#A5A7AA] transition-colors hover:text-[#0C0C0C]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Admin
      </Link>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          {kicker && (
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#A5A7AA]">{kicker}</p>
          )}
          <h1 className="mt-4 text-[40px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#0C0C0C] sm:text-[56px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-[520px] text-[16px] leading-[1.55] tracking-[-0.015em] text-[#6B6D70] sm:text-[17px]">
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
      </div>

      <div className="mt-12">
        <StaffingNav />
      </div>
    </header>
  )
}
