// Desbloqueo de /admin/deadlines (segundo candado, solo para el dueño).
//
// - La contraseña (ADMIN_OWNER_PASSWORD) se compara en tiempo constante.
// - La cookie NO guarda la contraseña: guarda una expiración firmada con
//   HMAC-SHA256 (DEADLINES_SECRET). Cambiar el secreto invalida todas.
// - Va encima del candado normal del admin (cookie admin_auth), que no se toca.

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const COOKIE_DESBLOQUEO = 'deadlines_unlock'
export const DURACION_MS = 30 * 24 * 60 * 60 * 1000 // 30 días

const VERSION = 'v1'

function secreto(): string | null {
  const s = process.env.DEADLINES_SECRET?.trim()
  return s && s.length >= 16 ? s : null
}

function firmar(payload: string, clave: string): string {
  return createHmac('sha256', clave).update(payload).digest('base64url')
}

// Comparación en tiempo constante aunque los largos difieran: se comparan
// los hashes (siempre 32 bytes), no los textos.
function igualesSeguro(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function configuracionCompleta(): boolean {
  return Boolean(secreto() && process.env.ADMIN_OWNER_PASSWORD?.trim())
}

export function passwordDelDuenoCorrecta(intento: string): boolean {
  const real = process.env.ADMIN_OWNER_PASSWORD?.trim()
  if (!real || !secreto()) return false
  return igualesSeguro(intento, real)
}

// Valor de la cookie: "v1.<expiraEnMs>.<firma>"
export function crearValorCookie(ahora = Date.now()): string {
  const clave = secreto()
  if (!clave) throw new Error('Falta DEADLINES_SECRET (mínimo 16 caracteres)')
  const payload = `${VERSION}.${ahora + DURACION_MS}`
  return `${payload}.${firmar(payload, clave)}`
}

export function valorCookieValido(valor: string | undefined, ahora = Date.now()): boolean {
  const clave = secreto()
  if (!clave || !valor) return false
  const partes = valor.split('.')
  if (partes.length !== 3 || partes[0] !== VERSION) return false
  const [version, expira, firma] = partes
  const esperada = firmar(`${version}.${expira}`, clave)
  if (!igualesSeguro(firma, esperada)) return false
  const exp = Number(expira)
  return Number.isFinite(exp) && exp > ahora
}

// Misma verificación que middleware.ts para el admin normal (sin cambiarla).
export function adminAutenticado(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  return Boolean(envPassword) && cookies().get('admin_auth')?.value === envPassword
}

export function deadlinesDesbloqueado(): boolean {
  return adminAutenticado() && valorCookieValido(cookies().get(COOKIE_DESBLOQUEO)?.value)
}
