import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid, normalizarEstudio, mapToQuoteBody } from '@/lib/cotizaciones-estudio'
import { PrintClient } from './PrintClient'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function PrintPage({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound()

  const { data } = await supabaseAdmin
    .from('cotizaciones_estudio')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) notFound()

  const body = mapToQuoteBody(normalizarEstudio(data))
  return <PrintClient body={body} />
}
