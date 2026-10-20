import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// /finanzas y el portal del cliente usan Supabase Auth, separado del admin.
// Aquí se refresca la sesión para que las páginas la lean al día y se
// devuelve el usuario para poder exigirla.
async function refrescarSesion(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const { data } = await supabase.auth.getUser()
  return { response, user: data.user }
}

// Portal del cliente. /mi-cuenta exige sesión aquí y otra vez en la página.
const PORTAL = ['/mi-cuenta', '/activar', '/entrar', '/registro', '/auth']
const esPortal = (path: string) => PORTAL.some((r) => path === r || path.startsWith(`${r}/`))

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path === '/finanzas' || path.startsWith('/finanzas/')) {
    return (await refrescarSesion(request)).response
  }

  if (esPortal(path)) {
    const { response, user } = await refrescarSesion(request)
    if (!user && (path === '/mi-cuenta' || path.startsWith('/mi-cuenta/'))) {
      return NextResponse.redirect(new URL('/entrar', request.url))
    }
    return response
  }

  if ((path.startsWith('/admin') && !path.startsWith('/admin/login')) || path.startsWith('/api/finanzas') || path.startsWith('/api/admin')) {
    const cookieValue = request.cookies.get('admin_auth')?.value
    const envPassword = (process.env.ADMIN_PASSWORD || '').trim()

    if (!cookieValue || cookieValue !== envPassword) {
      if (path.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*', '/api/finanzas/:path*', '/api/admin/:path*', '/finanzas', '/finanzas/:path*',
    '/mi-cuenta', '/mi-cuenta/:path*', '/activar/:path*', '/entrar', '/entrar/:path*', '/registro', '/auth/:path*',
  ],
}
