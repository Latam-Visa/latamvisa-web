import { NextResponse } from 'next/server'
import { clienteFinanzas } from '@/lib/finanzas/datos'
import { destinoTrasEntrar, motivoError, registrarErrorAuth } from '@/lib/finanzas/entrada'

export const dynamic = 'force-dynamic'

// Vuelta de Google (PKCE): cambia el código por la sesión. Necesita la cookie
// code_verifier del navegador que empezó, por eso el enlace mágico ya no pasa
// por aquí sino por /finanzas/auth/confirm.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const ir = (ruta: string) => NextResponse.redirect(new URL(ruta, url.origin))

  // Supabase devuelve el error en la URL (p. ej. error_code=otp_expired).
  const codigoUrl = url.searchParams.get('error_code')
  if (codigoUrl || url.searchParams.get('error')) {
    registrarErrorAuth('callback', { code: codigoUrl ?? url.searchParams.get('error'), message: url.searchParams.get('error_description') ?? undefined })
    return ir(`/finanzas?error=${motivoError(codigoUrl)}`)
  }

  const code = url.searchParams.get('code')
  if (!code) {
    registrarErrorAuth('callback', { code: 'sin_codigo' })
    return ir('/finanzas?error=entrar')
  }
  const supabase = clienteFinanzas()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    registrarErrorAuth('callback', error)
    return ir(`/finanzas?error=${motivoError(error.code)}`)
  }
  return ir(await destinoTrasEntrar(supabase))
}
