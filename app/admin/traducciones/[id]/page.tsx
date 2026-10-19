import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
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

  const documentos: TranslatedDocument[] = rows ? await signTranslatedRows(rows, lote.pais) : []

  /* Cuántos archivos subió el admin: es el denominador del aviso de
     "procesando". n8n escribe una fila por documento, así que mientras haya
     menos filas que archivos el lote sigue en proceso. */
  const { data: archivos } = await supabaseAdmin
    .storage
    .from(VISA_APPLICATIONS_BUCKET)
    .list(`manual/${params.id}`, { limit: 100 })

  const enStorage = (archivos || []).filter((f) => f.name && !f.name.startsWith('.')).length

  /* Cargados pero sin "Ya terminé" (enviado_at NULL): están en Storage pero n8n
     no los recibió, así que no cuentan para el aviso de "traduciendo". */
  const { data: pendientesDb, error: errorPendientes } = await supabaseAdmin
    .from('documentos_lote')
    .select('id')
    .eq('application_id', params.id)
    .is('enviado_at', null)
  if (errorPendientes) console.error('[TRADUCCIONES] Error contando pendientes:', errorPendientes)
  const pendientesIds = (pendientesDb || []).map((f) => f.id)
  const archivosSubidos = Math.max(0, enStorage - pendientesIds.length)

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-6">
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
        pendientesIds={pendientesIds}
      />
    </div>
  )
}
