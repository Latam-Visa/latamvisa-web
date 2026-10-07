// Lógica compartida de cotizaciones de convenios: la usan la página pública
// /pagar/[token], su server action de pago, el webhook de Stripe y el admin.
// Sin imports de servidor para que el formulario del admin pueda reutilizar
// el cálculo de tarifas en el cliente (el servidor lo vuelve a calcular).

export type EstadoCotizacion = 'pendiente' | 'pagada' | 'vencida' | 'anulada'

export interface Cotizacion {
  id: string
  numero: string
  token: string
  convenio_id: string | null
  cliente_nombre: string
  cliente_email: string | null
  cliente_whatsapp: string | null
  pais_destino: string
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
  pais_destino: string
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

export function labelPaisCotizacion(pais: string): string {
  return PAISES_COTIZACION.find((p) => p.value === pais)?.label ?? pais
}

// Precio de lista de traducción por persona: sirve para mostrar el ahorro
// ("antes $X, ¡ahorran $Y!") cuando el convenio da tarifa plana de grupo.
export const TRADUCCION_LISTA_POR_PERSONA = 50000

export const WHATSAPP_LATAM = '61426779734'
export const PUBLIC_SITE_URL = 'https://www.latamvisatravel.com'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

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

// es-CO pone un espacio duro entre "$" y la cifra ("$ 1.850.000"); se quita
// para mostrar "$1.850.000", como en el resto de nuestra comunicación.
export function formatMoney(monto: number, moneda = 'COP'): string {
  const texto = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: moneda === 'COP' ? 0 : 2,
  }).format(monto)
  return moneda === 'COP' ? texto.replace(/^(-?\$)[\s\u00a0]+/, '$1') : texto
}

const TZ = 'America/Bogota'

export function formatFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: TZ }).format(new Date(iso))
}

export function formatFechaHora(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ }).format(new Date(iso))
}

// Fin del día en Bogotá (UTC-5 todo el año, Colombia no tiene horario de
// verano) dentro de `dias` días. Así "válida hasta el 15 de octubre" cubre el
// 15 completo para el cliente.
export function finDelDiaBogota(dias: number, desde = new Date()): Date {
  const hoyBogota = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(desde) // YYYY-MM-DD
  const [y, m, d] = hoyBogota.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + dias, 23 + 5, 59, 59))
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

export interface MontosSugeridos {
  asesoria_total: number
  traducciones_total: number
  gobierno_estimado: number
  comision_total: number
  moneda: string
}

// Precarga del formulario del admin. Se ejecuta en el cliente (para mostrar
// el total en vivo) y otra vez en el servidor al guardar.
export function calcularMontos(
  personas: number,
  tarifa: ConvenioTarifa,
  comisionPorPersona: number,
): MontosSugeridos {
  const traduccionPlana =
    personas >= tarifa.grupo_minimo && tarifa.traduccion_grupo_plana != null
      ? toNumber(tarifa.traduccion_grupo_plana)
      : null

  return {
    asesoria_total: personas * toNumber(tarifa.asesoria_por_persona),
    traducciones_total: traduccionPlana ?? personas * toNumber(tarifa.traduccion_por_persona),
    gobierno_estimado: personas * toNumber(tarifa.gobierno_por_persona),
    comision_total: personas * toNumber(comisionPorPersona),
    moneda: tarifa.moneda || 'COP',
  }
}
