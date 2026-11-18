import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ymd, weekDates, type StaffMember } from '@/lib/staffing'
import { StaffClient } from '../_components/StaffClient'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function StaffPage() {
  const week = weekDates(new Date())
  const weekStart = ymd(week[0])
  const weekEnd = ymd(week[6])

  const [staffRes, asgRes] = await Promise.all([
    supabaseAdmin.from('staffing_staff').select('*').order('full_name'),
    // Asignaciones de esta semana, con la fecha del turno embebida para contar.
    supabaseAdmin.from('staffing_assignments').select('staff_id, staffing_needs(shift_date)'),
  ])

  const staff = (staffRes.data || []) as StaffMember[]

  const turnosSemana: Record<string, number> = {}
  for (const a of (asgRes.data || []) as any[]) {
    const d = a.staffing_needs?.shift_date
    if (d && d >= weekStart && d <= weekEnd) turnosSemana[a.staff_id] = (turnosSemana[a.staff_id] || 0) + 1
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-6 pb-12">
      <div className="flex items-start gap-4">
        <Link href="/admin/staffing" aria-label="Volver al calendario" className="flex shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white p-2 text-[#0A0A0A] transition-colors hover:border-[#0A0A0A]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="font-[PPMonumentExtended] text-2xl font-bold text-[#0d2b0d]">Personal</h2>
          <p className="text-sm text-[#6B6B6B]">{staff.length} persona(s) · turnos contados de esta semana</p>
        </div>
      </div>

      <StaffClient staff={staff} turnosSemana={turnosSemana} />
    </div>
  )
}
