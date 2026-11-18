"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { STAFF_STATUS_LABEL, initials, avatarColor, type StaffMember, type StaffStatus } from '@/lib/staffing'
import { crearStaff, actualizarStaff, eliminarStaff } from '../_actions/actions'

const STATUSES: StaffStatus[] = ['active', 'trial', 'inactive']
const statusChip: Record<StaffStatus, string> = {
  active: 'bg-[#DCFCE7] text-[#166534]',
  trial: 'bg-[#FEF3C7] text-[#92400E]',
  inactive: 'bg-[#F0F0F0] text-[#6B6B6B]',
}

export function StaffClient({ staff, turnosSemana }: { staff: StaffMember[]; turnosSemana: Record<string, number> }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [f, setF] = useState({ full_name: '', phone: '', email: '', status: 'active' as StaffStatus, notes: '' })

  function crear() {
    setErr(null)
    startTransition(async () => {
      const r = await crearStaff(f)
      if (!r.success) setErr(r.error || 'Error')
      else { setF({ full_name: '', phone: '', email: '', status: 'active', notes: '' }); setAdding(false); router.refresh() }
    })
  }

  const total = staff.length
  const nActive = staff.filter((s) => s.status === 'active').length
  const nTrial = staff.filter((s) => s.status === 'trial').length
  const nInactive = staff.filter((s) => s.status === 'inactive').length
  const stats = [
    { label: 'Total', n: total, cls: 'text-[#0d2b0d]', dot: 'bg-[#0d2b0d]' },
    { label: 'Activos', n: nActive, cls: 'text-[#166534]', dot: 'bg-[#22C55E]' },
    { label: 'En prueba', n: nTrial, cls: 'text-[#92400E]', dot: 'bg-[#F59E0B]' },
    { label: 'Inactivos', n: nInactive, cls: 'text-[#6B6B6B]', dot: 'bg-[#B6B6AE]' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-[#E8E8E3] bg-white p-4"
          >
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#B6B6AE]">{s.label}</span>
            </div>
            <div className={`mt-1 text-[26px] font-bold leading-none ${s.cls}`}>{s.n}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[#9A9A94]">Equipo de la agencia</p>
        <button onClick={() => setAdding((v) => !v)} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#C8FF00] px-4 py-2.5 text-sm font-bold text-[#2F4A00] transition-colors hover:bg-[#bdf000]">
          <Plus className="h-4 w-4" /> Agregar persona
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl border border-[#E8E8E3] bg-white p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} placeholder="Nombre completo *" className={inputCls} />
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as StaffStatus })} className={inputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{STAFF_STATUS_LABEL[s]}</option>)}
            </select>
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Teléfono" className={inputCls} />
            <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" className={inputCls} />
            <input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Notas" className={`${inputCls} sm:col-span-2`} />
          </div>
          {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
          <div className="mt-4 flex gap-2">
            <button disabled={pending} onClick={crear} className="rounded-lg bg-[#C8FF00] px-4 py-2 text-sm font-bold text-[#2F4A00] disabled:opacity-50">Guardar</button>
            <button disabled={pending} onClick={() => setAdding(false)} className="rounded-xl border border-[#E8E8E3] px-4 py-2 text-sm font-semibold text-[#6B6B6B]">Cancelar</button>
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DEDED6] bg-white p-8 text-center text-sm text-[#9A9A94]">Aún no hay personal. Agrega la primera persona o conviértela desde Candidatos.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E8E8E3] bg-white">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-[#FBFBF8] text-[11px] uppercase tracking-wide text-[#B6B6AE]">
              <tr>
                <th className="p-3 text-left font-bold">Nombre</th>
                <th className="p-3 text-left font-bold">Estado</th>
                <th className="p-3 text-left font-bold">Contacto</th>
                <th className="p-3 text-center font-bold">Turnos (semana)</th>
                <th className="p-3 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((p) => (
                <StaffRow key={p.id} p={p} turnos={turnosSemana[p.id] || 0} pending={pending} startTransition={startTransition} onRefresh={() => router.refresh()} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StaffRow({
  p, turnos, pending, startTransition, onRefresh,
}: {
  p: StaffMember
  turnos: number
  pending: boolean
  startTransition: (cb: () => void) => void
  onRefresh: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState({ full_name: p.full_name, phone: p.phone || '', email: p.email || '', status: p.status, notes: p.notes || '' })
  const [err, setErr] = useState<string | null>(null)

  function guardar() {
    setErr(null)
    startTransition(async () => {
      const r = await actualizarStaff(p.id, f)
      if (!r.success) setErr(r.error || 'Error')
      else { setEditing(false); onRefresh() }
    })
  }
  function borrar() {
    if (!confirm(`¿Eliminar a ${p.full_name} y sus asignaciones?`)) return
    startTransition(async () => {
      const r = await eliminarStaff(p.id)
      if (r.success) onRefresh()
    })
  }

  if (editing) {
    return (
      <tr className="border-t border-[#F0F0F0] bg-[#FCFEF5]">
        <td className="p-2"><input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} className="w-full rounded border border-[#E5E5E5] px-2 py-1 text-sm" /></td>
        <td className="p-2">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as StaffStatus })} className="rounded border border-[#E5E5E5] px-2 py-1 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{STAFF_STATUS_LABEL[s]}</option>)}
          </select>
        </td>
        <td className="p-2">
          <div className="flex flex-col gap-1">
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Tel" className="w-full rounded border border-[#E5E5E5] px-2 py-1 text-xs" />
            <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" className="w-full rounded border border-[#E5E5E5] px-2 py-1 text-xs" />
          </div>
        </td>
        <td className="p-2 text-center text-[#6B6B6B]">{turnos}</td>
        <td className="p-2">
          <div className="flex items-center justify-end gap-1.5">
            {err && <span className="text-[11px] text-red-600">{err}</span>}
            <button disabled={pending} onClick={guardar} aria-label="Guardar" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8FF00] text-[#2F4A00] disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
            <button disabled={pending} onClick={() => setEditing(false)} aria-label="Cancelar" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5]"><X className="h-3.5 w-3.5" /></button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-t border-[#F2F2EC] transition-colors hover:bg-[#FBFBF8]">
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: avatarColor(p.full_name) }}>
            {initials(p.full_name)}
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-[#0d2b0d]">{p.full_name}</div>
            {p.notes && <div className="max-w-[240px] truncate text-[11px] text-[#A3A3A3]">{p.notes}</div>}
          </div>
        </div>
      </td>
      <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusChip[p.status]}`}>{STAFF_STATUS_LABEL[p.status]}</span></td>
      <td className="p-3 text-[#6B6B6B]">
        <div>{p.phone || '—'}</div>
        <div className="text-[11px]">{p.email || ''}</div>
      </td>
      <td className="p-3 text-center"><span className="inline-flex min-w-[28px] justify-center rounded-full bg-[#F2FBDD] px-2 py-0.5 text-xs font-bold text-[#2F4A00]">{turnos}</span></td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={() => setEditing(true)} className="rounded-lg border border-[#E5E5E5] px-2.5 py-1.5 text-xs font-bold text-[#0d2b0d] hover:border-[#0A0A0A]">Editar</button>
          <button disabled={pending} onClick={borrar} aria-label="Eliminar" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#B91C1C] hover:border-[#B91C1C] disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </td>
    </tr>
  )
}

const inputCls = 'w-full rounded-lg border border-[#E8E8E3] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none'
