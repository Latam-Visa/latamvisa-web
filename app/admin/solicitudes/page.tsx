import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApplicationsListClient, type Application } from './_components/ApplicationsListClient'

export const dynamic = 'force-dynamic'
// `dynamic = 'force-dynamic'` re-renders this route per request, but it does not
// by itself disable Next's fetch-level Data Cache for third-party clients like
// supabase-js — without this, the underlying PostgREST fetches can get cached
// indefinitely and keep serving a stale snapshot from whenever the cache was
// first populated, silently hiding every row inserted afterward.
export const fetchCache = 'force-no-store'

// One entry per country. Adding a new destination later means adding one
// entry here — the fetch/normalize/merge/sort loop below needs no changes.
const SOURCES: {
  table: string
  select: string
  destination: string
  normalize: (row: any) => Omit<Application, 'id' | 'created_at' | 'destination'>
}[] = [
  {
    table: 'visa_applications_usa',
    select: 'id, created_at, status, data',
    destination: 'USA',
    normalize: (app) => ({
      status: app.status,
      fullName: app.data?.step1Contact?.fullName || '—',
      email: app.data?.step1Contact?.email || '—',
      visaType: app.data?.step4Travel?.usaVisaType === 'B1/B2 Turismo y Negocios' ? 'B1/B2' : (app.data?.step4Travel?.usaVisaType || '—'),
    }),
  },
  {
    table: 'visa_applications_canada',
    select: '*',
    destination: 'Canadá',
    normalize: (app) => ({
      status: app.status || 'nuevo',
      fullName: `${app.given_name || ''} ${app.surname || ''}`.trim() || '—',
      email: app.email || '—',
      visaType: app.apply_for || '—',
    }),
  },
  {
    table: 'visa_applications_uk',
    select: '*',
    destination: 'UK',
    normalize: (app) => ({
      status: app.status || 'nuevo',
      fullName: `${app.first_name || ''} ${app.last_name || ''}`.trim() || '—',
      email: app.email || '—',
      visaType: app.purpose_of_visit || '—',
    }),
  },
  {
    table: 'visa_applications_schengen',
    select: '*',
    destination: 'Schengen',
    normalize: (app) => ({
      status: app.status || 'nuevo',
      fullName: `${app.first_names || ''} ${app.surname || ''}`.trim() || '—',
      email: app.home_email || '—',
      visaType: app.purpose_of_journey || '—',
    }),
  },
  {
    table: 'aplicaciones_turismo_australia',
    select: '*',
    destination: 'Australia',
    normalize: (app) => ({
      status: app.status || 'nuevo',
      fullName: `${app.given_names || ''} ${app.family_name || ''}`.trim() || '—',
      email: app.email || '—',
      visaType: app.visa_stream === 'tourist' ? 'Tourist Stream (Subclass 600)' : (app.visa_stream || '—'),
    }),
  },
]

export default async function AdminDashboard() {
  const results = await Promise.all(
    SOURCES.map((source) =>
      supabaseAdmin.from(source.table).select(source.select).order('created_at', { ascending: false })
    )
  )

  if (results.every((r) => r.error)) {
    return <div className="p-8 text-center text-[#DC2626]">Error cargando datos.</div>
  }

  const applications: Application[] = results
    .flatMap((result, i) => {
      const source = SOURCES[i]
      if (result.error) {
        console.error(`[ADMIN_SOLICITUDES] Error querying ${source.table}:`, result.error)
        return []
      }
      return (result.data || []).map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        destination: source.destination,
        ...source.normalize(row),
      }))
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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
