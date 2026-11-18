"use client"

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  fmtRangoCorto,
  fechaCortaEs,
  slotStatus,
  SLOT_STYLE,
  SLOT_DOT,
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
      {/* Barra de control + resumen */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8E8E3] bg-white p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <Link href={props.prevHref} aria-label="Anterior" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E8E3] text-[#0d2b0d] transition-colors hover:bg-[#F2FBDD]">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href={props.nextHref} aria-label="Siguiente" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E8E3] text-[#0d2b0d] transition-colors hover:bg-[#F2FBDD]">
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link href={props.todayHref} className="ml-0.5 rounded-xl border border-[#E8E8E3] px-3 py-1.5 text-xs font-semibold text-[#0d2b0d] transition-colors hover:bg-[#F2FBDD]">
            Hoy
          </Link>
          <span className="ml-1.5 text-[15px] font-bold text-[#0d2b0d]">
            {view === 'month' ? mesLabel(anchor) : rangoSemanaLabel(anchor)}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-1.5 text-[11px] font-semibold sm:flex">
            <span className="text-[#9A9A94]">{totals.slots} turnos</span>
            <Stat n={totals.missing} cls="bg-[#FEE2E2] text-[#B91C1C]" label="faltan" pulse />
            <Stat n={totals.draft} cls="bg-[#FEF3C7] text-[#92400E]" label="borrador" />
            <Stat n={totals.confirmed} cls="bg-[#DCFCE7] text-[#166534]" label="ok" />
          </div>
          <div className="flex rounded-xl border border-[#E8E8E3] p-0.5">
            <Link href={`/admin/staffing?view=week&d=${anchorYmd}`} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${view === 'week' ? 'bg-[#C8FF00] text-[#2F4A00]' : 'text-[#9A9A94]'}`}>Semana</Link>
            <Link href={`/admin/staffing?view=month&d=${anchorYmd}`} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${view === 'month' ? 'bg-[#C8FF00] text-[#2F4A00]' : 'text-[#9A9A94]'}`}>Mes</Link>
          </div>
        </div>
      </div>

      {/* Totales en mobile */}
      <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold sm:hidden">
        <span className="text-[#9A9A94]">{totals.slots} turnos</span>
        <Stat n={totals.missing} cls="bg-[#FEE2E2] text-[#B91C1C]" label="faltan" pulse />
        <Stat n={totals.draft} cls="bg-[#FEF3C7] text-[#92400E]" label="borr." />
        <Stat n={totals.confirmed} cls="bg-[#DCFCE7] text-[#166534]" label="ok" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="order-2 space-y-6 lg:order-1">
          {weeks.map((days, wi) => (
            <WeekGrid key={wi} days={days} view={view} anchor={anchor} hoyYmd={hoyYmd} clients={clients} byCell={byCell} assigned={assigned} onOpen={setOpenNeed} />
          ))}
          {clients.length === 0 && (
            <div className="rounded-2xl border border-[#E8E8E3] bg-white p-6 text-sm text-[#6B6B6B]">
              No hay clientes todavía. Agrega turnos en <Link href="/admin/staffing/needs" className="font-semibold text-[#2F4A00] underline">Turnos</Link>.
            </div>
          )}
        </div>

        {/* Panel de Gaps */}
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-20 overflow-hidden rounded-2xl border border-[#FBD5D5] bg-gradient-to-b from-[#FFF6F6] to-[#FFFBFB]">
            <div className="flex items-center gap-2 border-b border-[#FBD5D5] px-4 py-3">
              <span className="relative flex h-2.5 w-2.5">
                {gaps.length > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F87171] opacity-70" />}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${gaps.length ? 'bg-[#DC2626]' : 'bg-[#22C55E]'}`} />
              </span>
              <h3 className="text-[13px] font-bold text-[#B91C1C]">Gaps · próximos 14 días</h3>
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#B91C1C]">{gaps.length}</span>
            </div>
            {gaps.length === 0 ? (
              <p className="px-4 py-6 text-sm font-medium text-[#166534]">Todo cubierto. Nada se está cayendo. 🎉</p>
            ) : (
              <ul className="max-h-[62vh] space-y-2 overflow-y-auto p-3">
                {gaps.map((g, i) => (
                  <motion.li key={g.need_id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
                    <button
                      onClick={() => setOpenNeed(g.need_id)}
                      className="w-full rounded-xl border border-[#FBD5D5] bg-white p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgba(185,28,28,0.4)]"
                      style={{ borderLeft: `4px solid ${g.client_color || '#B91C1C'}` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-bold text-[#0d2b0d]">{g.client_name}</span>
                        <span className="shrink-0 rounded-full border border-[#FCA5A5] bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-bold text-[#B91C1C]">FALTAN {g.missing}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#8A8A84]">{fechaCortaEs(g.shift_date)} · {fmtRango(g.start_time, g.end_time)} · {g.role}</div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {openRow && (
          <SlotDrawer
            key={openRow.need_id}
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
      </AnimatePresence>
    </div>
  )
}

function Stat({ n, cls, label, pulse }: { n: number; cls: string; label: string; pulse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${cls} ${pulse && n > 0 ? 'ring-1 ring-[#FCA5A5]' : ''}`}>
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
    <div className="overflow-x-auto rounded-2xl border border-[#E8E8E3] bg-white [scrollbar-width:thin]">
      <div className="min-w-[840px]">
        {/* Encabezado */}
        <div className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] border-b border-[#EFEFEA] bg-[#FBFBF8]">
          <div className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#B6B6AE]">Cliente</div>
          {days.map((d) => {
            const isToday = ymd(d) === hoyYmd
            const dim = view === 'month' && !sameMonth(d, anchor)
            return (
              <div key={ymd(d)} className={`border-l border-[#F2F2EC] py-2 text-center ${isToday ? 'bg-[#EDF9CF]' : ''}`}>
                <div className={`text-[10px] font-semibold uppercase ${dim ? 'text-[#D3D3CB]' : 'text-[#A7A7A0]'}`}>{DIAS_ES[(d.getDay() + 6) % 7]}</div>
                <div className={`text-[15px] font-bold leading-tight ${isToday ? 'text-[#2F4A00]' : dim ? 'text-[#D3D3CB]' : 'text-[#0d2b0d]'}`}>
                  {d.getDate()}{view === 'month' && d.getDate() === 1 ? ` ${MESES_ES[d.getMonth()].slice(0, 3)}` : ''}
                </div>
              </div>
            )
          })}
        </div>

        {/* Filas por cliente */}
        {clients.map((client, ci) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(ci * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] border-b border-[#F2F2EC] last:border-b-0"
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white" style={{ background: client.color || '#C8FF00', boxShadow: `0 0 0 1px ${client.color || '#C8FF00'}40` }} />
              <div className="min-w-0">
                <div className="text-[13px] font-bold leading-tight text-[#0d2b0d]">{client.name}</div>
                <div className="truncate text-[10px] text-[#B6B6AE]">{client.location}</div>
              </div>
            </div>
            {days.map((d) => {
              const slots = byCell[`${client.id}|${ymd(d)}`] || []
              const isToday = ymd(d) === hoyYmd
              return (
                <div key={ymd(d)} className={`min-h-[76px] space-y-1.5 border-l border-[#F2F2EC] p-1.5 ${isToday ? 'bg-[#FCFEF4]' : ''}`}>
                  {slots.map((sl) => (
                    <SlotChip key={sl.need_id} row={sl} color={client.color} names={assigned[sl.need_id] || []} onClick={() => onOpen(sl.need_id)} />
                  ))}
                </div>
              )
            })}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SlotChip({ row, color, names, onClick }: { row: CoverageRow; color: string; names: AssignedStaff[]; onClick: () => void }) {
  const st = slotStatus(row)
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      title={`${fmtRango(row.start_time, row.end_time)} · ${row.role} · ${SLOT_STYLE[st].label(row)}`}
      className="w-full rounded-lg border border-[#ECECE5] bg-[#FBFBF8] p-1.5 text-left transition-colors hover:bg-white hover:shadow-[0_6px_16px_-10px_rgba(13,43,13,0.4)]"
      style={{ borderLeft: `3px solid ${color || '#C8FF00'}` }}
    >
      <div className="flex items-center gap-1">
        <span className={`h-2 w-2 shrink-0 rounded-full ${SLOT_DOT[st]}`} />
        <span className="text-[11px] font-bold leading-tight tabular-nums text-[#0d2b0d]">{fmtRangoCorto(row.start_time, row.end_time)}</span>
      </div>
      <div className="mt-0.5 truncate text-[10px] text-[#9A9A94]">{row.role} · {row.assigned}/{row.headcount}</div>
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
    </motion.button>
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
      <motion.div className="absolute inset-0 bg-[#0d2b0d]/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="relative z-10 h-full w-full max-w-[420px] overflow-y-auto bg-[#FBFBF8] shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#E8E8E3] bg-[#FBFBF8]/90 p-4 backdrop-blur">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: row.client_color || '#C8FF00' }} />
              <h3 className="truncate text-[15px] font-bold text-[#0d2b0d]">{row.client_name}</h3>
            </div>
            <p className="mt-0.5 text-xs text-[#9A9A94]">{fechaCortaEs(row.shift_date)} · {fmtRango(row.start_time, row.end_time)} · {row.role}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E8E8E3] bg-white hover:bg-[#F2FBDD]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-4">
          <div className="flex items-center justify-between rounded-xl border border-[#ECECE5] bg-white p-3">
            <span className="text-sm text-[#6B6B6B]">Cobertura</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${SLOT_STYLE[st].chip}`}>{row.assigned}/{row.headcount} · {SLOT_STYLE[st].label(row)}</span>
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-[#FEF2F2] p-2.5 text-xs text-red-700">{error}</div>}

          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">Asignados</h4>
            {assigned.length === 0 ? (
              <p className="text-sm text-[#9A9A94]">Nadie asignado todavía.</p>
            ) : (
              <ul className="space-y-2">
                {assigned.map((a) => (
                  <li key={a.assignment_id} className="flex items-center justify-between gap-2 rounded-xl border border-[#ECECE5] bg-white p-2.5">
                    <span className="truncate text-sm font-semibold text-[#0d2b0d]">{a.full_name}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        disabled={pending}
                        onClick={() => onToggle(a.assignment_id, a.status === 'confirmed' ? 'draft' : 'confirmed')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${a.status === 'confirmed' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#92400E]'}`}
                      >
                        {a.status === 'confirmed' ? 'Confirmado' : 'Borrador'}
                      </button>
                      <button disabled={pending} onClick={() => onRemove(a.assignment_id)} aria-label="Quitar" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E8E3] bg-white text-[#B91C1C] hover:border-[#B91C1C] disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">Asignar persona</h4>
            <div className="flex gap-2">
              <select value={pick} onChange={(e) => setPick(e.target.value)} className="flex-1 rounded-lg border border-[#E8E8E3] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none">
                <option value="">Elige del equipo…</option>
                {disponibles.map((s) => <option key={s.id} value={s.id}>{s.full_name}{s.status === 'trial' ? ' (prueba)' : ''}</option>)}
              </select>
              <button disabled={pending || !pick} onClick={() => { if (pick) { onAssign(pick); setPick('') } }} className="inline-flex items-center gap-1 rounded-lg bg-[#C8FF00] px-3 py-2 text-sm font-bold text-[#2F4A00] transition-colors hover:bg-[#bdf000] disabled:opacity-50">
                <Plus className="h-4 w-4" /> Asignar
              </button>
            </div>
            {disponibles.length === 0 && <p className="mt-1.5 text-xs text-[#9A9A94]">Todo el equipo activo ya está en este turno.</p>}
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">Notas del turno</h4>
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} placeholder="Ej. uniforme negro, llegar 15 min antes…" className="w-full rounded-lg border border-[#E8E8E3] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none" />
            <button disabled={pending || nota === notes} onClick={() => onSaveNotes(nota)} className="mt-2 rounded-lg border border-[#E8E8E3] bg-white px-3 py-1.5 text-xs font-bold text-[#0d2b0d] hover:bg-[#F2FBDD] disabled:opacity-40">
              Guardar nota
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
