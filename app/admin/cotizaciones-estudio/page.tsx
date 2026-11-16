import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { normalizarEstudio } from '@/lib/cotizaciones-estudio'
import { ListaClient } from './_components/ListaClient'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function CotizacionesEstudioPage() {
  const { data: filasRaw, error } = await supabaseAdmin
    .from('cotizaciones_estudio')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[COT-ESTUDIO] listar:', error)
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="rounded-xl border border-red-200 bg-[#FEF2F2] p-6 text-sm text-red-700">
          No pudimos cargar las cotizaciones de estudio. Revisa que la tabla{' '}
          <code className="font-mono">cotizaciones_estudio</code> exista en Supabase.
        </div>
      </div>
    )
  }

  const filas = (filasRaw || []).map(normalizarEstudio)
  const colegios = Array.from(new Set(filas.map((f) => f.colegio).filter(Boolean) as string[])).sort()

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-8 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <Link
            href="/admin"
            aria-label="Volver al inicio del admin"
            className="flex shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white p-2 text-[#0A0A0A] transition-colors hover:border-[#0A0A0A]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="font-[PPMonumentExtended] text-2xl font-bold text-[#0A0A0A]">Cotizaciones Estudio</h2>
            <p className="text-sm text-[#6B6B6B]">
              {filas.length} {filas.length === 1 ? 'cotización' : 'cotizaciones'} · Visa de estudiante (Subclass 500)
            </p>
          </div>
        </div>

        <Link
          href="/admin/cotizaciones-estudio/nueva"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C8FF00] px-4 py-2.5 text-sm font-bold text-[#2F4A00] transition-colors hover:bg-[#b8ef00]"
        >
          <Plus className="h-4 w-4" />
          Nueva cotización
        </Link>
      </div>

      <ListaClient filas={filas} colegios={colegios} />
    </div>
  )
}
