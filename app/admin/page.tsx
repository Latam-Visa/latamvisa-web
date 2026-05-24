import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApplicationsListClient } from './_components/ApplicationsListClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [usaRes, canRes] = await Promise.all([
    supabaseAdmin.from('visa_applications_usa').select('id, created_at, status, data').order('created_at', { ascending: false }),
    supabaseAdmin.from('visa_applications_canada').select('*').order('created_at', { ascending: false })
  ])

  if (usaRes.error && canRes.error) {
    return <div className="p-8 text-center text-[#DC2626]">Error cargando datos.</div>
  }

  const usaApps = (usaRes.data || []).map(app => ({
    id: app.id,
    created_at: app.created_at,
    status: app.status,
    destination: 'USA',
    fullName: app.data?.step1Contact?.fullName || '—',
    email: app.data?.step1Contact?.email || '—',
    visaType: app.data?.step4Travel?.usaVisaType === 'B1/B2 Turismo y Negocios' ? 'B1/B2' : (app.data?.step4Travel?.usaVisaType || '—')
  }))

  const canApps = (canRes.data || []).map(app => ({
    id: app.id,
    created_at: app.created_at,
    status: app.status || 'nuevo',
    destination: 'Canadá',
    fullName: `${app.given_name || ''} ${app.surname || ''}`.trim() || '—',
    email: app.email || '—',
    visaType: app.apply_for || '—'
  }))

  const applications = [...usaApps, ...canApps].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto w-full pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A]">Solicitudes</h2>
        <p className="text-sm text-[#6B6B6B]">{applications.length} solicitudes en total</p>
      </div>

      <ApplicationsListClient applications={applications} />
    </div>
  )
}
