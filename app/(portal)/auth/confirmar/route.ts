import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { clientePortal } from '@/lib/portal/supabase'
import { rutaSegura } from '@/lib/portal/textos'

export const dynamic = 'force-dynamic'
// force-dynamic no apaga el Data Cache de Next para los fetch de supabase-js
// (ver admin/solicitudes): sin esto, una fila leída antes de activarse se
// sigue sirviendo vieja.
export const fetchCache = 'force-no-store'

// Links que arma app/(portal)/acciones.ts (confirmar correo y recuperar
// contraseña). Con token_hash no hace falta ninguna cookie del navegador que
// lo pidió: abre desde la app de Gmail o desde otro celular.
const TIPOS: EmailOtpType[] = ['signup', 'recovery']

export async function GET(req: Request) {
  const url = new URL(req.url)
  const ir = (ruta: string) => NextResponse.redirect(new URL(ruta, url.origin))
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const next = rutaSegura(url.searchParams.get('next'))
  // Si falla la confirmación de una cuenta nueva, se vuelve al link del pago:
  // ahí puede entrar con "Ya tengo cuenta" y la solicitud igual se activa.
  const activar = next.match(/^\/activar\/([0-9a-f]{64})\/completar$/)
  const fallo = type === 'recovery' ? '/entrar/recuperar?vencido=1' : activar ? `/activar/${activar[1]}?error=confirmar` : '/entrar?error=confirmar'

  if (!tokenHash || !type || !TIPOS.includes(type)) return ir(fallo)

  const supabase = clientePortal()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  if (error) {
    console.error('[PORTAL] confirmar falló', { code: error.code ?? null, status: error.status ?? null })
    // Doble clic: el primero ya dejó la sesión abierta en este navegador.
    const { data } = await supabase.auth.getUser()
    if (data.user) return ir(next)
    return ir(fallo)
  }
  return ir(next)
}
