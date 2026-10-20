// Prueba de seguridad del portal del cliente contra el Supabase real.
// Dos clientes con su propia sesión (anon key): cada uno ve solo su
// solicitud, nadie puede leer ni adueñarse de la del otro, y la activación
// por token no se puede robar con otra cuenta.
//
// Solo corre con RUN_RLS_TESTS=1 (necesita NEXT_PUBLIC_SUPABASE_URL,
// NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY). La service role
// se usa para preparar y limpiar, y es la misma vía que usan el webhook y
// /activar en producción (crearSolicitud, activarSolicitud).

import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { activarSolicitud, crearSolicitud, solicitudPorToken } from '../lib/portal/solicitudes'

const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!
const activo = process.env.RUN_RLS_TESTS === '1' && URL_SB && ANON && SERVICE

describe.skipIf(!activo)('Portal: solicitudes con dos clientes y la anon key', () => {
  const admin = activo ? createClient(URL_SB, SERVICE, { auth: { persistSession: false } }) : (null as never)
  const sufijo = randomUUID().slice(0, 8)
  const usuarios = {
    a: { email: `portal-rls-a-${sufijo}@example.com`, password: randomUUID() },
    b: { email: `portal-rls-b-${sufijo}@example.com`, password: randomUUID() },
  }
  const sesiones = { a: `cs_test_portal_a_${sufijo}`, b: `cs_test_portal_b_${sufijo}` }
  const ids: Record<string, string> = {}
  const sb: Record<string, SupabaseClient> = {}
  const sol: Record<string, { id: string; token: string }> = {}

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
    for (const k of ['a', 'b'] as const) {
      // Correo de pago distinto al de la cuenta: la llave es el token.
      const s = await crearSolicitud({ email_pago: `pago-${k}-${sufijo}@example.com`, nombre_cliente: `Cliente ${k.toUpperCase()}`, pais: 'japon', servicio: 'Visa de Turismo Japón (Sin Traducción)', stripe_session_id: sesiones[k] })
      sol[k] = { id: s.id, token: s.token }
    }
  }, 60_000)

  afterAll(async () => {
    if (!activo) return
    await admin.from('solicitudes').delete().in('stripe_session_id', Object.values(sesiones))
    for (const id of Object.values(ids)) await admin.auth.admin.deleteUser(id)
  }, 60_000)

  it('el pago crea la fila con un token de 64 hex, pendiente de activación', async () => {
    const fila = await solicitudPorToken(sol.a.token)
    expect(sol.a.token).toMatch(/^[0-9a-f]{64}$/)
    expect(fila?.user_id).toBeNull()
    expect(fila?.activada_at).toBeNull()
  })

  it('reenviar el mismo evento no crea una segunda fila', async () => {
    const otra = await crearSolicitud({ email_pago: 'x@example.com', nombre_cliente: null, pais: 'japon', servicio: null, stripe_session_id: sesiones.a })
    expect(otra.nueva).toBe(false)
    expect(otra.id).toBe(sol.a.id)
    const { count } = await admin.from('solicitudes').select('id', { count: 'exact', head: true }).eq('stripe_session_id', sesiones.a)
    expect(count).toBe(1)
  })

  it('antes de activar, ni el dueño futuro ni nadie la puede leer con su sesión', async () => {
    expect((await sb.a.from('solicitudes').select('id').eq('id', sol.a.id)).data).toEqual([])
    expect((await createClient(URL_SB, ANON).from('solicitudes').select('id')).data).toEqual([])
  })

  it('token inventado: invalida', async () => {
    expect(await activarSolicitud('f'.repeat(64), ids.a)).toBe('invalida')
    expect(await activarSolicitud('no-es-un-token', ids.a)).toBe('invalida')
  })

  it('activar amarra user_id, activada_at y estado', async () => {
    expect(await activarSolicitud(sol.a.token, ids.a)).toBe('activada')
    expect(await activarSolicitud(sol.b.token, ids.b)).toBe('activada')
    const { data } = await admin.from('solicitudes').select('user_id, activada_at, estado').eq('id', sol.a.id).single()
    expect(data).toMatchObject({ user_id: ids.a, estado: 'activa' })
    expect(data?.activada_at).not.toBeNull()
  })

  it('el mismo link con otra cuenta NO la roba', async () => {
    expect(await activarSolicitud(sol.a.token, ids.b)).toBe('ajena')
    expect(await activarSolicitud(sol.a.token, ids.a)).toBe('ya_tuya')
    const { data } = await admin.from('solicitudes').select('user_id').eq('id', sol.a.id).single()
    expect(data?.user_id).toBe(ids.a)
  })

  it('cada cliente ve solo su solicitud', async () => {
    const a = await sb.a.from('solicitudes').select('id')
    const b = await sb.b.from('solicitudes').select('id')
    expect(a.data?.map((f) => f.id)).toEqual([sol.a.id])
    expect(b.data?.map((f) => f.id)).toEqual([sol.b.id])
  })

  it('leer la del otro por la API con la sesión equivocada devuelve vacío', async () => {
    expect((await sb.b.from('solicitudes').select('*').eq('id', sol.a.id)).data).toEqual([])
    expect((await sb.b.from('solicitudes').select('*').eq('token', sol.a.token)).data).toEqual([])
    expect((await sb.b.from('solicitudes').select('*').eq('user_id', ids.a)).data).toEqual([])
  })

  it('B no puede editar, borrar ni crear filas ajenas', async () => {
    const upd = await sb.b.from('solicitudes').update({ user_id: ids.b }).eq('id', sol.a.id).select('id')
    expect(upd.data ?? []).toEqual([])
    const del = await sb.b.from('solicitudes').delete().eq('id', sol.a.id).select('id')
    expect(del.data ?? []).toEqual([])
    const ins = await sb.b.from('solicitudes').insert({ email_pago: 'b@example.com', pais: 'usa', user_id: ids.b })
    expect(ins.error).not.toBeNull()
    const { data } = await admin.from('solicitudes').select('user_id').eq('id', sol.a.id).single()
    expect(data?.user_id).toBe(ids.a)
  })

  it('el dueño no puede regalarle su fila a otra cuenta', async () => {
    const r = await sb.b.from('solicitudes').update({ user_id: ids.a }).eq('id', sol.b.id).select('id')
    expect(r.error).not.toBeNull()
    const { data } = await admin.from('solicitudes').select('user_id').eq('id', sol.b.id).single()
    expect(data?.user_id).toBe(ids.b)
  })

  // Requiere supabase/portal_solicitudes_permisos.sql: sin él, la política de
  // UPDATE deja al dueño editar cualquier columna de su propia fila.
  it('el dueño no puede tocar estado, activada_at ni token de su propia fila', async () => {
    for (const cambio of [{ estado: 'completada' }, { activada_at: null }, { token: 'f'.repeat(64) }]) {
      const r = await sb.a.from('solicitudes').update(cambio).eq('id', sol.a.id).select('id')
      expect(r.data ?? []).toEqual([])
    }
    const { data } = await admin.from('solicitudes').select('estado, token').eq('id', sol.a.id).single()
    expect(data).toMatchObject({ estado: 'activa', token: sol.a.token })
  })

  it('sin sesión no se ve nada', async () => {
    const anon = createClient(URL_SB, ANON, { auth: { persistSession: false } })
    expect((await anon.from('solicitudes').select('*')).data).toEqual([])
  })
})
