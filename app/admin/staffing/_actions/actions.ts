"use server"

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  isUuid,
  timesOverlap,
  fromYmd,
  addDays,
  ymd,
  mondayIndex,
  REJECT_REASONS,
  type AssignmentStatus,
  type CandidateStage,
  type StaffStatus,
} from '@/lib/staffing'

type Res = { success: boolean; error?: string; warning?: string }

// Mismo guard que el resto del admin: cookie admin_auth === ADMIN_PASSWORD.
// Las server actions se pueden invocar por POST directo, así que se revalida aquí
// aunque el middleware ya proteja /admin. Nunca se expone el service role al cliente.
function esAdmin(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  return Boolean(envPassword) && cookies().get('admin_auth')?.value === envPassword
}
const NO_AUTH: Res = { success: false, error: 'Sesión de admin expirada. Vuelve a iniciar sesión.' }

function revalidar() {
  revalidatePath('/admin/staffing')
  revalidatePath('/admin/staffing/needs')
  revalidatePath('/admin/staffing/staff')
  revalidatePath('/admin/staffing/candidates')
  revalidatePath('/admin')
}

const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const nOrNull = (v: unknown) => (s(v) ? s(v) : null)

// ===========================================================================
// Asignaciones
// ===========================================================================

export async function asignarStaff(needId: string, staffId: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(needId) || !isUuid(staffId)) return { success: false, error: 'Datos inválidos.' }

  // Necesidad destino (para fecha/horario).
  const { data: need, error: needErr } = await supabaseAdmin
    .from('staffing_needs')
    .select('id, shift_date, start_time, end_time')
    .eq('id', needId)
    .single()
  if (needErr || !need) return { success: false, error: 'No encontramos ese turno.' }

  // ¿Ya está asignada esta persona a este turno?
  const { data: yaAqui } = await supabaseAdmin
    .from('staffing_assignments')
    .select('id')
    .eq('need_id', needId)
    .eq('staff_id', staffId)
    .maybeSingle()
  if (yaAqui) return { success: false, error: 'Esa persona ya está en este turno.' }

  // Choque: mismo día, horario que se pisa con otra asignación de la persona.
  const { data: suyas } = await supabaseAdmin
    .from('staffing_assignments')
    .select('id, staffing_needs(shift_date, start_time, end_time)')
    .eq('staff_id', staffId)

  const choca = (suyas || []).some((a: any) => {
    const nd = a.staffing_needs
    return nd && nd.shift_date === need.shift_date && timesOverlap(need.start_time, need.end_time, nd.start_time, nd.end_time)
  })
  if (choca) {
    return { success: false, error: 'Esa persona ya tiene un turno que se cruza ese día. Quita el otro primero.' }
  }

  const { error } = await supabaseAdmin
    .from('staffing_assignments')
    .insert({ need_id: needId, staff_id: staffId, status: 'draft' as AssignmentStatus })
  if (error) {
    console.error('[STAFFING] asignar:', error)
    return { success: false, error: 'No pudimos asignar.' }
  }
  revalidar()
  return { success: true }
}

export async function cambiarEstadoAsignacion(assignmentId: string, status: AssignmentStatus): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(assignmentId) || !['draft', 'confirmed'].includes(status)) return { success: false, error: 'Datos inválidos.' }
  const { error } = await supabaseAdmin.from('staffing_assignments').update({ status }).eq('id', assignmentId)
  if (error) {
    console.error('[STAFFING] estado asignación:', error)
    return { success: false, error: 'No pudimos actualizar el estado.' }
  }
  revalidar()
  return { success: true }
}

export async function quitarAsignacion(assignmentId: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(assignmentId)) return { success: false, error: 'Datos inválidos.' }
  const { error } = await supabaseAdmin.from('staffing_assignments').delete().eq('id', assignmentId)
  if (error) {
    console.error('[STAFFING] quitar asignación:', error)
    return { success: false, error: 'No pudimos quitar la asignación.' }
  }
  revalidar()
  return { success: true }
}

export async function actualizarNotaTurno(needId: string, notes: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(needId)) return { success: false, error: 'Datos inválidos.' }
  const { error } = await supabaseAdmin.from('staffing_needs').update({ notes: nOrNull(notes) }).eq('id', needId)
  if (error) return { success: false, error: 'No pudimos guardar la nota.' }
  revalidar()
  return { success: true }
}

// ===========================================================================
// Necesidades (turnos)
// ===========================================================================

export interface NeedsBulkPayload {
  client_id: string
  desde: string // YYYY-MM-DD
  hasta: string // YYYY-MM-DD
  dias: number[] // lunes=0 ... domingo=6
  start_time: string // HH:MM
  end_time: string
  role: string
  headcount: number
  notes?: string
}

