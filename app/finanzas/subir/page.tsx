import Link from 'next/link'
import { redirect } from 'next/navigation'
import { estadoActual } from '@/lib/finanzas/datos'
import { Subir } from '../_components/Subir'
import { foco, titulo } from '../_components/ui'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
// Leer un extracto en PDF puede tomar varios segundos.
export const maxDuration = 60

export default async function SubirPage({ searchParams }: { searchParams: { volver?: string } }) {
  const { supabase, user, perfil } = await estadoActual()
  if (!user) redirect('/finanzas')
  if (!perfil) redirect('/finanzas/empezar')

  const { data: pendientes } = await supabase
    .from('fin_uploads')
    .select('id, storage_path, status, extracted')
    .in('status', ['subido', 'extraido', 'manual'])
    .is('file_deleted_at', null)
    .order('created_at', { ascending: false })

  const volver = Number(searchParams.volver)
  const enlace = volver >= 1 && volver <= 7 ? `/finanzas/empezar?paso=${volver}` : '/finanzas/plan'

  return (
    <div className="space-y-5">
      <div>
        <Link href={enlace} className={`text-sm underline min-h-[44px] inline-flex items-center ${foco}`}>← Volver</Link>
        <h1 className={`${titulo} text-xl sm:text-2xl`}>Subir pantallazos</h1>
        <p className="text-[15px] text-[#0d2b0d]/80 mt-1">
          Saldos de tus cuentas, cuotas de Afterpay o StepPay, o el extracto del banco. Revisas lo que encontramos antes de que entre a tu plan.
        </p>
      </div>
      <Subir pendientes={(pendientes || []) as never} />
    </div>
  )
}
