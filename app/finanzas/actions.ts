'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { esFecha } from '@/lib/deadlines/dates'
import { BUCKET, borrarTodosMisDatos, estadoActual } from '@/lib/finanzas/datos'
import { extraerArchivo, narrarPlan, type Extraccion } from '@/lib/finanzas/claude'
import { FRECUENCIAS, type Plan } from '@/lib/finanzas/plan'
import type { Narrativa } from '@/lib/finanzas/narrativa'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; error: string }

const SIN_SESION = { ok: false as const, error: 'Tu sesión terminó. Vuelve a entrar.' }
const ERROR_DB = { ok: false as const, error: 'No se pudo guardar. Intenta de nuevo.' }

function origen(): string {
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL || 'https://www.latamvisatravel.com'
}

// Usuario con perfil (consentimiento dado). RLS hace el resto.
async function conPerfil() {
  const e = await estadoActual()
  if (!e.user || !e.perfil) return null
  return e as typeof e & { user: NonNullable<typeof e.user> }
}

function refrescar() {
  for (const r of ['/finanzas/plan', '/finanzas/ajustes', '/finanzas/empezar', '/finanzas/subir']) revalidatePath(r)
}

// ── Sesión ────────────────────────────────────────────────────────────────
// Google queda apagado en el piloto (solo enlace mágico) hasta configurar
// Google Cloud: se prende con NEXT_PUBLIC_FINANZAS_GOOGLE=on.

export async function entrarConGoogle() {
  if (process.env.NEXT_PUBLIC_FINANZAS_GOOGLE !== 'on') redirect('/finanzas')
  const { supabase } = await estadoActual()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origen()}/finanzas/auth/callback` },
  })
  if (error || !data.url) redirect('/finanzas?error=google')
  redirect(data.url)
}

export async function entrarConEmail(_prev: { ok?: boolean; mensaje?: string } | null, fd: FormData) {
  const email = String(fd.get('email') || '').trim().toLowerCase()
  if (!z.string().email().safeParse(email).success) return { ok: false, mensaje: 'Escribe un correo válido.' }
  const { supabase } = await estadoActual()
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origen()}/finanzas/auth/callback` } })
  if (error) {
    console.error('[FINANZAS] envío del enlace falló', { code: error.code ?? null, status: error.status ?? null })
    return { ok: false, mensaje: 'No pudimos enviar el enlace. Intenta en un momento.' }
  }
  return { ok: true, mensaje: 'Te enviamos un enlace para entrar. Revisa tu correo: lo puedes abrir desde cualquier navegador o celular.' }
}

export async function salir() {
  const { supabase } = await estadoActual()
  await supabase.auth.signOut()
  redirect('/finanzas')
}

// ── Perfil y consentimiento ────────────────────────────────────────────────
export async function crearPerfil(_prev: { error?: string } | null, fd: FormData): Promise<{ error?: string }> {
  const e = await estadoActual()
  if (!e.user) redirect('/finanzas')
  if (!e.enPiloto) return { error: 'Estamos en piloto y tu correo todavía no está en la lista.' }
  if (fd.get('acepto') !== 'si') return { error: 'Para seguir tienes que aceptar.' }
  const nombre = String(fd.get('display_name') || '').trim().slice(0, 80) || null
  const { error } = await e.supabase.from('fin_profiles').insert({ user_id: e.user.id, display_name: nombre, consent_at: new Date().toISOString() })
  if (error && error.code !== '23505') return { error: 'No pudimos crear tu perfil. Intenta de nuevo.' }
  redirect('/finanzas/empezar')
}

const perfilSchema = z.object({
  display_name: z.string().trim().max(80).nullable(),
  pay_frequency: z.enum(['semanal', 'quincenal', 'mensual', 'irregular']).nullable(),
})

export async function actualizarPerfil(input: z.input<typeof perfilSchema>): Promise<Resultado> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  const p = perfilSchema.safeParse(input)
  if (!p.success) return { ok: false, error: 'Datos inválidos.' }
  const { error } = await e.supabase.from('fin_profiles').update(p.data).eq('user_id', e.user.id)
  if (error) return ERROR_DB
  refrescar()
  return { ok: true }
}

export async function avanzarOnboarding(paso: number, terminado = false): Promise<Resultado> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  const step = Math.max(0, Math.min(7, Math.trunc(paso)))
  const { error } = await e.supabase.from('fin_profiles').update({ onboarding_step: step, onboarding_done: terminado || e.perfil!.onboarding_done }).eq('user_id', e.user.id)
  if (error) return ERROR_DB
  refrescar()
  return { ok: true }
}

