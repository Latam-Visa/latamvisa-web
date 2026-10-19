import { NextResponse } from 'next/server'
import { CAMPO_HONEYPOT, solicitudSchema } from '@/lib/viajes/schema'
import { MENSAJE_SIN_RANGO, procesarSolicitud } from '@/lib/viajes/solicitud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* POST /api/viajes/cotizar — formulario "Dos Vacaciones" de /viajes.
   Al navegador solo vuelve el objeto `publico` del cotizador y las guías:
   las tarifas netas y el desglose se quedan en la base. */
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
  }

  // Honeypot: un bot lo llenó. Se responde como éxito para no darle pistas,
  // pero no se guarda nada.
  const trampa = (body as Record<string, unknown> | null)?.[CAMPO_HONEYPOT]
  if (typeof trampa === 'string' && trampa.trim() !== '') {
    console.warn('[VIAJES] Honeypot activado; solicitud descartada.')
    return NextResponse.json({ ok: true, solicitud_id: null, publico: null, guias: [], mensaje: MENSAJE_SIN_RANGO })
  }

  const parsed = solicitudSchema.safeParse(body)
  if (!parsed.success) {
    const campos: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const campo = issue.path.join('.') || '_'
      campos[campo] ??= issue.message
    }
    return NextResponse.json({ ok: false, error: 'Revisa los datos del formulario.', campos }, { status: 400 })
  }

  try {
    return NextResponse.json(await procesarSolicitud(parsed.data))
  } catch (e) {
    // procesarSolicitud ya intenta guardar o avisar; esto es la última red.
    console.error('[VIAJES] Error inesperado en /api/viajes/cotizar:', e)
    return NextResponse.json({ ok: true, solicitud_id: null, publico: null, guias: [], mensaje: MENSAJE_SIN_RANGO })
  }
}
