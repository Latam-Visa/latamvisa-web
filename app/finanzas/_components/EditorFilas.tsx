'use client'

import { useState, useTransition } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { borrarFila, guardarFila, type FilaInput } from '../actions'
import { Chips, btnPeligro, btnPrimario, btnSecundario, campo, etiqueta, tarjeta } from './ui'

type Tabla = 'fin_income_sources' | 'fin_expenses' | 'fin_accounts' | 'fin_goals'

export type Campo =
  | { tipo: 'texto'; nombre: string; label: string; requerido?: boolean; placeholder?: string }
  | { tipo: 'monto'; nombre: string; label: string; requerido?: boolean }
  | { tipo: 'fecha'; nombre: string; label: string; requerido?: boolean; ayuda?: string }
  | { tipo: 'chips'; nombre: string; label: string; opciones: { valor: string; label: string }[]; requerido?: boolean; ayuda?: string }
  | { tipo: 'si_no'; nombre: string; label: string; ayuda?: string }

type Valores = Record<string, string | boolean | null>

export interface Preset {
  label: string
  valores: Valores
}

function vacios(campos: Campo[], defaults: Valores): Valores {
  const v: Valores = {}
  for (const c of campos) v[c.nombre] = c.tipo === 'si_no' ? false : ''
  return { ...v, ...defaults }
}

function Formulario({
  tabla,
  campos,
  inicial,
  onListo,
  onCancelar,
  textoGuardar,
}: {
  tabla: Tabla
  campos: Campo[]
  inicial: Valores
  onListo: () => void
  onCancelar?: () => void
  textoGuardar: string
}) {
  const [v, setV] = useState<Valores>(inicial)
  const [error, setError] = useState('')
  const [pendiente, start] = useTransition()
  const set = (k: string, x: string | boolean | null) => setV((prev) => ({ ...prev, [k]: x }))

  const guardar = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const falta = campos.find((c) => c.tipo !== 'si_no' && c.requerido && (v[c.nombre] === '' || v[c.nombre] === null))
    if (falta) return setError(`Falta: ${falta.label}`)
    start(async () => {
      const datos: Record<string, unknown> = { ...v }
      for (const c of campos) if (c.tipo === 'fecha' && datos[c.nombre] === '') datos[c.nombre] = null
      const r = await guardarFila(tabla, datos as FilaInput<typeof tabla>)
      if (r.ok) onListo()
      else setError(r.error)
    })
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      {campos.map((c) => (
        <div key={c.nombre}>
          {c.tipo === 'chips' ? (
            <>
              <span className={etiqueta}>{c.label}</span>
              <Chips etiquetaGrupo={c.label} opciones={c.opciones} valor={(v[c.nombre] as string) || null} onChange={(x) => set(c.nombre, x)} />
              {c.ayuda && <p className="text-xs text-[#0d2b0d]/60 mt-1.5">{c.ayuda}</p>}
            </>
          ) : c.tipo === 'si_no' ? (
            <>
              <span className={etiqueta}>{c.label}</span>
              <Chips
                etiquetaGrupo={c.label}
                opciones={[{ valor: 'si', label: 'Sí' }, { valor: 'no', label: 'No' }]}
                valor={v[c.nombre] ? 'si' : 'no'}
                onChange={(x) => set(c.nombre, x === 'si')}
              />
              {c.ayuda && <p className="text-xs text-[#0d2b0d]/60 mt-1.5">{c.ayuda}</p>}
            </>
          ) : (
            <label className="block">
              <span className={etiqueta}>{c.label}</span>
              <input
                type={c.tipo === 'fecha' ? 'date' : 'text'}
                inputMode={c.tipo === 'monto' ? 'decimal' : undefined}
                value={(v[c.nombre] as string) ?? ''}
                onChange={(e) => set(c.nombre, c.tipo === 'monto' ? e.target.value.replace(/[^\d.,]/g, '').replace(',', '.') : e.target.value)}
                placeholder={c.tipo === 'monto' ? '0' : c.tipo === 'texto' ? c.placeholder : undefined}
                className={`${campo} ${c.tipo !== 'texto' ? 'tabular-nums' : ''}`}
              />
              {c.tipo === 'fecha' && c.ayuda && <span className="block text-xs text-[#0d2b0d]/60 mt-1.5">{c.ayuda}</span>}
            </label>
          )}
        </div>
      ))}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pendiente} className={btnPrimario}>
          {pendiente ? 'Guardando…' : textoGuardar}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className={btnSecundario}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