// ── Filas (ingresos, gastos, cuentas, deudas, meta) ────────────────────────
const fecha = z.string().refine(esFecha, 'Fecha inválida')
const fechaOpcional = z.union([fecha, z.literal(''), z.null()]).transform((v) => (v ? v : null))
const montoTexto = z.coerce.number().finite().min(0).max(10_000_000)
const id = z.string().uuid().optional()
const frecuencia = z.enum(FRECUENCIAS)

const esquemas = {
  fin_income_sources: z.object({
    id,
    name: z.string().trim().min(1).max(120),
    type: z.enum(['empleo_tfn', 'contrato_abn', 'negocio']),
    amount: montoTexto,
    frequency: frecuencia,
    is_minimum: z.boolean().default(true),
    next_date: fechaOpcional,
    tax_withheld: z.boolean(),
  }),
  fin_expenses: z
    .object({
      id,
      name: z.string().trim().min(1).max(120),
      category: z.string().trim().min(1).max(60),
      amount: montoTexto,
      frequency: frecuencia,
      next_due: fechaOpcional,
    })
    .refine((g) => g.frequency !== 'unico' || g.next_due, { message: 'Un pago único necesita su fecha.', path: ['next_due'] }),
  fin_accounts: z.object({
    id,
    name: z.string().trim().min(1).max(120),
    kind: z.enum(['personal', 'negocio', 'tarjeta', 'bnpl']),
    balance: z.coerce.number().finite().min(-10_000_000).max(10_000_000),
    available: z.union([montoTexto, z.literal(''), z.null()]).transform((v) => (v === '' || v === null ? null : Number(v))),
    as_of: fecha,
    is_untouchable: z.boolean(),
  }),
  fin_goals: z.object({ id, name: z.string().trim().min(1).max(120), target_amount: montoTexto.positive(), target_date: fechaOpcional }),
} as const
type TablaSimple = keyof typeof esquemas
export type FilaInput<T extends TablaSimple> = z.input<(typeof esquemas)[T]>

export async function guardarFila<T extends TablaSimple>(tabla: T, input: FilaInput<T>): Promise<Resultado<{ id: string }>> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  const esquema = esquemas[tabla]
  if (!esquema) return { ok: false, error: 'Tabla inválida.' }
  const p = esquema.safeParse(input)
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? 'Datos inválidos.' }
  const { id: filaId, ...datos } = p.data as { id?: string } & Record<string, unknown>
  const q = filaId
    ? e.supabase.from(tabla).update(datos).eq('id', filaId).select('id').single()
    : e.supabase.from(tabla).insert({ ...datos, user_id: e.user.id }).select('id').single()
  const { data, error } = await q
  if (error || !data) return ERROR_DB
  refrescar()
  return { ok: true, id: data.id }
}

const TABLAS_BORRABLES = new Set(['fin_income_sources', 'fin_expenses', 'fin_accounts', 'fin_debts', 'fin_goals'])

export async function borrarFila(tabla: string, filaId: string): Promise<Resultado> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  if (!TABLAS_BORRABLES.has(tabla) || !z.string().uuid().safeParse(filaId).success) return { ok: false, error: 'Datos inválidos.' }
  const { error } = await e.supabase.from(tabla).delete().eq('id', filaId)
  if (error) return ERROR_DB
  refrescar()
  return { ok: true }
}

const deudaSchema = z.object({
  id,
  lender: z.string().trim().min(1).max(120),
  kind: z.enum(['bnpl', 'tarjeta', 'prestamo_personal', 'otro']),
  balance: montoTexto,
  interest_rate: z.union([z.coerce.number().min(0).max(100), z.literal(''), z.null()]).transform((v) => (v === '' || v === null ? null : Number(v))),
  fee_monthly: z.union([montoTexto, z.literal(''), z.null()]).transform((v) => (v === '' || v === null ? null : Number(v))),
  late_fee_risk: z.boolean(),
  notes: z.string().trim().max(500).nullable().optional(),
  cuotas: z.array(z.object({ due_date: fecha, amount: z.coerce.number().positive().max(10_000_000), status: z.enum(['pendiente', 'pagado']) })).max(120),
})
export type DeudaInput = z.input<typeof deudaSchema>

// Guarda la deuda y reemplaza su calendario de cuotas.
export async function guardarDeuda(input: DeudaInput): Promise<Resultado<{ id: string }>> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  const p = deudaSchema.safeParse(input)
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? 'Datos inválidos.' }
  const { id: deudaId, cuotas, ...datos } = p.data
  const { data, error } = deudaId
    ? await e.supabase.from('fin_debts').update(datos).eq('id', deudaId).select('id').single()
    : await e.supabase.from('fin_debts').insert({ ...datos, user_id: e.user.id }).select('id').single()
  if (error || !data) return ERROR_DB
  const { error: e1 } = await e.supabase.from('fin_debt_payments').delete().eq('debt_id', data.id)
  if (e1) return ERROR_DB
  if (cuotas.length) {
    const { error: e2 } = await e.supabase.from('fin_debt_payments').insert(cuotas.map((q) => ({ ...q, debt_id: data.id, user_id: e.user.id })))
    if (e2) return ERROR_DB
  }
  refrescar()
  return { ok: true, id: data.id }
}

