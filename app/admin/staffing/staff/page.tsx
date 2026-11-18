import { supabaseAdmin } from '@/lib/supabase/admin'
import { ymd, weekDates, type StaffMember } from '@/lib/staffing'
import { StaffClient } from '../_components/StaffClient'
import { StaffingHeader } from '../_components/StaffingHeader'

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
      <StaffingHeader kicker="Equipo" title="Personal" subtitle={`${staff.length} persona(s) · turnos contados de esta semana.`} />

      <StaffClient staff={staff} turnosSemana={turnosSemana} />
    </div>
  )
}
