// Núcleo de servidor de las cotizaciones. Lo usan las server actions del
// admin y del portal de convenios; cada una verifica antes quién llama.

import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import {
  EMAIL_RE,
  MAX_PERSONAS,
  VIGENCIA_DIAS,
  calcularMontos,
  formatFecha,
  formatMoney,
  labelPaisCotizacion,
  linkPago,
  nombreArchivoPdf,
  normalizarCotizacion,
  toNumber,
  type Cotizacion,
  type CreadaPor,
  type Montos,
} from '.'
import { getContenido } from './contenido'
import { cargarTarifa } from './tarifas'
import { generarPdfCotizacion } from './pdf'

const MAX_MONTO = 99_999_999 // Límite de Stripe para COP: 10 dígitos en centavos.
export const MAX_EMAILS_POR_CONVENIO_DIA = 20
const ESPERA_REENVIO_MS = 60 * 1000

export interface GenerarInput {
  tipo_visa: string
  pais_destino: string
  pais_origen: string
  personas: number
  tiene_visa_usa: boolean
  cliente_nombre?: string | null
}

// Lo que ve quien generó la cotización (admin o convenio).
export interface CotizacionGenerada {
  id: string
  numero: string
  token: string
  cliente_nombre: string | null
  monto: number
  moneda: string
  comision_total: number | null
}

type Resultado<T> = { success: true } & T | { success: false; error: string }

function montoValido(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const n = toNumber(valor)
  if (!Number.isInteger(n) || n < 0 || n > MAX_MONTO) return null
  return n
}

/**
 * Crea una cotización. Los montos SIEMPRE se calculan aquí desde la tarifa;
 * `ajustes` solo existe para el admin (nunca se pasa desde el portal).
 */
