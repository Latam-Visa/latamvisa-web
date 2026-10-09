// Lógica compartida de cotizaciones: la usan /pagar/[token], el portal de
// convenios, el admin, el PDF, el correo y el webhook de Stripe.
// Sin imports de servidor: el generador la usa también en el cliente.

export type EstadoCotizacion = 'pendiente' | 'pagada' | 'vencida' | 'anulada'
export type CreadaPor = 'admin' | 'convenio'

export interface Cotizacion {
  id: string
  numero: string
  token: string
  convenio_id: string | null
  cliente_nombre: string | null
  cliente_email: string | null
  cliente_whatsapp: string | null
  tipo_visa: string
  pais_destino: string
  pais_origen: string
  tiene_visa_usa: boolean | null
  personas: number
  moneda: string
  asesoria_total: number
  traducciones_total: number
  // Columna GENERADA (asesoria_total + traducciones_total). Nunca se escribe.
  monto: number
  // Informativo: lo paga el cliente al gobierno, jamás se cobra en Stripe.
  gobierno_estimado: number
  comision_total: number
  estado: EstadoCotizacion
  vence_el: string
  stripe_session_id: string | null
  pagada_el: string | null
  comision_pagada_el: string | null
  creada_por: CreadaPor
  email_enviado_a: string | null
  email_enviado_el: string | null
  notas: string | null
  created_at: string
}

export interface Convenio {
  id: string
  slug: string
  nombre: string
  whatsapp: string | null
  comision_por_persona: number
  activo: boolean
}

export interface ConvenioTarifa {
  convenio_id: string
  tipo_visa: string
  pais_destino: string
  pais_origen: string
  moneda: string
  asesoria_por_persona: number
  traduccion_por_persona: number
  traduccion_grupo_plana: number | null
  grupo_minimo: number
  gobierno_por_persona: number
}

export const PAISES_COTIZACION = [
  { value: 'canada', label: 'Canadá' },
  { value: 'usa', label: 'Estados Unidos' },
  { value: 'uk', label: 'Reino Unido' },
  { value: 'australia', label: 'Australia' },
  { value: 'nz', label: 'Nueva Zelanda' },
  { value: 'japon', label: 'Japón' },
  { value: 'schengen', label: 'Schengen' },
] as const

const TIPOS_VISA: Record<string, string> = { turismo: 'Turismo', estudio: 'Estudio', trabajo: 'Trabajo' }

const PAISES_ORIGEN: Record<string, string> = {
  colombia: 'Colombia',
  mexico: 'México',
  peru: 'Perú',
  chile: 'Chile',
  argentina: 'Argentina',
  ecuador: 'Ecuador',
  venezuela: 'Venezuela',
}

function capitalizar(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function labelPaisCotizacion(pais: string): string {
  return PAISES_COTIZACION.find((p) => p.value === pais)?.label ?? capitalizar(pais)
}

export function labelTipoVisa(tipo: string): string {
  return TIPOS_VISA[tipo] ?? capitalizar(tipo)
}

export function labelPaisOrigen(pais: string): string {
  return PAISES_ORIGEN[pais] ?? capitalizar(pais)
}

// "Turismo · Canadá": etiqueta del selector de visa.
export function labelVisa(tipo: string, destino: string): string {
  return `${labelTipoVisa(tipo)} · ${labelPaisCotizacion(destino)}`
}

// Máximo de personas por cotización (formulario y servidor).
export const MAX_PERSONAS = 20
export const VIGENCIA_DIAS = 7

export const WHATSAPP_LATAM = '61426779734'
export const PUBLIC_SITE_URL = 'https://www.latamvisatravel.com'

export function linkPago(token: string): string {
  return `${PUBLIC_SITE_URL}/pagar/${token}`
}

export function linkPdf(token: string): string {
  return `/api/cotizaciones/${token}/pdf`
}

// "#000001" -> "Cotizacion-000001-LATAM-VISA.pdf"
export function nombreArchivoPdf(numero: string): string {
  return `Cotizacion-${numero.replace('#', '')}-LATAM-VISA.pdf`
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Supabase devuelve `numeric` como number en JSON, pero lo normalizamos por si
// llega como string (pasa con valores muy grandes).
export function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : (value as number)
  return Number.isFinite(n) ? n : 0
}

export function normalizarCotizacion(row: any): Cotizacion {
  return {
    ...row,
    personas: toNumber(row.personas),
    asesoria_total: toNumber(row.asesoria_total),
    traducciones_total: toNumber(row.traducciones_total),
    monto: toNumber(row.monto),
    gobierno_estimado: toNumber(row.gobierno_estimado),
    comision_total: toNumber(row.comision_total),
  }
}

// Única regla de "se puede pagar": la usan la página y la server action.
export function esPagable(c: Pick<Cotizacion, 'estado' | 'vence_el'>, ahora = new Date()): boolean {
  return c.estado === 'pendiente' && new Date(c.vence_el).getTime() > ahora.getTime()
}

// Estado que ve el usuario: una pendiente con vence_el en el pasado ya está
// vencida aunque nadie haya actualizado la fila.
export function estadoEfectivo(c: Pick<Cotizacion, 'estado' | 'vence_el'>, ahora = new Date()): EstadoCotizacion {
  if (c.estado === 'pendiente' && !esPagable(c, ahora)) return 'vencida'
  return c.estado
}

// Formato de dinero ÚNICO para web, PDF, correo y WhatsApp: "$1.850.000".
// es-CO pone un espacio duro entre "$" y la cifra; se quita para COP.
export function formatMoney(monto: number, moneda = 'COP'): string {
  const texto = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: moneda === 'COP' ? 0 : 2,
  }).format(monto)
  return moneda === 'COP' ? texto.replace(/^(-?\$)[\s ]+/, '$1') : texto
}

