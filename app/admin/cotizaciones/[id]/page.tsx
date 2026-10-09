import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid, normalizarCotizacion } from '@/lib/cotizaciones'
import { CotizacionDetailClient } from './_components/CotizacionDetailClient'
import { anularCotizacion, enviarEmailAdmin, extenderCotizacion, marcarComisionPagada } from '../_actions/cotizaciones-actions'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function CotizacionDetailPage({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound()

  const { data } = await supabaseAdmin.from('cotizaciones').select('*').eq('id', params.id).maybeSingle()
  if (!data) notFound()

  const cot = normalizarCotizacion(data)

  let convenio: { nombre: string; whatsapp: string | null } | null = null
  if (cot.convenio_id) {
    const { data: c } = await supabaseAdmin.from('convenios').select('nombre, whatsapp').eq('id', cot.convenio_id).maybeSingle()
    convenio = c
  }

  return (
    <div className="space-y-6 max-w-[900px] mx-auto w-full pb-10">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/cotizaciones"
          aria-label="Volver a cotizaciones"
          className="flex items-center justify-center bg-white border border-[#E5E5E5] text-[#0A0A0A] p-2 rounded-lg hover:border-[#0A0A0A] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A]">Cotización {cot.numero}</h2>
          <p className="text-sm text-[#6B6B6B] break-words">{cot.cliente_nombre || 'Sin nombre'}</p>
        </div>
      </div>

      <CotizacionDetailClient
        cot={cot}
        convenioNombre={convenio?.nombre ?? null}
        acciones={{ anular: anularCotizacion, extender: extenderCotizacion, marcarComisionPagada, enviarEmail: enviarEmailAdmin }}
      />
    </div>
  )
}
