import { NextResponse } from 'next/server'
import { alertarErrorFormulario } from '@/lib/aplicaciones/alertas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// El navegador reporta fallos que el servidor nunca ve (sin conexión,
// timeout, respuesta inesperada). Público: se acotan campos y frecuencia.
const FORMULARIOS = new Set(['Canadá'])
const VENTANA_MS = 10 * 60 * 1000
const MAX_POR_IP = 5
const recientes = new Map<string, number[]>()

const corto = (v: unknown, n = 300) => (v == null ? null : String(v).slice(0, n))

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  const ahora = Date.now()
  const lista = (recientes.get(ip) || []).filter((t) => ahora - t < VENTANA_MS)
  if (lista.length >= MAX_POR_IP) return NextResponse.json({ ok: false }, { status: 429 })
  recientes.set(ip, [...lista, ahora])

  try {
    const b = JSON.parse((await req.text()).slice(0, 5000))
    if (!FORMULARIOS.has(b?.formulario)) return NextResponse.json({ ok: false }, { status: 400 })
    await alertarErrorFormulario({
      formulario: b.formulario,
      etapa: `navegador: ${corto(b.etapa, 60)}`,
      paso: corto(b.paso, 20),
      nombre: corto(b.nombre, 120),
      email: corto(b.email, 200),
      applicationId: corto(b.submissionId, 60),
      error: new Error(corto(b.mensaje, 1500) || 'sin mensaje'),
      aplicacionGuardada: false,
      extra: { 'Navegador': corto(req.headers.get('user-agent'), 200) },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
