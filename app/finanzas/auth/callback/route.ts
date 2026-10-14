import { NextResponse } from 'next/server'
import { clienteFinanzas } from '@/lib/finanzas/datos'

export const dynamic = 'force-dynamic'

// Vuelta de Google o del enlace mágico (PKCE): cambia el código por la sesión.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (code) {
    const { error } = await clienteFinanzas().auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL('/finanzas/empezar', url.origin))
  }
  return NextResponse.redirect(new URL('/finanzas?error=entrar', url.origin))
}
