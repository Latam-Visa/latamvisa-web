/* Correo "Nuevo pago" al admin, armado desde la sesión de Stripe Checkout.
   Reemplaza al que mandaba n8n. Funciones puras para poder testearlas; el
   envío vive en app/api/stripe-webhook/route.ts. */

const PAISES: Record<string, string> = {
  usa: 'USA',
  canada: 'Canadá',
  uk: 'Reino Unido',
  australia: 'Australia',
  nz: 'Nueva Zelanda',
  japon: 'Japón',
  schengen: 'Schengen',
  cotizacion: 'Cotización',
}

export function nombrePais(destino: string | null | undefined): string {
  if (!destino) return 'Sin destino'
  return PAISES[destino] || destino
}

/* Para wa.me: solo dígitos con código de país, sin "+", espacios ni guiones.
   "+61 426 779 734" -> "61426779734". Un número que empieza en 0 se asume
   australiano ("0426…" -> "61426…"). "00" es prefijo internacional. Devuelve
   null si no queda un número plausible (8 a 15 dígitos, regla E.164). */
export function normalizarTelefonoWa(telefono: string | null | undefined): string | null {
  const crudo = (telefono || '').trim()
  if (!crudo) return null

  let digitos = crudo.replace(/\D/g, '')
  if (crudo.startsWith('+')) {
    // Ya trae código de país.
  } else if (digitos.startsWith('00')) {
    digitos = digitos.slice(2)
  } else if (digitos.startsWith('0')) {
    digitos = '61' + digitos.slice(1)
  }

  return digitos.length >= 8 && digitos.length <= 15 ? digitos : null
}

// Monedas sin decimales en Stripe: amount_total ya viene en unidades.
const SIN_DECIMALES = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'])

/* (19000, 'aud') -> "$190.00 AUD" */
export function formatearMonto(montoMinimo: number | null | undefined, moneda: string | null | undefined): string {
  const codigo = (moneda || '').toLowerCase()
  const sinDecimales = SIN_DECIMALES.has(codigo)
  const valor = (montoMinimo || 0) / (sinDecimales ? 1 : 100)
  const numero = valor.toLocaleString('en-US', {
    minimumFractionDigits: sinDecimales ? 0 : 2,
    maximumFractionDigits: sinDecimales ? 0 : 2,
  })
  return `$${numero} ${codigo.toUpperCase() || '—'}`.trim()
}

function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

export interface DatosPago {
  sessionId: string
  paymentIntentId?: string | null
  nombre?: string | null
  email?: string | null
  telefono?: string | null
  montoTotal?: number | null
  moneda?: string | null
  destino?: string | null
  metadata?: Record<string, string> | null
  // Payment Links: "Con traducción" / "Sin traducción".
  opcion?: string | null
  creadoEl?: Date
}

