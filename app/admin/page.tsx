import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'

// Prevent caching for this route so data is always fresh
export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-[PPMonumentExtended]">Solicitudes USA</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <ApplicationsTable />
        </div>
      </div>
    </div>
  )
}

async function ApplicationsTable() {
  const [usaRes, canRes] = await Promise.all([
    supabaseAdmin.from('visa_applications_usa').select('id, created_at, status, data').order('created_at', { ascending: false }),
    supabaseAdmin.from('visa_applications_canada').select('id, created_at, status, data').order('created_at', { ascending: false })
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
    fullName: `${app.data?.step2?.given_name || ''} ${app.data?.step2?.surname || ''}`.trim() || '—',
    email: app.data?.step10?.email || '—',
    visaType: app.data?.step1?.apply_for || '—'
  }))

  const applications = [...usaApps, ...canApps].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (applications.length === 0) {
    return <div className="p-8 text-center text-[#525252]">No hay solicitudes todavía.</div>
  }

  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-[#F5F5F0] text-[#525252] border-b border-[#E5E5E5]">
        <tr>
          <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Fecha</th>
          <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Nombre Completo</th>
          <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Email</th>
          <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Destino</th>
          <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Estado</th>
          <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#E5E5E5]">
        {applications.map((app) => (
          <tr key={app.id} className="hover:bg-[#FAFAF7] transition-colors">
            <td className="px-6 py-4 text-[#525252]">
              {format(new Date(app.created_at), "d 'de' MMM, yyyy", { locale: es })}
            </td>
            <td className="px-6 py-4 font-medium text-[#0A0A0A]">
              {app.fullName}
            </td>
            <td className="px-6 py-4 text-[#525252]">
              {app.email}
            </td>
            <td className="px-6 py-4 text-[#525252]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs border border-[#E5E5E5] px-2 py-1 rounded bg-white text-black">{app.destination}</span>
                <span className="text-xs truncate max-w-[150px]" title={app.visaType}>{app.visaType}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={app.status} />
            </td>
            <td className="px-6 py-4 text-right">
              <Link 
                href={`/admin/applications/${app.id}`}
                className="inline-flex items-center justify-center bg-white border border-[#E5E5E5] text-[#0A0A0A] p-2 rounded-lg hover:border-[#0A0A0A] transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
    case 'nuevo':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
          <Clock className="w-3.5 h-3.5" /> {status === 'nuevo' ? 'Nuevo' : 'Pendiente'}
        </span>
      )
    case 'in-progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> En Proceso
        </span>
      )
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
          <CheckCircle className="w-3.5 h-3.5" /> Aprobada
        </span>
      )
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
          <XCircle className="w-3.5 h-3.5" /> Rechazada
        </span>
      )
    default:
      return <span className="text-xs text-[#525252]">{status}</span>
  }
}
