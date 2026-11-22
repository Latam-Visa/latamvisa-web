"use client"

import { useState, useTransition } from 'react'
import { FlaskConical, Loader2, Trash2, Users, Quote, AlertTriangle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { simularIdea, eliminarIdea } from '../_actions/simular'
import type { IdeaRow, Reporte, Voto, Nivel } from './types'

const IDEA_SEMILLA = {
  titulo: 'Escala en Europa camino a casa',
  descripcion:
    'En vez de un vuelo larguísimo directo a Latinoamérica, ofrecer una parada (escala) en Europa para conocer un país europeo de paso — convertir un solo vuelo en dos vacaciones.',
  publico: 'Latinos que viven en Australia y viajan a Latinoamérica (dic–feb) a visitar familia',
  precio: '~$1.200 AUD extra por persona sobre el vuelo normal',
}

const votoChip: Record<Voto, string> = {
  'sí': 'bg-[#DCFCE7] text-[#166534]',
  'quizás': 'bg-[#FEF3C7] text-[#92400E]',
  'no': 'bg-[#FEE2E2] text-[#991B1B]',
}
const nivelDot: Record<Nivel, string> = { alto: 'bg-[#22C55E]', medio: 'bg-[#F59E0B]', bajo: 'bg-[#B6B6AE]' }
const nivelTxt: Record<Nivel, string> = { alto: 'text-[#166534]', medio: 'text-[#92400E]', bajo: 'text-[#6B6B6B]' }

export function LabClient({ initialRows, tablaLista }: { initialRows: IdeaRow[]; tablaLista: boolean }) {
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState(IDEA_SEMILLA)
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<IdeaRow[]>(initialRows)
  const [aviso, setAviso] = useState('')

  const simular = () => {
    setError('')
    setAviso('')
    startTransition(async () => {
      const r = await simularIdea(form)
      if (!r.ok) { setError(r.error); return }
      setReporte(r.reporte)
      if (r.guardado && r.id) {
        setRows((prev) => [
          { id: r.id!, titulo: form.titulo, descripcion: form.descripcion, publico: form.publico, precio: form.precio, resultado: r.reporte, veredicto: r.reporte.veredicto, adopcion: r.reporte.adopcionPct, created_at: new Date().toISOString() },
          ...prev,
        ])
      } else if (!r.guardado) {
        setAviso('Reporte listo. (No se guardó en el historial: falta crear la tabla ideas_lab en Supabase.)')
      }
      window.scrollTo({ top: 420, behavior: 'smooth' })
    })
  }

  const verGuardada = (row: IdeaRow) => {
    if (!row.resultado) return
    setForm({ titulo: row.titulo, descripcion: row.descripcion, publico: row.publico || '', precio: row.precio || '' })
    setReporte(row.resultado)
    setError('')
    window.scrollTo({ top: 420, behavior: 'smooth' })
  }

  const borrar = (id: string) => {
    if (!confirm('¿Eliminar esta simulación del historial?')) return
    startTransition(async () => {
      await eliminarIdea(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
    })
  }

  const inputCls = 'w-full rounded-xl border border-[#E5E5E5] bg-white px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#B6B6AE] focus:border-[#0A0A0A] focus:outline-none'

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="rounded-2xl border border-[#E8E8E3] bg-white p-5 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#9A9A94]">Idea</span>
            <input className={inputCls} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título de la idea" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#9A9A94]">Descripción</span>
            <textarea className={`${inputCls} min-h-[84px] resize-y`} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="¿Qué le ofrecemos a la gente?" />
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#9A9A94]">Público objetivo</span>
            <input className={inputCls} value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} placeholder="¿A quién?" />
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#9A9A94]">Precio / oferta</span>
            <input className={inputCls} value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="p.ej. +$1.200 AUD por persona" />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-[#DC2626]">{error}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={simular}
            disabled={pending}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#C8FF00] px-5 py-2.5 text-sm font-bold text-[#2F4A00] transition-colors hover:bg-[#bdf000] disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
            {pending ? 'Simulando panel… (~20–40s)' : 'Simular panel'}
          </button>
          <span className="text-xs text-[#9A9A94]">Simula un panel de personas con IA. Es un estimado ilustrativo, no datos de mercado reales.</span>
        </div>
        {aviso && <p className="mt-3 rounded-lg bg-[#FEF9E7] px-3 py-2 text-xs text-[#92680A]">{aviso}</p>}
      </div>

      {/* Reporte */}
      {reporte && <ReporteView r={reporte} />}

      {/* Historial */}
      <div className="rounded-2xl border border-[#E8E8E3] bg-white p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0A0A0A]">Historial de ideas</h3>
          {!tablaLista && <span className="text-[11px] text-[#B6B6AE]">Crea la tabla <code className="rounded bg-[#F2F2EC] px-1">ideas_lab</code> para guardar</span>}
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-[#9A9A94]">Aún no hay ideas guardadas. Simula una y aparecerá aquí.</p>
        ) : (
          <ul className="divide-y divide-[#F0F0EC]">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                <button onClick={() => verGuardada(row)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-[#0A0A0A]">{row.titulo}</p>
                  <p className="truncate text-xs text-[#9A9A94]">{row.veredicto || row.descripcion}</p>
                </button>
                {typeof row.adopcion === 'number' && (
                  <span className="shrink-0 rounded-full bg-[#F2FBDD] px-2.5 py-0.5 text-xs font-bold text-[#2F4A00]">{row.adopcion}%</span>
                )}
                <button onClick={() => borrar(row.id)} aria-label="Eliminar" className="shrink-0 rounded-lg border border-[#E5E5E5] p-2 text-[#B91C1C] transition-colors hover:border-[#B91C1C]">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#9A9A94]">{label}</span>
        <span className="text-lg font-bold text-[#0A0A0A]">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EFEFEA]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function ReporteView({ r }: { r: Reporte }) {
  const confColor =
    r.confianza === 'alta' ? 'bg-[#DCFCE7] text-[#166534]' : r.confianza === 'media' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#F0F0F0] text-[#6B6B6B]'
  return (
    <div className="space-y-5">
      {/* Veredicto */}
      <div className="rounded-2xl border border-[#0A0A0A] bg-[#0A0A0A] p-6 text-white">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8FF00]">Veredicto</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${confColor}`}>confianza {r.confianza}</span>
        </div>
        <p className="font-[PPMonumentExtended] text-lg leading-snug md:text-xl">{r.veredicto}</p>
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-white/70">{r.resumen}</p>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-white/[0.06] p-4"><Meter label="Lo consideraría" value={r.adopcionPct} color="#C8FF00" /></div>
          <div className="rounded-xl bg-white/[0.06] p-4"><Meter label="Convertiría" value={r.conversionPct} color="#1C7AE5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Segmentos */}
        <div className="rounded-2xl border border-[#E8E8E3] bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-[#0A0A0A]">Segmentos</h3>
          <ul className="space-y-3">
            {r.segmentos.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${nivelDot[s.interes]}`} />
                <div>
                  <p className="text-sm font-semibold text-[#0A0A0A]">{s.nombre} <span className={`text-[11px] font-bold uppercase ${nivelTxt[s.interes]}`}>· {s.interes}</span></p>
                  <p className="text-[13px] leading-snug text-[#6B6B6B]">{s.nota}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Objeciones + precio */}
        <div className="rounded-2xl border border-[#E8E8E3] bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-[#0A0A0A]">Objeciones a resolver</h3>
          <ul className="space-y-2">
            {r.objeciones.map((o, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-snug text-[#374151]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />{o}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-[#F7F9FB] p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9A9A94]">Sensibilidad al precio</p>
            <p className="mt-1 text-[13px] leading-snug text-[#374151]">{r.sensibilidadPrecio}</p>
          </div>
        </div>
      </div>

      {/* Mensajes ganadores */}
      <div className="rounded-2xl border border-[#E8E8E3] bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-[#0A0A0A]">Mensajes que mejor convierten</h3>
        <ul className="space-y-2.5">
          {r.mensajes.map((m, i) => (
            <li key={i} className="flex gap-2.5 rounded-xl border border-[#EFEFEA] bg-[#FCFDF7] p-3">
              <Quote className="h-4 w-4 shrink-0 text-[#2F4A00]" />
              <span className="text-sm leading-snug text-[#0A0A0A]">{m}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Panel de personas */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-[#6B6B6B]" />
          <h3 className="text-sm font-bold text-[#0A0A0A]">El panel ({r.personas.length} personas)</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {r.personas.map((p, i) => (
            <div key={i} className="rounded-2xl border border-[#E8E8E3] bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0A0A0A]">{p.nombre}</p>
                  <p className="text-[11px] leading-snug text-[#9A9A94]">{p.perfil}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${votoChip[p.voto]}`}>{p.voto}</span>
              </div>
              <p className="mt-2 text-[13px] leading-snug text-[#374151]">{p.razon}</p>
              {p.objecion && <p className="mt-2 text-[12px] leading-snug text-[#991B1B]"><b>Pero:</b> {p.objecion}</p>}
              {p.queLoConvenceria && <p className="mt-1.5 text-[12px] leading-snug text-[#166534]"><b>Lo convencería:</b> {p.queLoConvenceria}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Riesgos */}
      {r.riesgos?.length > 0 && (
        <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-5">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#92680A]" />
            <h3 className="text-sm font-bold text-[#92680A]">Riesgos / supuestos</h3>
          </div>
          <ul className="space-y-1.5">
            {r.riesgos.map((x, i) => (
              <li key={i} className="text-[13px] leading-snug text-[#7A5B06]">• {x}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-center text-[11px] text-[#B6B6AE]">Simulación ilustrativa generada por IA · no sustituye investigación de mercado real</p>
    </div>
  )
}

export function LabHeaderBack() {
  return (
    <Link href="/admin/ideas" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#525252] transition-colors hover:text-[#0A0A0A]">
      <ChevronLeft className="h-4 w-4" /> Ideas &amp; Tareas
    </Link>
  )
}
