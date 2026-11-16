import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid, normalizarEstudio, mapToQuoteBody } from '@/lib/cotizaciones-estudio'
import { PrintClient } from './PrintClient'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { cur?: string; rate?: string }
}) {
  if (!isUuid(params.id)) notFound()

  const { data } = await supabaseAdmin
    .from('cotizaciones_estudio')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) notFound()

  // Moneda opcional por query: ?cur=USD&rate=0.6778 (los montos guardados son AUD).
  const currency = searchParams?.cur === 'USD' ? 'USD' : 'AUD'
  const rate = Number(searchParams?.rate)
  const body = mapToQuoteBody(
    normalizarEstudio(data),
    currency === 'USD' && Number.isFinite(rate) && rate > 0 ? { currency: 'USD', rate } : { currency: 'AUD' },
  )
  return <PrintClient body={body} />
}
