import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// /finanzas usa Supabase Auth (Google / enlace mágico), separado del admin.
// Aquí solo se refresca la sesión para que las páginas la lean al día.
async function sesionFinanzas(request: NextRequest) {
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
  await supabase.auth.getUser()
  return response
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path === '/finanzas' || path.startsWith('/finanzas/')) {
    return sesionFinanzas(request)
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
  matcher: ['/admin/:path*', '/api/finanzas/:path*', '/api/admin/:path*', '/finanzas', '/finanzas/:path*'],
}
