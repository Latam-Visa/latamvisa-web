"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { DIAS_ES, fechaCortaEs, fmtRango, type StaffingClient } from '@/lib/staffing'
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
      <section className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-6">
        <h3 className="font-[PPMonumentExtended] text-lg text-[#0d2b0d] mb-4">Agregar turnos en bloque</h3>
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
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${dias.includes(i) ? 'bg-[#C8FF00] text-[#2F4A00]' : 'bg-[#F5F5F0] text-[#6B6B6B]'}`}
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

        <button
          onClick={crear}
          disabled={pending}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C8FF00] px-4 py-2.5 text-sm font-bold text-[#2F4A00] hover:bg-[#b8ef00] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {pending ? 'Creando…' : 'Generar turnos'}
        </button>
      </section>

      {/* Tabla de próximos turnos */}
      <section>
        <h3 className="font-[PPMonumentExtended] text-lg text-[#0d2b0d] mb-3">Próximos turnos ({needs.length})</h3>
        {needs.length === 0 ? (
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 text-sm text-[#6B6B6B]">No hay turnos próximos.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E5E5E5] bg-white">
            <table className="min-w-[640px] w-full text-sm">
              <thead className="bg-[#FAFAF7] text-[11px] uppercase tracking-wide text-[#A3A3A3]">
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
    <tr className="border-t border-[#F0F0F0]">
      <td className="p-3">
        <span className="inline-flex items-center gap-2">
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

const inputCls = 'w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wide text-[#A3A3A3] mb-1.5">{label}</span>
      {children}
    </label>
  )
}
