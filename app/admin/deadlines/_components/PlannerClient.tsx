'use client'
/// <reference types="react/canary" />

import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { HABITOS, type Habito } from '@/lib/deadlines/routine'
import { addDays, diasDeLaSemana, formatEs, startOfWeek, type Fecha } from '@/lib/deadlines/dates'
import { createTask, deleteTask, moveTask, toggleHabit, toggleTask, updateTask, type TareaInput } from '../actions'
import { DayCard } from './DayCard'
import { BotonHabito, HabitsGrid, claveHabito } from './HabitsGrid'
import { NuevaTarea } from './NuevaTarea'
import { TaskItem, type AccionesTarea } from './TaskItem'
import { btnSecundario, foco, tarjeta, type Tarea } from './ui'

export interface Semana {
  lunes: Fecha
  etiqueta: string // 'S1' o '29 dic'
  focus: string | null
}

type AccionOptimista =
  | { tipo: 'toggle'; id: string }
  | { tipo: 'mover'; id: string; fecha: Fecha }
  | { tipo: 'borrar'; id: string }

function reducirTareas(tareas: Tarea[], a: AccionOptimista): Tarea[] {
  switch (a.tipo) {
    case 'toggle':
      return tareas.map((t) => (t.id === a.id ? { ...t, done: !t.done } : t))
    case 'mover':
      return tareas.map((t) => (t.id === a.id ? { ...t, due_date: a.fecha } : t))
    case 'borrar':
      return tareas.filter((t) => t.id !== a.id)
  }
}

