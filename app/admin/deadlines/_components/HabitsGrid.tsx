'use client'

import { Check } from 'lucide-react'
import { HABITOS, type Habito } from '@/lib/deadlines/routine'
import { dayNameEs, formatEs, type Fecha } from '@/lib/deadlines/dates'
import { foco, tarjeta } from './ui'

export const claveHabito = (fecha: Fecha, habito: Habito | string) => `${fecha}|${habito}`

export function BotonHabito({
  fecha,
  habito,
  label,
  hecho,
  onToggle,
}: {
  fecha: Fecha
  habito: Habito
  label: string
  hecho: boolean
  onToggle: (fecha: Fecha, habito: Habito) => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={hecho}
      aria-label={`${label}, ${dayNameEs(fecha)} ${formatEs(fecha)}`}
      onClick={() => onToggle(fecha, habito)}
      className={`w-10 h-10 rounded-lg border flex items-center justify-center motion-safe:transition-colors ${foco} ${
        hecho ? 'bg-[#C8FF00] border-[#2F4A00]/40' : 'bg-white border-[#0d2b0d]/20 hover:border-[#2F4A00]'
      }`}
    >
      {hecho && <Check className="w-5 h-5 text-[#0d2b0d]" strokeWidth={3} />}
    </button>
  )
}

// La tabla scrollea dentro de su propio contenedor: el body nunca se mueve de lado.
export function HabitsGrid({
  dias,
  hechos,
  hoy,
  onToggle,
  errores,
}: {
  dias: Fecha[]
  hechos: Set<string>
  hoy: Fecha
  onToggle: (fecha: Fecha, habito: Habito) => void
  errores: string | undefined
}) {
  return (
    <section aria-labelledby="habitos" className={`${tarjeta} p-4`}>
      <h2 id="habitos" className="font-monument text-sm uppercase tracking-wide text-[#0d2b0d] mb-3">Hábitos</h2>
      {errores && <p role="alert" className="text-xs text-red-700 mb-2">{errores}</p>}
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="border-separate border-spacing-1 text-xs min-w-[560px]">
          <thead>
            <tr>
              <th className="text-left font-semibold text-[#0d2b0d]/70 pr-2">Hábito</th>
              {dias.map((d) => (
                <th key={d} className={`font-semibold tabular-nums w-11 ${d === hoy ? 'text-[#2F4A00]' : 'text-[#0d2b0d]/70'}`}>
                  {dayNameEs(d)}
                  <br />
                  <span className="font-normal">{formatEs(d).split(' ')[0]}</span>
                </th>
              ))}
              <th className="font-semibold text-[#0d2b0d]/70 pl-1">n/7</th>
            </tr>
          </thead>
          <tbody>
            {HABITOS.map((h) => {
              const n = dias.filter((d) => hechos.has(claveHabito(d, h.id))).length
              return (
                <tr key={h.id}>
                  <th scope="row" className="text-left font-medium text-[#0d2b0d] pr-2 whitespace-nowrap">{h.label}</th>
                  {dias.map((d) => (
                    <td key={d} className="text-center">
                      <BotonHabito fecha={d} habito={h.id} label={h.label} hecho={hechos.has(claveHabito(d, h.id))} onToggle={onToggle} />
                    </td>
                  ))}
                  <td className="tabular-nums font-semibold text-[#0d2b0d] pl-1">{n}/7</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
