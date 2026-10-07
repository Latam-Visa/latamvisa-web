import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { normalizarCotizacion } from '@/lib/cotizaciones'
import { CotizacionesListClient, type ResumenConvenio } from './_components/CotizacionesListClient'

export const dynamic = 'force-dynamic'
// Mismo motivo que en /admin/traducciones: sin esto supabase-js puede servir
// un snapshot cacheado y no se vería un pago recién confirmado.
export const fetchCache = 'force-no-store'

export default async function CotizacionesPage() {
  const [{ data: filas, error }, { data: convenios }] = await Promise.all([
    supabaseAdmin.from('cotizaciones').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('convenios').select('id, nombre').order('nombre'),
  ])

  if (error) {
    console.error('[COTIZACIONES] Error cargando cotizaciones:', error)
    return (
      <div className="max-w-[1100px] mx-auto w-full">
        <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-6 text-sm text-red-700">
          No pudimos cargar las cotizaciones. Revisa que la tabla <code className="font-mono">cotizaciones</code> exista en Supabase.
        </div>
      </div>
    )
  }

  const cotizaciones = (filas || []).map(normalizarCotizacion)
  const nombres = new Map((convenios || []).map((c) => [c.id, c.nombre as string]))

  // Resumen de comisiones por convenio (solo cuentan las pagadas).
  const resumen = new Map<string, ResumenConvenio>()
  for (const c of cotizaciones) {
    if (!c.convenio_id || c.estado !== 'pagada') continue
    const r = resumen.get(c.convenio_id) || {
      convenio_id: c.convenio_id,
      nombre: nombres.get(c.convenio_id) || 'Convenio',
      pagadas: 0,
      comision_total: 0,
      comision_pendiente: 0,
    }
    r.pagadas += 1
    r.comision_total += c.comision_total
    if (!c.comision_pagada_el) r.comision_pendiente += c.comision_total
    resumen.set(c.convenio_id, r)
  }

  return (
    <div className="space-y-8 max-w-[1100px] mx-auto w-full pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Link
            href="/admin"
            aria-label="Volver al inicio del admin"
            className="flex items-center justify-center bg-white border border-[#E5E5E5] text-[#0A0A0A] p-2 rounded-lg hover:border-[#0A0A0A] transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A]">Cotizaciones</h2>
            <p className="text-sm text-[#6B6B6B]">
              {cotizaciones.length} {cotizaciones.length === 1 ? 'cotización' : 'cotizaciones'} en total
            </p>
          </div>
        </div>

        <Link
          href="/admin/cotizaciones/nueva"
          className="inline-flex items-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#b8ef00] transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Nueva cotización
        </Link>
      </div>

      <CotizacionesListClient
        cotizaciones={cotizaciones}
        convenios={(convenios || []).map((c) => ({ id: c.id, nombre: c.nombre }))}
        resumen={Array.from(resumen.values())}
      />
    </div>
  )
}
