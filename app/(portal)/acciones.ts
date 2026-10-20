'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { construirCorreoConfirmar, construirCorreoRecuperar } from '@/lib/emails/portal'
import { activarSolicitud, solicitudPorToken } from '@/lib/portal/solicitudes'
import { GOOGLE_ACTIVO, SITIO, clientePortal, usuarioActual } from '@/lib/portal/supabase'
import { mensajeErrorAuth, rutaSegura } from '@/lib/portal/textos'

export type Estado = { ok: boolean; mensaje: string } | null

const DE = 'LATAM VISA <noreply@latamvisatravel.com>'
const correoValido = (v: string) => z.string().email().safeParse(v).success
const leer = (fd: FormData, campo: string) => String(fd.get(campo) || '').trim()

// Solo al log del servidor: código y estado de Supabase, nunca correos ni tokens.
function registrar(etapa: string, err: { code?: string | null; status?: number | null } | null | undefined) {
  console.error(`[PORTAL] ${etapa} falló`, { code: err?.code ?? null, status: err?.status ?? null })
}

// Amarra la solicitud al usuario con sesión y lo lleva a donde corresponda.
// Única puerta para escribir user_id/activada_at desde el portal.
async function activarYSeguir(token: string, userId: string): Promise<never> {
  const resultado = await activarSolicitud(token, userId)
  if (resultado === 'activada' || resultado === 'ya_tuya') redirect('/mi-cuenta')
  redirect(`/activar/${token}`)
}

// ── /activar/[token] ───────────────────────────────────────────────────────

/* Crear cuenta desde el link del pago. Si el correo es el mismo del pago, ya
   está probado (el link llegó ahí): la cuenta se crea confirmada y entra
   directo. Si es otro, se le manda un correo para confirmarlo primero. */
export async function crearCuenta(token: string, _prev: Estado, fd: FormData): Promise<Estado> {
  const email = leer(fd, 'email').toLowerCase()
  const password = String(fd.get('password') || '')
  if (!correoValido(email)) return { ok: false, mensaje: 'Escribe un correo válido.' }
  if (password.length < 8) return { ok: false, mensaje: 'La contraseña necesita al menos 8 caracteres.' }

  const solicitud = await solicitudPorToken(token)
  if (!solicitud || solicitud.activada_at) redirect(`/activar/${token}`)
  const datos = { full_name: solicitud.nombre_cliente ?? undefined }

  if (email === solicitud.email_pago.trim().toLowerCase()) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: datos })
    if (error || !data.user) {
      registrar('crear usuario', error)
      return { ok: false, mensaje: mensajeErrorAuth(error) }
    }
    const { error: errorEntrar } = await clientePortal().auth.signInWithPassword({ email, password })
    if (errorEntrar) {
      registrar('entrar tras crear', errorEntrar)
      return { ok: false, mensaje: 'Tu cuenta quedó creada. Elige "Ya tengo cuenta" y entra con tu correo y contraseña.' }
    }
    return activarYSeguir(token, data.user.id)
  }

  // Correo distinto al del pago: hay que confirmar que es suyo.
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: 'signup', email, password, options: { data: datos } })
  if (error || !data.properties?.hashed_token) {
    registrar('link de confirmación', error)
    return { ok: false, mensaje: mensajeErrorAuth(error) }
  }
  const siguiente = encodeURIComponent(`/activar/${token}/completar`)
  const link = `${SITIO}/auth/confirmar?token_hash=${data.properties.hashed_token}&type=signup&next=${siguiente}`
  const { asunto, html } = construirCorreoConfirmar({ link })
  const { error: errorCorreo } = await resend.emails.send({ from: DE, to: email, subject: asunto, html })
  if (errorCorreo) {
    console.error('[PORTAL] correo de confirmación falló', { mensaje: errorCorreo.message })
    return { ok: false, mensaje: 'No pudimos enviarte el correo. Intenta otra vez en un momento.' }
  }
  return { ok: true, mensaje: `Te enviamos un correo a ${email}. Ábrelo y toca "Confirmar mi correo" para terminar. Revisa también la carpeta de spam.` }
}

