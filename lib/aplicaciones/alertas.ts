// Alerta por correo cuando algo falla al enviar un formulario de aplicación.
// Nunca lanza: una alerta que falla no puede tumbar el envío del cliente.
// No incluye contenido de documentos ni datos sensibles (pasaporte, etc.):
// solo formulario, paso, nombre/correo de contacto y el error.

import { resend } from '@/lib/resend'

const DESTINO = 'future@latamvisas.com.au'
const FROM = `LATAM VISA Alertas <${process.env.RESEND_FROM_EMAIL || 'noreply@latamvisatravel.com'}>`
const TIMEOUT_MS = 8000

export interface AlertaFormulario {
  formulario: string // 'Canadá'
  etapa: string // 'guardar', 'email-admin', 'cliente:red', ...
  paso?: string | number | null // paso del formulario donde estaba el cliente
  nombre?: string | null
  email?: string | null
  applicationId?: string | null
  error: unknown
  // Si el envío del cliente igual quedó guardado (para saber la urgencia).
  aplicacionGuardada?: boolean
  extra?: Record<string, string | number | boolean | null | undefined>
}

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function describirError(error: unknown): { mensaje: string; stack: string } {
  if (error instanceof Error) return { mensaje: error.message, stack: error.stack || '' }
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>
    return { mensaje: String(e.message ?? JSON.stringify(e)), stack: [e.code, e.details, e.hint].filter(Boolean).join(' | ') }
  }
  return { mensaje: String(error), stack: '' }
}

export async function alertarErrorFormulario(a: AlertaFormulario): Promise<void> {
  try {
    const { mensaje, stack } = describirError(a.error)
    const urgente = a.aplicacionGuardada === false
    const filas: [string, unknown][] = [
      ['Formulario', a.formulario],
      ['Etapa', a.etapa],
      ['Paso del cliente', a.paso],
      ['Hora (UTC)', new Date().toISOString()],
      ['Cliente', a.nombre],
      ['Email del cliente', a.email],
      ['ID de aplicación', a.applicationId],
      ['¿Aplicación guardada?', a.aplicacionGuardada == null ? 'desconocido' : a.aplicacionGuardada ? 'Sí' : 'NO'],
      ...Object.entries(a.extra ?? {}),
    ]
    const html = `
      <div style="font-family:Helvetica,Arial,sans-serif;color:#111;padding:16px">
        <h2 style="margin:0 0 12px;color:${urgente ? '#B91C1C' : '#111'}">${urgente ? '🚨 ' : '⚠️ '}Error en formulario ${esc(a.formulario)} (${esc(a.etapa)})</h2>
        <table style="border-collapse:collapse;font-size:14px">
          ${filas
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`)
            .join('')}
        </table>
        <h3 style="margin:20px 0 6px">Error</h3>
        <pre style="white-space:pre-wrap;background:#f5f5f0;padding:12px;border-radius:8px;font-size:12px">${esc(mensaje)}</pre>
        ${stack ? `<h3 style="margin:16px 0 6px">Stack</h3><pre style="white-space:pre-wrap;background:#f5f5f0;padding:12px;border-radius:8px;font-size:11px">${esc(stack.slice(0, 4000))}</pre>` : ''}
      </div>`

    const envio = resend.emails.send({
      from: FROM,
      to: DESTINO,
      subject: `${urgente ? '🚨 NO GUARDADA' : '⚠️'} Formulario ${a.formulario}: error en ${a.etapa}${a.nombre ? ` — ${a.nombre}` : ''}`,
      html,
    })
    await Promise.race([envio, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout alerta')), TIMEOUT_MS))])
  } catch (err) {
    console.error('[ALERTA] No se pudo enviar la alerta:', err)
  }
}
