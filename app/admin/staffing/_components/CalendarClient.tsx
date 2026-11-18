"use client"

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, AlertTriangle, Check, Clock, Trash2, Plus } from 'lucide-react'
import {
  ymd,
  fromYmd,
  weekDates,
  monthWeeks,
  sameMonth,
  rangoSemanaLabel,
  mesLabel,
  fmtRango,
  fechaCortaEs,
  slotStatus,
  SLOT_STYLE,
  sumTotals,
  DIAS_ES,
  MESES_ES,
  type CoverageRow,
  type StaffingClient,
  type StaffMember,
  type AssignedStaff,
} from '@/lib/staffing'
import { asignarStaff, cambiarEstadoAsignacion, quitarAsignacion, actualizarNotaTurno } from '../_actions/actions'

interface Props {
  view: 'week' | 'month'
  anchorYmd: string
  prevHref: string
  nextHref: string
  todayHref: string
  clients: StaffingClient[]
  coverage: CoverageRow[]
  needClient: Record<string, string>
  needNotes: Record<string, string>
  assigned: Record<string, AssignedStaff[]>
  staff: StaffMember[]
  gaps: CoverageRow[]
}

export function CalendarClient(props: Props) {
  const { view, anchorYmd, clients, coverage, needClient, needNotes, assigned, staff, gaps } = props
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [openNeed, setOpenNeed] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const anchor = fromYmd(anchorYmd)
  const hoyYmd = ymd(new Date())

  // Índice: `${clientId}|${ymd}` → slots de ese cliente ese día.
  const byCell = useMemo(() => {
    const m: Record<string, CoverageRow[]> = {}
    for (const c of coverage) {
      const cid = needClient[c.need_id]
      if (!cid) continue
      ;(m[`${cid}|${c.shift_date}`] ||= []).push(c)
    }
    return m
  }, [coverage, needClient])

  const totals = useMemo(() => sumTotals(coverage), [coverage])
  const openRow = openNeed ? coverage.find((c) => c.need_id === openNeed) || null : null

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null)
    startTransition(async () => {
      const r = await action()
      if (!r.success) setError(r.error || 'Algo salió mal.')
      else router.refresh()
    })
  }

  const weeks = view === 'month' ? monthWeeks(anchor) : [weekDates(anchor)]

  return (
    <div className="space-y-5">
      {/* Barra de resumen + navegación */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Link href={props.prevHref} aria-label="Anterior" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] hover:border-[#0A0A0A]">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href={props.nextHref} aria-label="Siguiente" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] hover:border-[#0A0A0A]">
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link href={props.todayHref} className="ml-1 rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-xs font-semibold text-[#0d2b0d] hover:border-[#0A0A0A]">
            Hoy
          </Link>
          <span className="ml-2 font-[PPMonumentExtended] text-base sm:text-lg text-[#0d2b0d]">
            {view === 'month' ? mesLabel(anchor) : rangoSemanaLabel(anchor)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
            <span className="text-[#6B6B6B]">{totals.slots} turnos</span>
            <Stat n={totals.missing} cls="bg-[#FEE2E2] text-[#B91C1C]" label="faltan" />
            <Stat n={totals.draft} cls="bg-[#FEF3C7] text-[#92400E]" label="borrador" />
            <Stat n={totals.confirmed} cls="bg-[#DCFCE7] text-[#166534]" label="ok" />
          </div>
          <div className="flex rounded-lg border border-[#E5E5E5] p-0.5">
            <Link href={`/admin/staffing?view=week&d=${anchorYmd}`} className={`rounded-md px-3 py-1.5 text-xs font-bold ${view === 'week' ? 'bg-[#C8FF00] text-[#2F4A00]' : 'text-[#6B6B6B]'}`}>Semana</Link>
            <Link href={`/admin/staffing?view=month&d=${anchorYmd}`} className={`rounded-md px-3 py-1.5 text-xs font-bold ${view === 'month' ? 'bg-[#C8FF00] text-[#2F4A00]' : 'text-[#6B6B6B]'}`}>Mes</Link>
          </div>
        </div>
      </div>

      {/* Mobile: totales en línea */}
      <div className="flex sm:hidden items-center gap-2 text-xs font-semibold px-1">
        <span className="text-[#6B6B6B]">{totals.slots} turnos</span>
        <Stat n={totals.missing} cls="bg-[#FEE2E2] text-[#B91C1C]" label="faltan" />
        <Stat n={totals.draft} cls="bg-[#FEF3C7] text-[#92400E]" label="borr." />
        <Stat n={totals.confirmed} cls="bg-[#DCFCE7] text-[#166534]" label="ok" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Calendario */}
        <div className="order-2 lg:order-1 space-y-6">
          {weeks.map((days, wi) => (
            <WeekGrid
              key={wi}
              days={days}
              view={view}
              anchor={anchor}
              hoyYmd={hoyYmd}
              clients={clients}
              byCell={byCell}
              assigned={assigned}
              onOpen={setOpenNeed}
            />
          ))}
          {clients.length === 0 && (
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 text-sm text-[#6B6B6B]">
              No hay clientes todavía. Agrega turnos en <Link href="/admin/staffing/needs" className="font-semibold text-[#2F4A00] underline">Turnos</Link>.
            </div>
          )}
        </div>

        {/* Panel de Gaps (arriba en mobile, a un lado en desktop) */}
        <aside className="order-1 lg:order-2">
          <div className="sticky top-20 rounded-2xl border border-[#FCA5A5] bg-[#FFF5F5] p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-[#B91C1C]" />
              <h3 className="font-[PPMonumentExtended] text-sm text-[#B91C1C]">Gaps · próximos 14 días</h3>
            </div>
            {gaps.length === 0 ? (
              <p className="text-sm text-[#166534] font-medium">Todo cubierto. Nada se está cayendo. 🎉</p>
            ) : (
              <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {gaps.map((g) => (
                  <li key={g.need_id}>
                    <button
                      onClick={() => setOpenNeed(g.need_id)}
                      className="w-full text-left rounded-xl bg-white border border-[#FCA5A5] p-2.5 hover:border-[#B91C1C] transition-colors"
                      style={{ borderLeft: `4px solid ${g.client_color || '#B91C1C'}` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#0d2b0d] truncate">{g.client_name}</span>
                        <span className="shrink-0 rounded-full bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] px-2 py-0.5 text-[11px] font-bold">FALTAN {g.missing}</span>
                      </div>
                      <div className="text-[12px] text-[#6B6B6B] mt-0.5">
                        {fechaCortaEs(g.shift_date)} · {fmtRango(g.start_time, g.end_time)} · {g.role}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {openRow && (
        <SlotDrawer
          row={openRow}
          notes={needNotes[openRow.need_id] || ''}
          assigned={assigned[openRow.need_id] || []}
          staff={staff}
          pending={pending}
          error={error}
          onClose={() => { setOpenNeed(null); setError(null) }}
          onAssign={(staffId) => run(() => asignarStaff(openRow.need_id, staffId))}
          onToggle={(aid, next) => run(() => cambiarEstadoAsignacion(aid, next))}
          onRemove={(aid) => run(() => quitarAsignacion(aid))}
          onSaveNotes={(txt) => run(() => actualizarNotaTurno(openRow.need_id, txt))}
        />
      )}
    </div>
  )
}

function Stat({ n, cls, label }: { n: number; cls: string; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${cls}`}>
      {n} <span className="font-medium opacity-80">{label}</span>
    </span>
  )
}

function WeekGrid({
  days, view, anchor, hoyYmd, clients, byCell, assigned, onOpen,
}: {
  days: Date[]
  view: 'week' | 'month'
  anchor: Date
  hoyYmd: string
  clients: StaffingClient[]
  byCell: Record<string, CoverageRow[]>
  assigned: Record<string, AssignedStaff[]>
  onOpen: (needId: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5E5E5] bg-white">
      <div className="min-w-[760px]">
        {/* Encabezado de días */}
        <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] border-b border-[#E5E5E5] bg-[#FAFAF7]">
          <div className="p-2 text-[11px] font-bold uppercase tracking-wide text-[#A3A3A3]">Cliente</div>
          {days.map((d) => {
            const isToday = ymd(d) === hoyYmd
            const dim = view === 'month' && !sameMonth(d, anchor)
            return (
              <div key={ymd(d)} className={`p-2 text-center border-l border-[#F0F0F0] ${isToday ? 'bg-[#F2FBDD]' : ''}`}>
                <div className={`text-[11px] font-semibold ${dim ? 'text-[#C9C9C9]' : 'text-[#6B6B6B]'}`}>{DIAS_ES[(d.getDay() + 6) % 7]}</div>
                <div className={`text-sm font-bold ${isToday ? 'text-[#2F4A00]' : dim ? 'text-[#C9C9C9]' : 'text-[#0d2b0d]'}`}>
                  {d.getDate()}{view === 'month' && d.getDate() === 1 ? ` ${MESES_ES[d.getMonth()].slice(0, 3)}` : ''}
                </div>
              </div>
            )
          })}
        </div>

        {/* Filas por cliente */}
        {clients.map((client) => (
          <div key={client.id} className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] border-b border-[#F0F0F0] last:border-b-0">
            <div className="p-2 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: client.color || '#C8FF00' }} />
              <span className="text-sm font-bold text-[#0d2b0d] truncate" title={`${client.name} · ${client.location}`}>{client.name}</span>
            </div>
            {days.map((d) => {
              const slots = byCell[`${client.id}|${ymd(d)}`] || []
              const isToday = ymd(d) === hoyYmd
              return (
                <div key={ymd(d)} className={`p-1.5 border-l border-[#F0F0F0] min-h-[72px] space-y-1.5 ${isToday ? 'bg-[#FCFEF5]' : ''}`}>
                  {slots.map((sl) => (
                    <SlotChip key={sl.need_id} row={sl} color={client.color} names={assigned[sl.need_id] || []} onClick={() => onOpen(sl.need_id)} />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function SlotChip({ row, color, names, onClick }: { row: CoverageRow; color: string; names: AssignedStaff[]; onClick: () => void }) {
  const st = slotStatus(row)
  const style = SLOT_STYLE[st]
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg bg-[#FAFAF7] hover:bg-[#F2F2EC] border border-[#EDEDED] p-1.5 transition-colors"
      style={{ borderLeft: `4px solid ${color || '#C8FF00'}` }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-bold text-[#0d2b0d] tabular-nums">{fmtRango(row.start_time, row.end_time)}</span>
        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${style.chip}`}>{style.label(row)}</span>
      </div>
      <div className="text-[10px] text-[#8A8A8A] truncate">{row.role} · {row.assigned}/{row.headcount}</div>
      {names.length > 0 && (
        <div className="mt-0.5 flex flex-wrap gap-0.5">
          {names.map((p) => (
            <span key={p.assignment_id} className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-semibold ${p.status === 'confirmed' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
              {p.status === 'confirmed' ? <Check className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
              {p.full_name.split(' ')[0]}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

function SlotDrawer({
  row, notes, assigned, staff, pending, error, onClose, onAssign, onToggle, onRemove, onSaveNotes,
}: {
  row: CoverageRow
  notes: string
  assigned: AssignedStaff[]
  staff: StaffMember[]
  pending: boolean
  error: string | null
  onClose: () => void
  onAssign: (staffId: string) => void
  onToggle: (assignmentId: string, next: 'draft' | 'confirmed') => void
  onRemove: (assignmentId: string) => void
  onSaveNotes: (txt: string) => void
}) {
  const [pick, setPick] = useState('')
  const [nota, setNota] = useState(notes)
  const asignadosIds = new Set(assigned.map((a) => a.staff_id))
  const disponibles = staff.filter((s) => !asignadosIds.has(s.id))
  const st = slotStatus(row)

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-[420px] overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-[#E5E5E5] bg-white p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: row.client_color || '#C8FF00' }} />
              <h3 className="font-[PPMonumentExtended] text-base text-[#0d2b0d] truncate">{row.client_name}</h3>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{fechaCortaEs(row.shift_date)} · {fmtRango(row.start_time, row.end_time)} · {row.role}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] hover:border-[#0A0A0A]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between rounded-xl bg-[#FAFAF7] border border-[#EDEDED] p-3">
            <span className="text-sm text-[#6B6B6B]">Cobertura</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${SLOT_STYLE[st].chip}`}>
              {row.assigned}/{row.headcount} · {SLOT_STYLE[st].label(row)}
            </span>
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-[#FEF2F2] p-2.5 text-xs text-red-700">{error}</div>}

          {/* Asignados */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#A3A3A3] mb-2">Asignados</h4>
            {assigned.length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">Nadie asignado todavía.</p>
            ) : (
              <ul className="space-y-2">
                {assigned.map((a) => (
                  <li key={a.assignment_id} className="flex items-center justify-between gap-2 rounded-xl border border-[#EDEDED] p-2.5">
                    <span className="text-sm font-semibold text-[#0d2b0d] truncate">{a.full_name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        disabled={pending}
                        onClick={() => onToggle(a.assignment_id, a.status === 'confirmed' ? 'draft' : 'confirmed')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${a.status === 'confirmed' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#92400E]'}`}
                      >
                        {a.status === 'confirmed' ? 'Confirmado' : 'Borrador'}
                      </button>
                      <button disabled={pending} onClick={() => onRemove(a.assignment_id)} aria-label="Quitar" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#B91C1C] hover:border-[#B91C1C] disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Asignar persona */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#A3A3A3] mb-2">Asignar persona</h4>
            <div className="flex gap-2">
              <select
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                className="flex-1 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none"
              >
                <option value="">Elige del equipo…</option>
                {disponibles.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}{s.status === 'trial' ? ' (prueba)' : ''}</option>
                ))}
              </select>
              <button
                disabled={pending || !pick}
                onClick={() => { if (pick) { onAssign(pick); setPick('') } }}
                className="inline-flex items-center gap-1 rounded-lg bg-[#C8FF00] px-3 py-2 text-sm font-bold text-[#2F4A00] hover:bg-[#b8ef00] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Asignar
              </button>
            </div>
            {disponibles.length === 0 && <p className="mt-1.5 text-xs text-[#6B6B6B]">Todo el equipo activo ya está en este turno.</p>}
          </div>

          {/* Notas del turno */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#A3A3A3] mb-2">Notas del turno</h4>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              placeholder="Ej. uniforme negro, llegar 15 min antes…"
              className="w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none"
            />
            <button
              disabled={pending || nota === notes}
              onClick={() => onSaveNotes(nota)}
              className="mt-2 rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-xs font-bold text-[#0d2b0d] hover:border-[#0A0A0A] disabled:opacity-40"
            >
              Guardar nota
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