export async function crearNeedsBulk(p: NeedsBulkPayload): Promise<Res & { created?: number; skipped?: number }> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(p.client_id)) return { success: false, error: 'Elige un cliente.' }
  if (!p.desde || !p.hasta) return { success: false, error: 'Elige el rango de fechas.' }
  if (!Array.isArray(p.dias) || p.dias.length === 0) return { success: false, error: 'Marca al menos un día de la semana.' }
  if (!p.start_time || !p.end_time) return { success: false, error: 'Faltan las horas.' }
  if (p.start_time >= p.end_time) return { success: false, error: 'La hora de fin debe ser mayor a la de inicio.' }
  if (!s(p.role)) return { success: false, error: 'Falta el rol.' }
  const headcount = Math.max(1, Math.round(Number(p.headcount) || 1))

  const inicio = fromYmd(p.desde)
  const fin = fromYmd(p.hasta)
  if (inicio > fin) return { success: false, error: 'El rango de fechas está al revés.' }
  if ((fin.getTime() - inicio.getTime()) / 86400000 > 370) return { success: false, error: 'El rango no puede superar un año.' }

  const diasSet = new Set(p.dias)
  let created = 0
  let skipped = 0
  for (let d = new Date(inicio); d <= fin; d = addDays(d, 1)) {
    if (!diasSet.has(mondayIndex(d))) continue
    const row = {
      client_id: p.client_id,
      shift_date: ymd(d),
      start_time: p.start_time,
      end_time: p.end_time,
      role: s(p.role),
      headcount,
      notes: nOrNull(p.notes),
    }
    const { error } = await supabaseAdmin.from('staffing_needs').insert(row)
    if (error) {
      if (error.code === '23505') skipped++ // duplicado por unique constraint → se ignora
      else {
        console.error('[STAFFING] crear need:', error)
        return { success: false, error: 'No pudimos crear algunos turnos.', created, skipped }
      }
    } else {
      created++
    }
  }
  revalidar()
  return { success: true, created, skipped }
}

export async function actualizarNeed(
  id: string,
  patch: Partial<Pick<NeedsBulkPayload, 'start_time' | 'end_time' | 'role' | 'headcount' | 'notes'>>,
): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(id)) return { success: false, error: 'Datos inválidos.' }
  const upd: Record<string, unknown> = {}
  if (patch.start_time) upd.start_time = patch.start_time
  if (patch.end_time) upd.end_time = patch.end_time
  if (patch.role != null) upd.role = s(patch.role)
  if (patch.headcount != null) upd.headcount = Math.max(1, Math.round(Number(patch.headcount) || 1))
  if (patch.notes !== undefined) upd.notes = nOrNull(patch.notes)
  if (upd.start_time && upd.end_time && upd.start_time >= upd.end_time) {
    return { success: false, error: 'La hora de fin debe ser mayor a la de inicio.' }
  }
  const { error } = await supabaseAdmin.from('staffing_needs').update(upd).eq('id', id)
  if (error) {
    if (error.code === '23505') return { success: false, error: 'Ya existe un turno igual (cliente/fecha/hora/rol).' }
    console.error('[STAFFING] actualizar need:', error)
    return { success: false, error: 'No pudimos guardar los cambios.' }
  }
  revalidar()
  return { success: true }
}

export async function eliminarNeed(id: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(id)) return { success: false, error: 'Datos inválidos.' }
  // Las asignaciones del turno se van en cascada si la FK lo define; si no,
  // las limpiamos primero para no dejar huérfanas.
  await supabaseAdmin.from('staffing_assignments').delete().eq('need_id', id)
  const { error } = await supabaseAdmin.from('staffing_needs').delete().eq('id', id)
  if (error) {
    console.error('[STAFFING] eliminar need:', error)
    return { success: false, error: 'No pudimos eliminar el turno.' }
  }
  revalidar()
  return { success: true }
}

// ===========================================================================
// Personal
// ===========================================================================

export interface StaffPayload {
  full_name: string
  phone?: string
  email?: string
  status: StaffStatus
  notes?: string
}

export async function crearStaff(p: StaffPayload): Promise<Res & { id?: string }> {
  if (!esAdmin()) return NO_AUTH
  if (!s(p.full_name)) return { success: false, error: 'El nombre es obligatorio.' }
  const status: StaffStatus = ['active', 'trial', 'inactive'].includes(p.status) ? p.status : 'active'
  const { data, error } = await supabaseAdmin
    .from('staffing_staff')
    .insert({ full_name: s(p.full_name), phone: nOrNull(p.phone), email: nOrNull(p.email), status, notes: nOrNull(p.notes) })
    .select('id')
    .single()
  if (error || !data) {
    console.error('[STAFFING] crear staff:', error)
    return { success: false, error: 'No pudimos crear la persona.' }
  }
  revalidar()
  return { success: true, id: data.id }
}

