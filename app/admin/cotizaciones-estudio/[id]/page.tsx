import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid, normalizarEstudio } from '@/lib/cotizaciones-estudio'
import { EditorClient } from './_components/EditorClient'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function EstudioDetallePage({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound()

  const { data, error } = await supabaseAdmin
    .from('cotizaciones_estudio')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    console.error('[COT-ESTUDIO] detalle:', error)
  }
  if (!data) notFound()

  const cotizacion = normalizarEstudio(data)

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cotizaciones-estudio"
          aria-label="Volver a la lista"
          className="flex shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white p-2 text-[#0A0A0A] transition-colors hover:border-[#0A0A0A]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="font-[PPMonumentExtended] text-xl font-bold text-[#0A0A0A]">
            {cotizacion.nombre || 'Nueva cotización'}
          </h2>
          <p className="text-xs text-[#6B6B6B]">Visa de estudiante · Subclass 500</p>
        </div>
      </div>

      <EditorClient inicial={cotizacion} />
    </div>
  )
}
