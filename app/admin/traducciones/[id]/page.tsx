import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { signTranslatedRows } from '@/lib/traducciones/dispatch'
import { VISA_APPLICATIONS_BUCKET, type TranslatedDocument } from '@/lib/traducciones/shared'
import { LoteDetailClient } from './_components/LoteDetailClient'

export const dynamic = 'force-dynamic'
/* Sin esto, una página abierta mientras n8n todavía procesa puede quedarse
   sirviendo el snapshot vacío del Data Cache aunque la DB ya tenga las filas
   — que es exactamente el caso acá, porque el pipeline tarda ~15 minutos. */
export const fetchCache = 'force-no-store'

export default async function LoteDetallePage({ params }: { params: { id: string } }) {
  const { data: lote, error } = await supabaseAdmin
    .from('lotes_traduccion')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !lote) notFound()

  const { data: rows } = await supabaseAdmin
    .from('documentos_traducidos')
    .select('*')
    .eq('application_id', params.id)
    .order('created_at', { ascending: false })

  const documentos: TranslatedDocument[] = rows ? await signTranslatedRows(rows) : []

  /* Cuántos archivos subió el admin: es el denominador del aviso de
     "procesando". n8n escribe una fila por documento, así que mientras haya
     menos filas que archivos el lote sigue en proceso. */
  const { data: archivos } = await supabaseAdmin
    .storage
    .from(VISA_APPLICATIONS_BUCKET)
    .list(`manual/${params.id}`, { limit: 100 })

  const archivosSubidos = (archivos || []).filter((f) => f.name && !f.name.startsWith('.')).length

  return (
    <div className="space-y-6 max-w-[900px] mx-auto w-full pb-10">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/traducciones"
          aria-label="Volver a traducciones"
          className="flex items-center justify-center bg-white border border-[#E5E5E5] text-[#0A0A0A] p-2 rounded-lg hover:border-[#0A0A0A] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] min-w-0 break-words">
          Traducción
        </h2>
      </div>

      <LoteDetailClient
        lote={{
          id: lote.id,
          nombre_cliente: lote.nombre_cliente,
          pais: lote.pais,
          notas: lote.notas,
          created_at: lote.created_at,
        }}
        documentos={documentos}
        archivosSubidos={archivosSubidos}
      />
    </div>
  )
}
