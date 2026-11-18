"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, ChevronLeft, UserCheck, X } from 'lucide-react'
import {
  STAGE_LABEL,
  REJECT_REASONS,
  initials,
  avatarColor,
  type StaffingCandidate,
  type CandidateStage,
} from '@/lib/staffing'
import { crearCandidato, moverCandidato, contratarCandidato } from '../_actions/actions'

const FLOW: CandidateStage[] = ['applied', 'interview', 'trial']
const COLUMNS: CandidateStage[] = ['applied', 'interview', 'trial', 'hired', 'rejected']
const COL: Record<CandidateStage, { bar: string; dot: string; soft: string }> = {
  applied: { bar: 'bg-[#C8FF00]', dot: 'bg-[#8FB500]', soft: 'bg-[#FBFEF0]' },
  interview: { bar: 'bg-[#7CC4F5]', dot: 'bg-[#2E90DA]', soft: 'bg-[#F5FBFF]' },
  trial: { bar: 'bg-[#FCD34D]', dot: 'bg-[#E0A200]', soft: 'bg-[#FFFCF2]' },
  hired: { bar: 'bg-[#86EFAC]', dot: 'bg-[#22C55E]', soft: 'bg-[#F4FDF7]' },
  rejected: { bar: 'bg-[#FCA5A5]', dot: 'bg-[#EF4444]', soft: 'bg-[#FFF7F7]' },
}

