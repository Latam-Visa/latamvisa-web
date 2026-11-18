import { supabaseAdmin } from '@/lib/supabase/admin'
import { ymd, type StaffingClient } from '@/lib/staffing'
import { NeedsClient } from '../_components/NeedsClient'
import { StaffingHeader } from '../_components/StaffingHeader'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export interface NeedRow {
  id: string
  client_id: string
  client_name: string
  client_color: string
  shift_date: string
  start_time: string
  end_time: string
  role: string
  headcount: number
  notes: string | null
}

export default async function NeedsPage() {
  const hoy = ymd(new Date())
  const [clientsRes, needsRes] = await Promise.all([
    supabaseAdmin.from('staffing_clients').select('*').order('name'),
    supabaseAdmin
      .from('staffing_needs')
      .select('id, client_id, shift_date, start_time, end_time, role, headcount, notes, staffing_clients(name, color)')
      .gte('shift_date', hoy)
      .order('shift_date')
      .order('start_time')
      .limit(400),
  ])

  const clients = (clientsRes.data || []) as StaffingClient[]
  const needs: NeedRow[] = ((needsRes.data || []) as any[]).map((n) => ({
    id: n.id,
    client_id: n.client_id,
    client_name: n.staffing_clients?.name || '—',
    client_color: n.staffing_clients?.color || '#C8FF00',
    shift_date: n.shift_date,
    start_time: n.start_time,
    end_time: n.end_time,
    role: n.role,
    headcount: n.headcount,
    notes: n.notes,
  }))

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-12">
      <StaffingHeader kicker="Turnos" title="Necesidades" subtitle="Crea turnos en bloque y gestiona los próximos." />

      <NeedsClient clients={clients} needs={needs} />
    </div>
  )
}
