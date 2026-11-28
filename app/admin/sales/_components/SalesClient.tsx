"use client"

import { useMemo, useRef, useState, useTransition } from 'react'
import { Upload, LayoutGrid, Table as TableIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  EMAIL_BADGE, PIPELINE_STAGES, PRIORITY_DOT, SEGMENTS, SEGMENT_LABEL, STAGE_LABEL,
  aud, diaBrisbane, distintos, esContacto, followUpsDue, valorAbierto,
  type Activity, type Prospect, type Segment, type Stage,
} from '@/lib/sales'
import { importCsv, updateProspect } from '../_actions/actions'
import { ProspectDrawer } from './ProspectDrawer'
import { ProspectTable } from './ProspectTable'

export type Run = (fn: () => Promise<{ success: boolean; error?: string; message?: string }>) => void

export function SalesClient({ prospects, activities, today, weekStart }: {
  prospects: Prospect[]; activities: Activity[]; today: string; weekStart: string
}) {
  const [segment, setSegment] = useState<Segment | 'all'>('all')
  const [view, setView] = useState<'board' | 'table'>('board')
  const [openId, setOpenId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const dragId = useRef<string | null>(null)

  const run: Run = (fn) => {
    setNotice(null)
    start(async () => {
      try {
        const r = await fn()
        if (!r.success) setNotice({ ok: false, text: r.error || 'Something went wrong.' })
        else if (r.message) setNotice({ ok: true, text: r.message })
      } catch {
        setNotice({ ok: false, text: 'Could not save. Check your connection.' })
      }
    })
  }

  // do_not_contact queda fuera del pipeline, los KPIs y el panel de hoy.
  const activos = useMemo(() => prospects.filter((p) => p.stage !== 'do_not_contact'), [prospects])
  const delSegmento = (p: Prospect) => segment === 'all' || p.segment === segment
  const visibles = activos.filter(delSegmento)
  const ids = new Set(visibles.map((p) => p.id))

  const semana = activities.filter((a) => ids.has(a.prospect_id) && diaBrisbane(a.happened_at) >= weekStart)
  const enEtapa = (...s: Stage[]) => visibles.filter((p) => s.includes(p.stage)).length
  const kpis = [
    { label: 'Prospects', value: visibles.length },
    { label: 'Contacted this week', value: distintos(semana.filter(esContacto)) },
    { label: 'Replies', value: enEtapa('replied', 'meeting', 'quoted', 'won'), hint: 'at Replied or further' },
    { label: 'Meetings', value: enEtapa('meeting', 'quoted', 'won'), hint: 'at Meeting or further' },
    { label: 'Won', value: enEtapa('won') },
    { label: 'Pipeline value', value: aud(valorAbierto(visibles)), hint: 'open deals, AUD' },
  ]

  const hoyList = visibles.filter((p) => p.next_step_date && p.next_step_date <= today && !['won', 'lost'].includes(p.stage))
    .sort((a, b) => (a.next_step_date! < b.next_step_date! ? -1 : 1))
  const seguimientos = followUpsDue(visibles, activities, today)

  const mover = (id: string, stage: Stage) => run(() => updateProspect(id, { stage }))
  const abierto = prospects.find((p) => p.id === openId) || null

  const onFile = async (f: File | undefined) => {
    if (!f) return
    const csv = await f.text()
    run(() => importCsv(csv))
    if (fileRef.current) fileRef.current.value = ''
  }

  const chip = (on: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${on ? 'bg-[#C8FF00] text-[#0d2b0d]' : 'border border-[#E8E8E3] bg-white text-[#55554F] hover:bg-[#F2FBDD]'}`

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-[#E8E8E3] bg-white p-4">
            <p className="text-[11px] font-medium text-[#6B6B6B]">{k.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0d2b0d]">{k.value}</p>
            {k.hint && <p className="text-[10px] text-[#8A8A84]">{k.hint}</p>}
          </div>
        ))}
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {[
          { title: 'Today', list: hoyList, empty: 'No next steps due.', sub: (p: Prospect) => `${p.next_step || 'Next step'} · ${p.next_step_date}` },
          { title: 'Follow-ups due', list: seguimientos, empty: 'No follow-ups due.', sub: (p: Prospect) => 'No reply or activity for 4+ days' },
        ].map((b) => (
          <div key={b.title} className="rounded-2xl border border-[#E8E8E3] bg-white p-4">
            <h2 className="text-sm font-bold text-[#0d2b0d]">{b.title} <span className="text-[#8A8A84]">{b.list.length}</span></h2>
            {b.list.length === 0 ? <p className="mt-2 text-xs text-[#6B6B6B]">{b.empty}</p> : (
              <ul className="mt-2 max-h-56 divide-y divide-[#F2F2EC] overflow-y-auto">
                {b.list.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => setOpenId(p.id)} className="w-full py-2 text-left hover:bg-[#FBFBF8]">
                      <span className="block text-[13px] font-bold text-[#0d2b0d]">{p.full_name} <span className="font-normal text-[#6B6B6B]">· {p.company || '—'}</span></span>
                      <span className="block text-xs text-[#6B6B6B]">{b.sub(p)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setSegment('all')} className={chip(segment === 'all')}>All · {activos.length}</button>
        {SEGMENTS.map((s) => (
          <button key={s} onClick={() => setSegment(s)} className={chip(segment === s)}>
            {SEGMENT_LABEL[s]} · {activos.filter((p) => p.segment === s).length}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setView('board')} className={chip(view === 'board')}><LayoutGrid className="mr-1 inline h-3.5 w-3.5" />Board</button>
          <button onClick={() => setView('table')} className={chip(view === 'table')}><TableIcon className="mr-1 inline h-3.5 w-3.5" />Table</button>
        </div>
        <div className="flex items-center gap-3">
          {pending && <span className="text-xs text-[#6B6B6B]">Saving…</span>}
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button disabled={pending} onClick={() => fileRef.current?.click()} className="rounded-xl bg-[#0d2b0d] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
            <Upload className="mr-1.5 inline h-3.5 w-3.5" />Import CSV
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className={`rounded-xl p-3 text-sm ${notice.ok ? 'bg-[#F2FBDD] text-[#2F4A00]' : 'bg-[#FEF2F2] text-red-700'}`}>{notice.text}</p>
      )}

      {view === 'board' ? (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {PIPELINE_STAGES.map((stage, i) => {
            const cards = visibles.filter((p) => p.stage === stage).sort((a, b) => a.priority - b.priority || a.full_name.localeCompare(b.full_name))
            return (
              <div key={stage} className="w-[250px] shrink-0 rounded-2xl bg-[#F3F3EE] p-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (dragId.current) mover(dragId.current, stage); dragId.current = null }}>
                <h3 className="px-2 py-1.5 text-xs font-bold text-[#0d2b0d]">{STAGE_LABEL[stage]} <span className="text-[#6B6B6B]">{cards.length}</span></h3>
                <div className="max-h-[70vh] min-h-[60px] space-y-2 overflow-y-auto">
                  {cards.map((p) => {
                    const vencido = !!p.next_step_date && p.next_step_date < today && !['won', 'lost'].includes(p.stage)
                    return (
                      <article key={p.id} draggable onDragStart={() => { dragId.current = p.id }}
                        className="rounded-xl border border-[#E8E8E3] bg-white p-3">
                        <button onClick={() => setOpenId(p.id)} className="w-full text-left">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-[13px] font-bold text-[#0d2b0d]">{p.full_name}</span>
                            <span title={`Priority ${p.priority}`} aria-label={`Priority ${p.priority}`} className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_DOT[p.priority]}`} />
                          </span>
                          <span className="block text-[11px] text-[#55554F]">{p.job_title || '—'}</span>
                          <span className="block text-[11px] font-medium text-[#0d2b0d]">{p.company || '—'}</span>
                          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${EMAIL_BADGE[p.email_status].cls}`}>{EMAIL_BADGE[p.email_status].label}</span>
                          {(p.next_step || p.next_step_date) && (
                            <span className={`mt-1 block text-[11px] ${vencido ? 'font-bold text-red-700' : 'text-[#6B6B6B]'}`}>
                              {p.next_step || 'Next step'}{p.next_step_date ? ` · ${p.next_step_date}` : ''}{vencido ? ' (overdue)' : ''}
                            </span>
                          )}
                        </button>
                        <div className="mt-2 flex justify-between">
                          <button disabled={pending || i === 0} onClick={() => mover(p.id, PIPELINE_STAGES[i - 1])} aria-label="Move back"
                            className="rounded-lg border border-[#E8E8E3] p-1.5 hover:bg-[#F2FBDD] disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
                          <button disabled={pending || i === PIPELINE_STAGES.length - 1} onClick={() => mover(p.id, PIPELINE_STAGES[i + 1])} aria-label="Move forward"
                            className="rounded-lg border border-[#E8E8E3] p-1.5 hover:bg-[#F2FBDD] disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // La tabla incluye do_not_contact solo si se filtra por esa etapa.
        <ProspectTable prospects={prospects.filter(delSegmento)} today={today} pending={pending} run={run} onOpen={setOpenId} />
      )}

      {abierto && (
        <ProspectDrawer key={abierto.id} prospect={abierto} activities={activities.filter((a) => a.prospect_id === abierto.id)}
          pending={pending} run={run} notice={notice} onClose={() => { setOpenId(null); setNotice(null) }} />
      )}
    </div>
  )
}
