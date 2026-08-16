"use client"

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export interface Application {
  id: string
  created_at: string
  status: string
  destination: string
  fullName: string
  email: string
  visaType: string
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
    case 'nuevo':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
          <Clock className="w-3 h-3" /> {status === 'nuevo' ? 'Nuevo' : 'Pendiente'}
        </span>
      )
    case 'in-progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          <Loader2 className="w-3 h-3 animate-spin" /> En Proceso
        </span>
      )
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
          <CheckCircle className="w-3 h-3" /> Aprobada
        </span>
      )
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
          <XCircle className="w-3 h-3" /> Rechazada
        </span>
      )
    default:
      return <span className="text-[11px] text-[#6B6B6B]">{status}</span>
  }
}

export function ApplicationsListClient({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return <div className="p-8 text-center text-[#6B6B6B]">No hay solicitudes todavía.</div>
  }

  return (
    <div className="grid grid-cols-1 gap-3 pb-12">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center gap-4 px-5 pb-2 text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider border-b border-[#E5E5E5] mb-2">
        <div className="w-28 shrink-0">Fecha</div>
        <div className="w-56 shrink-0">Aplicante</div>
        <div className="w-24 shrink-0">Destino</div>
        <div className="flex-1 min-w-0">Tipo de Visa</div>
        <div className="w-28 shrink-0">Estado</div>
        <div className="w-10 shrink-0 text-right">Ver</div>
      </div>

      {applications.map((app, index) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link 
            href={`/admin/applications/${app.id}`}
            className="group block relative overflow-hidden bg-white rounded-xl border border-[#E5E5E5] p-5 md:py-4 md:px-5 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300 ease-out"
          >
            {/* Left Neon Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8FF00] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom" />

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              
              {/* Desktop Columns */}
              <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
                <div className="w-28 shrink-0 text-xs text-[#6B6B6B]">
                  {format(new Date(app.created_at), "d MMM, yyyy", { locale: es })}
                </div>
                <div className="w-56 shrink-0 pr-4">
                  <h3 className="text-sm font-bold text-[#0A0A0A] truncate">{app.fullName}</h3>
                  <p className="text-[11px] text-[#6B6B6B] truncate">{app.email}</p>
                </div>
                <div className="w-24 shrink-0">
                  <span className="font-bold text-[10px] uppercase tracking-wider bg-[#F5F5F0] text-[#0A0A0A] px-2 py-1 rounded-md border border-[#E5E5E5]">
                    {app.destination}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <span className="text-xs text-[#0A0A0A] font-medium truncate block" title={app.visaType}>
                    {app.visaType}
                  </span>
                </div>
                <div className="w-28 shrink-0">
                  <StatusBadge status={app.status} />
                </div>
                <div className="w-10 shrink-0 flex justify-end">
                  <div className="p-2 rounded-lg bg-[#FAFAF7] group-hover:bg-[#C8FF00] transition-colors">
                    <Eye className="w-4 h-4 text-[#0A0A0A]" />
                  </div>
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] uppercase tracking-wider bg-[#F5F5F0] text-[#0A0A0A] px-2 py-1 rounded-md border border-[#E5E5E5]">
                    {app.destination}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] truncate">{app.fullName}</h3>
                  <p className="text-xs text-[#6B6B6B] truncate">{app.email}</p>
                </div>

                <div className="flex items-center justify-between border-t border-[#F5F5F0] pt-3 mt-1">
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-[10px] text-[#6B6B6B] mb-0.5">{format(new Date(app.created_at), "d MMM yyyy", { locale: es })}</span>
                    <span className="text-xs text-[#0A0A0A] font-medium truncate block" title={app.visaType}>{app.visaType}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFAF7] shrink-0">
                    <Eye className="w-4 h-4 text-[#0A0A0A]" />
                  </div>
                </div>
              </div>

            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
