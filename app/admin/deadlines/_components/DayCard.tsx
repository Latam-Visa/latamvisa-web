'use client'

import { bloquesDelDia } from '@/lib/deadlines/routine'
import { dayNameEs, formatEs, type Fecha } from '@/lib/deadlines/dates'
import { TaskItem, type AccionesTarea } from './TaskItem'
import { Swatch, tarjeta, type Tarea } from './ui'

export function DayCard({ fecha, tareas, esHoy, acciones }: { fecha: Fecha; tareas: Tarea[]; esHoy: boolean; acciones: AccionesTarea }) {
  const bloques = bloquesDelDia(fecha)
  const hitos = tareas.filter((t) => t.slot === 'hito')
  const slotsConBloque = new Set(bloques.map((b) => b.slot).filter(Boolean))
  // Tareas cuyo bloque no existe ese día (p. ej. 'am' un viernes): nunca se ocultan.
  const sinBloque = tareas.filter((t) => t.slot !== 'hito' && !slotsConBloque.has(t.slot))

  return (
    <section
      id={`dia-${fecha}`}
      aria-label={`${dayNameEs(fecha)} ${formatEs(fecha)}`}
      className={`${tarjeta} p-4 scroll-mt-4 ${esHoy ? 'border-2 border-[#2F4A00]' : ''}`}
    >
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-monument text-sm uppercase tracking-wide text-[#0d2b0d]">
          {dayNameEs(fecha)} <span className="tabular-nums text-[#0d2b0d]/60">{formatEs(fecha)}</span>
        </h3>
        {esHoy && <span className="bg-[#C8FF00] text-[#0d2b0d] text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">Hoy</span>}
      </header>

      {hitos.length > 0 && (
        <ul className="mb-3 rounded-xl border border-red-200 bg-red-50 px-2">
          {hitos.map((t) => (
            <TaskItem key={t.id} tarea={t} acciones={acciones} />
          ))}
        </ul>
      )}

      <ol className="space-y-3">
        {bloques.map((b, i) => {
          const suyas = b.slot ? tareas.filter((t) => t.slot === b.slot) : []
          return (
            <li key={i} className={b.isWork ? 'opacity-60' : ''}>
              <div className={`flex items-center gap-2 text-xs ${b.isWork ? 'text-[#0d2b0d]/70 italic' : 'text-[#0d2b0d]'}`}>
                <span className="tabular-nums w-10 shrink-0 text-[#0d2b0d]/60">{b.time}</span>
                <Swatch categoria={b.category} />
                <span className="font-semibold">{b.etiqueta}</span>
              </div>
              {suyas.length > 0 && (
                <ul className="ml-12 mt-1">
                  {suyas.map((t) => (
                    <TaskItem key={t.id} tarea={t} acciones={acciones} />
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>

      {sinBloque.length > 0 && (
        <div className="mt-4 pt-3 border-t border-dashed border-[#0d2b0d]/15">
          <p className="text-xs font-semibold text-[#0d2b0d]/70">Sin bloque</p>
          <ul>
            {sinBloque.map((t) => (
              <TaskItem key={t.id} tarea={t} acciones={acciones} />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
