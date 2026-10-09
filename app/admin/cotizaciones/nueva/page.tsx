import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { toNumber, type ConvenioTarifa } from '@/lib/cotizaciones'
import { GeneradorCotizacion } from '@/components/cotizacion/GeneradorCotizacion'
import { enviarEmailAdmin, generarCotizacionAdmin } from '../_actions/cotizaciones-actions'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function NuevaCotizacionPage() {
  const [{ data: convenios }, { data: tarifas }] = await Promise.all([
    supabaseAdmin.from('convenios').select('id, nombre, comision_por_persona').eq('activo', true).order('nombre'),
    supabaseAdmin.from('convenio_tarifas').select('*'),
  ])

  return (
    <div className="space-y-6 max-w-[720px] mx-auto w-full pb-10">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/cotizaciones"
          aria-label="Volver a cotizaciones"
          className="flex items-center justify-center bg-white border border-[#E5E5E5] text-[#0A0A0A] p-2 rounded-lg hover:border-[#0A0A0A] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A]">Nueva cotización</h2>
          <p className="text-sm text-[#6B6B6B]">Genera el link de pago y el PDF para el cliente.</p>
        </div>
      </div>

      <div className="font-funnel">
        <GeneradorCotizacion
          modo="admin"
          convenios={(convenios || []).map((c) => ({ id: c.id, nombre: c.nombre, comision_por_persona: toNumber(c.comision_por_persona) }))}
          tarifas={(tarifas || []) as ConvenioTarifa[]}
          generar={generarCotizacionAdmin}
          enviarEmail={enviarEmailAdmin}
        />
      </div>
    </div>
  )
}
