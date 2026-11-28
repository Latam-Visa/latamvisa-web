"use server"

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/staffing'
import { esFecha } from '@/lib/deadlines/dates'
import {
  ACTIVITY_TYPES, EMAIL_STATUSES, SEGMENTS, STAGES, stageNote,
  type ActivityType, type EmailStatus, type Prospect, type Segment, type Stage,
} from '@/lib/sales'
import { cargarProspectos } from '@/lib/sales/datos'

type Res = { success: boolean; error?: string; message?: string }

// Mismo guard que /admin/staffing: las server actions aceptan POST directo.
function esAdmin(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  return Boolean(envPassword) && cookies().get('admin_auth')?.value === envPassword
}
const NO_AUTH: Res = { success: false, error: 'Admin session expired. Please log in again.' }
const INVALID: Res = { success: false, error: 'Invalid data.' }

function revalidar() {
  revalidatePath('/admin/sales')
  revalidatePath('/admin/sales/report')
  revalidatePath('/admin')
}

const ahora = () => new Date().toISOString()
const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 4000) : null)

// Solo estas columnas se pueden editar, cada una validada.
function limpiar(patch: Record<string, unknown>): Record<string, unknown> | null {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'full_name') {
      if (!texto(v)) return null
      out[k] = texto(v)
    } else if (['job_title', 'company', 'email', 'city', 'source', 'next_step', 'notes'].includes(k)) {
      out[k] = texto(v)
    } else if (k === 'email_status') {
      if (!EMAIL_STATUSES.includes(v as EmailStatus)) return null
      out[k] = v
    } else if (k === 'segment') {
      if (!SEGMENTS.includes(v as Segment)) return null
      out[k] = v
    } else if (k === 'priority') {
      const n = Number(v)
      if (![1, 2, 3].includes(n)) return null
      out[k] = n
    } else if (k === 'next_step_date') {
      if (v && !esFecha(v)) return null
      out[k] = v || null
    } else if (k === 'estimated_value') {
      if (v === '' || v == null) out[k] = null
      else {
        const n = Number(v)
        if (!Number.isFinite(n) || n < 0) return null
        out[k] = n
      }
    } else if (k !== 'stage') return null
  }
  return out
}

// Una lista larga de uuids no cabe en la URL de PostgREST.
const lotes = (ids: string[]) => Array.from({ length: Math.ceil(ids.length / 100) }, (_, i) => ids.slice(i * 100, i * 100 + 100))

// Cambia la etapa de varios prospectos y deja la nota que alimenta fechas y reporte.
async function cambiarEtapa(ids: string[], stage: Stage): Promise<Res> {
  const { data, error } = await supabaseAdmin.from('sales_prospects').select('id, stage').in('id', ids)
  if (error) return { success: false, error: error.message }
  const cambian = (data || []).filter((p) => p.stage !== stage)
  if (!cambian.length) return { success: true }
  const up = await supabaseAdmin
    .from('sales_prospects')
    .update({ stage, updated_at: ahora() })
    .in('id', cambian.map((p) => p.id))
  if (up.error) return { success: false, error: up.error.message }
  const ins = await supabaseAdmin
    .from('sales_activities')
    .insert(cambian.map((p) => ({ prospect_id: p.id, type: 'note', summary: stageNote(p.stage as Stage, stage) })))
  if (ins.error) return { success: false, error: `Stage saved, but the history note failed: ${ins.error.message}` }
  return { success: true }
}

export async function updateProspect(id: string, patch: Record<string, unknown>): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  const campos = isUuid(id) ? limpiar(patch) : null
  const stage = patch.stage as Stage | undefined
  if (!campos || (stage !== undefined && !STAGES.includes(stage))) return INVALID
  if (Object.keys(campos).length) {
    const { error } = await supabaseAdmin.from('sales_prospects').update({ ...campos, updated_at: ahora() }).eq('id', id)
    if (error) return { success: false, error: error.message }
  }
  const res = stage ? await cambiarEtapa([id], stage) : { success: true }
  revalidar()
  return res
}

export async function bulkUpdate(ids: string[], change: { stage?: Stage; priority?: number }): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!Array.isArray(ids) || !ids.length || ids.length > 500 || !ids.every(isUuid)) return INVALID
  let res: Res = { success: true }
  if (change.stage !== undefined) {
    if (!STAGES.includes(change.stage)) return INVALID
    for (const lote of lotes(ids)) {
      res = await cambiarEtapa(lote, change.stage)
      if (!res.success) break
    }
  } else {
    if (![1, 2, 3].includes(change.priority as number)) return INVALID
    for (const lote of lotes(ids)) {
      const { error } = await supabaseAdmin.from('sales_prospects').update({ priority: change.priority, updated_at: ahora() }).in('id', lote)
      if (error) { res = { success: false, error: error.message }; break }
    }
  }
  revalidar()
  return res
}

