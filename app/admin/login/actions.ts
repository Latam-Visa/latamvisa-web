"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAdmin(password: string) {
  // Hardcoded password as requested
  if (password === 'latam2026!') {
    cookies().set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })
    
    redirect('/admin')
  } else {
    return { error: 'Contraseña incorrecta' }
  }
}

export async function logoutAdmin() {
  cookies().delete('admin_session')
  redirect('/admin/login')
}
