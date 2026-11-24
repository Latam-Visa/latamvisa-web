"use server"

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Res = { success: boolean; error?: string }

// Mismo guard que el resto del admin (cookie admin_auth === ADMIN_PASSWORD).
function esAdmin(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  return Boolean(envPassword) && cookies().get('admin_auth')?.value === envPassword
}
const NO_AUTH: Res = { success: false, error: 'Sesión de admin expirada. Vuelve a iniciar sesión.' }

const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const isYmd = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v)

export async function agregarRegistro(p: {
  fecha: string
  categoria: string
  descripcion: string
  minutos: number | null
  evidencia_url: string
}): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  const fecha = s(p.fecha)
  const descripcion = s(p.descripcion)
  if (!isYmd(fecha)) return { success: false, error: 'Fecha inválida.' }
  if (!descripcion) return { success: false, error: 'Escribe qué hiciste.' }
  const minutos = p.minutos == null || !Number.isFinite(p.minutos) ? null : Math.max(0, Math.round(p.minutos))
  const { error } = await supabaseAdmin.from('registro_trabajo').insert({
    fecha,
    categoria: s(p.categoria) || 'Gestión',
    descripcion,
    minutos,
    evidencia_url: s(p.evidencia_url) || null,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/registro')
  return { success: true }
}

export async function actualizarMinutos(id: string, minutos: number | null): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  const m = minutos == null || !Number.isFinite(minutos) ? null : Math.max(0, Math.round(minutos))
  const { error } = await supabaseAdmin.from('registro_trabajo').update({ minutos: m }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/registro')
  return { success: true }
}

export async function borrarRegistro(id: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  const { error } = await supabaseAdmin.from('registro_trabajo').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/registro')
  return { success: true }
}