export function PlannerClient({
  hoy,
  lunes,
  semanas,
  tareas: tareasServidor,
  habitos: habitosServidor,
}: {
  hoy: Fecha
  lunes: Fecha
  semanas: Semana[]
  tareas: Tarea[]
  habitos: string[]
}) {
  const [, startTransition] = useTransition()
  const [tareas, aplicar] = useOptimistic(tareasServidor, reducirTareas)
  const [habitos, aplicarHabito] = useOptimistic(new Set(habitosServidor), (actual: Set<string>, clave: string) => {
    const nuevo = new Set(actual)
    nuevo.has(clave) ? nuevo.delete(clave) : nuevo.add(clave)
    return nuevo
  })
  const [errores, setErrores] = useState<Record<string, string>>({})

  // Optimista: la UI cambia al instante; si la acción falla, useOptimistic
  // vuelve solo al estado del servidor y se muestra un error en línea.
  const ejecutar = (clave: string, optimista: () => void, accion: () => Promise<{ ok: boolean; error?: string }>) => {
    setErrores(({ [clave]: _, ...resto }) => resto)
    startTransition(async () => {
      optimista()
      const r = await accion()
      if (!r.ok) setErrores((e) => ({ ...e, [clave]: r.error || 'No se pudo guardar.' }))
    })
  }

  const acciones: AccionesTarea = {
    toggle: (t) => ejecutar(t.id, () => aplicar({ tipo: 'toggle', id: t.id }), () => toggleTask(t.id)),
    borrar: (t) => ejecutar(t.id, () => aplicar({ tipo: 'borrar', id: t.id }), () => deleteTask(t.id)),
    actualizar: (t, input: TareaInput) => updateTask(t.id, input),
    error: (t) => errores[t.id],
  }
  const mover = (t: Tarea, fecha: Fecha) => ejecutar(t.id, () => aplicar({ tipo: 'mover', id: t.id, fecha }), () => moveTask(t.id, fecha))
  const toggleH = (fecha: Fecha, habito: Habito) => {
    const clave = claveHabito(fecha, habito)
    ejecutar('habitos', () => aplicarHabito(clave), () => toggleHabit(fecha, habito))
  }

  // ── Datos derivados ──
  const manana = addDays(hoy, 1)
  const proximoLunes = addDays(startOfWeek(hoy), 7)
  const total = tareas.length
  const hechas = tareas.filter((t) => t.done).length
  const deHoy = tareas.filter((t) => t.due_date === hoy)
  const atrasadas = tareas.filter((t) => t.due_date < hoy && !t.done).sort((a, b) => a.due_date.localeCompare(b.due_date))
  const hitos = tareas.filter((t) => t.slot === 'hito').sort((a, b) => a.due_date.localeCompare(b.due_date))
  const dias = diasDeLaSemana(lunes)
  const finSemana = dias[6]
  const deLaSemana = tareas.filter((t) => t.due_date >= lunes && t.due_date <= finSemana)
  const cerradas = deLaSemana.filter((t) => t.done).length
  const semana = semanas.find((s) => s.lunes === lunes)
  const porDia = new Map<Fecha, Tarea[]>()
  for (const t of deLaSemana) porDia.set(t.due_date, [...(porDia.get(t.due_date) || []), t])

  // El chip de la semana elegida queda visible dentro de su propio scroll.
  const chipActivo = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const chip = chipActivo.current
    const cont = chip?.parentElement
    if (chip && cont) cont.scrollLeft = chip.offsetLeft - cont.clientWidth / 2 + chip.clientWidth / 2
  }, [lunes])

  return (
    <div className="max-w-[1400px] mx-auto w-full space-y-6 pb-16 font-funnel text-[#0d2b0d]">
      {/* 1. Encabezado */}
      <header className="space-y-3">
        <h1 className="font-monument text-2xl sm:text-3xl uppercase">Deadlines</h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-[#0d2b0d]/10 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={hechas} aria-label="Progreso total">
            <div className="h-full bg-[#2F4A00] motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${total ? (hechas / total) * 100 : 0}%` }} />
          </div>
          <span className="tabular-nums text-sm font-semibold">{hechas} / {total}</span>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 2. Hoy */}
        <section aria-labelledby="hoy" className={`${tarjeta} p-4 border-2 border-[#2F4A00]`}>
          <div className="flex items-center justify-between mb-2">
            <h2 id="hoy" className="font-monument text-sm uppercase tracking-wide">Hoy</h2>
            <span className="tabular-nums text-xs text-[#0d2b0d]/60">{formatEs(hoy)}</span>
          </div>
          {deHoy.length === 0 ? (
            <p className="text-sm text-[#0d2b0d]/60">Sin tareas para hoy.</p>
          ) : (
            <ul>{deHoy.map((t) => <TaskItem key={t.id} tarea={t} acciones={acciones} />)}</ul>
          )}
          <div className="mt-3 pt-3 border-t border-[#0d2b0d]/10">
            <p className="text-xs font-semibold text-[#0d2b0d]/70 mb-2">Hábitos de hoy</p>
            {errores.habitos && <p role="alert" className="text-xs text-red-700 mb-2">{errores.habitos}</p>}
            <ul className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {HABITOS.map((h) => (
                <li key={h.id} className="flex flex-col items-center gap-1 text-center">
                  <BotonHabito fecha={hoy} habito={h.id} label={h.label} hecho={habitos.has(claveHabito(hoy, h.id))} onToggle={toggleH} />
                  <span className="text-[11px] leading-tight text-[#0d2b0d]/70">{h.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Atrasadas */}
        <section aria-labelledby="atrasadas" className={atrasadas.length ? `${tarjeta} p-4` : 'px-1'}>
          <h2 id="atrasadas" className="font-monument text-sm uppercase tracking-wide mb-2">Atrasadas</h2>
          {atrasadas.length === 0 ? (
            <p className="text-sm text-[#2F4A00]">Nada atrasado.</p>
          ) : (
            <ul>
              {atrasadas.map((t) => (
                <TaskItem key={t.id} tarea={t} acciones={acciones} mostrarFecha>
                  <button type="button" className={btnSecundario} onClick={() => acciones.toggle(t)}>Hecha</button>
                  <button type="button" className={btnSecundario} onClick={() => mover(t, manana)}>Mover a mañana</button>
                  <button type="button" className={btnSecundario} onClick={() => mover(t, proximoLunes)}>Mover al próximo lunes</button>
                </TaskItem>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 4. Fechas que no se mueven */}
      {hitos.length > 0 && (
        <section aria-labelledby="hitos">
          <h2 id="hitos" className="font-monument text-sm uppercase tracking-wide mb-2">Fechas que no se mueven</h2>
          <ul className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {hitos.map((t) => (
              <li key={t.id} className="shrink-0">
                <Link
                  href={`?week=${startOfWeek(t.due_date)}#dia-${t.due_date}`}
                  scroll={false}
                  className={`flex items-center gap-2 rounded-xl bg-white border border-[#0d2b0d]/10 px-3 min-h-[44px] text-sm hover:border-red-300 ${foco} ${t.done ? 'opacity-50' : ''}`}
                >
                  <span className="tabular-nums font-bold text-red-700">{formatEs(t.due_date)}</span>
                  <span className={`max-w-[220px] truncate ${t.done ? 'line-through' : ''}`}>{t.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. Semanas */}
      <section aria-labelledby="semana" className="space-y-2">
        <nav aria-label="Semanas" className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {semanas.map((s) => {
            const activa = s.lunes === lunes
            return (
              <Link
                key={s.lunes}
                ref={activa ? chipActivo : undefined}
                href={`?week=${s.lunes}`}
                scroll={false}
                aria-current={activa ? 'page' : undefined}
                className={`shrink-0 inline-flex items-center justify-center rounded-full px-4 min-h-[40px] text-sm font-bold tabular-nums ${foco} ${
                  activa ? 'bg-[#C8FF00] text-[#0d2b0d]' : 'bg-white border border-[#0d2b0d]/15 text-[#0d2b0d] hover:border-[#0d2b0d]/40'
                }`}
              >
                {s.etiqueta}
              </Link>
            )
          })}
        </nav>
        <div>
          <h2 id="semana" className="font-monument text-lg uppercase">
            {semana?.etiqueta.startsWith('S') ? `${semana.etiqueta} · ` : 'Semana · '}
            <span className="tabular-nums">{formatEs(lunes)} – {formatEs(finSemana)}</span>
          </h2>
          {semana?.focus && <p className="text-sm text-[#2F4A00] font-semibold">{semana.focus}</p>}
          <p className="text-sm text-[#0d2b0d]/70 tabular-nums">{cerradas} de {deLaSemana.length} cerradas</p>
        </div>
      </section>

      {/* 6. Días */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {dias.map((d) => (
          <DayCard key={d} fecha={d} tareas={porDia.get(d) || []} esHoy={d === hoy} acciones={acciones} />
        ))}
      </div>

      {/* 7. Hábitos */}
      <HabitsGrid dias={dias} hechos={habitos} hoy={hoy} onToggle={toggleH} errores={errores.habitos} />

      {/* 8. Nueva tarea */}
      <NuevaTarea fechaInicial={hoy >= lunes && hoy <= finSemana ? hoy : lunes} crear={createTask} />
    </div>
  )
}
