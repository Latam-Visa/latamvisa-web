"use client"

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash2, Check, X, CalendarCheck } from 'lucide-react'
import { DIAS_ES, fechaCortaEs, fmtRango, fromYmd, addDays, mondayIndex, type StaffingClient } from '@/lib/staffing'
import { crearNeedsBulk, actualizarNeed, eliminarNeed } from '../_actions/actions'
import type { NeedRow } from '../needs/page'

export function NeedsClient({ clients, needs }: { clients: StaffingClient[]; needs: NeedRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Form de alta masiva
  const [clientId, setClientId] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [dias, setDias] = useState<number[]>([0, 1, 2, 3, 4]) // lun-vie por defecto
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('19:00')
  const [role, setRole] = useState('Host')
  const [headcount, setHeadcount] = useState(1)
  const [notes, setNotes] = useState('')

  function toggleDia(i: number) {
    setDias((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()))
  }

  // Preview en vivo: cuántos turnos se generarían con el rango y días elegidos.
  const previewCount = useMemo(() => {
    if (!desde || !hasta || dias.length === 0) return 0
    const ini = fromYmd(desde)
    const fin = fromYmd(hasta)
    if (ini > fin || (fin.getTime() - ini.getTime()) / 86400000 > 370) return 0
    const set = new Set(dias)
    let n = 0
    for (let d = new Date(ini); d <= fin; d = addDays(d, 1)) if (set.has(mondayIndex(d))) n++
    return n
  }, [desde, hasta, dias])
  const clienteNombre = clients.find((c) => c.id === clientId)?.name

  function crear() {
    setMsg(null)
    startTransition(async () => {
      const r = await crearNeedsBulk({ client_id: clientId, desde, hasta, dias, start_time: start, end_time: end, role, headcount, notes })
      if (!r.success) setMsg({ ok: false, text: r.error || 'No se pudo.' })
      else {
        setMsg({ ok: true, text: `Listo: ${r.created} turno(s) creado(s)${r.skipped ? `, ${r.skipped} repetido(s) omitido(s)` : ''}.` })
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Alta masiva */}
      <section className="rounded-2xl border border-[#E8E8E3] bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C8FF00] text-[#2F4A00]"><Plus className="h-4 w-4" /></span>
          <h3 className="text-[17px] font-bold text-[#0d2b0d]">Agregar turnos en bloque</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Cliente">
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputCls}>
              <option value="">Elige…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Rol">
            <input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} placeholder="Host, Sales, Barista…" />
          </Field>
          <Field label="Personas por turno">
            <input type="number" min={1} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Desde">
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Hasta">
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Horario">
            <div className="flex items-center gap-2">
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
              <span className="text-[#6B6B6B]">→</span>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
            </div>
          </Field>
        </div>

        <div className="mt-4">
          <span className="block text-xs font-bold uppercase tracking-wide text-[#A3A3A3] mb-2">Días de la semana</span>
          <div className="flex flex-wrap gap-1.5">
            {DIAS_ES.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDia(i)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${dias.includes(i) ? 'bg-[#C8FF00] text-[#2F4A00]' : 'bg-[#F2F2EC] text-[#6B6B6B] hover:bg-[#EAEAE2]'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Field label="Notas (opcional)">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} placeholder="Uniforme, punto de encuentro…" />
          </Field>
        </div>

        {msg && (
          <div className={`mt-4 rounded-lg border p-2.5 text-xs ${msg.ok ? 'border-[#86EFAC] bg-[#DCFCE7] text-[#166534]' : 'border-red-200 bg-[#FEF2F2] text-red-700'}`}>
            {msg.text}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={crear}
            disabled={pending || previewCount === 0}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#C8FF00] px-4 py-2.5 text-sm font-bold text-[#2F4A00] transition-colors hover:bg-[#bdf000] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {pending ? 'Creando…' : 'Generar turnos'}
          </button>
          <motion.div
            key={previewCount}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9EFB0] bg-[#F7FCE9] px-3 py-2 text-[13px] font-semibold text-[#2F4A00]"
          >
            <CalendarCheck className="h-4 w-4" />
            {previewCount > 0
              ? <>Se generarán <strong className="tabular-nums">{previewCount}</strong> turno{previewCount === 1 ? '' : 's'}{clienteNombre ? ` para ${clienteNombre}` : ''}</>
              : 'Completa cliente, fechas y días para ver el total'}
          </motion.div>
        </div>
      </section>

      {/* Tabla de próximos turnos */}
      <section>
        <h3 className="mb-3 text-[17px] font-bold text-[#0d2b0d]">Próximos turnos <span className="text-[#B6B6AE]">({needs.length})</span></h3>
        {needs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DEDED6] bg-white p-8 text-center text-sm text-[#9A9A94]">No hay turnos próximos. Genera algunos arriba.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E8E8E3] bg-white">
            <table className="min-w-[640px] w-full text-sm">
              <thead className="bg-[#FBFBF8] text-[11px] uppercase tracking-wide text-[#B6B6AE]">
                <tr>
                  <th className="p-3 text-left font-bold">Cliente</th>
                  <th className="p-3 text-left font-bold">Fecha</th>
                  <th className="p-3 text-left font-bold">Horario</th>
                  <th className="p-3 text-left font-bold">Rol</th>
                  <th className="p-3 text-left font-bold">Nº</th>
                  <th className="p-3 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {needs.map((n) => (
                  <NeedRowItem key={n.id} need={n} pending={pending} onRefresh={() => router.refresh()} startTransition={startTransition} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function NeedRowItem({
  need, pending, onRefresh, startTransition,
}: {
  need: NeedRow
  pending: boolean
  onRefresh: () => void
  startTransition: (cb: () => void) => void
}) {
  const [editing, setEditing] = useState(false)
  const [start, setStart] = useState(need.start_time.slice(0, 5))
  const [end, setEnd] = useState(need.end_time.slice(0, 5))
  const [role, setRole] = useState(need.role)
  const [headcount, setHeadcount] = useState(need.headcount)
  const [err, setErr] = useState<string | null>(null)

  function guardar() {
    setErr(null)
    startTransition(async () => {
      const r = await actualizarNeed(need.id, { start_time: start, end_time: end, role, headcount })
      if (!r.success) setErr(r.error || 'Error')
      else { setEditing(false); onRefresh() }
    })
  }
  function borrar() {
    if (!confirm('¿Eliminar este turno y sus asignaciones?')) return
    startTransition(async () => {
      const r = await eliminarNeed(need.id)
      if (r.success) onRefresh()
    })
  }

  return (
    <tr className="border-t border-[#F2F2EC] transition-colors hover:bg-[#FBFBF8]">
      <td className="p-3" style={{ boxShadow: `inset 3px 0 0 ${need.client_color}` }}>
        <span className="inline-flex items-center gap-2 pl-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: need.client_color }} />
          <span className="font-semibold text-[#0d2b0d]">{need.client_name}</span>
        </span>
      </td>
      <td className="p-3 text-[#6B6B6B]">{fechaCortaEs(need.shift_date)}</td>
      <td className="p-3">
        {editing ? (
          <span className="flex items-center gap-1">
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-[92px] rounded border border-[#E5E5E5] px-1.5 py-1 text-xs" />
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-[92px] rounded border border-[#E5E5E5] px-1.5 py-1 text-xs" />
          </span>
        ) : (
          <span className="tabular-nums text-[#0d2b0d]">{fmtRango(need.start_time, need.end_time)}</span>
        )}
      </td>
      <td className="p-3">
        {editing ? <input value={role} onChange={(e) => setRole(e.target.value)} className="w-28 rounded border border-[#E5E5E5] px-1.5 py-1 text-xs" /> : <span className="text-[#0d2b0d]">{need.role}</span>}
      </td>
      <td className="p-3">
        {editing ? <input type="number" min={1} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} className="w-16 rounded border border-[#E5E5E5] px-1.5 py-1 text-xs" /> : <span className="text-[#0d2b0d]">{need.headcount}</span>}
      </td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-1.5">
          {err && <span className="text-[11px] text-red-600 mr-1">{err}</span>}
          {editing ? (
            <>
              <button disabled={pending} onClick={guardar} aria-label="Guardar" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8FF00] text-[#2F4A00] disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
              <button disabled={pending} onClick={() => setEditing(false)} aria-label="Cancelar" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] disabled:opacity-50"><X className="h-3.5 w-3.5" /></button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="rounded-lg border border-[#E5E5E5] px-2.5 py-1.5 text-xs font-bold text-[#0d2b0d] hover:border-[#0A0A0A]">Editar</button>
              <button disabled={pending} onClick={borrar} aria-label="Eliminar" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#B91C1C] hover:border-[#B91C1C] disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

const inputCls = 'w-full rounded-lg border border-[#E8E8E3] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wide text-[#A3A3A3] mb-1.5">{label}</span>
      {children}
    </label>
  )
}
