'use client'

import { useState, useTransition } from 'react'
import { Check, MoreHorizontal } from 'lucide-react'
import { CATEGORIAS, ETIQUETA_CATEGORIA, ETIQUETA_SLOT, SLOTS } from '@/lib/deadlines/routine'
import { formatEs } from '@/lib/deadlines/dates'
import { Swatch, btnPeligro, btnPrimario, btnSecundario, campo, foco, type Resultado, type Tarea } from './ui'
import type { TareaInput } from '../actions'

export interface AccionesTarea {
  toggle: (t: Tarea) => void
  borrar: (t: Tarea) => void
  actualizar: (t: Tarea, input: TareaInput) => Promise<Resultado>
  error: (t: Tarea) => string | undefined
}

export function TaskItem({
  tarea,
  acciones,
  mostrarFecha = false,
  children,
}: {
  tarea: Tarea
  acciones: AccionesTarea
  mostrarFecha?: boolean
  children?: React.ReactNode
}) {
  const [menu, setMenu] = useState<'cerrado' | 'abierto' | 'editar' | 'borrar'>('cerrado')
  const error = acciones.error(tarea)

  return (
    <li className="py-1.5">
      <div className="flex items-start gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={tarea.done}
          aria-label={`${tarea.done ? 'Desmarcar' : 'Marcar como hecha'}: ${tarea.title}`}
          onClick={() => acciones.toggle(tarea)}
          className={`shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center motion-safe:transition-colors ${foco} ${
            tarea.done ? 'bg-[#C8FF00] border-[#2F4A00]/40' : 'bg-white border-[#0d2b0d]/25 hover:border-[#2F4A00]'
          }`}
        >
          {tarea.done && <Check className="w-5 h-5 text-[#0d2b0d]" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1 pt-1.5">
          <p className={`text-sm leading-snug break-words ${tarea.done ? 'line-through text-[#0d2b0d]/45' : 'text-[#0d2b0d]'}`}>
            <span className="inline-flex align-middle mr-1.5 -mt-0.5">
              <Swatch categoria={tarea.category} />
            </span>
            {mostrarFecha && <span className="tabular-nums font-semibold text-[#2F4A00] mr-1.5">{formatEs(tarea.due_date)}</span>}
            {tarea.title}
          </p>
          {tarea.notes && <p className="text-xs text-[#0d2b0d]/60 mt-0.5 break-words">{tarea.notes}</p>}
          {error && (
            <p role="alert" className="text-xs text-red-700 mt-1">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          aria-label={`Opciones de ${tarea.title}`}
          aria-expanded={menu !== 'cerrado'}
          onClick={() => setMenu((m) => (m === 'cerrado' ? 'abierto' : 'cerrado'))}
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-[#0d2b0d]/50 hover:text-[#0d2b0d] hover:bg-[#0d2b0d]/5 ${foco}`}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {children && <div className="flex flex-wrap gap-2 mt-2 pl-12">{children}</div>}

      {menu === 'abierto' && (
        <div className="flex flex-wrap gap-2 mt-2 pl-12">
          <button type="button" onClick={() => setMenu('editar')} className={btnSecundario}>
            Editar
          </button>
          <button type="button" onClick={() => setMenu('borrar')} className={btnSecundario}>
            Borrar
          </button>
        </div>
      )}

      {menu === 'borrar' && (
        <div className="mt-2 pl-12 flex flex-wrap items-center gap-2" role="group" aria-label="Confirmar borrado">
          <span className="text-sm text-[#0d2b0d]">¿Borrar esta tarea?</span>
          <button
            type="button"
            onClick={() => {
              setMenu('cerrado')
              acciones.borrar(tarea)
            }}
            className={btnPeligro}
          >
            Sí, borrar
          </button>
          <button type="button" onClick={() => setMenu('cerrado')} className={btnSecundario}>
            Cancelar
          </button>
        </div>
      )}

      {menu === 'editar' && <EditarTarea tarea={tarea} acciones={acciones} onCerrar={() => setMenu('cerrado')} />}
    </li>
  )
}

function EditarTarea({ tarea, acciones, onCerrar }: { tarea: Tarea; acciones: AccionesTarea; onCerrar: () => void }) {
  const [pendiente, start] = useTransition()
  const [error, setError] = useState('')

  const guardar = (fd: FormData) => {
    setError('')
    const input: TareaInput = {
      due_date: String(fd.get('due_date') || ''),
      slot: String(fd.get('slot')) as TareaInput['slot'],
      category: String(fd.get('category')) as TareaInput['category'],
      title: String(fd.get('title') || ''),
      notes: String(fd.get('notes') || ''),
    }
    start(async () => {
      const r = await acciones.actualizar(tarea, input)
      if (r.ok) onCerrar()
      else setError(r.error)
    })
  }

  return (
    <form action={guardar} className="mt-2 ml-12 grid grid-cols-2 gap-2 rounded-xl bg-[#FAFAF7] border border-[#0d2b0d]/10 p-3">
      <label className="col-span-2 text-xs font-semibold text-[#0d2b0d]">
        Título
        <input name="title" defaultValue={tarea.title} required maxLength={200} className={`${campo} mt-1`} />
      </label>
      <label className="text-xs font-semibold text-[#0d2b0d]">
        Fecha
        <input type="date" name="due_date" defaultValue={tarea.due_date} required className={`${campo} mt-1 tabular-nums`} />
      </label>
      <label className="text-xs font-semibold text-[#0d2b0d]">
        Bloque
        <select name="slot" defaultValue={tarea.slot} className={`${campo} mt-1`}>
          {SLOTS.map((s) => (
            <option key={s} value={s}>{ETIQUETA_SLOT[s]}</option>
          ))}
        </select>
      </label>
      <label className="col-span-2 text-xs font-semibold text-[#0d2b0d]">
        Categoría
        <select name="category" defaultValue={tarea.category} className={`${campo} mt-1`}>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{ETIQUETA_CATEGORIA[c]}</option>
          ))}
        </select>
      </label>
      <label className="col-span-2 text-xs font-semibold text-[#0d2b0d]">
        Notas
        <textarea name="notes" defaultValue={tarea.notes ?? ''} rows={2} maxLength={2000} className={`${campo} mt-1 py-2 resize-none`} />
      </label>
      {error && (
        <p role="alert" className="col-span-2 text-xs text-red-700">{error}</p>
      )}
      <div className="col-span-2 flex gap-2">
        <button type="submit" disabled={pendiente} className={btnPrimario}>
          {pendiente ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCerrar} className={btnSecundario}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
