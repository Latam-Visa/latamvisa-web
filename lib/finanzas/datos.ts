// Acceso a datos de Finanzas. SIEMPRE con el cliente del usuario (su sesión
// de Supabase Auth), así RLS garantiza que cada quien solo toca lo suyo.
// La service role no se usa aquí (solo en el cron de limpieza).

import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { MOTOR_VERSION, type PlanInput } from './plan'

export const BUCKET = 'finanzas-uploads'

// Cliente con la sesión del usuario (anon key + su JWT). API getAll/setAll
// de @supabase/ssr; en un Server Component set() no aplica y se ignora (el
// middleware de /finanzas ya refresca la sesión).
export function clienteFinanzas(): SupabaseClient {
  const store = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // Server Component: no puede escribir cookies.
        }
      },
    },
  })
}

export interface Perfil {
  user_id: string
  display_name: string | null
  pay_frequency: string | null
  timezone: string
  currency: string
  consent_at: string
  onboarding_step: number
  onboarding_done: boolean
}

export interface Estado {
  supabase: SupabaseClient
  user: User | null
  enPiloto: boolean
  perfil: Perfil | null
}

// Quién es, si está en el piloto (fin_en_piloto, la única lista) y su perfil.
export async function estadoActual(): Promise<Estado> {
  const supabase = clienteFinanzas()
  const { data } = await supabase.auth.getUser()
  const user = data.user ?? null
  if (!user) return { supabase, user: null, enPiloto: false, perfil: null }
  const [{ data: piloto }, { data: perfil }] = await Promise.all([
    supabase.rpc('fin_en_piloto'),
    supabase.from('fin_profiles').select('*').eq('user_id', user.id).maybeSingle(),
  ])
  return { supabase, user, enPiloto: piloto === true, perfil: (perfil as Perfil | null) ?? null }
}

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v))

export interface DatosUsuario {
  ingresos: any[]
  gastos: any[]
  cuentas: any[]
  deudas: any[]
  cuotas: any[]
  metas: any[]
}

export async function cargarDatos(supabase: SupabaseClient): Promise<DatosUsuario> {
  const [ingresos, gastos, cuentas, deudas, cuotas, metas] = await Promise.all([
    supabase.from('fin_income_sources').select('*').order('created_at'),
    supabase.from('fin_expenses').select('*').order('created_at'),
    supabase.from('fin_accounts').select('*').order('created_at'),
    supabase.from('fin_debts').select('*').order('created_at'),
    supabase.from('fin_debt_payments').select('*').order('due_date'),
    supabase.from('fin_goals').select('*').order('created_at'),
  ])
  const error = [ingresos, gastos, cuentas, deudas, cuotas, metas].find((r) => r.error)?.error
  if (error) throw new Error(`No se pudieron leer los datos (${error.code})`)
  return {
    ingresos: ingresos.data || [],
    gastos: gastos.data || [],
    cuentas: cuentas.data || [],
    deudas: deudas.data || [],
    cuotas: cuotas.data || [],
    metas: metas.data || [],
  }
}

export function aPlanInput(d: DatosUsuario): PlanInput {
  return {
    ingresos: d.ingresos.map((i) => ({
      id: i.id,
      nombre: i.name,
      tipo: i.type,
      monto: Number(i.amount),
      frecuencia: i.frequency,
      proxima: i.next_date,
    })),
    gastos: d.gastos.map((g) => ({
      id: g.id,
      nombre: g.name,
      categoria: g.category,
      monto: Number(g.amount),
      frecuencia: g.frequency,
      proximo: g.next_due,
    })),
    cuentas: d.cuentas.map((a) => ({
      id: a.id,
      nombre: a.name,
      tipo: a.kind,
      saldo: Number(a.balance),
      disponible: num(a.available),
      intocable: a.is_untouchable,
    })),
    deudas: d.deudas.map((x) => ({
      id: x.id,
      acreedor: x.lender,
      tipo: x.kind,
      saldo: Number(x.balance),
      tasa: num(x.interest_rate),
      riesgoMora: x.late_fee_risk,
      cuotas: d.cuotas
        .filter((q) => q.debt_id === x.id)
        .map((q) => ({ fecha: q.due_date, monto: Number(q.amount), pagada: q.status === 'pagado' })),
    })),
    meta: d.metas[0]
      ? { nombre: d.metas[0].name, monto: Number(d.metas[0].target_amount), fecha: d.metas[0].target_date }
      : null,
  }
}

// Hash estable de lo que entra al motor: mismo hash = mismo plan = misma
// narrativa (no se vuelve a cobrar).
export function hashEntradas(input: PlanInput, hoy: string, semanas: number): string {
  const ordenar = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(ordenar)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, ordenar((v as Record<string, unknown>)[k])]))
        : v
  return createHash('sha256')
    .update(JSON.stringify(ordenar({ motor: MOTOR_VERSION, hoy, semanas, input })))
    .digest('hex')
}

/**
 * "Borrar todos mis datos": primero los archivos por la API de Storage (con
 * el cliente del usuario), después las filas con fin_borrar_mis_datos().
 * Devuelve cuántos archivos quedaron (debe ser 0).
 */
export async function borrarTodosMisDatos(supabase: SupabaseClient, userId: string): Promise<{ archivosRestantes: number }> {
  const storage = supabase.storage.from(BUCKET)
  for (let ronda = 0; ronda < 20; ronda++) {
    const { data: archivos, error } = await storage.list(userId, { limit: 100 })
    if (error) throw new Error(`No se pudieron listar los archivos (${error.message})`)
    const rutas = (archivos || []).filter((f) => f.name && f.id).map((f) => `${userId}/${f.name}`)
    if (!rutas.length) break
    const { error: e2 } = await storage.remove(rutas)
    if (e2) throw new Error(`No se pudieron borrar los archivos (${e2.message})`)
  }
  const { data: quedan } = await storage.list(userId, { limit: 1 })
  const archivosRestantes = (quedan || []).filter((f) => f.id).length
  if (archivosRestantes) throw new Error('Quedaron archivos sin borrar')

  const { error } = await supabase.rpc('fin_borrar_mis_datos')
  if (error) throw new Error(`No se pudieron borrar las filas (${error.code})`)
  return { archivosRestantes }
}
