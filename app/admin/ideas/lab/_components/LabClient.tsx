"use client"

import { useState, useTransition } from 'react'
import { FlaskConical, Loader2, Trash2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { simularIdea, eliminarIdea } from '../_actions/simular'
import { ReporteView } from './ReporteView'
import type { IdeaRow, Reporte } from './types'

const IDEA_SEMILLA = {
  titulo: 'Escala en Europa camino a casa',
  descripcion:
    'En vez de un vuelo larguísimo directo a Latinoamérica, ofrecer una parada (escala) en Europa para conocer un país europeo de paso — convertir un solo vuelo en dos vacaciones.',
  publico: 'Latinos que viven en Australia y viajan a Latinoamérica (dic–feb) a visitar familia',
  precio: '~$1.200 AUD extra por persona sobre el vuelo normal',
}

export function LabClient({ initialRows, tablaLista }: { initialRows: IdeaRow[]; tablaLista: boolean }) {
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState(IDEA_SEMILLA)
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [error, setError] = useState('')
  // Solo ideas nacidas en el lab (las del board se muestran en el board, no acá)
  const [rows, setRows] = useState<IdeaRow[]>(initialRows.filter((r) => (r.resultado as any)?.source !== 'board'))
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
      window.scrollTo({ top: 360, behavior: 'smooth' })
    })
  }

  const verGuardada = (row: IdeaRow) => {
    if (!row.resultado) return
    setForm({ titulo: row.titulo, descripcion: row.descripcion, publico: row.publico || '', precio: row.precio || '' })
    setReporte(row.resultado)
    setError('')
    window.scrollTo({ top: 360, behavior: 'smooth' })
  }

  const borrar = (id: string) => {
    if (!confirm('¿Eliminar esta simulación del historial?')) return
    startTransition(async () => {
      await eliminarIdea(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
    })
  }

  const inputCls = 'w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-[13px] text-[#0A0A0A] placeholder:text-[#B6B6AE] focus:border-[#0A0A0A] focus:outline-none'
  const microLabel = 'mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A9A94]'

  return (
    <div className="space-y-5">
      {/* Formulario */}
      <div className="rounded-xl border border-[#E8E8E3] bg-white p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className={microLabel}>Idea</span>
            <input className={inputCls} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título de la idea" />
          </label>
          <label className="md:col-span-2">
            <span className={microLabel}>Descripción</span>
            <textarea className={`${inputCls} min-h-[72px] resize-y`} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="¿Qué le ofrecemos a la gente?" />
          </label>
          <label>
            <span className={microLabel}>Público objetivo</span>
            <input className={inputCls} value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} placeholder="¿A quién?" />
          </label>
          <label>
            <span className={microLabel}>Precio / oferta</span>
            <input className={inputCls} value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="p.ej. +$1.200 AUD por persona" />
          </label>
        </div>

        {error && <p className="mt-2.5 text-[12px] text-[#DC2626]">{error}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={simular}
            disabled={pending}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#C8FF00] px-4 py-2 text-[13px] font-bold text-[#2F4A00] transition-colors hover:bg-[#bdf000] disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
            {pending ? 'Simulando… (~20–40s)' : 'Simular panel'}
          </button>
          <span className="text-[11px] text-[#9A9A94]">Panel simulado con IA. Estimado ilustrativo, no datos reales.</span>
        </div>
        {aviso && <p className="mt-2.5 rounded-lg bg-[#FEF9E7] px-3 py-2 text-[11px] text-[#92680A]">{aviso}</p>}
      </div>

      {/* Reporte */}
      {reporte && <ReporteView r={reporte} />}

      {/* Historial */}
      <div className="rounded-xl border border-[#E8E8E3] bg-white p-4 md:p-5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A9A94]">Historial de ideas</span>
          {!tablaLista && <span className="text-[10px] text-[#B6B6AE]">Crea la tabla <code className="rounded bg-[#F2F2EC] px-1">ideas_lab</code> para guardar</span>}
        </div>
        {rows.length === 0 ? (
          <p className="text-[12px] text-[#9A9A94]">Aún no hay ideas guardadas. Simula una y aparecerá aquí.</p>
        ) : (
          <ul className="divide-y divide-[#F0F0EC]">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-2">
                <button onClick={() => verGuardada(row)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[12.5px] font-semibold text-[#0A0A0A]">{row.titulo}</p>
                  <p className="truncate text-[11px] text-[#9A9A94]">{row.veredicto || row.descripcion}</p>
                </button>
                {typeof row.adopcion === 'number' && (
                  <span className="shrink-0 rounded-full bg-[#F2FBDD] px-2 py-0.5 text-[11px] font-semibold text-[#2F4A00]">{row.adopcion}%</span>
                )}
                <button onClick={() => borrar(row.id)} aria-label="Eliminar" className="shrink-0 rounded-lg border border-[#E5E5E5] p-1.5 text-[#B91C1C] transition-colors hover:border-[#B91C1C]">
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

export function LabHeaderBack() {
  return (
    <Link href="/admin/ideas" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#525252] transition-colors hover:text-[#0A0A0A]">
      <ChevronLeft className="h-4 w-4" /> Ideas &amp; Tareas
    </Link>
  )
}