// ── Subidas: navegador -> URL firmada -> extracción -> confirmación ────────
const MIMES = ['image/png', 'image/jpeg', 'image/heic', 'image/heif', 'application/pdf'] as const
const MAX_BYTES = 10 * 1024 * 1024

function nombreSeguro(nombre: string): string {
  const limpio = nombre.normalize('NFKD').replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_').slice(-80)
  return limpio || 'archivo'
}

export async function crearSubida(input: { nombre: string; mime: string; size: number }): Promise<Resultado<{ id: string; path: string; signedUrl: string }>> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  if (!MIMES.includes(input.mime as (typeof MIMES)[number])) return { ok: false, error: 'Sube PNG, JPG, HEIC o PDF.' }
  if (!(input.size > 0) || input.size > MAX_BYTES) return { ok: false, error: 'Cada archivo puede pesar hasta 10 MB.' }
  const path = `${e.user.id}/${randomUUID()}-${nombreSeguro(input.nombre)}`
  const { data: fila, error } = await e.supabase
    .from('fin_uploads')
    .insert({ user_id: e.user.id, storage_path: path, mime: input.mime, size_bytes: input.size })
    .select('id')
    .single()
  if (error || !fila) return ERROR_DB
  // URL firmada creada con la sesión del usuario: las políticas de Storage
  // solo la permiten dentro de su carpeta.
  const { data: firmada, error: e2 } = await e.supabase.storage.from(BUCKET).createSignedUploadUrl(path)
  if (e2 || !firmada) {
    await e.supabase.from('fin_uploads').delete().eq('id', fila.id)
    return { ok: false, error: 'No se pudo preparar la subida.' }
  }
  return { ok: true, id: fila.id, path, signedUrl: firmada.signedUrl }
}

async function filaSubida(e: NonNullable<Awaited<ReturnType<typeof conPerfil>>>, subidaId: string) {
  if (!z.string().uuid().safeParse(subidaId).success) return null
  const { data } = await e.supabase.from('fin_uploads').select('*').eq('id', subidaId).maybeSingle()
  return data
}

async function borrarArchivo(e: NonNullable<Awaited<ReturnType<typeof conPerfil>>>, path: string) {
  const { error } = await e.supabase.storage.from(BUCKET).remove([path])
  return !error
}

export async function extraerSubida(subidaId: string): Promise<Resultado<{ datos: Extraccion | null; manual: boolean }>> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  const fila = await filaSubida(e, subidaId)
  if (!fila || fila.file_deleted_at) return { ok: false, error: 'No encontramos el archivo.' }
  if (fila.status === 'extraido' && fila.extracted) return { ok: true, datos: fila.extracted as Extraccion, manual: false }

  const { data: blob, error } = await e.supabase.storage.from(BUCKET).download(fila.storage_path)
  if (error || !blob) return { ok: false, error: 'El archivo todavía no terminó de subir.' }
  if (blob.size > MAX_BYTES) return { ok: false, error: 'El archivo pesa más de 10 MB.' }

  const r = await extraerArchivo(Buffer.from(await blob.arrayBuffer()), fila.mime)
  const datos = r.ok ? r.datos : null
  await e.supabase.from('fin_uploads').update({ status: r.ok ? 'extraido' : 'manual', extracted: datos }).eq('id', fila.id)
  refrescar()
  return { ok: true, datos, manual: !r.ok }
}

const confirmacionSchema = z.object({
  cuentas: z.array(z.object({ nombre: z.string().trim().min(1).max(120), kind: z.enum(['personal', 'negocio', 'tarjeta', 'bnpl']), saldo: z.coerce.number().finite(), disponible: z.union([z.coerce.number().finite(), z.null()]), fecha: fecha, intocable: z.boolean() })).max(20),
  cuotas: z.array(z.object({ acreedor: z.string().trim().min(1).max(120), fecha, monto: z.coerce.number().positive() })).max(60),
  cargos: z.array(z.object({ comercio: z.string().trim().min(1).max(120), monto: z.coerce.number().positive(), frecuencia: z.enum(['semanal', 'quincenal', 'mensual', 'trimestral', 'anual']), categoria: z.string().trim().min(1).max(60) })).max(40),
})
export type ConfirmacionInput = z.input<typeof confirmacionSchema>