export async function logActivity(prospectId: string, type: ActivityType, summary: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(prospectId) || !ACTIVITY_TYPES.includes(type)) return INVALID
  const { data: p, error: pErr } = await supabaseAdmin.from('sales_prospects').select('stage').eq('id', prospectId).single()
  if (pErr || !p) return { success: false, error: 'Prospect not found.' }
  const { error } = await supabaseAdmin.from('sales_activities').insert({ prospect_id: prospectId, type, summary: texto(summary) })
  if (error) return { success: false, error: error.message }
  // Un email a un prospecto nuevo lo pasa a contactado.
  const patch: Record<string, unknown> = { updated_at: ahora() }
  if (type === 'email' && p.stage === 'new') patch.stage = 'contacted'
  const up = await supabaseAdmin.from('sales_prospects').update(patch).eq('id', prospectId)
  revalidar()
  return up.error ? { success: false, error: up.error.message } : { success: true }
}

function segmentoDeLinea(line: string): Segment {
  const l = line.toLowerCase()
  if (l.includes('office')) return 'office_cleaning'
  if (l.includes('construction')) return 'construction_cleaning'
  return 'luxury_retail'
}

// Upsert por (full_name, company) sin distinguir mayúsculas. En los que ya
// existen solo se pisan las columnas que traen dato; etapa y notas no se tocan.
export async function importCsv(csv: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (typeof csv !== 'string' || csv.length > 4_000_000) return { success: false, error: 'File too large.' }
  let filas: Record<string, string>[]
  try {
    filas = parse(csv, {
      bom: true, skip_empty_lines: true, trim: true, relax_column_count: true,
      columns: (h: string[]) => h.map((x) => x.trim().toLowerCase()),
    }) as Record<string, string>[]
  } catch {
    return { success: false, error: 'Could not read that CSV.' }
  }
  if (!filas.length || !('name' in filas[0])) return { success: false, error: 'The CSV needs a "name" column.' }
  if (filas.length > 2000) return { success: false, error: 'Max 2000 rows per import.' }

  const clave = (n: string, c: string | null) => `${n.trim().toLowerCase()}|${(c || '').trim().toLowerCase()}`
  let existentes: Prospect[]
  try {
    existentes = await cargarProspectos()
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
  const porClave = new Map(existentes.map((p) => [clave(p.full_name, p.company), p.id]))
  const nuevos = new Map<string, Record<string, unknown>>()
  let actualizados = 0, saltados = 0, fallidos = 0

  for (const f of filas) {
    if (!f.name) { saltados++; continue }
    const campos: Record<string, unknown> = {}
    if (f.job_title) campos.job_title = f.job_title
    if (f.email) campos.email = f.email
    if (f.source) campos.source = f.source
    if (f.line) campos.segment = segmentoDeLinea(f.line)
    const estado = (f.email_status || '').toLowerCase().replace(/[\s-]+/g, '_') as EmailStatus
    if (EMAIL_STATUSES.includes(estado)) campos.email_status = estado
    const k = clave(f.name, f.company || null)
    const id = porClave.get(k)
    if (id) {
      const { error } = await supabaseAdmin.from('sales_prospects').update({ ...campos, updated_at: ahora() }).eq('id', id)
      if (error) fallidos++
      else actualizados++
    } else {
      // Filas repetidas dentro del archivo: gana la última.
      nuevos.set(k, {
        full_name: f.name, company: f.company || null, job_title: null, email: null,
        source: 'Apollo', segment: segmentoDeLinea(f.line || ''), email_status: 'pending',
        ...campos,
      })
    }
  }
  let insertados = 0
  for (const fila of Array.from(nuevos.values())) {
    const { error } = await supabaseAdmin.from('sales_prospects').insert(fila)
    if (error) fallidos++
    else insertados++
  }
  revalidar()
  return {
    success: fallidos === 0,
    message: `${insertados} added, ${actualizados} updated, ${saltados} skipped (no name).`,
    error: fallidos ? `${insertados} added, ${actualizados} updated, ${fallidos} failed.` : undefined,
  }
}
