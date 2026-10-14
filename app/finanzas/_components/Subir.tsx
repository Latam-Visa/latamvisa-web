'use client'

import { useRef, useState, useTransition } from 'react'
import { Check, Loader2, Trash2, Upload } from 'lucide-react'
import { convertirHeicAJpeg, esHeic, mensajeArchivoGrande } from '@/lib/aplicaciones/archivos-cliente'
import { todayBrisbane } from '@/lib/deadlines/dates'
import { dinero } from '@/lib/finanzas/formato'
import type { Extraccion } from '@/lib/finanzas/claude'
import { confirmarSubida, crearSubida, descartarSubida, extraerSubida, type ConfirmacionInput } from '../actions'
import { Chips, FRECUENCIA_LABEL, btnPrimario, btnSecundario, campo, foco, tarjeta } from './ui'

const MAX = 10 * 1024 * 1024
const TIPOS = ['image/png', 'image/jpeg', 'application/pdf']

export interface SubidaPendiente {
  id: string
  nombre: string
  estado: 'subiendo' | 'analizando' | 'listo' | 'manual' | 'error' | 'subido'
  datos?: Extraccion | null
  error?: string
}

function nombreDe(path: string) {
  return path.split('/').pop()?.replace(/^[0-9a-f-]{36}-/, '') ?? 'archivo'
}

