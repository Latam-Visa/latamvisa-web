"use client"

import { useState } from 'react'
import {
  EMAIL_BADGE, EMAIL_STATUSES, SEGMENTS, SEGMENT_LABEL, STAGES, STAGE_LABEL,
  type Prospect, type Stage,
} from '@/lib/sales'
import { bulkUpdate, updateProspect } from '../_actions/actions'
import type { Run } from './SalesClient'

const input = 'rounded-lg border border-[#E8E8E3] bg-white px-2 py-1.5 text-xs text-[#0d2b0d]'

const COLS: { key: keyof Prospect; label: string }[] = [
  { key: 'full_name', label: 'Name' }, { key: 'company', label: 'Company' }, { key: 'segment', label: 'Segment' },
  { key: 'stage', label: 'Stage' }, { key: 'email_status', label: 'Email' }, { key: 'city', label: 'City' },
  { key: 'priority', label: 'Priority' }, { key: 'next_step', label: 'Next step' },
  { key: 'next_step_date', label: 'Date' }, { key: 'estimated_value', label: 'Value (AUD)' },
]

export function ProspectTable({ prospects, today, pending, run, onOpen }: {
  prospects: Prospect[]; today: string; pending: boolean; run: Run; onOpen: (id: string) => void
}) {
  const [q, setQ] = useState('')
  const [f, setF] = useState({ segment: '', stage: '', email_status: '', priority: '', city: '' })
  const [sort, setSort] = useState<{ key: keyof Prospect; dir: 1 | -1 }>({ key: 'full_name', dir: 1 })
  const [sel, setSel] = useState<string[]>([])

  const ciudades = Array.from(new Set(prospects.map((p) => p.city).filter(Boolean))) as string[]
  const needle = q.trim().toLowerCase()
  const rows = prospects
    .filter((p) =>
      (f.stage ? p.stage === f.stage : p.stage !== 'do_not_contact') &&
      (!f.segment || p.segment === f.segment) &&
      (!f.email_status || p.email_status === f.email_status) &&
      (!f.priority || String(p.priority) === f.priority) &&
      (!f.city || (f.city === '__none' ? !p.city : p.city === f.city)) &&
      (!needle || [p.full_name, p.company, p.job_title, p.email, p.city, p.notes].some((v) => v?.toLowerCase().includes(needle))))
    .sort((a, b) => {
      const x = a[sort.key], y = b[sort.key]
      if (x == null || x === '') return y == null || y === '' ? 0 : 1 // vacíos siempre al final
      if (y == null || y === '') return -1
      return (typeof x === 'number' ? x - Number(y) : String(x).localeCompare(String(y))) * sort.dir
    })

  const seleccion = sel.filter((id) => rows.some((r) => r.id === id)) // nunca actúa sobre filas ocultas
  const masivo = (change: { stage?: Stage; priority?: number }) => {
    const que = change.stage ? `stage "${STAGE_LABEL[change.stage]}"` : `priority ${change.priority}`
    if (!confirm(`Set ${que} for ${seleccion.length} prospects?`)) return
    run(() => bulkUpdate(seleccion, change))
    setSel([])
  }

  // Guarda al salir del campo, solo si cambió.
  const celda = (p: Prospect, key: 'city' | 'next_step' | 'next_step_date' | 'estimated_value', type: string, width: string) => (
    <input key={`${key}-${p[key] ?? ''}`} type={type} min={type === 'number' ? 0 : undefined} defaultValue={p[key] ?? ''}
      aria-label={`${key} for ${p.full_name}`} className={`${input} ${width} ${key === 'next_step_date' && p.next_step_date && p.next_step_date < today ? 'border-red-300 text-red-700' : ''}`}
      onBlur={(e) => { const v = e.target.value; if (v !== String(p[key] ?? '')) run(() => updateProspect(p.id, { [key]: v })) }}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} />
  )

  const filtro = (key: keyof typeof f, label: string, opts: [string, string][]) => (
    <select aria-label={label} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} className={input}>
      <option value="">{label}: all</option>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company, email…" className={`${input} min-w-[200px] flex-1`} />
        {filtro('segment', 'Segment', SEGMENTS.map((s) => [s, SEGMENT_LABEL[s]]))}
        {filtro('stage', 'Stage', STAGES.map((s) => [s, STAGE_LABEL[s]]))}
        {filtro('email_status', 'Email', EMAIL_STATUSES.map((s) => [s, EMAIL_BADGE[s].label]))}
        {filtro('priority', 'Priority', [['1', '1'], ['2', '2'], ['3', '3']])}
        {filtro('city', 'City', [['__none', '(no city)'], ...ciudades.map((c) => [c, c] as [string, string])])}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[#55554F]">
        <span>{rows.length} results · {seleccion.length} selected</span>
        {seleccion.length > 0 && (
          <>
            <select aria-label="Set stage" disabled={pending} value="" onChange={(e) => e.target.value && masivo({ stage: e.target.value as Stage })} className={input}>
              <option value="">Set stage…</option>
              {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
            </select>
            <select aria-label="Set priority" disabled={pending} value="" onChange={(e) => e.target.value && masivo({ priority: Number(e.target.value) })} className={input}>
              <option value="">Set priority…</option>
              {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E8E8E3] bg-white">
        <table className="w-full min-w-[1100px] text-left text-xs">
          <thead className="bg-[#FBFBF8] text-[#6B6B6B]">
            <tr>
              <th className="p-2">
                <input type="checkbox" aria-label="Select all" checked={rows.length > 0 && seleccion.length === rows.length}
                  onChange={(e) => setSel(e.target.checked ? rows.slice(0, 500).map((r) => r.id) : [])} />
              </th>
              {COLS.map((c) => (
                <th key={c.key} className="p-2">
                  <button onClick={() => setSort({ key: c.key, dir: sort.key === c.key && sort.dir === 1 ? -1 : 1 })} className="font-bold hover:text-[#0d2b0d]">
                    {c.label}{sort.key === c.key ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2EC]">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="p-2">
                  <input type="checkbox" aria-label={`Select ${p.full_name}`} checked={sel.includes(p.id)}
                    onChange={(e) => setSel(e.target.checked ? [...sel, p.id] : sel.filter((x) => x !== p.id))} />
                </td>
                <td className="p-2"><button onClick={() => onOpen(p.id)} className="text-left font-bold text-[#0d2b0d] underline-offset-2 hover:underline">{p.full_name}</button></td>
                <td className="p-2">{p.company || '—'}</td>
                <td className="p-2">{SEGMENT_LABEL[p.segment]}</td>
                <td className="p-2">{STAGE_LABEL[p.stage]}</td>
                <td className="p-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${EMAIL_BADGE[p.email_status].cls}`}>{EMAIL_BADGE[p.email_status].label}</span></td>
                <td className="p-2">{celda(p, 'city', 'text', 'w-28')}</td>
                <td className="p-2">
                  <select aria-label={`priority for ${p.full_name}`} value={p.priority} onChange={(e) => run(() => updateProspect(p.id, { priority: Number(e.target.value) }))} className={input}>
                    {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </td>
                <td className="p-2">{celda(p, 'next_step', 'text', 'w-40')}</td>
                <td className="p-2">{celda(p, 'next_step_date', 'date', 'w-36')}</td>
                <td className="p-2">{celda(p, 'estimated_value', 'number', 'w-24')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-[#6B6B6B]">No prospects match.</p>}
      </div>
    </div>
  )
}