// Nada entra al plan hasta este paso. Después se borra el archivo.
export async function confirmarSubida(subidaId: string, input: ConfirmacionInput): Promise<Resultado> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  const fila = await filaSubida(e, subidaId)
  if (!fila || fila.status === 'confirmado' || fila.status === 'descartado') return { ok: false, error: 'Este archivo ya se procesó.' }
  const p = confirmacionSchema.safeParse(input)
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? 'Revisa los datos.' }
  const uid = e.user.id
  const d = p.data

  if (d.cuentas.length) {
    const { error } = await e.supabase.from('fin_accounts').insert(
      d.cuentas.map((c) => ({ user_id: uid, name: c.nombre, kind: c.kind, balance: c.saldo, available: c.disponible, as_of: c.fecha, is_untouchable: c.intocable })),
    )
    if (error) return ERROR_DB
  }

  // Cuotas agrupadas por acreedor: se suman a la deuda existente o se crea.
  const porAcreedor = new Map<string, typeof d.cuotas>()
  for (const q of d.cuotas) porAcreedor.set(q.acreedor, [...(porAcreedor.get(q.acreedor) || []), q])
  for (const [acreedor, cuotas] of Array.from(porAcreedor)) {
    const { data: existente } = await e.supabase.from('fin_debts').select('id, balance').ilike('lender', acreedor).maybeSingle()
    let deudaId = existente?.id as string | undefined
    if (!deudaId) {
      const { data: nueva, error } = await e.supabase
        .from('fin_debts')
        .insert({ user_id: uid, lender: acreedor, kind: 'bnpl', balance: cuotas.reduce((s, q) => s + q.monto, 0), late_fee_risk: true })
        .select('id')
        .single()
      if (error || !nueva) return ERROR_DB
      deudaId = nueva.id
    }
    const { data: yaEstan } = await e.supabase.from('fin_debt_payments').select('due_date, amount').eq('debt_id', deudaId)
    const clave = (f: string, m: number) => `${f}|${Number(m).toFixed(2)}`
    const existentes = new Set((yaEstan || []).map((x) => clave(x.due_date, x.amount)))
    const nuevas = cuotas.filter((q) => !existentes.has(clave(q.fecha, q.monto)))
    if (nuevas.length) {
      const { error } = await e.supabase
        .from('fin_debt_payments')
        .insert(nuevas.map((q) => ({ user_id: uid, debt_id: deudaId, due_date: q.fecha, amount: q.monto, status: 'pendiente' })))
      if (error) return ERROR_DB
    }
  }

  if (d.cargos.length) {
    const { error } = await e.supabase
      .from('fin_expenses')
      .insert(d.cargos.map((g) => ({ user_id: uid, name: g.comercio, category: g.categoria, amount: g.monto, frequency: g.frecuencia, next_due: null })))
    if (error) return ERROR_DB
  }

  const borrado = await borrarArchivo(e, fila.storage_path)
  await e.supabase
    .from('fin_uploads')
    .update({ status: 'confirmado', extracted: null, file_deleted_at: borrado ? new Date().toISOString() : null })
    .eq('id', fila.id)
  refrescar()
  return { ok: true }
}

export async function descartarSubida(subidaId: string): Promise<Resultado> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  const fila = await filaSubida(e, subidaId)
  if (!fila) return { ok: false, error: 'No encontramos el archivo.' }
  const borrado = await borrarArchivo(e, fila.storage_path)
  await e.supabase.from('fin_uploads').update({ status: 'descartado', extracted: null, file_deleted_at: borrado ? new Date().toISOString() : null }).eq('id', fila.id)
  refrescar()
  return { ok: true }
}

// ── Tu análisis (narrativa, cacheada por inputs_hash) ──────────────────────
export async function generarNarrativa(hash: string): Promise<Resultado<{ narrativa: Narrativa | null }>> {
  const e = await conPerfil()
  if (!e) return SIN_SESION
  if (!/^[0-9a-f]{64}$/.test(hash)) return { ok: false, error: 'Plan inválido.' }
  const { data: fila } = await e.supabase.from('fin_plans').select('id, plan, narrative').eq('inputs_hash', hash).maybeSingle()
  if (!fila) return { ok: false, error: 'El plan cambió. Recarga la página.' }
  if (fila.narrative) return { ok: true, narrativa: fila.narrative as Narrativa }
  const narrativa = await narrarPlan(fila.plan as Plan)
  if (narrativa) await e.supabase.from('fin_plans').update({ narrative: narrativa }).eq('id', fila.id)
  return { ok: true, narrativa }
}

// ── Borrar todo ────────────────────────────────────────────────────────────
export async function borrarTodo(): Promise<Resultado> {
  const e = await estadoActual()
  if (!e.user) return SIN_SESION
  try {
    await borrarTodosMisDatos(e.supabase, e.user.id)
  } catch {
    return { ok: false, error: 'No pudimos borrar todo. Intenta de nuevo; si sigue, escríbenos.' }
  }
  redirect('/finanzas?borrado=1')
}
