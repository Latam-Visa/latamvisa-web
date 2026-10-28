'use server'

import { resend } from '@/lib/resend'
import {
  CIUDADES_SALIDA,
  calcularEstimado,
  destinoPorSlug,
  formatAUD,
  type CiudadSalida,
  type Estimado,
} from '@/lib/viajes/rangos'

/* Cotizador de /viajes (Euro Trip): el cliente llena lo básico, recibe un
   estimado por rango en pantalla y un correo; a ustedes les llega el lead
   para mandar la cotización afinada en 24h.

   Manual por ahora: el estimado sale de lib/viajes/rangos.ts. No toca base de
   datos. El estimado que se muestra es el mismo que se envía por correo (una
   sola fuente de verdad, calculada acá en el servidor). */

export interface CotizarInput {
  nombre: string
  email: string
  whatsapp?: string
  ciudadSalida: string
  destinoSlug: string
  personas: number
  fechas?: string
}

export type CotizarResultado =
  | { ok: true; estimado: Estimado; destinoNombre: string }
  | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function esCiudad(v: string): v is CiudadSalida {
  return (CIUDADES_SALIDA as readonly string[]).includes(v)
}

export async function cotizarViaje(input: CotizarInput): Promise<CotizarResultado> {
  const nombre = (input.nombre || '').trim()
  const email = (input.email || '').trim()
  const whatsapp = (input.whatsapp || '').trim()
  const fechas = (input.fechas || '').trim()
  const personas = Math.max(1, Math.min(9, Math.floor(input.personas) || 1))

  // Validación mínima (sin zod para no arrastrar los errores viejos del repo).
  if (nombre.length < 2) return { ok: false, error: 'Dinos tu nombre.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Revisa tu correo.' }
  if (!esCiudad(input.ciudadSalida)) return { ok: false, error: 'Elige tu ciudad de salida.' }
  const destino = destinoPorSlug(input.destinoSlug)
  if (!destino) return { ok: false, error: 'Elige a qué país vas.' }

  const estimado = calcularEstimado(destino, personas)

  // Texto compartido por los dos correos.
  const porPersona = personas > 1 ? ` (${personas} personas)` : ''
  const resumenHtml = `
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#0b2a4a">
      <tr>
        <td style="padding:6px 14px 6px 0;color:#5b7187">Directo (Pacífico / vía USA)</td>
        <td style="padding:6px 0;font-weight:700">${formatAUD(estimado.directo.min)} – ${formatAUD(estimado.directo.max)}</td>
      </tr>
      <tr>
        <td style="padding:6px 14px 6px 0;color:#5b7187">Con parada en Europa</td>
        <td style="padding:6px 0;font-weight:700">${formatAUD(estimado.europa.min)} – ${formatAUD(estimado.europa.max)}</td>
      </tr>
      <tr>
        <td style="padding:6px 14px 6px 0;color:#5b7187">Diferencia (desde)</td>
        <td style="padding:6px 0;font-weight:700">~${formatAUD(estimado.diferenciaDesde)} por persona</td>
      </tr>
    </table>`

  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@latamvisatravel.com'
  const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || 'future@latamvisas.com.au'
  const tieneResend = Boolean(process.env.RESEND_API_KEY)

  // Correo al cliente: estimado + promesa de cotización afinada en 24h.
  const clienteHtml = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b2a4a">
      <h1 style="font-size:22px;margin:0 0 6px">Tu estimado para ${destino.nombre}</h1>
      <p style="margin:0 0 18px;color:#5b7187">1 viaje, 2 vacaciones — desde ${input.ciudadSalida}${porPersona}.</p>
      ${resumenHtml}
      <p style="margin:18px 0 0;font-size:14px;color:#5b7187">
        Es un <strong>estimado por rango</strong> (ida y vuelta, por persona). En las próximas
        <strong>24&nbsp;horas</strong> te enviamos una cotización afinada con fechas y aerolíneas reales.
      </p>
      <p style="margin:14px 0 0;font-size:13px;color:#8aa0b3">LATAM Travel — 1 viaje, 2 vacaciones.</p>
    </div>`

  // Correo interno: el lead, para poder cumplir el "en 24h".
  const adminHtml = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#0b2a4a">
      <h2 style="font-size:18px;margin:0 0 10px">✈️ Nueva cotización /viajes</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:3px 12px 3px 0;color:#5b7187">Nombre</td><td style="padding:3px 0"><strong>${nombre}</strong></td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#5b7187">Correo</td><td style="padding:3px 0">${email}</td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#5b7187">WhatsApp</td><td style="padding:3px 0">${whatsapp || '—'}</td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#5b7187">Sale de</td><td style="padding:3px 0">${input.ciudadSalida}</td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#5b7187">Destino</td><td style="padding:3px 0">${destino.nombre}</td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#5b7187">Personas</td><td style="padding:3px 0">${personas}</td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#5b7187">Fechas aprox.</td><td style="padding:3px 0">${fechas || '—'}</td></tr>
      </table>
      <div style="margin-top:12px">${resumenHtml}</div>
    </div>`

  // El estimado se muestra aunque el correo falle: calcularlo no depende del
  // envío. Si no hay RESEND_API_KEY (entornos sin configurar), igual responde.
  if (tieneResend) {
    const enviar = Promise.allSettled([
      resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `✈️ Cotización /viajes — ${nombre} → ${destino.nombre}`,
        html: adminHtml,
        replyTo: email,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Tu estimado para ${destino.nombre} — LATAM Travel`,
        html: clienteHtml,
      }),
    ])
    try {
      const res = await enviar
      res.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[VIAJES_COTIZAR] email ${i} falló`, r.reason)
      })
    } catch (e) {
      console.error('[VIAJES_COTIZAR] envío de correos falló', e)
    }
  } else {
    console.warn('[VIAJES_COTIZAR] RESEND_API_KEY ausente: se omite el envío de correos')
  }

  return { ok: true, estimado, destinoNombre: destino.nombre }
}
