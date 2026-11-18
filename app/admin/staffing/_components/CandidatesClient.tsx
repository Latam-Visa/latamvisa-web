"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight, ChevronLeft, UserCheck, X } from 'lucide-react'
import {
  STAGE_LABEL,
  REJECT_REASONS,
  type StaffingCandidate,
  type CandidateStage,
} from '@/lib/staffing'
import { crearCandidato, moverCandidato, contratarCandidato } from '../_actions/actions'

// Orden del flujo. Hired y Rejected son columnas finales.
const FLOW: CandidateStage[] = ['applied', 'interview', 'trial']
const COLUMNS: CandidateStage[] = ['applied', 'interview', 'trial', 'hired', 'rejected']
const COL_HEAD: Record<CandidateStage, string> = {
  applied: 'border-[#C8FF00]',
  interview: 'border-[#7CC4F5]',
  trial: 'border-[#FCD34D]',
  hired: 'border-[#86EFAC]',
  rejected: 'border-[#FCA5A5]',
}

export function CandidatesClient({ candidates }: { candidates: StaffingCandidate[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [rejectFor, setRejectFor] = useState<StaffingCandidate | null>(null)

  const [f, setF] = useState({ full_name: '', phone: '', email: '', english_level: '', availability: '', source: '' })

  function refresh() { router.refresh() }

  function crear() {
    setErr(null)
    startTransition(async () => {
      const r = await crearCandidato(f)
      if (!r.success) setErr(r.error || 'Error')
      else { setF({ full_name: '', phone: '', email: '', english_level: '', availability: '', source: '' }); setAdding(false); refresh() }
    })
  }
  function mover(c: StaffingCandidate, stage: CandidateStage) {
    startTransition(async () => { const r = await moverCandidato(c.id, stage); if (r.success) refresh() })
  }
  function contratar(c: StaffingCandidate) {
    startTransition(async () => { const r = await contratarCandidato(c.id); if (r.success) refresh() })
  }
  function confirmarRechazo(reason: string) {
    if (!rejectFor) return
    startTransition(async () => {
      const r = await moverCandidato(rejectFor.id, 'rejected', reason)
      if (r.success) { setRejectFor(null); refresh() }
    })
  }

  const byStage = (s: CandidateStage) => candidates.filter((c) => c.stage === s)

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setAdding((v) => !v)} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C8FF00] px-4 py-2.5 text-sm font-bold text-[#2F4A00] hover:bg-[#b8ef00]">
          <Plus className="h-4 w-4" /> Agregar candidato
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} placeholder="Nombre completo *" className={inputCls} />
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Teléfono" className={inputCls} />
            <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" className={inputCls} />
            <input value={f.english_level} onChange={(e) => setF({ ...f, english_level: e.target.value })} placeholder="Nivel de inglés" className={inputCls} />
            <input value={f.availability} onChange={(e) => setF({ ...f, availability: e.target.value })} placeholder="Disponibilidad" className={inputCls} />
            <input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} placeholder="Fuente (Instagram, referido…)" className={inputCls} />
          </div>
          {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
          <div className="mt-4 flex gap-2">
            <button disabled={pending} onClick={crear} className="rounded-lg bg-[#C8FF00] px-4 py-2 text-sm font-bold text-[#2F4A00] disabled:opacity-50">Guardar</button>
            <button disabled={pending} onClick={() => setAdding(false)} className="rounded-lg border border-[#E5E5E5] px-4 py-2 text-sm font-semibold text-[#6B6B6B]">Cancelar</button>
          </div>
        </div>
      )}

      {/* Kanban: scroll horizontal en mobile */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-[920px] lg:min-w-0">
          {COLUMNS.map((stage) => {
            const list = byStage(stage)
            return (
              <div key={stage} className="flex-1 min-w-[180px]">
                <div className={`rounded-t-xl border-t-4 ${COL_HEAD[stage]} bg-[#FAFAF7] px-3 py-2 flex items-center justify-between`}>
                  <span className="text-sm font-bold text-[#0d2b0d]">{STAGE_LABEL[stage]}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#6B6B6B]">{list.length}</span>
                </div>
                <div className="space-y-2 rounded-b-xl bg-[#FAFAF7]/50 p-2 min-h-[120px]">
                  {list.map((c) => (
                    <CandCard
                      key={c.id}
                      c={c}
                      pending={pending}
                      onForward={FLOW.includes(stage) ? () => mover(c, FLOW[FLOW.indexOf(stage) + 1] || 'trial') : undefined}
                      onBack={stage !== 'applied' && stage !== 'hired' ? () => mover(c, prevStage(stage)) : undefined}
                      onReject={stage !== 'rejected' && stage !== 'hired' ? () => setRejectFor(c) : undefined}
                      onHire={stage === 'trial' || stage === 'interview' ? () => contratar(c) : undefined}
                      canForward={FLOW.includes(stage) && stage !== 'trial'}
                    />
                  ))}
                  {list.length === 0 && <p className="px-1 py-6 text-center text-[11px] text-[#C9C9C9]">Vacío</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal de rechazo con motivo fijo */}
      {rejectFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={() => setRejectFor(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-[PPMonumentExtended] text-base text-[#0d2b0d]">Rechazar a {rejectFor.full_name}</h3>
              <button onClick={() => setRejectFor(null)} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5]"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-[#6B6B6B] mb-4">Elige un motivo de la lista. No se guardan comentarios libres sobre apariencia ni nacionalidad.</p>
            <div className="grid grid-cols-1 gap-2">
              {REJECT_REASONS.map((reason) => (
                <button
                  key={reason}
                  disabled={pending}
                  onClick={() => confirmarRechazo(reason)}
                  className="rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-left text-sm font-semibold text-[#0d2b0d] hover:border-[#B91C1C] hover:bg-[#FFF5F5] disabled:opacity-50"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function prevStage(stage: CandidateStage): CandidateStage {
  const order: CandidateStage[] = ['applied', 'interview', 'trial']
  if (stage === 'rejected') return 'applied'
  const i = order.indexOf(stage)
  return order[Math.max(0, i - 1)]
}

function CandCard({
  c, pending, onForward, onBack, onReject, onHire, canForward,
}: {
  c: StaffingCandidate
  pending: boolean
  onForward?: () => void
  onBack?: () => void
  onReject?: () => void
  onHire?: () => void
  canForward: boolean
}) {
  return (
    <div className="rounded-xl border border-[#EDEDED] bg-white p-2.5">
      <div className="font-bold text-sm text-[#0d2b0d] truncate">{c.full_name}</div>
      <div className="mt-1 space-y-0.5 text-[11px] text-[#6B6B6B]">
        {c.english_level && <div>Inglés: {c.english_level}</div>}
        {c.availability && <div>Disp.: {c.availability}</div>}
        {c.source && <div>Fuente: {c.source}</div>}
        {c.stage === 'rejected' && c.reason && <div className="font-semibold text-[#B91C1C]">Motivo: {c.reason}</div>}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {onBack && (
          <button disabled={pending} onClick={onBack} aria-label="Atrás" className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#0A0A0A] disabled:opacity-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
        )}
        {onForward && canForward && (
          <button disabled={pending} onClick={onForward} className="inline-flex items-center gap-0.5 rounded-lg border border-[#E5E5E5] px-2 py-1 text-[11px] font-bold text-[#0d2b0d] hover:border-[#0A0A0A] disabled:opacity-50">Avanzar <ChevronRight className="h-3 w-3" /></button>
        )}
        {onHire && (
          <button disabled={pending} onClick={onHire} className="inline-flex items-center gap-1 rounded-lg bg-[#C8FF00] px-2 py-1 text-[11px] font-bold text-[#2F4A00] hover:bg-[#b8ef00] disabled:opacity-50"><UserCheck className="h-3 w-3" /> Contratar</button>
        )}
        {onReject && (
          <button disabled={pending} onClick={onReject} className="rounded-lg border border-[#E5E5E5] px-2 py-1 text-[11px] font-bold text-[#B91C1C] hover:border-[#B91C1C] disabled:opacity-50">Rechazar</button>
        )}
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#0d2b0d] focus:border-[#2F4A00] focus:outline-none'
