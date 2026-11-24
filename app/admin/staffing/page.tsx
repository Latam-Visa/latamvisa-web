import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  ymd,
  fromYmd,
  addDays,
  weekDates,
  monthWeeks,
  startOfWeek,
  type CoverageRow,
  type StaffingClient,
  type StaffMember,
  type AssignedStaff,
} from '@/lib/staffing'
import { CalendarClient } from './_components/CalendarClient'
import { StaffingHeader } from './_components/StaffingHeader'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function StaffingPage({
  searchParams,
}: {
  searchParams: { d?: string; view?: string }
}) {
  const view = searchParams.view === 'month' ? 'month' : 'week'
  const anchor = searchParams.d && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d) ? fromYmd(searchParams.d) : new Date()

  // Rango visible (incluye la rejilla completa del mes cuando view=month).
  let rangeStart: Date
  let rangeEnd: Date
  if (view === 'month') {
    const weeks = monthWeeks(anchor)
    rangeStart = weeks[0][0]
    rangeEnd = weeks[weeks.length - 1][6]
  } else {
    const days = weekDates(anchor)
    rangeStart = days[0]
    rangeEnd = days[6]
  }
  const startYmd = ymd(rangeStart)
  const endYmd = ymd(rangeEnd)

  // Ventana de "Gaps": próximos 14 días desde hoy, independiente de lo que se vea.
  const hoy = new Date()
  const hoyYmd = ymd(hoy)
  const gapsEndYmd = ymd(addDays(hoy, 14))

  const [clientsRes, coverageRes, needsRes, staffRes, gapsRes] = await Promise.all([
    supabaseAdmin.from('staffing_clients').select('*').order('name'),
    supabaseAdmin
      .from('staffing_coverage')
      .select('*')
      .gte('shift_date', startYmd)
      .lte('shift_date', endYmd)
      .order('shift_date')
      .order('start_time'),
    supabaseAdmin.from('staffing_needs').select('id, client_id, notes').gte('shift_date', startYmd).lte('shift_date', endYmd),
    supabaseAdmin.from('staffing_staff').select('*').in('status', ['active', 'trial']).order('full_name'),
    supabaseAdmin
      .from('staffing_coverage')
      .select('*')
      .gte('shift_date', hoyYmd)
      .lte('shift_date', gapsEndYmd)
      .gt('missing', 0)
      .order('shift_date')
      .order('start_time'),
  ])

  if (clientsRes.error || coverageRes.error) {
    console.error('[STAFFING] cargar calendario:', clientsRes.error || coverageRes.error)
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="rounded-xl border border-red-200 bg-[#FEF2F2] p-6 text-sm text-red-700">
          No pudimos cargar el calendario. Revisa que las tablas <code className="font-mono">staffing_*</code> y la vista{' '}
          <code className="font-mono">staffing_coverage</code> existan en Supabase.
        </div>
      </div>
    )
  }

  const clients = (clientsRes.data || []) as StaffingClient[]
  const coverage = (coverageRes.data || []) as CoverageRow[]
  const staff = (staffRes.data || []) as StaffMember[]
  const gaps = (gapsRes.data || []) as CoverageRow[]

  // need_id → client_id (la vista no trae client_id, así que lo mapeamos aquí).
  const needClient: Record<string, string> = {}
  const needNotes: Record<string, string> = {}
  for (const n of needsRes.data || []) {
    needClient[n.id] = n.client_id
    if (n.notes) needNotes[n.id] = n.notes
  }

  // need_id → personal asignado (con nombre, para pintar en la celda).
  const needIds = coverage.map((c) => c.need_id)
  const assigned: Record<string, AssignedStaff[]> = {}
  if (needIds.length) {
    const { data: asgs } = await supabaseAdmin
      .from('staffing_assignments')
      .select('id, need_id, staff_id, status, staffing_staff(full_name)')
      .in('need_id', needIds)
    for (const a of (asgs || []) as any[]) {
      ;(assigned[a.need_id] ||= []).push({
        assignment_id: a.id,
        staff_id: a.staff_id,
        full_name: a.staffing_staff?.full_name || '—',
        status: a.status,
      })
    }
  }

  const prev = ymd(view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1) : addDays(startOfWeek(anchor), -7))
  const next = ymd(view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1) : addDays(startOfWeek(anchor), 7))

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-14 pb-24">
      <StaffingHeader kicker="Agencia" title="Staffing" subtitle="Calendario de turnos, cobertura por cliente y reclutamiento." />

      <CalendarClient
        view={view}
        anchorYmd={ymd(anchor)}
        prevHref={`/admin/staffing?view=${view}&d=${prev}`}
        nextHref={`/admin/staffing?view=${view}&d=${next}`}
        todayHref={`/admin/staffing?view=${view}&d=${hoyYmd}`}
        clients={clients}
        coverage={coverage}
        needClient={needClient}
        needNotes={needNotes}
        assigned={assigned}
        staff={staff}
        gaps={gaps}
      />
    </div>
  )
}