export async function crearCotizacion(opts: {
  convenioId: string | null
  creadaPor: CreadaPor
  input: GenerarInput
  ajustes?: Partial<Montos> | null
}): Promise<Resultado<{ cotizacion: CotizacionGenerada }>> {
  const { convenioId, creadaPor, input, ajustes } = opts

  const personas = Math.trunc(toNumber(input.personas))
  if (personas < 1 || personas > MAX_PERSONAS) {
    return { success: false, error: `El número de personas debe estar entre 1 y ${MAX_PERSONAS}.` }
  }
  if (typeof input.tiene_visa_usa !== 'boolean') {
    return { success: false, error: 'Indica si tienen visa americana aprobada.' }
  }
  const tipo = String(input.tipo_visa || '')
  const destino = String(input.pais_destino || '')
  const origen = String(input.pais_origen || '')
  if (!tipo || !destino || !origen) return { success: false, error: 'Elige la visa y el país desde donde aplican.' }

  const nombre = input.cliente_nombre?.trim().slice(0, 120) || null

  let montos: Montos
  let moneda = 'COP'

  if (convenioId) {
    const { data: convenio } = await supabaseAdmin
      .from('convenios')
      .select('id, activo, comision_por_persona')
      .eq('id', convenioId)
      .maybeSingle()
    if (!convenio || !convenio.activo) return { success: false, error: 'El convenio no existe o no está activo.' }

    const tarifa = await cargarTarifa(convenioId, tipo, destino, origen)
    if (!tarifa) return { success: false, error: 'No hay tarifa para esa visa y país. Elige otra combinación.' }

    montos = calcularMontos(personas, tarifa, toNumber(convenio.comision_por_persona))
    moneda = tarifa.moneda || 'COP'
  } else {
    // Directo: no hay tarifa ni comisión; el admin ingresa los montos.
    montos = { asesoria_total: 0, traducciones_total: 0, gobierno_estimado: 0, comision_total: 0 }
  }

  if (ajustes) {
    montos = {
      asesoria_total: montoValido(ajustes.asesoria_total) ?? montos.asesoria_total,
      traducciones_total: montoValido(ajustes.traducciones_total) ?? montos.traducciones_total,
      gobierno_estimado: montoValido(ajustes.gobierno_estimado) ?? montos.gobierno_estimado,
      comision_total: convenioId ? montoValido(ajustes.comision_total) ?? montos.comision_total : 0,
    }
  }

  if (montos.asesoria_total <= 0) {
    return { success: false, error: convenioId ? 'La asesoría debe ser mayor a cero.' : 'Para una cotización directa ingresa los montos.' }
  }
  if (montos.asesoria_total + montos.traducciones_total > MAX_MONTO) {
    return { success: false, error: 'El monto a cobrar es demasiado alto.' }
  }

  // numero, token y monto (columna generada) los pone la base de datos.
  const { data, error } = await supabaseAdmin
    .from('cotizaciones')
    .insert({
      convenio_id: convenioId,
      creada_por: creadaPor,
      tipo_visa: tipo,
      pais_destino: destino,
      pais_origen: origen,
      tiene_visa_usa: input.tiene_visa_usa,
      personas,
      moneda,
      cliente_nombre: nombre,
      ...montos,
      vence_el: new Date(Date.now() + VIGENCIA_DIAS * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id, numero, token, cliente_nombre, monto, moneda, comision_total')
    .single()

  if (error || !data) {
    console.error('[COTIZACIONES] Error creando cotización:', error)
    return { success: false, error: 'No pudimos crear la cotización. Intenta de nuevo.' }
  }

  return {
    success: true,
    cotizacion: {
      id: data.id,
      numero: data.numero,
      token: data.token,
      cliente_nombre: data.cliente_nombre,
      monto: toNumber(data.monto),
      moneda: data.moneda,
      comision_total: convenioId ? toNumber(data.comision_total) : null,
    },
  }
}

export async function cargarCotizacion(id: string): Promise<Cotizacion | null> {
  const { data } = await supabaseAdmin.from('cotizaciones').select('*').eq('id', id).maybeSingle()
  return data ? normalizarCotizacion(data) : null
}

function inicioDelDiaBogota(): string {
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date()) // YYYY-MM-DD
  return new Date(`${hoy}T00:00:00-05:00`).toISOString()
}

// Cotizaciones del convenio con correo enviado hoy (hora de Bogotá).
export async function emailsEnviadosHoy(convenioId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from('cotizaciones')
    .select('id', { count: 'exact', head: true })
    .eq('convenio_id', convenioId)
    .gte('email_enviado_el', inicioDelDiaBogota())
  return count || 0
}

function htmlCorreo(c: Cotizacion, nombreVisa: string): string {
  const saludo = c.cliente_nombre ? `Hola ${c.cliente_nombre},` : 'Hola,'
  const link = linkPago(c.token)
  return `
  <div style="background-color:#FAFAF7;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#0d2b0d;line-height:1.6;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E5E0;border-radius:16px;padding:32px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#2F4A00;font-weight:bold;">Cotización ${c.numero}</p>
      <h1 style="margin:0 0 20px;font-size:22px;color:#0d2b0d;">${saludo}</h1>
      <p style="margin:0 0 16px;font-size:16px;">Te enviamos la propuesta para tu ${nombreVisa.toLowerCase()} (grupo de ${c.personas} ${c.personas === 1 ? 'persona' : 'personas'}). Adjuntamos el PDF con todo el detalle.</p>
      <p style="margin:0 0 4px;font-size:14px;color:#2F4A00;font-weight:bold;">Para empezar</p>
      <p style="margin:0 0 16px;font-size:28px;font-weight:bold;color:#0d2b0d;">${formatMoney(c.monto, c.moneda)}</p>
      <p style="margin:0 0 28px;font-size:14px;">Válida hasta el ${formatFecha(c.vence_el)}.</p>
      <p style="margin:0 0 28px;text-align:center;">
        <a href="${link}" style="display:inline-block;background:#C8FF00;color:#0d2b0d;text-decoration:none;font-weight:bold;padding:16px 32px;border-radius:12px;font-size:15px;text-transform:uppercase;letter-spacing:1px;">Ver cotización y pagar</a>
      </p>
      <p style="margin:0;font-size:13px;color:#4A5A4A;">¿Preguntas? Responde este correo o escríbenos por WhatsApp.</p>
      <p style="margin:16px 0 0;font-size:14px;font-weight:bold;color:#2F4A00;">Equipo LATAM VISA</p>
    </div>
  </div>`
}

/**
 * Envía la cotización por correo con el PDF adjunto y guarda a quién y
 * cuándo. `convenioId` restringe el envío a cotizaciones de ese convenio y
 * aplica el límite diario (portal); el admin pasa null.
 */
export async function enviarCotizacionPorEmail(opts: {
  cotizacionId: string
  email: string
  convenioId: string | null
}): Promise<Resultado<{ enviadoA: string }>> {
  const email = String(opts.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 200) return { success: false, error: 'Escribe un correo válido.' }

  const cot = await cargarCotizacion(opts.cotizacionId)
  if (!cot || (opts.convenioId && cot.convenio_id !== opts.convenioId)) {
    return { success: false, error: 'No encontramos la cotización.' }
  }
  if (cot.estado === 'anulada') return { success: false, error: 'La cotización está anulada.' }

  if (cot.email_enviado_el && Date.now() - new Date(cot.email_enviado_el).getTime() < ESPERA_REENVIO_MS) {
    return { success: false, error: 'Espera un minuto antes de volver a enviar esta cotización.' }
  }

  if (opts.convenioId) {
    const enviados = await emailsEnviadosHoy(opts.convenioId)
    if (enviados >= MAX_EMAILS_POR_CONVENIO_DIA) {
      return { success: false, error: `Llegaste al límite de ${MAX_EMAILS_POR_CONVENIO_DIA} correos por día. Usa WhatsApp o inténtalo mañana.` }
    }
  }

  const contenido = getContenido(cot.tipo_visa, cot.pais_destino, cot.pais_origen)
  const nombreVisa = contenido?.nombreVisa ?? `Visa de turismo ${labelPaisCotizacion(cot.pais_destino)}`

  let pdf: Buffer
  try {
    pdf = await generarPdfCotizacion(cot)
  } catch (err) {
    console.error('[COTIZACIONES] Error generando PDF para correo:', err)
    return { success: false, error: 'No pudimos generar el PDF. Intenta de nuevo.' }
  }

  const from = `LATAM VISA <${process.env.RESEND_FROM_EMAIL || 'noreply@latamvisatravel.com'}>`
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Tu cotización ${cot.numero} – Visa de turismo ${labelPaisCotizacion(cot.pais_destino)} | LATAM VISA`,
    html: htmlCorreo(cot, nombreVisa),
    attachments: [{ filename: nombreArchivoPdf(cot.numero), content: pdf }],
  })

  if (error) {
    console.error('[COTIZACIONES] Error enviando correo:', error)
    return { success: false, error: 'No pudimos enviar el correo. Revisa la dirección e intenta de nuevo.' }
  }

  await supabaseAdmin
    .from('cotizaciones')
    .update({ email_enviado_a: email, email_enviado_el: new Date().toISOString(), cliente_email: cot.cliente_email ?? email })
    .eq('id', cot.id)

  return { success: true, enviadoA: email }
}