export async function actualizarStaff(id: string, p: StaffPayload): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(id)) return { success: false, error: 'Datos inválidos.' }
  if (!s(p.full_name)) return { success: false, error: 'El nombre es obligatorio.' }
  const status: StaffStatus = ['active', 'trial', 'inactive'].includes(p.status) ? p.status : 'active'
  const { error } = await supabaseAdmin
    .from('staffing_staff')
    .update({ full_name: s(p.full_name), phone: nOrNull(p.phone), email: nOrNull(p.email), status, notes: nOrNull(p.notes) })
    .eq('id', id)
  if (error) {
    console.error('[STAFFING] actualizar staff:', error)
    return { success: false, error: 'No pudimos guardar los cambios.' }
  }
  revalidar()
  return { success: true }
}

export async function eliminarStaff(id: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(id)) return { success: false, error: 'Datos inválidos.' }
  await supabaseAdmin.from('staffing_assignments').delete().eq('staff_id', id)
  const { error } = await supabaseAdmin.from('staffing_staff').delete().eq('id', id)
  if (error) {
    console.error('[STAFFING] eliminar staff:', error)
    return { success: false, error: 'No pudimos eliminar la persona.' }
  }
  revalidar()
  return { success: true }
}

// ===========================================================================
// Candidatos (pipeline de reclutamiento)
// ===========================================================================

export interface CandidatePayload {
  full_name: string
  phone?: string
  email?: string
  english_level?: string
  availability?: string
  source?: string
  notes?: string
}

export async function crearCandidato(p: CandidatePayload): Promise<Res & { id?: string }> {
  if (!esAdmin()) return NO_AUTH
  if (!s(p.full_name)) return { success: false, error: 'El nombre es obligatorio.' }
  const { data, error } = await supabaseAdmin
    .from('staffing_candidates')
    .insert({
      full_name: s(p.full_name),
      phone: nOrNull(p.phone),
      email: nOrNull(p.email),
      english_level: nOrNull(p.english_level),
      availability: nOrNull(p.availability),
      source: nOrNull(p.source),
      stage: 'applied' as CandidateStage,
    })
    .select('id')
    .single()
  if (error || !data) {
    console.error('[STAFFING] crear candidato:', error)
    return { success: false, error: 'No pudimos crear el candidato.' }
  }
  revalidar()
  return { success: true, id: data.id }
}

export async function moverCandidato(id: string, stage: CandidateStage, reason?: string): Promise<Res> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(id)) return { success: false, error: 'Datos inválidos.' }
  const stages: CandidateStage[] = ['applied', 'interview', 'trial', 'hired', 'rejected']
  if (!stages.includes(stage)) return { success: false, error: 'Etapa inválida.' }

  const upd: Record<string, unknown> = { stage, updated_at: new Date().toISOString() }
  if (stage === 'rejected') {
    // Motivo obligatorio y SOLO de la lista fija (nada de apariencia/nacionalidad).
    if (!reason || !(REJECT_REASONS as readonly string[]).includes(reason)) {
      return { success: false, error: 'Elige un motivo de rechazo de la lista.' }
    }
    upd.reason = reason
  } else {
    upd.reason = null
  }
  const { error } = await supabaseAdmin.from('staffing_candidates').update(upd).eq('id', id)
  if (error) {
    console.error('[STAFFING] mover candidato:', error)
    return { success: false, error: 'No pudimos mover el candidato.' }
  }
  revalidar()
  return { success: true }
}

/** Contrata: crea una persona en staffing_staff (status 'trial') y marca el candidato 'hired'. */
export async function contratarCandidato(id: string): Promise<Res & { staffId?: string }> {
  if (!esAdmin()) return NO_AUTH
  if (!isUuid(id)) return { success: false, error: 'Datos inválidos.' }
  const { data: cand, error: candErr } = await supabaseAdmin.from('staffing_candidates').select('*').eq('id', id).single()
  if (candErr || !cand) return { success: false, error: 'No encontramos el candidato.' }

  const { data: nuevo, error: staffErr } = await supabaseAdmin
    .from('staffing_staff')
    .insert({
      full_name: cand.full_name,
      phone: cand.phone,
      email: cand.email,
      status: 'trial' as StaffStatus,
      notes: `Contratado desde reclutamiento. Inglés: ${cand.english_level || '—'}. Disponibilidad: ${cand.availability || '—'}. Fuente: ${cand.source || '—'}.`,
    })
    .select('id')
    .single()
  if (staffErr || !nuevo) {
    console.error('[STAFFING] contratar (staff):', staffErr)
    return { success: false, error: 'No pudimos crear la persona en el equipo.' }
  }

  const { error: updErr } = await supabaseAdmin
    .from('staffing_candidates')
    .update({ stage: 'hired' as CandidateStage, reason: null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (updErr) console.error('[STAFFING] contratar (update candidato):', updErr)

  revalidar()
  return { success: true, staffId: nuevo.id }
}
