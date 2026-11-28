"use client"

import { useEffect, useState } from 'react'
import { X, Copy, Ban } from 'lucide-react'
import {
  ACTIVITY_TYPES, EMAIL_BADGE, EMAIL_STATUSES, SEGMENTS, SEGMENT_LABEL, STAGES, STAGE_LABEL,
  type Activity, type ActivityType, type Prospect,
} from '@/lib/sales'
import { TEMPLATES, fillTemplate, type TemplateKey } from '@/lib/sales/templates'
import { logActivity, updateProspect } from '../_actions/actions'
import type { Run } from './SalesClient'

const input = 'w-full rounded-lg border border-[#E8E8E3] bg-white px-2.5 py-2 text-sm text-[#0d2b0d]'

const CAMPOS = ['full_name', 'job_title', 'company', 'email', 'email_status', 'segment', 'city', 'source', 'stage', 'priority', 'next_step', 'next_step_date', 'estimated_value', 'notes'] as const

export function ProspectDrawer({ prospect: p, activities, pending, run, notice, onClose }: {
  prospect: Prospect; activities: Activity[]; pending: boolean; run: Run
  notice: { ok: boolean; text: string } | null; onClose: () => void
}) {
  const inicial = () => Object.fromEntries(CAMPOS.map((k) => [k, String(p[k] ?? '')])) as Record<(typeof CAMPOS)[number], string>
  const [form, setForm] = useState(inicial)
  const [base, setBase] = useState(inicial)
  const [type, setType] = useState<ActivityType>('email')
  const [summary, setSummary] = useState('')
  const [copiado, setCopiado] = useState('')

  // Si el servidor cambia el prospecto (p. ej. un email lo pasa a contacted),
  // se actualizan solo los campos que no estén editados sin guardar.
  useEffect(() => {
    const nuevo = inicial()
    setForm((f) => Object.fromEntries(CAMPOS.map((k) => [k, f[k] === base[k] ? nuevo[k] : f[k]])) as typeof f)
    setBase(nuevo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p])

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const cambios = Object.fromEntries(CAMPOS.filter((k) => form[k] !== base[k]).map((k) => [k, form[k]]))
  const sucio = Object.keys(cambios).length > 0
  const bloqueado = p.stage === 'do_not_contact'

  const copiar = async (key: TemplateKey) => {
    const { subject, body } = fillTemplate(key, p)
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      setCopiado(`${TEMPLATES[key].label} copied.`)
    } catch {
      setCopiado('Could not copy to clipboard.')
    }
    if (p.email) window.location.href = `mailto:${p.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const campo = (k: (typeof CAMPOS)[number], label: string, type = 'text', opts?: [string, string][]) => (
    <label className="block text-[11px] font-bold text-[#6B6B6B]">
      {label}
      {opts ? (
        <select value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={`${input} mt-1 font-normal`}>
          {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={`${input} mt-1 font-normal`} />
      )}
    </label>
  )

  const orden: TemplateKey[] = [p.segment, 'follow_up', ...SEGMENTS.filter((s) => s !== p.segment)]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/30" />
      <aside role="dialog" aria-label={p.full_name} className="relative h-full w-full max-w-[480px] space-y-6 overflow-y-auto bg-[#FAFAF7] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#0d2b0d]">{p.full_name}</h2>
            <p className="text-sm text-[#6B6B6B]">{[p.job_title, p.company].filter(Boolean).join(' · ') || '—'}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-[#F2FBDD]"><X className="h-5 w-5" /></button>
        </div>

        {notice && <p role="status" className={`rounded-xl p-3 text-sm ${notice.ok ? 'bg-[#F2FBDD] text-[#2F4A00]' : 'bg-[#FEF2F2] text-red-700'}`}>{notice.text}</p>}

        <section>
          <h3 className="mb-2 text-sm font-bold text-[#0d2b0d]">Copy email template</h3>
          {bloqueado ? <p className="text-sm text-red-700">This person is marked do not contact.</p> : (
            <>
              <div className="flex flex-wrap gap-2">
                {orden.map((k, i) => (
                  <button key={k} onClick={() => copiar(k)} className={`rounded-xl px-3 py-2 text-xs font-bold ${i === 0 ? 'bg-[#C8FF00] text-[#0d2b0d]' : 'border border-[#E8E8E3] bg-white text-[#55554F]'}`}>
                    <Copy className="mr-1 inline h-3 w-3" />{TEMPLATES[k].label}
                  </button>
                ))}
              </div>
              <p aria-live="polite" className="mt-1.5 text-xs text-[#6B6B6B]">{copiado || (p.email ? 'Copies the text and opens your email app. Nothing is sent from here.' : 'No email on file: it only copies the text.')}</p>
              {p.email_status !== 'verified' && p.email && <p className="mt-1 text-xs font-bold text-[#92400E]">Email status: {EMAIL_BADGE[p.email_status].label}.</p>}
            </>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[#0d2b0d]">Log activity</h3>
          <div className="flex gap-2">
            <select aria-label="Activity type" value={type} onChange={(e) => setType(e.target.value as ActivityType)} className={`${input} !w-36`}>
              {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
            </select>
            <input aria-label="Activity summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" className={input} />
          </div>
          <button disabled={pending} onClick={() => { run(() => logActivity(p.id, type, summary)); setSummary('') }}
            className="rounded-xl bg-[#0d2b0d] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Log activity</button>
          <ol className="space-y-2 pt-1">
            {activities.length === 0 && <li className="text-xs text-[#6B6B6B]">No activity yet.</li>}
            {[...activities].sort((a, b) => Date.parse(b.happened_at) - Date.parse(a.happened_at)).map((a) => (
              <li key={a.id} className="rounded-xl border border-[#E8E8E3] bg-white p-2.5">
                <p className="text-[11px] font-bold text-[#0d2b0d]">
                  {a.type.replace('_', '-')} <span className="font-normal text-[#6B6B6B]">· {new Date(a.happened_at).toLocaleString('en-AU', { timeZone: 'Australia/Brisbane', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                </p>
                {a.summary && <p className="text-xs text-[#2A2A24]">{a.summary}</p>}
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#0d2b0d]">Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {campo('full_name', 'Name')}{campo('job_title', 'Job title')}
            {campo('company', 'Company')}{campo('email', 'Email', 'email')}
            {campo('email_status', 'Email status', 'text', EMAIL_STATUSES.map((s) => [s, EMAIL_BADGE[s].label]))}
            {campo('segment', 'Segment', 'text', SEGMENTS.map((s) => [s, SEGMENT_LABEL[s]]))}
            {campo('city', 'City')}{campo('source', 'Source')}
            {campo('stage', 'Stage', 'text', STAGES.map((s) => [s, STAGE_LABEL[s]]))}
            {campo('priority', 'Priority (1 = highest)', 'text', [['1', '1'], ['2', '2'], ['3', '3']])}
            {campo('next_step', 'Next step')}{campo('next_step_date', 'Next step date', 'date')}
            {campo('estimated_value', 'Estimated value (AUD)', 'number')}
          </div>
          <label className="block text-[11px] font-bold text-[#6B6B6B]">Notes
            <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${input} mt-1 font-normal`} />
          </label>
          <button disabled={pending || !sucio} onClick={() => run(() => updateProspect(p.id, cambios))}
            className="rounded-xl bg-[#C8FF00] px-4 py-2 text-xs font-bold text-[#0d2b0d] disabled:opacity-40">Save changes</button>
        </section>

        {!bloqueado && (
          <button disabled={pending}
            onClick={() => { if (confirm(`Mark ${p.full_name} as do not contact? They will be hidden from the pipeline.`)) { run(() => updateProspect(p.id, { stage: 'do_not_contact' })); onClose() } }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700"><Ban className="h-3.5 w-3.5" />Mark do not contact</button>
        )}
      </aside>
    </div>
  )
}
