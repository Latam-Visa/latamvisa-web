'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { CATEGORIAS, ETIQUETA_CATEGORIA, ETIQUETA_SLOT, SLOTS } from '@/lib/deadlines/routine'
import type { Fecha } from '@/lib/deadlines/dates'
import { btnPrimario, btnSecundario, campo, tarjeta, type Resultado } from './ui'
import type { TareaInput } from '../actions'

export function NuevaTarea({ fechaInicial, crear }: { fechaInicial: Fecha; crear: (input: TareaInput) => Promise<Resultado> }) {
  const [abierto, setAbierto] = useState(false)
  const [pendiente, start] = useTransition()
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const form = useRef<HTMLFormElement>(null)

  const enviar = (fd: FormData) => {
    setMensaje(null)
    const input: TareaInput = {
      due_date: String(fd.get('due_date') || ''),
      slot: String(fd.get('slot')) as TareaInput['slot'],
      category: String(fd.get('category')) as TareaInput['category'],
      title: String(fd.get('title') || ''),
      notes: String(fd.get('notes') || ''),
    }
    start(async () => {
      const r = await crear(input)
      if (r.ok) {
        setMensaje({ ok: true, texto: 'Tarea creada.' })
        form.current?.reset()
      } else setMensaje({ ok: false, texto: r.error })
    })
  }

  return (
    <section className={`${tarjeta} p-4`}>
      {!abierto ? (
        <button type="button" onClick={() => setAbierto(true)} className={btnSecundario} aria-expanded={false}>
          <Plus className="w-4 h-4" />
          Nueva tarea
        </button>
      ) : (
        <form ref={form} action={enviar} className="grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-monument text-sm uppercase tracking-wide text-[#0d2b0d]">Nueva tarea</h2>
          <label className="text-xs font-semibold text-[#0d2b0d]">
            Fecha
            <input type="date" name="due_date" required defaultValue={fechaInicial} className={`${campo} mt-1 tabular-nums`} />
          </label>
          <label className="text-xs font-semibold text-[#0d2b0d]">
            Bloque
            <select name="slot" defaultValue="am" className={`${campo} mt-1`}>
              {SLOTS.map((s) => (
                <option key={s} value={s}>{ETIQUETA_SLOT[s]}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 text-xs font-semibold text-[#0d2b0d]">
            Categoría
            <select name="category" defaultValue="latam" className={`${campo} mt-1`}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{ETIQUETA_CATEGORIA[c]}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 text-xs font-semibold text-[#0d2b0d]">
            Título
            <input name="title" required maxLength={200} className={`${campo} mt-1`} />
          </label>
          <label className="col-span-2 text-xs font-semibold text-[#0d2b0d]">
            Notas <span className="font-normal text-[#0d2b0d]/50">(opcional)</span>
            <textarea name="notes" rows={2} maxLength={2000} className={`${campo} mt-1 py-2 resize-none`} />
          </label>
          {mensaje && (
            <p role={mensaje.ok ? 'status' : 'alert'} className={`col-span-2 text-sm ${mensaje.ok ? 'text-[#2F4A00] font-semibold' : 'text-red-700'}`}>
              {mensaje.texto}
            </p>
          )}
          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={pendiente} className={btnPrimario}>
              {pendiente ? 'Creando…' : 'Crear tarea'}
            </button>
            <button type="button" onClick={() => { setAbierto(false); setMensaje(null) }} className={btnSecundario}>
              Cerrar
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
