import { cargarActividades, cargarProspectos } from '@/lib/sales/datos'
import { startOfWeek, todayBrisbane } from '@/lib/deadlines/dates'
import { SalesClient } from './_components/SalesClient'
import { SalesHeader } from './_components/SalesHeader'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function SalesPage() {
  const datos = await Promise.all([cargarProspectos(), cargarActividades()]).catch((e) => {
    console.error('[SALES] load:', e)
    return null
  })
  if (!datos) {
    return (
      <div className="mx-auto w-full max-w-[1200px] rounded-xl border border-red-200 bg-[#FEF2F2] p-6 text-sm text-red-700">
        Could not load Sales. Check the sales_* tables in Supabase.
      </div>
    )
  }
  const [prospects, activities] = datos
  const hoy = todayBrisbane()
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 pb-24">
      <SalesHeader active="pipeline" />
      <SalesClient prospects={prospects} activities={activities} today={hoy} weekStart={startOfWeek(hoy)} />
    </div>
  )
}
