import { NextResponse } from 'next/server'
import { clientePortal } from '@/lib/portal/supabase'
import { rutaSegura } from '@/lib/portal/textos'

export const dynamic = 'force-dynamic'
// force-dynamic no apaga el Data Cache de Next para los fetch de supabase-js
// (ver admin/solicitudes): sin esto, una fila leída antes de activarse se
// sigue sirviendo vieja.
export const fetchCache = 'force-no-store'

// Vuelta de Google (PKCE): cambia el código por la sesión y sigue a `next`
// (por ejemplo /activar/<token>/completar).
export async function GET(req: Request) {
  const url = new URL(req.url)
  const ir = (ruta: string) => NextResponse.redirect(new URL(ruta, url.origin))
  const next = rutaSegura(url.searchParams.get('next'))

  const code = url.searchParams.get('code')
  if (!code || url.searchParams.get('error')) return ir('/entrar?error=google')

  const { error } = await clientePortal().auth.exchangeCodeForSession(code)
  if (error) {
    console.error('[PORTAL] google callback falló', { code: error.code ?? null, status: error.status ?? null })
    return ir('/entrar?error=google')
  }
  return ir(next)
}
