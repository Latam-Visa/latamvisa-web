// Prueba de privacidad de Finanzas contra el Supabase real: dos usuarios con
// la anon key. A no puede leer, editar ni borrar nada de B (filas y archivos),
// alguien fuera del piloto no puede crear perfil y "Borrar todos mis datos"
// deja cero filas y cero archivos.
//
// Solo corre con RUN_RLS_TESTS=1 (necesita NEXT_PUBLIC_SUPABASE_URL,
// NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY). La service role
// se usa SOLO para preparar y limpiar (crear usuarios de prueba y anotarlos
// en el piloto); todas las comprobaciones van con la sesión de cada usuario.

import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { BUCKET, borrarTodosMisDatos } from '../lib/finanzas/datos'

const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!
const activo = process.env.RUN_RLS_TESTS === '1' && URL_SB && ANON && SERVICE

const TABLAS = ['fin_profiles', 'fin_income_sources', 'fin_expenses', 'fin_accounts', 'fin_debts', 'fin_debt_payments', 'fin_uploads', 'fin_goals', 'fin_plans', 'fin_rules'] as const

describe.skipIf(!activo)('Finanzas: RLS con dos usuarios y la anon key', () => {
  const admin = activo ? createClient(URL_SB, SERVICE, { auth: { persistSession: false } }) : (null as never)
  const sufijo = randomUUID().slice(0, 8)
  const usuarios = {
    a: { email: `fin-rls-a-${sufijo}@example.com`, password: randomUUID() },
    b: { email: `fin-rls-b-${sufijo}@example.com`, password: randomUUID() },
    fuera: { email: `fin-rls-fuera-${sufijo}@example.com`, password: randomUUID() },
  }
  const ids: Record<string, string> = {}
  const sb: Record<string, SupabaseClient> = {}
  const filasA: Record<string, string> = {}
  let archivoA = ''

  beforeAll(async () => {
    for (const [k, u] of Object.entries(usuarios)) {
      const { data, error } = await admin.auth.admin.createUser({ email: u.email, password: u.password, email_confirm: true })
      if (error) throw error
      ids[k] = data.user.id
      const c = createClient(URL_SB, ANON, { auth: { persistSession: false } })
      const { error: e2 } = await c.auth.signInWithPassword(u)
      if (e2) throw e2
      sb[k] = c
    }
    // Solo A y B entran al piloto.
    await admin.from('fin_pilot_emails').insert([{ email: usuarios.a.email }, { email: usuarios.b.email }])

    // A crea un poco de todo con su propia sesión.
    const a = sb.a
    const uid = ids.a
    expect((await a.from('fin_profiles').insert({ user_id: uid, display_name: 'A', consent_at: new Date().toISOString() })).error).toBeNull()
    const ins = async (t: string, fila: Record<string, unknown>) => {
      const { data, error } = await a.from(t).insert({ user_id: uid, ...fila }).select('id').single()
      if (error) throw new Error(`${t}: ${error.message}`)
      filasA[t] = data.id
    }
    await ins('fin_income_sources', { name: 'Sueldo', type: 'empleo_tfn', amount: 1000, frequency: 'semanal', tax_withheld: true })
    await ins('fin_expenses', { name: 'Arriendo', category: 'arriendo', amount: 400, frequency: 'quincenal' })
    await ins('fin_accounts', { name: 'Everyday', kind: 'personal', balance: 600 })
    await ins('fin_debts', { lender: 'Afterpay', kind: 'bnpl', balance: 200, late_fee_risk: true })
    await ins('fin_debt_payments', { debt_id: filasA.fin_debts, due_date: '2026-10-28', amount: 50 })
    await ins('fin_goals', { name: 'Viaje', target_amount: 1000 })
    await ins('fin_plans', { inputs_hash: 'x'.repeat(64), plan: { prueba: true } })
    await ins('fin_rules', { patron: 'UBER', categoria: 'Transporte', tipo: 'gasto', grupo: 'personal' })
    archivoA = `${uid}/${randomUUID()}-extracto.pdf`
    await ins('fin_uploads', { storage_path: archivoA, mime: 'application/pdf', size_bytes: 9 })
    const { error: eUp } = await a.storage.from(BUCKET).upload(archivoA, new Blob(['%PDF-1.4\n'], { type: 'application/pdf' }), { contentType: 'application/pdf' })
    if (eUp) throw eUp
  }, 60_000)

  afterAll(async () => {
    if (!activo) return
    await admin.from('fin_pilot_emails').delete().in('email', [usuarios.a.email, usuarios.b.email])
    if (archivoA) await admin.storage.from(BUCKET).remove([archivoA])
    for (const id of Object.values(ids)) await admin.auth.admin.deleteUser(id) // borra en cascada sus filas
  }, 60_000)

  it('B no ve ninguna fila de A en ninguna tabla', async () => {
    for (const t of TABLAS) {
      const { data, error } = await sb.b.from(t).select('*').eq('user_id', ids.a)
      expect(error, t).toBeNull()
      expect(data, t).toEqual([])
    }
  })

  it('B no puede editar ni borrar filas de A', async () => {
    for (const [t, id] of Object.entries(filasA)) {
      const upd = await sb.b.from(t).update({ created_at: new Date().toISOString() }).eq('id', id).select('id')
      expect(upd.data ?? [], `update ${t}`).toEqual([])
      const del = await sb.b.from(t).delete().eq('id', id).select('id')
      expect(del.data ?? [], `delete ${t}`).toEqual([])
    }
    // Siguen ahí para A.
    const { data } = await sb.a.from('fin_accounts').select('id').eq('id', filasA.fin_accounts)
    expect(data).toHaveLength(1)
  })

  it('B no puede insertar filas a nombre de A ni colgar cuotas de la deuda de A', async () => {
    const r1 = await sb.b.from('fin_accounts').insert({ user_id: ids.a, name: 'trampa', kind: 'personal', balance: 1 })
    expect(r1.error).not.toBeNull()
    await sb.b.from('fin_profiles').insert({ user_id: ids.b, consent_at: new Date().toISOString() })
    const r2 = await sb.b.from('fin_debt_payments').insert({ user_id: ids.b, debt_id: filasA.fin_debts, due_date: '2026-11-01', amount: 10 })
    expect(r2.error).not.toBeNull()
  })

  it('B no puede leer, listar, sobrescribir ni borrar archivos de A', async () => {
    const dl = await sb.b.storage.from(BUCKET).download(archivoA)
    expect(dl.data).toBeNull()
    const ls = await sb.b.storage.from(BUCKET).list(ids.a)
    expect((ls.data ?? []).filter((f) => f.id)).toEqual([])
    const up = await sb.b.storage.from(BUCKET).upload(`${ids.a}/${randomUUID()}-trampa.pdf`, new Blob(['%PDF'], { type: 'application/pdf' }))
    expect(up.error).not.toBeNull()
    await sb.b.storage.from(BUCKET).remove([archivoA])
    const sigue = await sb.a.storage.from(BUCKET).download(archivoA)
    expect(sigue.data).not.toBeNull()
  })

  it('un correo fuera del piloto no puede crear perfil (ni por la API directa)', async () => {
    const { data: enPiloto } = await sb.fuera.rpc('fin_en_piloto')
    expect(enPiloto).toBe(false)
    const { error } = await sb.fuera.from('fin_profiles').insert({ user_id: ids.fuera, consent_at: new Date().toISOString() })
    expect(error).not.toBeNull()
    const { error: e2 } = await sb.fuera.from('fin_accounts').insert({ user_id: ids.fuera, name: 'x', kind: 'personal', balance: 1 })
    expect(e2).not.toBeNull() // sin perfil no se puede guardar nada
  })

  it('"Borrar todos mis datos" deja cero filas y cero archivos para A', async () => {
    const r = await borrarTodosMisDatos(sb.a, ids.a)
    expect(r.archivosRestantes).toBe(0)
    for (const t of TABLAS) {
      const { count } = await admin.from(t).select('*', { count: 'exact', head: true }).eq('user_id', ids.a)
      expect(count, t).toBe(0)
    }
    const { data: archivos } = await admin.storage.from(BUCKET).list(ids.a)
    expect((archivos ?? []).filter((f) => f.id)).toEqual([])
    archivoA = ''
  })
})
