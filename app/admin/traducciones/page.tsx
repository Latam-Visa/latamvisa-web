import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { normalizeDocStatus } from '@/lib/traducciones/shared'
import { TraduccionesListClient, type LoteResumen } from './_components/TraduccionesListClient'

export const dynamic = 'force-dynamic'
/* Igual que en /admin/solicitudes: force-dynamic re-renderiza por request pero
   no desactiva el Data Cache de fetch para supabase-js. Sin esto, una lista
   abierta antes de que n8n insertara los documentos puede seguir sirviendo el
   snapshot vacío indefinidamente. */
export const fetchCache = 'force-no-store'

export default async function TraduccionesPage() {
  const { data: lotes, error } = await supabaseAdmin
    .from('lotes_traduccion')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[TRADUCCIONES] Error cargando lotes:', error)
    return (
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-6 text-sm text-red-700">
          No pudimos cargar las traducciones. Revisa que la tabla{' '}
          <code className="font-mono">lotes_traduccion</code> exista en Supabase.
        </div>
      </div>
    )
  }

  /* Un solo query para los documentos de todos los lotes, en vez de uno por
     fila: la lista puede crecer y N+1 queries la volverían lenta. */
  const ids = (lotes || []).map((l) => l.id)
  const conteos = new Map<string, { traducido: number; no_traducido: number; error: number }>()

  if (ids.length > 0) {
    const { data: docs } = await supabaseAdmin
      .from('documentos_traducidos')
      .select('application_id, status')
      .in('application_id', ids)

    for (const doc of docs || []) {
      const actual = conteos.get(doc.application_id) || { traducido: 0, no_traducido: 0, error: 0 }
      actual[normalizeDocStatus(doc.status)] += 1
      conteos.set(doc.application_id, actual)
    }
  }

  const resumenes: LoteResumen[] = (lotes || []).map((lote) => {
    const c = conteos.get(lote.id) || { traducido: 0, no_traducido: 0, error: 0 }
    return {
      id: lote.id,
      nombre_cliente: lote.nombre_cliente,
      pais: lote.pais,
      created_at: lote.created_at,
      traducidos: c.traducido,
      originales: c.no_traducido,
      conError: c.error,
    }
  })

  return (
    <div className="space-y-3 max-w-[1200px] mx-auto w-full pb-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link
          href="/admin"
          aria-label="Volver al inicio del admin"
          title="Volver al inicio del admin"
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-[#525252] hover:bg-[#F5F5F0] hover:text-[#0A0A0A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-[20px] leading-7 font-bold text-[#0A0A0A]">Traducciones</h1>
        <span className="text-[12px] text-[#6B6B6B]">
          {resumenes.length} {resumenes.length === 1 ? 'traducción' : 'traducciones'}
        </span>
        <Link
          href="/admin/traducciones/nueva"
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-bold bg-[#C8FF00] text-[#2F4A00] hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva traducción
        </Link>
      </div>

      <TraduccionesListClient lotes={resumenes} />
    </div>
  )
}
