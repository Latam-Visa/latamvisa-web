"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAdmin(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD || 'fuckingalive'
  if (password === expectedPassword) {
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
