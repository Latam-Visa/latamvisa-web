import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const cookieValue = request.cookies.get('admin_auth')?.value
    const envPassword = (process.env.ADMIN_PASSWORD || '').trim()

    if (!cookieValue || cookieValue !== envPassword) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
