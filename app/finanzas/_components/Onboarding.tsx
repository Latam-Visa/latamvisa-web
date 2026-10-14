'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { todayBrisbane } from '@/lib/deadlines/dates'
import type { DatosUsuario } from '@/lib/finanzas/datos'
import { avanzarOnboarding } from '../actions'
import { EditorDeudas } from './EditorDeudas'
import { EditorFilas } from './EditorFilas'
import {
  CAMPOS_CUENTA,
  CAMPOS_GASTO,
  CAMPOS_INGRESO,
  CAMPOS_META,
  CAMPOS_PAGO_GRANDE,
  PRESETS_GASTO,
  PRESETS_PAGO_GRANDE,
  resumenCuenta,
  resumenGasto,
  resumenIngreso,
  resumenMeta,
} from './campos'
import { btnPrimario, btnSecundario, foco, titulo } from './ui'

const PASOS = [
  { titulo: '¿Cada cuánto te pagan?', ayuda: 'Cuánto es lo mínimo que te entra y si es por TFN o por ABN.' },
  { titulo: '¿Tienes negocio o ingresos aparte?', ayuda: 'Si su plata está en una cuenta que no quieres tocar, márcala como intocable.' },
  { titulo: 'Gastos fijos', ayuda: 'Arriendo, bills, comida, transporte, gym, celular, suscripciones. Cada uno con su frecuencia real.' },
  { titulo: 'Pagos grandes que vienen', ayuda: 'Estudio, impuestos, seguros: monto y fecha exacta.' },
  { titulo: 'Deudas', ayuda: 'Cada una con lo que debes y su calendario de cuotas.' },
  { titulo: 'Cuentas y saldos de hoy', ayuda: 'Lo que tienes hoy en cada cuenta.' },
  { titulo: 'Una meta (opcional)', ayuda: 'Algo para lo que quieras juntar plata.' },
]

export function Onboarding({ paso, datos }: { paso: number; datos: DatosUsuario }) {
  const router = useRouter()
  const [pendiente, start] = useTransition()
  const ir = (n: number, terminado = false) =>
    start(async () => {
      await avanzarOnboarding(n, terminado)
      router.push(terminado ? '/finanzas/plan' : `/finanzas/empezar?paso=${n}`)
    })

  const hoy = todayBrisbane()
  // Paso 1: el pago principal (TFN o ABN). Paso 2: el negocio.
  const principales = datos.ingresos.filter((i) => i.type !== 'negocio')
  const aparte = datos.ingresos.filter((i) => i.type === 'negocio')
  const grandes = datos.gastos.filter((g) => ['unico', 'trimestral', 'anual'].includes(g.frequency) && g.next_due)
  const fijos = datos.gastos.filter((g) => !grandes.includes(g))

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between text-xs text-[#0d2b0d]/70 mb-2 tabular-nums">
          <span>Paso {paso} de {PASOS.length}</span>
          <Link href="/finanzas/plan" className={`underline min-h-[44px] inline-flex items-center ${foco}`}>Ver mi plan</Link>
        </div>
        <div className="h-2 rounded-full bg-[#0d2b0d]/10 overflow-hidden" role="progressbar" aria-valuemin={1} aria-valuemax={PASOS.length} aria-valuenow={paso}>
          <div className="h-full bg-[#2F4A00] motion-safe:transition-[width]" style={{ width: `${(paso / PASOS.length) * 100}%` }} />
        </div>
      </div>

      <div>
        <h1 className={`${titulo} text-xl sm:text-2xl`}>{PASOS[paso - 1].titulo}</h1>
        <p className="text-[15px] text-[#0d2b0d]/80 mt-1">{PASOS[paso - 1].ayuda}</p>
      </div>

      {paso === 1 && (
        <EditorFilas tabla="fin_income_sources" filas={principales} campos={CAMPOS_INGRESO} resumen={resumenIngreso} defaults={{ name: 'Sueldo', type: 'empleo_tfn', tax_withheld: true }} textoAgregar="Otro ingreso" />
      )}
      {paso === 2 && (
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="font-semibold">Ingresos aparte</h2>
            <EditorFilas tabla="fin_income_sources" filas={aparte} campos={CAMPOS_INGRESO} resumen={resumenIngreso} defaults={{ name: 'Negocio', type: 'negocio', tax_withheld: false }} textoAgregar="Agregar ingreso aparte" />
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold">Cuenta que no quieres tocar</h2>
            <EditorFilas
              tabla="fin_accounts"
              filas={datos.cuentas.filter((c) => c.is_untouchable)}
              campos={CAMPOS_CUENTA}
              resumen={resumenCuenta}
              defaults={{ kind: 'negocio', is_untouchable: true, as_of: hoy }}
              textoAgregar="Agregar cuenta intocable"
            />
          </section>
        </div>
      )}
      {paso === 3 && (
        <EditorFilas tabla="fin_expenses" filas={fijos} campos={CAMPOS_GASTO} resumen={resumenGasto} defaults={{ category: 'otro' }} presets={PRESETS_GASTO} textoAgregar="Otro gasto" />
      )}
      {paso === 4 && (
        <EditorFilas tabla="fin_expenses" filas={grandes} campos={CAMPOS_PAGO_GRANDE} resumen={resumenGasto} defaults={{ category: 'otro' }} presets={PRESETS_PAGO_GRANDE} textoAgregar="Otro pago grande" />
      )}
      {paso === 5 && <EditorDeudas deudas={datos.deudas} cuotas={datos.cuotas} />}
      {paso === 6 && (
        <EditorFilas
          tabla="fin_accounts"
          filas={datos.cuentas.filter((c) => !c.is_untouchable)}
          campos={CAMPOS_CUENTA}
          resumen={resumenCuenta}
          defaults={{ kind: 'personal', is_untouchable: false, as_of: hoy }}
          textoAgregar="Agregar cuenta"
        />
      )}
      {paso === 7 && (
        <EditorFilas tabla="fin_goals" filas={datos.metas} campos={CAMPOS_META} resumen={resumenMeta} textoAgregar="Agregar meta" />
      )}

      <Link href={`/finanzas/subir?volver=${paso}`} className={`${btnSecundario} w-full`}>
        <Upload className="w-4 h-4" /> Sube un pantallazo o extracto
      </Link>

      <nav className="flex items-center justify-between gap-2 pt-2" aria-label="Pasos">
        <button type="button" disabled={pendiente || paso === 1} onClick={() => ir(paso - 1)} className={btnSecundario}>Atrás</button>
        <div className="flex gap-2">
          {paso < PASOS.length && (
            <button type="button" disabled={pendiente} onClick={() => ir(paso + 1)} className={btnSecundario}>Saltar</button>
          )}
          <button type="button" disabled={pendiente} onClick={() => (paso < PASOS.length ? ir(paso + 1) : ir(PASOS.length, true))} className={btnPrimario}>
            {paso < PASOS.length ? 'Siguiente' : 'Ver mi plan'}
          </button>
        </div>
      </nav>
    </div>
  )
}
