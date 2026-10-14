'use client'

import { useState, useTransition } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { addDays } from '@/lib/deadlines/dates'
import { dinero, fechaCorta } from '@/lib/finanzas/formato'
import { borrarFila, guardarDeuda, type DeudaInput } from '../actions'
import { Chips, btnPeligro, btnPrimario, btnSecundario, campo, etiqueta, tarjeta } from './ui'

type Cuota = { due_date: string; amount: string; status: 'pendiente' | 'pagado' }
interface Borrador {
  id?: string
  lender: string
  kind: DeudaInput['kind']
  balance: string
  interest_rate: string
  late_fee_risk: boolean
  cuotas: Cuota[]
}

export const PRESETS_DEUDA: { label: string; valores: Partial<Borrador> }[] = [
  { label: 'Afterpay', valores: { lender: 'Afterpay', kind: 'bnpl', late_fee_risk: true } },
  { label: 'StepPay', valores: { lender: 'StepPay', kind: 'bnpl', late_fee_risk: true } },
  { label: 'Tarjeta de crédito', valores: { lender: 'Tarjeta de crédito', kind: 'tarjeta', late_fee_risk: true } },
  { label: 'Le debo a alguien', valores: { lender: '', kind: 'otro', late_fee_risk: false } },
]

const vacio = (v: Partial<Borrador> = {}): Borrador => ({ lender: '', kind: 'bnpl', balance: '', interest_rate: '', late_fee_risk: true, cuotas: [], ...v })

