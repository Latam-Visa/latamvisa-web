import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid, nombreArchivoPdf, normalizarCotizacion } from '@/lib/cotizaciones'
import { generarPdfCotizacion } from '@/lib/cotizaciones/pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PDF generado al vuelo (nunca se guarda en Storage). El token es el mismo
// secreto que el link de pago, y el PDF no incluye convenio ni comisión.
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  if (!isUuid(params.token)) return new Response('No encontrado', { status: 404 })

  const { data } = await supabaseAdmin.from('cotizaciones').select('*').eq('token', params.token).maybeSingle()
  if (!data) return new Response('No encontrado', { status: 404 })

  const cot = normalizarCotizacion(data)
  try {
    const pdf = await generarPdfCotizacion(cot)
    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nombreArchivoPdf(cot.numero)}"`,
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (err) {
    console.error('[PDF] Error generando cotización', cot.numero, err)
    return new Response('No pudimos generar el PDF', { status: 500 })
  }
}
