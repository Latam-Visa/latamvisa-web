import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { clienteFinanzas } from '@/lib/finanzas/datos'
import { destinoTrasEntrar, motivoError, registrarErrorAuth } from '@/lib/finanzas/entrada'

export const dynamic = 'force-dynamic'

// Enlace mágico con token_hash (plantilla de Supabase):
//   {{ .SiteURL }}/finanzas/auth/confirm?token_hash={{ .TokenHash }}&type=email
// A diferencia del código PKCE no necesita ninguna cookie del navegador que
// pidió el enlace: sirve en otro navegador, en la app de Gmail o en otro equipo.
const TIPOS: EmailOtpType[] = ['email', 'magiclink', 'signup']

export async function GET(req: Request) {
  const url = new URL(req.url)
  const ir = (ruta: string) => NextResponse.redirect(new URL(ruta, url.origin))
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  if (!tokenHash || !type || !TIPOS.includes(type)) {
    registrarErrorAuth('confirm', { code: 'parametros_invalidos', message: `token_hash ${tokenHash ? 'presente' : 'ausente'}, type ${type ?? 'ausente'}` })
    return ir('/finanzas?error=entrar')
  }

  const supabase = clienteFinanzas()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  if (error) {
    registrarErrorAuth('confirm', error)
    // Doble clic o enlace ya usado en este mismo navegador: si ya hay sesión, adentro.
    const { data } = await supabase.auth.getUser()
    if (data.user) return ir(await destinoTrasEntrar(supabase))
    return ir(`/finanzas?error=${motivoError(error.code)}`)
  }
  return ir(await destinoTrasEntrar(supabase))
}
