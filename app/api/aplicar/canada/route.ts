import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { isUuid } from '@/lib/cotizaciones'
import { alertarErrorFormulario } from '@/lib/aplicaciones/alertas'
import { construirFila, contactoDe, guardarCanada, programarTareasCanada, type EnvioCanada } from '@/lib/aplicaciones/canada'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// La respuesta sale apenas se guarda; este margen es para las tareas en
// segundo plano (emails, PDF, carta con IA) que siguen vivas con waitUntil.
export const maxDuration = 60

const MAX_BODY = 1_000_000 // ~1 MB: solo viaja JSON con rutas de Storage, nunca archivos.

const respuesta = (status: number, body: Record<string, unknown>) => NextResponse.json(body, { status })

// Envío del formulario de Canadá: validar -> guardar -> responder. Todo lo
// demás corre después y no puede hacer fallar la respuesta.
export async function POST(req: Request) {
  let envio: EnvioCanada | null = null
  let paso: string | number | null = null
  let guardada = false

  try {
    const texto = await req.text()
    if (texto.length > MAX_BODY) {
      return respuesta(413, { success: false, errorCode: 'BODY_TOO_LARGE' })
    }
    const body = JSON.parse(texto)
    paso = typeof body?.paso === 'number' || typeof body?.paso === 'string' ? body.paso : null
    envio = { submissionId: body?.submissionId, data: body?.data, passportScanPath: body?.passportScanPath ?? null }

    // Validación mínima: lo necesario para poder contactar al cliente. El
    // formulario ya validó todo lo demás; aquí no se rechaza por detalles.
    const { nombre, email } = contactoDe(envio.data)
    if (!isUuid(String(envio.submissionId || '')) || !envio.data || typeof envio.data !== 'object' || (!email && !nombre)) {
      return respuesta(400, { success: false, errorCode: 'INVALID_PAYLOAD' })
    }

    const { fila, ajustes } = construirFila(envio)
    const guardado = await guardarCanada(envio, fila)

    if (!guardado.ok) {
      console.error('[CANADA] No se pudo guardar:', guardado.error)
      // Las alertas no retrasan la respuesta: siguen vivas con waitUntil.
      waitUntil(alertarErrorFormulario({
        formulario: 'Canadá',
        etapa: 'guardar en Supabase',
        paso,
        nombre,
        email,
        applicationId: envio.submissionId,
        error: guardado.error,
        aplicacionGuardada: false,
      }))
      return respuesta(503, { success: false, errorCode: 'SAVE_FAILED' })
    }

    guardada = true
    // Reintento o doble clic: ya estaba guardada, no se repiten emails.
    if (guardado.nueva) {
      if (guardado.emergencia || ajustes.length) {
        waitUntil(alertarErrorFormulario({
          formulario: 'Canadá',
          etapa: guardado.emergencia ? 'guardado de emergencia (datos rechazados)' : 'ajustes automáticos de datos',
          paso,
          nombre,
          email,
          applicationId: fila.id,
          error: new Error(guardado.emergencia ? 'La base rechazó un valor; se guardó el formulario completo en admin_notes.' : ajustes.join('\n')),
          aplicacionGuardada: true,
        }))
      }
      programarTareasCanada(envio, fila, guardado.emergencia)
    }

    return respuesta(200, { success: true, applicationId: fila.id, duplicate: !guardado.nueva })
  } catch (error) {
    console.error('[CANADA] Error inesperado en el envío:', error)
    const { nombre, email } = contactoDe(envio?.data)
    waitUntil(alertarErrorFormulario({
      formulario: 'Canadá',
      etapa: 'envío (error inesperado)',
      paso,
      nombre,
      email,
      applicationId: envio?.submissionId ?? null,
      error,
      aplicacionGuardada: guardada,
    }))
    // Si ya se guardó, para el cliente el envío fue exitoso.
    if (guardada && envio) return respuesta(200, { success: true, applicationId: envio.submissionId })
    return respuesta(500, { success: false, errorCode: 'UNEXPECTED' })
  }
}
