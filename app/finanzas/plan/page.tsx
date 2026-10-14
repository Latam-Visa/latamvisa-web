import Link from 'next/link'
import { redirect } from 'next/navigation'
import { todayBrisbane } from '@/lib/deadlines/dates'
import { aPlanInput, cargarDatos, estadoActual, hashEntradas } from '@/lib/finanzas/datos'
import { MOTOR_VERSION, buildCashflowPlan } from '@/lib/finanzas/plan'
import type { Narrativa } from '@/lib/finanzas/narrativa'
import { PlanVista } from '../_components/PlanVista'
import { btnPrimario, tarjeta, titulo } from '../_components/ui'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
// La narrativa (tu análisis) se pide desde esta página.
export const maxDuration = 60

const SEMANAS = 20

export default async function PlanPage() {
  const { supabase, user, perfil } = await estadoActual()
  if (!user) redirect('/finanzas')
  if (!perfil) redirect('/finanzas/empezar')

  const datos = await cargarDatos(supabase)
  if (!datos.ingresos.length && !datos.cuentas.length) {
    return (
      <div className={`${tarjeta} p-6 space-y-4`}>
        <h1 className={`${titulo} text-xl`}>Faltan datos</h1>
        <p className="text-[15px]">Para armar tu plan necesitamos al menos cuánto te entra y cuánto tienes hoy.</p>
        <Link href="/finanzas/empezar?paso=1" className={btnPrimario}>Completar mis datos</Link>
      </div>
    )
  }

  const hoy = todayBrisbane()
  const input = aPlanInput(datos)
  const plan = buildCashflowPlan(input, hoy, SEMANAS)
  const hash = hashEntradas(input, hoy, SEMANAS)

  // Caché por inputs_hash: mismos datos el mismo día = mismo plan y misma narrativa.
  await supabase
    .from('fin_plans')
    .upsert({ user_id: user.id, version: MOTOR_VERSION, inputs_hash: hash, plan }, { onConflict: 'user_id,inputs_hash', ignoreDuplicates: true })
  const { data: guardado } = await supabase.from('fin_plans').select('narrative').eq('inputs_hash', hash).maybeSingle()

  return <PlanVista plan={plan} hash={hash} narrativaInicial={(guardado?.narrative as Narrativa | null) ?? null} nombre={perfil.display_name} />
}