export function CandidatesClient({ candidates }: { candidates: StaffingCandidate[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [rejectFor, setRejectFor] = useState<StaffingCandidate | null>(null)
  const [f, setF] = useState({ full_name: '', phone: '', email: '', english_level: '', availability: '', source: '' })

  const refresh = () => router.refresh()

  function crear() {
    setErr(null)
    startTransition(async () => {
      const r = await crearCandidato(f)
      if (!r.success) setErr(r.error || 'Error')
      else { setF({ full_name: '', phone: '', email: '', english_level: '', availability: '', source: '' }); setAdding(false); refresh() }
    })
  }
  const mover = (c: StaffingCandidate, stage: CandidateStage) => startTransition(async () => { const r = await moverCandidato(c.id, stage); if (r.success) refresh() })
  const contratar = (c: StaffingCandidate) => startTransition(async () => { const r = await contratarCandidato(c.id); if (r.success) refresh() })
  function confirmarRechazo(reason: string) {
    if (!rejectFor) return
    startTransition(async () => { const r = await moverCandidato(rejectFor.id, 'rejected', reason); if (r.success) { setRejectFor(null); refresh() } })
  }
  const byStage = (s: CandidateStage) => candidates.filter((c) => c.stage === s)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[#9A9A94]">{candidates.length} candidato(s) en el pipeline</p>
        <button onClick={() => setAdding((v) => !v)} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#C8FF00] px-4 py-2.5 text-sm font-bold text-[#2F4A00] transition-colors hover:bg-[#bdf000]">
          <Plus className="h-4 w-4" /> Agregar candidato
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-[#E8E8E3] bg-white p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} placeholder="Nombre completo *" className={inputCls} />
                <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Teléfono" className={inputCls} />
                <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" className={inputCls} />
                <input value={f.english_level} onChange={(e) => setF({ ...f, english_level: e.target.value })} placeholder="Nivel de inglés" className={inputCls} />
                <input value={f.availability} onChange={(e) => setF({ ...f, availability: e.target.value })} placeholder="Disponibilidad" className={inputCls} />
                <input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} placeholder="Fuente (Instagram, referido…)" className={inputCls} />
              </div>
              {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
              <div className="mt-4 flex gap-2">
                <button disabled={pending} onClick={crear} className="rounded-xl bg-[#C8FF00] px-4 py-2 text-sm font-bold text-[#2F4A00] disabled:opacity-50">Guardar</button>
                <button disabled={pending} onClick={() => setAdding(false)} className="rounded-xl border border-[#E8E8E3] px-4 py-2 text-sm font-semibold text-[#6B6B6B]">Cancelar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[960px] gap-4 lg:min-w-0">
          {COLUMNS.map((stage) => {
            const list = byStage(stage)
            return (
              <div key={stage} className="flex-1">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={`h-2 w-2 rounded-full ${COL[stage].dot}`} />
                  <span className="text-[13px] font-bold text-[#0d2b0d]">{STAGE_LABEL[stage]}</span>
                  <span className="ml-auto rounded-full bg-[#F2F2EC] px-2 py-0.5 text-[11px] font-bold text-[#6B6B6B]">{list.length}</span>
                </div>
                <div className={`space-y-2 rounded-2xl border border-[#EDEDE7] ${COL[stage].soft} p-2`} style={{ minHeight: 140 }}>
                  <div className={`h-1 rounded-full ${COL[stage].bar} opacity-70`} />
                  <AnimatePresence mode="popLayout">
                    {list.map((c) => (
                      <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 34 }}>
                        <CandCard
                          c={c}
                          pending={pending}
                          onForward={FLOW.includes(stage) && stage !== 'trial' ? () => mover(c, FLOW[FLOW.indexOf(stage) + 1]) : undefined}
                          onBack={stage !== 'applied' && stage !== 'hired' ? () => mover(c, prevStage(stage)) : undefined}
                          onReject={stage !== 'rejected' && stage !== 'hired' ? () => setRejectFor(c) : undefined}
                          onHire={stage === 'trial' || stage === 'interview' ? () => contratar(c) : undefined}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {list.length === 0 && (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-[#DEDED6] py-6 text-[11px] font-medium text-[#C4C4BC]">Vacío</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {rejectFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div className="absolute inset-0 bg-[#0d2b0d]/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRejectFor(null)} />
            <motion.div initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.97 }} className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0d2b0d]">Rechazar a {rejectFor.full_name}</h3>
                <button onClick={() => setRejectFor(null)} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8E8E3] hover:bg-[#F6F6F2]"><X className="h-4 w-4" /></button>
              </div>
              <p className="mb-4 text-xs text-[#9A9A94]">Elige un motivo de la lista. No se guardan comentarios libres sobre apariencia ni nacionalidad.</p>
              <div className="grid grid-cols-1 gap-2">
                {REJECT_REASONS.map((reason) => (
                  <button key={reason} disabled={pending} onClick={() => confirmarRechazo(reason)} className="rounded-xl border border-[#E8E8E3] px-3 py-2.5 text-left text-sm font-semibold text-[#0d2b0d] transition-colors hover:border-[#EF4444] hover:bg-[#FFF5F5] disabled:opacity-50">
                    {reason}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function prevStage(stage: CandidateStage): CandidateStage {
  const order: CandidateStage[] = ['applied', 'interview', 'trial']
  if (stage === 'rejected') return 'applied'
  return order[Math.max(0, order.indexOf(stage) - 1)]
}

function CandCard({ c, pending, onForward, onBack, onReject, onHire }: {
  c: StaffingCandidate
  pending: boolean
  onForward?: () => void
  onBack?: () => void
  onReject?: () => void
  onHire?: () => void
}) {
  return (
    <div className="rounded-xl border border-[#ECECE5] bg-white p-2.5 shadow-[0_1px_2px_rgba(13,43,13,0.04)] transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(13,43,13,0.35)]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: avatarColor(c.full_name) }}>
          {initials(c.full_name)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-[#0d2b0d]">{c.full_name}</div>
          {c.source && <div className="truncate text-[10px] text-[#9A9A94]">{c.source}</div>}
        </div>
      </div>
      {(c.english_level || c.availability) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {c.english_level && <span className="rounded-md bg-[#F2F2EC] px-1.5 py-0.5 text-[10px] font-semibold text-[#5A5A52]">🗣 {c.english_level}</span>}
          {c.availability && <span className="rounded-md bg-[#F2F2EC] px-1.5 py-0.5 text-[10px] font-semibold text-[#5A5A52]">📅 {c.availability}</span>}
        </div>
      )}
      {c.stage === 'rejected' && c.reason && <div className="mt-1.5 text-[11px] font-semibold text-[#B91C1C]">Motivo: {c.reason}</div>}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {onBack && <button disabled={pending} onClick={onBack} aria-label="Atrás" className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8E8E3] text-[#9A9A94] hover:bg-[#F6F6F2] disabled:opacity-50"><ChevronLeft className="h-3.5 w-3.5" /></button>}
        {onForward && <button disabled={pending} onClick={onForward} className="inline-flex items-center gap-0.5 rounded-lg border border-[#E8E8E3] px-2 py-1 text-[11px] font-bold text-[#0d2b0d] hover:bg-[#F2FBDD] disabled:opacity-50">Avanzar <ChevronRight className="h-3 w-3" /></button>}
        {onHire && <button disabled={pending} onClick={onHire} className="inline-flex items-center gap-1 rounded-lg bg-[#C8FF00] px-2 py-1 text-[11px] font-bold text-[#2F4A00] hover:bg-[#bdf000] disabled:opacity-50"><UserCheck className="h-3 w-3" /> Contratar</button>}
        {onReject && <button disabled={pending} onClick={onReject} className="rounded-lg border border-[#E8E8E3] px-2 py-1 text-[11px] font-bold text-[#B91C1C] hover:border-[#EF4444] disabled:opacity-50">Rechazar</button>}
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-[#E8E8E3] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none'
