import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

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
  matcher: ['/admin/:path*', '/api/finanzas/:path*', '/api/admin/:path*'],
}
