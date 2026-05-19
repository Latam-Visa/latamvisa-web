"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAdmin(password: string) {
  const submittedPassword = (password || '').trim()
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()

  if (!envPassword) {
    console.error('[ADMIN_LOGIN] ADMIN_PASSWORD env var is not set')
    return { error: 'Error de configuración del servidor' }
  }

  console.log('[ADMIN_LOGIN] env password length:', envPassword.length)
  console.log('[ADMIN_LOGIN] submitted password length:', submittedPassword.length)

  if (submittedPassword !== envPassword) {
    console.log('[ADMIN_LOGIN] passwords did not match')
    return { error: 'Contraseña incorrecta' }
  }

  cookies().set('admin_auth', envPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  redirect('/admin')
}

export async function logoutAdmin() {
  cookies().delete('admin_auth')
  redirect('/admin/login')
}