/**
 * Lista editable de filas de una tabla. Se usa en el onboarding y en Ajustes.
 * Borrar pide confirmación en la página ("Sí, borrar"), nunca window.confirm.
 */
export function EditorFilas({
  tabla,
  filas,
  campos,
  resumen,
  defaults = {},
  presets = [],
  textoAgregar,
  aValores,
}: {
  tabla: Tabla
  filas: any[]
  campos: Campo[]
  resumen: (fila: any) => { titulo: string; detalle: string }
  defaults?: Valores
  presets?: Preset[]
  textoAgregar: string
  aValores?: (fila: any) => Valores
}) {
  const [agregando, setAgregando] = useState<Valores | null>(filas.length === 0 ? vacios(campos, defaults) : null)
  const [editando, setEditando] = useState<string | null>(null)
  const [borrando, setBorrando] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [pendiente, start] = useTransition()

  // Valores de una fila guardada: sus campos visibles + las claves fijas de
  // `defaults` (p. ej. la categoría del gasto, que no se edita aquí).
  const valoresDe = (f: any): Valores => {
    if (aValores) return aValores(f)
    const v: Valores = {}
    for (const k of Object.keys(defaults)) if (f[k] !== null && f[k] !== undefined) v[k] = typeof f[k] === 'boolean' ? f[k] : String(f[k])
    for (const c of campos) {
      const x = f[c.nombre]
      v[c.nombre] = x === null || x === undefined ? (c.tipo === 'si_no' ? false : '') : typeof x === 'boolean' ? x : String(x)
    }
    return v
  }

  const borrar = (id: string) =>
    start(async () => {
      setError('')
      const r = await borrarFila(tabla, id)
      if (!r.ok) setError(r.error)
      setBorrando(null)
    })

  return (
    <div className="space-y-3">
      {filas.length > 0 && (
        <ul className="space-y-2">
          {filas.map((f) => {
            const r = resumen(f)
            return (
              <li key={f.id} className={`${tarjeta} p-3`}>
                {editando === f.id ? (
                  <Formulario tabla={tabla} campos={campos} inicial={{ ...valoresDe(f), id: f.id }} onListo={() => setEditando(null)} onCancelar={() => setEditando(null)} textoGuardar="Guardar" />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold break-words">{r.titulo}</p>
                      <p className="text-sm text-[#0d2b0d]/70 tabular-nums break-words">{r.detalle}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" aria-label={`Editar ${r.titulo}`} onClick={() => setEditando(f.id)} className={`${btnSecundario} px-3`}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setBorrando(f.id)} className={`${btnSecundario} px-3`}>
                        Borrar
                      </button>
                    </div>
                  </div>
                )}
                {borrando === f.id && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm">¿Borrar “{r.titulo}”?</span>
                    <button type="button" disabled={pendiente} onClick={() => borrar(f.id)} className={btnPeligro}>
                      Sí, borrar
                    </button>
                    <button type="button" onClick={() => setBorrando(null)} className={btnSecundario}>
                      Cancelar
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      {agregando ? (
        <div className={`${tarjeta} p-4`}>
          <Formulario
            key={JSON.stringify(agregando)}
            tabla={tabla}
            campos={campos}
            inicial={agregando}
            onListo={() => setAgregando(null)}
            onCancelar={filas.length ? () => setAgregando(null) : undefined}
            textoGuardar="Guardar"
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.label} type="button" onClick={() => setAgregando(vacios(campos, { ...defaults, ...p.valores }))} className={btnSecundario}>
              <Plus className="w-4 h-4" />
              {p.label}
            </button>
          ))}
          <button type="button" onClick={() => setAgregando(vacios(campos, defaults))} className={btnSecundario}>
            <Plus className="w-4 h-4" />
            {textoAgregar}
          </button>
        </div>
      )}
    </div>
  )
}