export function construirCorreoPagoAdmin(datos: DatosPago): { asunto: string; html: string } {
  const nombre = (datos.nombre || '').trim() || 'Cliente sin nombre'
  const primerNombre = nombre.split(/\s+/)[0]
  const pais = nombrePais(datos.destino)
  const monto = formatearMonto(datos.montoTotal, datos.moneda)
  const moneda = (datos.moneda || '').toUpperCase()
  const telefonoWa = normalizarTelefonoWa(datos.telefono)
  const m = datos.metadata || {}

  const asunto = `Nuevo pago ${pais} — ${monto} · ${nombre}`

  const saludo = `Hola ${primerNombre}, te escribo de LATAM VISA por tu pago de la asesoría de visa ${pais}. ¡Gracias por confiar en nosotros!`
  const linkWa = telefonoWa ? `https://wa.me/${telefonoWa}?text=${encodeURIComponent(saludo)}` : null
  const linkMail = datos.email
    ? `mailto:${datos.email}?subject=${encodeURIComponent(`Tu asesoría de visa ${pais} — LATAM VISA`)}`
    : null
  const linkStripe = datos.paymentIntentId
    ? `https://dashboard.stripe.com/payments/${datos.paymentIntentId}`
    : `https://dashboard.stripe.com/search?query=${encodeURIComponent(datos.sessionId)}`

  // Montos de metadata vienen en unidades de la moneda (p. ej. "190").
  const enMoneda = (v: string | undefined) => (v ? `${v} ${moneda}`.trim() : null)
  const descuento = m.descuento_aplicado && m.descuento_aplicado !== '0'
    ? `${enMoneda(m.descuento_aplicado)}${m.porcentaje_descuento ? ` (${m.porcentaje_descuento}%)` : ''}`
    : m.descuento_aplicado === '0' ? 'Sin descuento' : null

  const filas: [string, string | null][] = [
    ['Cliente', nombre],
    ['Email', datos.email || null],
    ['Teléfono', datos.telefono || null],
    ['Destino', pais],
    ...(datos.opcion ? [['Opción elegida', datos.opcion] as [string, string]] : []),
    ['Aplicantes', m.aplicantes || null],
    ['Precio original', enMoneda(m.precio_original)],
    ['Descuento', descuento],
    ['Total pagado', monto],
    ['Fecha', (datos.creadoEl || new Date()).toLocaleString('es-CO', { timeZone: 'Australia/Brisbane', dateStyle: 'medium', timeStyle: 'short' }) + ' (Brisbane)'],
  ]

  const fila = ([etiqueta, valor]: [string, string | null]) => `
        <tr>
          <td style="padding:6px 12px 6px 0;color:#6B6B6B;font-size:13px;width:130px;vertical-align:top;">${etiqueta}</td>
          <td style="padding:6px 0;color:#0A0A0A;font-size:14px;">${valor ? escaparHtml(valor) : '<span style="color:#A3A3A3;">—</span>'}</td>
        </tr>`

  const boton = (href: string, texto: string, fondo: string) => `
      <a href="${escaparHtml(href)}" style="display:inline-block;background:${fondo};color:#FFFFFF;padding:12px 20px;border-radius:8px;font-weight:bold;font-size:14px;text-decoration:none;margin:0 8px 8px 0;">${texto}</a>`

  const contacto = linkWa
    ? boton(linkWa, '💬 Escribirle por WhatsApp', '#0B7A3E')
    : `<p style="margin:0 0 12px;padding:10px 14px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;color:#92400E;font-size:14px;">
        Sin teléfono — responder por email${linkMail ? `: <a href="${escaparHtml(linkMail)}" style="color:#92400E;font-weight:bold;">${escaparHtml(datos.email!)}</a>` : ''}
      </p>`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#F5F5F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;">
    <div style="padding:20px 24px;border-bottom:3px solid #C8FF00;">
      <div style="font-size:12px;letter-spacing:1px;color:#2F4A00;font-weight:bold;">LATAM VISA · ADMIN</div>
      <div style="font-size:20px;color:#0A0A0A;font-weight:bold;margin-top:6px;">Nuevo pago ${escaparHtml(pais)}</div>
      <div style="font-size:24px;color:#2F4A00;font-weight:bold;margin-top:4px;">${escaparHtml(monto)}</div>
    </div>
    <div style="padding:20px 24px;">
      <table style="width:100%;border-collapse:collapse;">${filas.map(fila).join('')}
      </table>
    </div>
    <div style="padding:4px 24px 20px;">
      ${contacto}
      ${linkWa && linkMail ? boton(linkMail, '✉️ Responder por email', '#2F4A00') : ''}
      ${boton(linkStripe, 'Ver pago en Stripe', '#4B5A66')}
    </div>
    <div style="padding:12px 24px;background:#FAFAF7;border-top:1px solid #E5E5E5;color:#A3A3A3;font-size:11px;font-family:monospace;">
      ${escaparHtml(datos.sessionId)}
    </div>
  </div>
</body>
</html>`

  return { asunto, html }
}