export function Subir({ pendientes }: { pendientes: { id: string; storage_path: string; status: string; extracted: Extraccion | null }[] }) {
  const [items, setItems] = useState<SubidaPendiente[]>(
    pendientes.map((p) => ({
      id: p.id,
      nombre: nombreDe(p.storage_path),
      estado: p.status === 'extraido' && p.extracted ? 'listo' : p.status === 'manual' ? 'manual' : 'subido',
      datos: p.extracted,
    })),
  )
  const [aviso, setAviso] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const actualizar = (id: string, cambio: Partial<SubidaPendiente>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...cambio } : x)))

  const analizar = async (id: string) => {
    actualizar(id, { estado: 'analizando', error: undefined })
    const r = await extraerSubida(id)
    if (!r.ok) return actualizar(id, { estado: 'error', error: r.error })
    actualizar(id, { estado: r.manual ? 'manual' : 'listo', datos: r.datos })
  }

  const elegir = async (lista: FileList | null) => {
    setAviso('')
    for (const original of Array.from(lista || [])) {
      // Fotos de iPhone (HEIC) se pasan a JPEG antes de subir.
      let file = original
      try {
        file = esHeic(original) ? await convertirHeicAJpeg(original) : original
      } catch {
        setAviso(`No pudimos convertir «${original.name}». Toma un pantallazo y súbelo de nuevo.`)
        continue
      }
      if (!TIPOS.includes(file.type)) {
        setAviso(`«${original.name}»: sube PNG, JPG, HEIC o PDF.`)
        continue
      }
      if (file.size > MAX) {
        setAviso(mensajeArchivoGrande(file, MAX))
        continue
      }
      const r = await crearSubida({ nombre: file.name, mime: file.type, size: file.size })
      if (!r.ok) {
        setAviso(r.error)
        continue
      }
      setItems((xs) => [{ id: r.id, nombre: file.name, estado: 'subiendo' }, ...xs])
      const put = await fetch(r.signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } }).catch(() => null)
      if (!put?.ok) {
        actualizar(r.id, { estado: 'error', error: 'No se pudo subir. Intenta de nuevo.' })
        continue
      }
      await analizar(r.id)
    }
    if (input.current) input.current.value = ''
  }

  return (
    <div className="space-y-5">
      <label className={`${tarjeta} border-dashed border-2 border-[#2F4A00]/30 p-6 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-[#2F4A00]/60 ${foco}`}>
        <Upload className="w-6 h-6 text-[#2F4A00]" />
        <span className="font-semibold">Elige pantallazos o extractos</span>
        <span className="text-xs text-[#0d2b0d]/60">PNG, JPG, HEIC o PDF · hasta 10 MB cada uno · varios a la vez</span>
        <input ref={input} type="file" multiple accept="image/png,image/jpeg,image/heic,image/heif,.heic,.heif,application/pdf" className="sr-only" onChange={(e) => elegir(e.target.files)} />
      </label>
      {aviso && <p role="alert" className="text-sm text-red-700">{aviso}</p>}

      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.id} className={`${tarjeta} p-4 space-y-3`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold break-all">{it.nombre}</p>
              {(it.estado === 'subiendo' || it.estado === 'analizando') && (
                <span className="inline-flex items-center gap-1.5 text-sm text-[#2F4A00]">
                  <Loader2 className="w-4 h-4 motion-safe:animate-spin" /> {it.estado === 'subiendo' ? 'Subiendo…' : 'Haciendo tu análisis…'}
                </span>
              )}
            </div>
            {it.estado === 'subido' && (
              <button type="button" className={btnSecundario} onClick={() => analizar(it.id)}>Analizar</button>
            )}
            {it.estado === 'error' && (
              <div className="space-y-2">
                <p role="alert" className="text-sm text-red-700">{it.error}</p>
                <button type="button" className={btnSecundario} onClick={() => analizar(it.id)}>Reintentar</button>
              </div>
            )}
            {it.estado === 'manual' && <Manual id={it.id} onListo={() => setItems((xs) => xs.filter((x) => x.id !== it.id))} />}
            {it.estado === 'listo' && it.datos && <Revision id={it.id} datos={it.datos} onListo={() => setItems((xs) => xs.filter((x) => x.id !== it.id))} />}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Manual({ id, onListo }: { id: string; onListo: () => void }) {
  const [pendiente, start] = useTransition()
  return (
    <div className="space-y-2">
      <p className="text-sm">No pudimos leer este archivo. Agrega esos datos a mano en tu plan.</p>
      <button type="button" disabled={pendiente} className={btnSecundario} onClick={() => start(async () => { await descartarSubida(id); onListo() })}>
        <Trash2 className="w-4 h-4" /> Borrar el archivo
      </button>
    </div>
  )
}

type Fila<T> = T & { incluir: boolean }

function Revision({ id, datos, onListo }: { id: string; datos: Extraccion; onListo: () => void }) {
  const hoy = todayBrisbane()
  const [cuentas, setCuentas] = useState<Fila<ConfirmacionInput['cuentas'][number]>[]>(
    datos.cuentas.map((c) => ({ nombre: c.nombre, kind: 'personal', saldo: c.saldo, disponible: c.disponible, fecha: c.fecha ?? hoy, intocable: false, incluir: true })),
  )
  const [cuotas, setCuotas] = useState<Fila<ConfirmacionInput['cuotas'][number]>[]>(datos.cuotas.map((q) => ({ ...q, incluir: true })))
  const [cargos, setCargos] = useState<Fila<ConfirmacionInput['cargos'][number]>[]>(
    datos.cargos_recurrentes.map((g) => ({ ...g, categoria: 'suscripciones', incluir: true })),
  )
  const [error, setError] = useState('')
  const [pendiente, start] = useTransition()
  const nada = !cuentas.length && !cuotas.length && !cargos.length

  const confirmar = () =>
    start(async () => {
      setError('')
      const quitar = <T extends { incluir: boolean }>(xs: T[]) => xs.filter((x) => x.incluir).map(({ incluir: _, ...x }) => x)
      const r = await confirmarSubida(id, { cuentas: quitar(cuentas), cuotas: quitar(cuotas), cargos: quitar(cargos) })
      if (r.ok) onListo()
      else setError(r.error)
    })

  const num = (s: string) => Number(s.replace(',', '.'))
  const Incluir = ({ v, set, label }: { v: boolean; set: (b: boolean) => void; label: string }) => (
    <label className="flex items-center gap-2 min-h-[44px] text-sm">
      <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} className={`w-5 h-5 accent-[#2F4A00] ${foco}`} aria-label={label} /> Incluir
    </label>
  )

  return (
    <div className="space-y-4">
      <h3 className="font-monument text-sm uppercase">Esto es lo que encontramos</h3>
      {nada && <p className="text-sm">No encontramos saldos, cuotas ni cobros en este archivo.</p>}

      {cuentas.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-sm font-semibold">Cuentas</h4>
          {cuentas.map((c, i) => {
            const set = (cambio: Partial<typeof c>) => setCuentas((xs) => xs.map((x, j) => (j === i ? { ...x, ...cambio } : x)))
            return (
              <div key={i} className="rounded-xl border border-[#0d2b0d]/10 p-3 space-y-2">
                <input aria-label="Nombre de la cuenta" value={c.nombre} onChange={(e) => set({ nombre: e.target.value })} className={campo} />
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-semibold">Saldo<input inputMode="decimal" value={String(c.saldo)} onChange={(e) => set({ saldo: num(e.target.value) })} className={`${campo} mt-1 tabular-nums`} /></label>
                  <label className="text-xs font-semibold">Al día<input type="date" value={c.fecha} onChange={(e) => set({ fecha: e.target.value })} className={`${campo} mt-1 tabular-nums`} /></label>
                </div>
                <Chips etiquetaGrupo="Tipo de cuenta" valor={c.kind} onChange={(k) => set({ kind: k })} opciones={[{ valor: 'personal', label: 'Personal' }, { valor: 'negocio', label: 'Negocio' }, { valor: 'tarjeta', label: 'Tarjeta' }, { valor: 'bnpl', label: 'BNPL' }]} />
                <label className="flex items-center gap-2 min-h-[44px] text-sm">
                  <input type="checkbox" checked={c.intocable} onChange={(e) => set({ intocable: e.target.checked })} className={`w-5 h-5 accent-[#2F4A00] ${foco}`} /> Es plata que no quiero tocar
                </label>
                <Incluir v={c.incluir} set={(b) => set({ incluir: b })} label={`Incluir ${c.nombre}`} />
              </div>
            )
          })}
        </section>
      )}

      {cuotas.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-sm font-semibold">Cuotas</h4>
          {cuotas.map((q, i) => {
            const set = (cambio: Partial<typeof q>) => setCuotas((xs) => xs.map((x, j) => (j === i ? { ...x, ...cambio } : x)))
            return (
              <div key={i} className="rounded-xl border border-[#0d2b0d]/10 p-3 grid grid-cols-2 gap-2">
                <input aria-label="Acreedor" value={q.acreedor} onChange={(e) => set({ acreedor: e.target.value })} className={`${campo} col-span-2`} />
                <input type="date" aria-label="Fecha" value={q.fecha} onChange={(e) => set({ fecha: e.target.value })} className={`${campo} tabular-nums`} />
                <input inputMode="decimal" aria-label="Monto" value={String(q.monto)} onChange={(e) => set({ monto: num(e.target.value) })} className={`${campo} tabular-nums`} />
                <div className="col-span-2"><Incluir v={q.incluir} set={(b) => set({ incluir: b })} label={`Incluir cuota de ${q.acreedor}`} /></div>
              </div>
            )
          })}
        </section>
      )}

      {cargos.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-sm font-semibold">Cobros que se repiten</h4>
          {cargos.map((g, i) => {
            const set = (cambio: Partial<typeof g>) => setCargos((xs) => xs.map((x, j) => (j === i ? { ...x, ...cambio } : x)))
            return (
              <div key={i} className="rounded-xl border border-[#0d2b0d]/10 p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input aria-label="Comercio" value={g.comercio} onChange={(e) => set({ comercio: e.target.value })} className={campo} />
                  <input inputMode="decimal" aria-label="Monto" value={String(g.monto)} onChange={(e) => set({ monto: num(e.target.value) })} className={`${campo} tabular-nums`} />
                </div>
                <Chips etiquetaGrupo="Frecuencia" valor={g.frecuencia} onChange={(f) => set({ frecuencia: f })} opciones={(['semanal', 'quincenal', 'mensual', 'trimestral', 'anual'] as const).map((v) => ({ valor: v, label: FRECUENCIA_LABEL[v] }))} />
                <Incluir v={g.incluir} set={(b) => set({ incluir: b })} label={`Incluir ${g.comercio}`} />
              </div>
            )
          })}
        </section>
      )}

      {datos.resumen_categorias.length > 0 && (
        <section className="space-y-1">
          <h4 className="text-sm font-semibold">Gasto por categoría en el periodo</h4>
          <ul className="text-sm tabular-nums">
            {datos.resumen_categorias.map((c, i) => (
              <li key={i} className="flex justify-between border-b border-[#0d2b0d]/5 py-1">
                <span>{c.categoria}</span>
                <span>{dinero(c.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pendiente} onClick={confirmar} className={btnPrimario}>
          <Check className="w-4 h-4" /> {pendiente ? 'Guardando…' : 'Confirmar'}
        </button>
        <button type="button" disabled={pendiente} onClick={() => start(async () => { await descartarSubida(id); onListo() })} className={btnSecundario}>
          Descartar
        </button>
      </div>
      <p className="text-xs text-[#0d2b0d]/60">Al confirmar o descartar, el archivo se borra.</p>
    </div>
  )
}
