// ===========================================================================
// Staffing · lógica pura (sin red, sin React). Fácil de testear y reutilizar
// tanto en server components como en client components.
// ===========================================================================

export type StaffStatus = 'active' | 'trial' | 'inactive'
export type AssignmentStatus = 'draft' | 'confirmed'
export type CandidateStage = 'applied' | 'interview' | 'trial' | 'hired' | 'rejected'
export type SlotStatus = 'ok' | 'draft' | 'missing'

export interface StaffingClient {
  id: string
  name: string
  location: string
  color: string
  active: boolean
}

export interface StaffMember {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  status: StaffStatus
  notes: string | null
}

export interface StaffingNeed {
  id: string
  client_id: string
  shift_date: string // YYYY-MM-DD
  start_time: string // HH:MM:SS
  end_time: string
  role: string
  headcount: number
  notes: string | null
}

export interface StaffingAssignment {
  id: string
  need_id: string
  staff_id: string
  status: AssignmentStatus
}

export interface StaffingCandidate {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  english_level: string | null
  availability: string | null
  source: string | null
  stage: CandidateStage
  reason: string | null
  notes: string | null
}

// Fila de la vista staffing_coverage (conteos ya agregados por necesidad).
export interface CoverageRow {
  need_id: string
  shift_date: string
  start_time: string
  end_time: string
  role: string
  headcount: number
  client_name: string
  client_color: string
  assigned: number
  confirmed: number
  missing: number
}

// Nombre del personal asignado a una necesidad (para pintar en la celda).
export interface AssignedStaff {
  assignment_id: string
  staff_id: string
  full_name: string
  status: AssignmentStatus
}

// ---------------------------------------------------------------------------
// Fechas (trabajamos con 'YYYY-MM-DD' en horario local, sin saltos de zona)
// ---------------------------------------------------------------------------

export const DIAS_ES = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'] // índice 0 = lunes
export const DIAS_ES_LARGO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** 'YYYY-MM-DD' de un Date en horario local. */
export function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Date local (mediodía, para evitar corrimientos por zona horaria) desde 'YYYY-MM-DD'. */
export function fromYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0)
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Índice de día con lunes=0 ... domingo=6. */
export function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7
}

/** Lunes de la semana que contiene a `d`. */
export function startOfWeek(d: Date): Date {
  return addDays(d, -mondayIndex(d))
}

/** Los 7 Date (lun→dom) de la semana de `d`. */
export function weekDates(d: Date): Date[] {
  const mon = startOfWeek(d)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

/** Semanas (filas de 7 días lun→dom) que cubren el mes de `anchor`. */
export function monthWeeks(anchor: Date): Date[][] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12)
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 12)
  const weeks: Date[][] = []
  let cursor = startOfWeek(first)
  while (cursor <= last) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)))
    cursor = addDays(cursor, 7)
  }
  return weeks
}

export function sameMonth(d: Date, anchor: Date): boolean {
  return d.getMonth() === anchor.getMonth() && d.getFullYear() === anchor.getFullYear()
}

/** 'HH:MM:SS' o 'HH:MM' → 'HH:MM'. */
export function fmtTime(t: string | null | undefined): string {
  if (!t) return ''
  return t.slice(0, 5)
}

export function fmtRango(start: string, end: string): string {
  return `${fmtTime(start)}–${fmtTime(end)}`
}

export function rangoSemanaLabel(d: Date): string {
  const [ini, , , , , , fin] = weekDates(d)
  const mi = MESES_ES[ini.getMonth()].slice(0, 3)
  const mf = MESES_ES[fin.getMonth()].slice(0, 3)
  if (ini.getMonth() === fin.getMonth()) return `${ini.getDate()}–${fin.getDate()} ${mi} ${fin.getFullYear()}`
  return `${ini.getDate()} ${mi} – ${fin.getDate()} ${mf} ${fin.getFullYear()}`
}

export function mesLabel(d: Date): string {
  return `${MESES_ES[d.getMonth()][0].toUpperCase()}${MESES_ES[d.getMonth()].slice(1)} ${d.getFullYear()}`
}

export function fechaCortaEs(s: string): string {
  const d = fromYmd(s)
  return `${DIAS_ES[mondayIndex(d)]} ${d.getDate()} ${MESES_ES[d.getMonth()].slice(0, 3)}`
}

// ---------------------------------------------------------------------------
// Solapamiento de horarios y estado de cobertura
// ---------------------------------------------------------------------------

/** ¿Los rangos [aStart,aEnd) y [bStart,bEnd) se pisan? (mismo día, 'HH:MM:SS'). */
export function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd
}

export function slotStatus(row: Pick<CoverageRow, 'headcount' | 'assigned' | 'confirmed' | 'missing'>): SlotStatus {
  if ((row.missing ?? 0) > 0) return 'missing'
  if ((row.confirmed ?? 0) < (row.headcount ?? 0)) return 'draft'
  return 'ok'
}

export const SLOT_STYLE: Record<SlotStatus, { chip: string; label: (r: CoverageRow) => string }> = {
  missing: { chip: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]', label: (r) => `FALTAN ${r.missing}` },
  draft: { chip: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]', label: () => 'BORRADOR' },
  ok: { chip: 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]', label: () => 'OK' },
}

export interface CoverageTotals { slots: number; missing: number; draft: number; confirmed: number }

export function sumTotals(rows: CoverageRow[]): CoverageTotals {
  const t: CoverageTotals = { slots: 0, missing: 0, draft: 0, confirmed: 0 }
  for (const r of rows) {
    t.slots += 1
    t.missing += r.missing || 0
    const s = slotStatus(r)
    if (s === 'draft') t.draft += 1
    if (s === 'ok') t.confirmed += 1
  }
  return t
}

// Motivos fijos de rechazo. Nada de texto libre sobre apariencia o nacionalidad.
export const REJECT_REASONS = ['Presentación', 'Nivel de inglés', 'Disponibilidad', 'No-show', 'Otro'] as const
export type RejectReason = (typeof REJECT_REASONS)[number]

export const STAGE_LABEL: Record<CandidateStage, string> = {
  applied: 'Aplicó',
  interview: 'Entrevista',
  trial: 'Prueba',
  hired: 'Contratado',
  rejected: 'Rechazado',
}

export const STAFF_STATUS_LABEL: Record<StaffStatus, string> = {
  active: 'Activo',
  trial: 'En prueba',
  inactive: 'Inactivo',
}

export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}