function sumarMes(f: string, n: number) {
  const [y, m, d] = f.split('-').map(Number)
  const x = new Date(Date.UTC(y, m - 1 + n, 1))
  const ultimo = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate()
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(Math.min(d, ultimo)).padStart(2, '0')}`
}

function Formulario({ inicial, onListo, onCancelar }: { inicial: Borrador; onListo: () => void; onCancelar?: () => void }) {
  const [b, setB] = useState(inicial)
  const [gen, setGen] = useState({ n: '4', monto: '', cada: 'quincenal', desde: '' })
  const [error, setError] = useState('')
  const [pendiente, start] = useTransition()
  const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) => setB((x) => ({ ...x, [k]: v }))
  const num = (s: string) => s.replace(/[^\d.,]/g, '').replace(',', '.')

  // "N cuotas de X cada <frecuencia> desde <fecha>" -> lista editable.
  const generar = () => {
    const n = Math.min(60, Math.max(1, Number(gen.n) || 0))
    if (!gen.desde || !(Number(gen.monto) > 0)) return setError('Para generar cuotas pon el monto y la primera fecha.')
    setError('')
    const fechas = Array.from({ length: n }, (_, i) =>
      gen.cada === 'semanal' ? addDays(gen.desde, 7 * i) : gen.cada === 'quincenal' ? addDays(gen.desde, 14 * i) : sumarMes(gen.desde, i),
    )
    set('cuotas', [...b.cuotas, ...fechas.map((f) => ({ due_date: f, amount: gen.monto, status: 'pendiente' as const }))].sort((x, y) => x.due_date.localeCompare(y.due_date)))
  }

  const guardar = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!b.lender.trim()) return setError('Falta: ¿a quién le debes?')
    start(async () => {
      const saldo = b.balance || String(b.cuotas.filter((q) => q.status === 'pendiente').reduce((s, q) => s + Number(q.amount || 0), 0))
      const r = await guardarDeuda({
        id: b.id,
        lender: b.lender,
        kind: b.kind,
        balance: saldo,
        interest_rate: b.interest_rate,
        fee_monthly: null,
        late_fee_risk: b.late_fee_risk,
        notes: null,
        cuotas: b.cuotas.filter((q) => q.due_date && Number(q.amount) > 0),
      })
      if (r.ok) onListo()
      else setError(r.error)
    })
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      <label className="block">
        <span className={etiqueta}>¿A quién le debes?</span>
        <input value={b.lender} onChange={(e) => set('lender', e.target.value)} className={campo} placeholder="Ej. Afterpay, mi tía…" />
      </label>
      <div>
        <span className={etiqueta}>Tipo</span>
        <Chips
          etiquetaGrupo="Tipo de deuda"
          valor={b.kind}
          onChange={(k) => set('kind', k)}
          opciones={[
            { valor: 'bnpl', label: 'BNPL' },
            { valor: 'tarjeta', label: 'Tarjeta' },
            { valor: 'prestamo_personal', label: 'Préstamo' },
            { valor: 'otro', label: 'Persona / otro' },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={etiqueta}>Saldo que debes</span>
          <input inputMode="decimal" value={b.balance} onChange={(e) => set('balance', num(e.target.value))} className={`${campo} tabular-nums`} placeholder="Suma de cuotas" />
        </label>
        <label className="block">
          <span className={etiqueta}>Interés anual %</span>
          <input inputMode="decimal" value={b.interest_rate} onChange={(e) => set('interest_rate', num(e.target.value))} className={`${campo} tabular-nums`} placeholder="0" />
        </label>
      </div>
      <div>
        <span className={etiqueta}>¿Te cobran multa si te atrasas?</span>
        <Chips etiquetaGrupo="Multa por atraso" valor={b.late_fee_risk ? 'si' : 'no'} onChange={(x) => set('late_fee_risk', x === 'si')} opciones={[{ valor: 'si', label: 'Sí' }, { valor: 'no', label: 'No' }]} />
      </div>

      <fieldset className="rounded-xl border border-[#0d2b0d]/10 p-3 space-y-3">
        <legend className="px-1 text-sm font-semibold">Calendario de cuotas</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold">
            Cuántas
            <input inputMode="numeric" value={gen.n} onChange={(e) => setGen((g) => ({ ...g, n: e.target.value.replace(/\D/g, '') }))} className={`${campo} mt-1 tabular-nums`} />
          </label>
          <label className="text-xs font-semibold">
            De cuánto
            <input inputMode="decimal" value={gen.monto} onChange={(e) => setGen((g) => ({ ...g, monto: num(e.target.value) }))} className={`${campo} mt-1 tabular-nums`} />
          </label>
          <label className="text-xs font-semibold col-span-2">
            Primera cuota
            <input type="date" value={gen.desde} onChange={(e) => setGen((g) => ({ ...g, desde: e.target.value }))} className={`${campo} mt-1 tabular-nums`} />
          </label>
        </div>
        <Chips etiquetaGrupo="Cada cuánto" valor={gen.cada} onChange={(c) => setGen((g) => ({ ...g, cada: c }))} opciones={[{ valor: 'semanal', label: 'Semanal' }, { valor: 'quincenal', label: 'Quincenal' }, { valor: 'mensual', label: 'Mensual' }]} />
        <button type="button" onClick={generar} className={btnSecundario}>
          <Plus className="w-4 h-4" /> Agregar cuotas
        </button>
        {b.cuotas.length > 0 && (
          <ul className="space-y-1">
            {b.cuotas.map((q, i) => (
              <li key={i} className="flex items-center gap-2">
                <input type="date" aria-label="Fecha de la cuota" value={q.due_date} onChange={(e) => set('cuotas', b.cuotas.map((x, j) => (j === i ? { ...x, due_date: e.target.value } : x)))} className={`${campo} tabular-nums`} />
                <input inputMode="decimal" aria-label="Monto de la cuota" value={q.amount} onChange={(e) => set('cuotas', b.cuotas.map((x, j) => (j === i ? { ...x, amount: num(e.target.value) } : x)))} className={`${campo} w-28 tabular-nums`} />
                <button type="button" aria-label="Quitar cuota" onClick={() => set('cuotas', b.cuotas.filter((_, j) => j !== i))} className={`${btnSecundario} px-3 shrink-0`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pendiente} className={btnPrimario}>{pendiente ? 'Guardando…' : 'Guardar deuda'}</button>
        {onCancelar && <button type="button" onClick={onCancelar} className={btnSecundario}>Cancelar</button>}
      </div>
    </form>
  )
}

export function EditorDeudas({ deudas, cuotas }: { deudas: any[]; cuotas: any[] }) {
  const [agregando, setAgregando] = useState<Borrador | null>(null)
  const [editando, setEditando] = useState<string | null>(null)
  const [borrando, setBorrando] = useState<string | null>(null)
  const [pendiente, start] = useTransition()
  const [error, setError] = useState('')

  const aBorrador = (d: any): Borrador => ({
    id: d.id,
    lender: d.lender,
    kind: d.kind,
    balance: String(Number(d.balance)),
    interest_rate: d.interest_rate === null ? '' : String(Number(d.interest_rate)),
    late_fee_risk: d.late_fee_risk,
    cuotas: cuotas.filter((q) => q.debt_id === d.id).map((q) => ({ due_date: q.due_date, amount: String(Number(q.amount)), status: q.status })),
  })

  return (
    <div className="space-y-3">
      {deudas.length > 0 && (
        <ul className="space-y-2">
          {deudas.map((d) => {
            const suyas = cuotas.filter((q) => q.debt_id === d.id && q.status === 'pendiente')
            return (
              <li key={d.id} className={`${tarjeta} p-3`}>
                {editando === d.id ? (
                  <Formulario inicial={aBorrador(d)} onListo={() => setEditando(null)} onCancelar={() => setEditando(null)} />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold break-words">{d.lender}</p>
                      <p className="text-sm text-[#0d2b0d]/70 tabular-nums">
                        {dinero(Number(d.balance))} · {suyas.length} {suyas.length === 1 ? 'cuota' : 'cuotas'}
                        {suyas[0] ? ` · próxima ${fechaCorta(suyas[0].due_date)}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" aria-label={`Editar ${d.lender}`} onClick={() => setEditando(d.id)} className={`${btnSecundario} px-3`}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setBorrando(d.id)} className={`${btnSecundario} px-3`}>Borrar</button>
                    </div>
                  </div>
                )}
                {borrando === d.id && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm">¿Borrar “{d.lender}” y sus cuotas?</span>
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() =>
                        start(async () => {
                          const r = await borrarFila('fin_debts', d.id)
                          if (!r.ok) setError(r.error)
                          setBorrando(null)
                        })
                      }
                      className={btnPeligro}
                    >
                      Sí, borrar
                    </button>
                    <button type="button" onClick={() => setBorrando(null)} className={btnSecundario}>Cancelar</button>
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
          <Formulario key={agregando.lender + agregando.kind} inicial={agregando} onListo={() => setAgregando(null)} onCancelar={() => setAgregando(null)} />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {PRESETS_DEUDA.map((p) => (
            <button key={p.label} type="button" onClick={() => setAgregando(vacio(p.valores))} className={btnSecundario}>
              <Plus className="w-4 h-4" /> {p.label}
            </button>
          ))}
          <button type="button" onClick={() => setAgregando(vacio({ kind: 'otro', late_fee_risk: false }))} className={btnSecundario}>
            <Plus className="w-4 h-4" /> Otra deuda
          </button>
        </div>
      )}
    </div>
  )
}
