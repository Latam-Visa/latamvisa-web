import Link from 'next/link'
import { redirect } from 'next/navigation'
import { todayBrisbane } from '@/lib/deadlines/dates'
import { cargarDatos, estadoActual } from '@/lib/finanzas/datos'
import { salir } from '../actions'
import { BorrarTodo } from '../_components/BorrarTodo'
import { EditorDeudas } from '../_components/EditorDeudas'
import { EditorFilas } from '../_components/EditorFilas'
import {
  CAMPOS_CUENTA,
  CAMPOS_GASTO,
  CAMPOS_INGRESO,
  CAMPOS_META,
  PRESETS_GASTO,
  resumenCuenta,
  resumenGasto,
  resumenIngreso,
  resumenMeta,
} from '../_components/campos'
import { btnSecundario, foco, titulo } from '../_components/ui'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

function Seccion({ id, nombre, children }: { id: string; nombre: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-2">
      <h2 id={id} className={`${titulo} text-sm`}>{nombre}</h2>
      {children}
    </section>
  )
}

export default async function Ajustes() {
  const { supabase, user, perfil } = await estadoActual()
  if (!user) redirect('/finanzas')
  if (!perfil) redirect('/finanzas/empezar')
  const datos = await cargarDatos(supabase)
  const hoy = todayBrisbane()

  return (
    <div className="space-y-8">
      <div>
        <Link href="/finanzas/plan" className={`text-sm underline min-h-[44px] inline-flex items-center ${foco}`}>← Mi plan</Link>
        <h1 className={`${titulo} text-xl sm:text-2xl`}>Ajustes</h1>
        <p className="text-sm text-[#0d2b0d]/70">Entraste como {user.email}.</p>
      </div>
      <Seccion id="ingresos" nombre="Ingresos">
        <EditorFilas tabla="fin_income_sources" filas={datos.ingresos} campos={CAMPOS_INGRESO} resumen={resumenIngreso} defaults={{ type: 'empleo_tfn', tax_withheld: true }} textoAgregar="Agregar ingreso" />
      </Seccion>
      <Seccion id="gastos" nombre="Gastos y pagos">
        <EditorFilas tabla="fin_expenses" filas={datos.gastos} campos={CAMPOS_GASTO} resumen={resumenGasto} defaults={{ category: 'otro' }} presets={PRESETS_GASTO} textoAgregar="Otro gasto" />
      </Seccion>
      <Seccion id="deudas" nombre="Deudas">
        <EditorDeudas deudas={datos.deudas} cuotas={datos.cuotas} />
      </Seccion>
      <Seccion id="cuentas" nombre="Cuentas">
        <EditorFilas tabla="fin_accounts" filas={datos.cuentas} campos={CAMPOS_CUENTA} resumen={resumenCuenta} defaults={{ kind: 'personal', is_untouchable: false, as_of: hoy }} textoAgregar="Agregar cuenta" />
      </Seccion>
      <Seccion id="meta" nombre="Meta">
        <EditorFilas tabla="fin_goals" filas={datos.metas} campos={CAMPOS_META} resumen={resumenMeta} textoAgregar="Agregar meta" />
      </Seccion>
      <BorrarTodo />
      <form action={salir}>
        <button type="submit" className={btnSecundario}>Salir</button>
      </form>
    </div>
  )
}
