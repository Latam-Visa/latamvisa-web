"use client"

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { agregarRegistro, actualizarMinutos, borrarRegistro } from '../_actions/actions'

export type Registro = {
  id: string
  fecha: string
  categoria: string
  descripcion: string
  minutos: number | null
  evidencia_url: string | null
}

const CATEGORIAS = ['Gestión', 'Reclutamiento', 'Compras / pedidos', 'Coordinación', 'Llamadas / correos', 'Redes / contenido', 'Desarrollo web', 'Otro']

const hoyYmd = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney' }).format(new Date())
const fmt = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`
const fechaLarga = (ymd: string) =>
  new Intl.DateTimeFormat('es-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(ymd + 'T00:00:00Z'))

const label = 'text-[10px] font-medium uppercase tracking-[0.2em] text-[#A5A7AA]'
const input = 'w-full border-0 border-b border-[#E6E6E1] bg-transparent px-0 py-2 text-[15px] tracking-[-0.01em] text-[#0C0C0C] placeholder:text-[#C4C5C7] focus:border-[#0C0C0C] focus:outline-none focus:ring-0'

export function RegistroClient({ registros, tablaFalta }: { registros: Registro[]; tablaFalta: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const [f, setF] = useState({ fecha: hoyYmd(), categoria: CATEGORIAS[0], descripcion: '', minutos: '', evidencia_url: '' })

  const dias = useMemo(() => {
    const m = new Map<string, Registro[]>()
    registros.forEach((r) => m.set(r.fecha, [...(m.get(r.fecha) ?? []), r]))
    return Array.from(m.entries())
  }, [registros])

  const totalMin = registros.reduce((a, r) => a + (r.minutos ?? 0), 0)
  const sinTiempo = registros.filter((r) => r.minutos == null).length

  function add() {
    setErr(null)
    start(async () => {
      const r = await agregarRegistro({
        fecha: f.fecha,
        categoria: f.categoria,
        descripcion: f.descripcion,
        minutos: f.minutos.trim() === '' ? null : Number(f.minutos),
        evidencia_url: f.evidencia_url,
      })
      if (!r.success) return setErr(r.error ?? 'No se pudo guardar.')
      setF({ ...f, descripcion: '', minutos: '', evidencia_url: '' })
      router.refresh()
    })
  }

  function csv() {
    const esc = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [['Fecha', 'Categoría', 'Descripción', 'Minutos', 'Horas', 'Evidencia'].map(esc).join(',')]
    ;[...registros].reverse().forEach((r) =>
      rows.push([r.fecha, r.categoria, r.descripcion, r.minutos, r.minutos == null ? '' : (r.minutos / 60).toFixed(2), r.evidencia_url].map(esc).join(','))
    )
    const url = URL.createObjectURL(new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'registro-de-trabajo.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-[880px] pb-24 pt-6">
      <p className={label}>Registro</p>
      <h1 className="mt-4 text-[44px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#0C0C0C] sm:text-[56px]">Trabajo desde casa</h1>
      <p className="mt-6 max-w-[520px] text-[17px] leading-[1.55] tracking-[-0.015em] text-[#6B6D70]">
        Bitácora diaria de lo que se gestiona: qué se hizo, cuánto tiempo y la prueba. Sirve para convertirlo en horas.
      </p>

      {tablaFalta && (
        <p className="mt-10 border-l-2 border-[#0C0C0C] pl-4 text-[14px] leading-[1.6] text-[#3A3A3C]">
          Falta crear la tabla. Corre el archivo <strong>supabase_registro_trabajo.sql</strong> en el SQL editor de Supabase y recarga.
        </p>
      )}

      <div className="mt-14 grid grid-cols-2 gap-10 border-t border-[#E6E6E1] pt-8 sm:grid-cols-3">
        <div>
          <p className={label}>Total registrado</p>
          <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.02em]">{fmt(totalMin)}</p>
        </div>
        <div>
          <p className={label}>Entradas</p>
          <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.02em]">{registros.length}</p>
        </div>
        <div>
          <p className={label}>Sin tiempo</p>
          <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.02em]">{sinTiempo}</p>
        </div>
      </div>

      {/* Nueva entrada */}
      <section className="mt-20">
        <p className={label}>Nueva entrada</p>
        <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          <div>
            <label className={label}>Fecha</label>
            <input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>Categoría</label>
            <select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} className={input}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Qué hice</label>
            <textarea rows={2} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} placeholder="Ej. Llamé a 2 proveedores de canapés y comparé precios" className={input + ' resize-none'} />
          </div>
          <div>
            <label className={label}>Minutos (opcional)</label>
            <input type="number" min={0} inputMode="numeric" value={f.minutos} onChange={(e) => setF({ ...f, minutos: e.target.value })} placeholder="45" className={input} />
          </div>
          <div>
            <label className={label}>Prueba / link (opcional)</label>
            <input value={f.evidencia_url} onChange={(e) => setF({ ...f, evidencia_url: e.target.value })} placeholder="https://…" className={input} />
          </div>
        </div>
        <div className="mt-8 flex items-center gap-5">
          <button onClick={add} disabled={pending || !f.descripcion.trim()} className="rounded-full bg-[#0C0C0C] px-7 py-3 text-[13px] font-medium tracking-[-0.01em] text-white transition-opacity hover:opacity-80 disabled:opacity-30">
            {pending ? 'Guardando…' : 'Guardar entrada'}
          </button>
          {err && <span className="text-[13px] text-[#B91C1C]">{err}</span>}
        </div>
      </section>

      {/* Historial */}
      <section className="mt-24">
        <div className="flex items-end justify-between">
          <p className={label}>Historial</p>
          {registros.length > 0 && (
            <button onClick={csv} className="text-[12px] font-medium tracking-[-0.01em] text-[#6B6D70] underline underline-offset-4 hover:text-[#0C0C0C]">Descargar CSV</button>
          )}
        </div>

        {dias.length === 0 && !tablaFalta && <p className="mt-10 text-[15px] text-[#A5A7AA]">Aún no hay entradas.</p>}

        <div className="mt-6 space-y-16">
          {dias.map(([fecha, items]) => {
            const min = items.reduce((a, r) => a + (r.minutos ?? 0), 0)
            return (
              <div key={fecha}>
                <div className="flex items-baseline justify-between border-b border-[#0C0C0C] pb-3">
                  <h2 className="text-[22px] font-semibold capitalize leading-none tracking-[-0.02em]">{fechaLarga(fecha)}</h2>
                  <span className="text-[13px] tracking-[-0.01em] text-[#6B6D70]">{min ? fmt(min) : '—'}</span>
                </div>
                <ul>
                  {items.map((r) => (
                    <Fila key={r.id} r={r} onChange={() => router.refresh()} />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Fila({ r, onChange }: { r: Registro; onChange: () => void }) {
  const [min, setMin] = useState(r.minutos == null ? '' : String(r.minutos))
  const [, start] = useTransition()
  const guardar = () => {
    const nuevo = min.trim() === '' ? null : Number(min)
    if (nuevo === r.minutos) return
    start(async () => { await actualizarMinutos(r.id, nuevo); onChange() })
  }
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-2 border-b border-[#EEEEEA] py-6">
      <div>
        <p className={label}>{r.categoria}</p>
        <p className="mt-2 text-[16px] leading-[1.55] tracking-[-0.015em] text-[#0C0C0C]">{r.descripcion}</p>
        {r.evidencia_url && (
          <a href={r.evidencia_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[12px] tracking-[-0.01em] text-[#6B6D70] underline underline-offset-4 hover:text-[#0C0C0C]">Ver prueba</a>
        )}
      </div>
      <div className="flex flex-col items-end gap-3">
        <label className="flex items-baseline gap-1.5">
          <input
            type="number" min={0} inputMode="numeric" value={min} placeholder="—"
            onChange={(e) => setMin(e.target.value)} onBlur={guardar}
            className="w-14 border-0 border-b border-[#E6E6E1] bg-transparent p-0 text-right text-[15px] tabular-nums focus:border-[#0C0C0C] focus:outline-none focus:ring-0"
          />
          <span className="text-[12px] text-[#A5A7AA]">min</span>
        </label>
        <button
          onClick={() => { if (confirm('¿Borrar esta entrada?')) start(async () => { await borrarRegistro(r.id); onChange() }) }}
          className="text-[11px] tracking-[-0.01em] text-[#A5A7AA] hover:text-[#B91C1C]"
        >Borrar</button>
      </div>
    </li>
  )
}