const TZ = 'America/Bogota'

export function formatFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: TZ }).format(new Date(iso))
}

export function formatFechaHora(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ }).format(new Date(iso))
}

/**
 * Convierte un monto a la unidad mínima que espera Stripe en `unit_amount`.
 *
 * Regla de Stripe (https://docs.stripe.com/currencies):
 * - "Currencies are two-decimal currencies unless otherwise specified." COP
 *   NO está en la lista de zero-decimal ni en los casos especiales (ISK, HUF,
 *   TWD, UGX), así que se envía en centavos: $1.850.000 COP -> 185000000.
 *   AUD también es de dos decimales.
 * - Mínimo: la cuenta es australiana y liquida en AUD, y "charges requiring
 *   conversion into your account's default settlement currency must meet the
 *   equivalent minimum of the settlement currency" -> el equivalente a
 *   AUD 0.50 (unos COP 1.300). Cualquier cotización real lo supera de sobra.
 * - Máximo con tarjeta: 12 dígitos en unidad mínima, pero American Express
 *   solo acepta 9 (COP 9.999.999,99). Por encima de eso, Amex rechaza.
 *
 * Confirmado contra la cuenta: country AU, default_currency aud,
 * card_payments activo; COP es moneda de presentación soportada para cuentas
 * australianas.
 */
const MONEDAS_DOS_DECIMALES = new Set(['COP', 'AUD', 'USD'])

export function toStripeAmount(monto: number, moneda: string): number {
  const code = moneda.toUpperCase()
  if (!MONEDAS_DOS_DECIMALES.has(code)) {
    throw new Error(`Moneda no soportada para cobro: ${moneda}`)
  }
  return Math.round(monto * 100)
}

export interface Montos {
  asesoria_total: number
  traducciones_total: number
  gobierno_estimado: number
  comision_total: number
}

// Cálculo de montos desde la tarifa del convenio. El generador lo usa como
// vista previa; el servidor lo vuelve a ejecutar y es el que vale.
export function calcularMontos(personas: number, tarifa: ConvenioTarifa, comisionPorPersona: number): Montos {
  const plana =
    personas >= toNumber(tarifa.grupo_minimo) && tarifa.traduccion_grupo_plana != null
      ? toNumber(tarifa.traduccion_grupo_plana)
      : null

  return {
    asesoria_total: personas * toNumber(tarifa.asesoria_por_persona),
    traducciones_total: plana ?? personas * toNumber(tarifa.traduccion_por_persona),
    gobierno_estimado: personas * toNumber(tarifa.gobierno_por_persona),
    comision_total: personas * toNumber(comisionPorPersona),
  }
}

export interface Desglose {
  asesoriaPorPersona: number
  // Valor de lista de las traducciones; null si no hubo descuento.
  traduccionAntes: number | null
  ahorroTraduccion: number
  totalConGobierno: number
  valorRealPorPersona: number
}

// Números derivados de la tabla de precios. Web y PDF usan esta función para
// que nunca muestren cifras distintas.
export function desglosePrecios(
  c: Pick<Cotizacion, 'personas' | 'asesoria_total' | 'traducciones_total' | 'monto' | 'gobierno_estimado'>,
  traduccionPorPersona: number | null,
): Desglose {
  const personas = Math.max(1, c.personas)
  const lista = traduccionPorPersona != null ? personas * traduccionPorPersona : null
  const ahorro = lista != null ? lista - c.traducciones_total : 0
  const totalConGobierno = c.monto + c.gobierno_estimado
  return {
    asesoriaPorPersona: Math.round(c.asesoria_total / personas),
    traduccionAntes: ahorro > 0 ? lista : null,
    ahorroTraduccion: Math.max(0, ahorro),
    totalConGobierno,
    valorRealPorPersona: Math.round(totalConGobierno / personas),
  }
}

// Mensaje de WhatsApp (sin número: el usuario elige el chat).
export function urlWhatsAppCotizacion(c: Pick<Cotizacion, 'cliente_nombre' | 'numero' | 'monto' | 'moneda' | 'token'>): string {
  const saludo = c.cliente_nombre ? `Hola ${c.cliente_nombre}` : 'Hola'
  const texto = [
    `${saludo}, aquí está la cotización ${c.numero} de LATAM VISA.`,
    `Para empezar: ${formatMoney(c.monto, c.moneda)}.`,
    `Revísala y paga aquí: ${linkPago(c.token)}`,
  ].join('\n')
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}