export async function entrarYActivar(token: string, _prev: Estado, fd: FormData): Promise<Estado> {
  const email = leer(fd, 'email').toLowerCase()
  const password = String(fd.get('password') || '')
  if (!correoValido(email) || !password) return { ok: false, mensaje: 'Escribe tu correo y tu contraseña.' }
  const { data, error } = await clientePortal().auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    if (error?.code !== 'invalid_credentials') registrar('entrar (activar)', error)
    return { ok: false, mensaje: mensajeErrorAuth(error) }
  }
  return activarYSeguir(token, data.user.id)
}

// Ya había sesión: el cliente confirma con qué cuenta se queda la solicitud.
export async function activarConSesion(token: string): Promise<void> {
  const { user } = await usuarioActual()
  if (!user) redirect(`/activar/${token}`)
  await activarYSeguir(token, user.id)
}

export async function usarOtraCuenta(token: string): Promise<void> {
  await clientePortal().auth.signOut()
  redirect(`/activar/${token}`)
}

// ── Google ─────────────────────────────────────────────────────────────────

export async function entrarConGoogle(siguiente: string): Promise<void> {
  const volver = rutaSegura(siguiente)
  if (!GOOGLE_ACTIVO) redirect(volver === '/mi-cuenta' ? '/entrar' : volver)
  const { data, error } = await clientePortal().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${SITIO}/auth/callback?next=${encodeURIComponent(volver)}` },
  })
  if (error || !data.url) {
    registrar('google', error)
    redirect('/entrar?error=google')
  }
  redirect(data.url)
}

// ── /entrar ────────────────────────────────────────────────────────────────

export async function entrar(_prev: Estado, fd: FormData): Promise<Estado> {
  const email = leer(fd, 'email').toLowerCase()
  const password = String(fd.get('password') || '')
  if (!correoValido(email) || !password) return { ok: false, mensaje: 'Escribe tu correo y tu contraseña.' }
  const { error } = await clientePortal().auth.signInWithPassword({ email, password })
  if (error) {
    if (error.code !== 'invalid_credentials') registrar('entrar', error)
    return { ok: false, mensaje: mensajeErrorAuth(error) }
  }
  redirect('/mi-cuenta')
}

/* Recuperar contraseña con el flujo de recovery de Supabase. El link se arma
   aquí y sale por Resend (no por la plantilla de Supabase), para que abra en
   cualquier navegador. La respuesta es la misma exista o no la cuenta. */
export async function recuperar(_prev: Estado, fd: FormData): Promise<Estado> {
  const email = leer(fd, 'email').toLowerCase()
  if (!correoValido(email)) return { ok: false, mensaje: 'Escribe un correo válido.' }
  const respuesta = { ok: true, mensaje: 'Si hay una cuenta con ese correo, te llegará un enlace para cambiar la contraseña en unos minutos. Revisa también spam.' }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email })
  if (error || !data.properties?.hashed_token) {
    if (error?.status !== 404 && error?.code !== 'user_not_found') registrar('link de recuperación', error)
    return respuesta
  }
  const link = `${SITIO}/auth/confirmar?token_hash=${data.properties.hashed_token}&type=recovery&next=${encodeURIComponent('/entrar/nueva-clave')}`
  const { asunto, html } = construirCorreoRecuperar({ link })
  // Máximo un correo cada 10 minutos por dirección, aunque toquen el botón muchas veces.
  const ventana = Math.floor(Date.now() / 600_000)
  const { error: errorCorreo } = await resend.emails.send(
    { from: DE, to: email, subject: asunto, html },
    { idempotencyKey: `recuperar/${email}/${ventana}` },
  )
  if (errorCorreo) console.error('[PORTAL] correo de recuperación falló', { mensaje: errorCorreo.message })
  return respuesta
}

export async function nuevaClave(_prev: Estado, fd: FormData): Promise<Estado> {
  const password = String(fd.get('password') || '')
  if (password.length < 8) return { ok: false, mensaje: 'La contraseña necesita al menos 8 caracteres.' }
  const { supabase, user } = await usuarioActual()
  if (!user) redirect('/entrar/recuperar?vencido=1')
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    registrar('nueva clave', error)
    return { ok: false, mensaje: mensajeErrorAuth(error) }
  }
  redirect('/mi-cuenta')
}

export async function salir(): Promise<void> {
  await clientePortal().auth.signOut()
  redirect('/entrar')
}
