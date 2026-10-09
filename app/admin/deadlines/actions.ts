'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esFecha } from '@/lib/deadlines/dates'
import { CATEGORIAS, HABITOS, SLOTS } from '@/lib/deadlines/routine'
import {
  COOKIE_DESBLOQUEO,
  DURACION_MS,
  adminAutenticado,
  configuracionCompleta,
  crearValorCookie,
  deadlinesDesbloqueado,
  passwordDelDuenoCorrecta,
} from '@/lib/deadlines/unlock'

const RUTA = '/admin/deadlines'

export type Resultado = { ok: true } | { ok: false; error: string }

const BLOQUEADO: Resultado = { ok: false, error: 'Sesión bloqueada. Vuelve a desbloquear Deadlines.' }
const ERROR_DB: Resultado = { ok: false, error: 'No se pudo guardar. Intenta de nuevo.' }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const id = z.string().regex(UUID_RE)
const fecha = z.string().refine(esFecha, 'Fecha inválida')

const tareaSchema = z.object({
  due_date: fecha,
  slot: z.enum(SLOTS),
  category: z.enum(CATEGORIAS),
  title: z.string().trim().min(1, 'Escribe un título').max(200),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => v || null),
})
export type TareaInput = z.input<typeof tareaSchema>

const habitoSchema = z.enum(HABITOS.map((h) => h.id) as [string, ...string[]])

const ahora = () => new Date().toISOString()

function terminar(): Resultado {
  revalidatePath(RUTA)
  revalidatePath('/admin')
  return { ok: true }
}

// ── Desbloqueo ─────────────────────────────────────────────────────────────
export async function desbloquearDeadlines(_prev: { error?: string } | null, formData: FormData): Promise<{ error?: string }> {
  if (!adminAutenticado()) redirect('/admin/login')
  if (!configuracionCompleta()) {
    return { error: 'Falta configurar ADMIN_OWNER_PASSWORD y DEADLINES_SECRET en el servidor.' }
  }
  const intento = String(formData.get('password') ?? '')
  if (!passwordDelDuenoCorrecta(intento)) {
    // Freno simple contra intentos repetidos.
    await new Promise((r) => setTimeout(r, 600))
    return { error: 'Contraseña incorrecta.' }
  }
  cookies().set(COOKIE_DESBLOQUEO, crearValorCookie(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: DURACION_MS / 1000,
  })
  redirect(RUTA)
}

// ── Tareas ─────────────────────────────────────────────────────────────────
export async function toggleTask(taskId: string): Promise<Resultado> {
  if (!deadlinesDesbloqueado()) return BLOQUEADO
  if (!id.safeParse(taskId).success) return { ok: false, error: 'Tarea inválida.' }

  const { data: actual, error } = await supabaseAdmin.from('admin_deadlines').select('done').eq('id', taskId).maybeSingle()
  if (error || !actual) return ERROR_DB
  const done = !actual.done
  const { error: e2 } = await supabaseAdmin
    .from('admin_deadlines')
    .update({ done, done_at: done ? ahora() : null, updated_at: ahora() })
    .eq('id', taskId)
  return e2 ? ERROR_DB : terminar()
}

export async function moveTask(taskId: string, newDate: string): Promise<Resultado> {
  if (!deadlinesDesbloqueado()) return BLOQUEADO
  if (!id.safeParse(taskId).success || !esFecha(newDate)) return { ok: false, error: 'Datos inválidos.' }
  const { error } = await supabaseAdmin.from('admin_deadlines').update({ due_date: newDate, updated_at: ahora() }).eq('id', taskId)
  return error ? ERROR_DB : terminar()
}

export async function createTask(input: TareaInput): Promise<Resultado> {
  if (!deadlinesDesbloqueado()) return BLOQUEADO
  const parsed = tareaSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  const { error } = await supabaseAdmin.from('admin_deadlines').insert({ ...parsed.data, done: false })
  return error ? ERROR_DB : terminar()
}

export async function updateTask(taskId: string, input: TareaInput): Promise<Resultado> {
  if (!deadlinesDesbloqueado()) return BLOQUEADO
  if (!id.safeParse(taskId).success) return { ok: false, error: 'Tarea inválida.' }
  const parsed = tareaSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  const { error } = await supabaseAdmin.from('admin_deadlines').update({ ...parsed.data, updated_at: ahora() }).eq('id', taskId)
  return error ? ERROR_DB : terminar()
}

export async function deleteTask(taskId: string): Promise<Resultado> {
  if (!deadlinesDesbloqueado()) return BLOQUEADO
  if (!id.safeParse(taskId).success) return { ok: false, error: 'Tarea inválida.' }
  const { error } = await supabaseAdmin.from('admin_deadlines').delete().eq('id', taskId)
  return error ? ERROR_DB : terminar()
}

// ── Hábitos: existe la fila = hecho ese día ─────────────────────────────────
export async function toggleHabit(date: string, habit: string): Promise<Resultado> {
  if (!deadlinesDesbloqueado()) return BLOQUEADO
  if (!esFecha(date) || !habitoSchema.safeParse(habit).success) return { ok: false, error: 'Datos inválidos.' }

  const { data: borradas, error } = await supabaseAdmin
    .from('admin_habit_logs')
    .delete()
    .eq('log_date', date)
    .eq('habit', habit)
    .select('habit')
  if (error) return ERROR_DB
  if (!borradas?.length) {
    const { error: e2 } = await supabaseAdmin.from('admin_habit_logs').insert({ log_date: date, habit })
    // 23505: otro clic ya lo insertó; el estado final es "hecho" igual.
    if (e2 && e2.code !== '23505') return ERROR_DB
  }
  return terminar()
}
