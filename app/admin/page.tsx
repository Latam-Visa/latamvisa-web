import { supabaseAdmin } from '@/lib/supabase/admin'
import { AdminHomeHub } from './_components/AdminHomeHub'

export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  const [usaRes, canRes, ukRes, schengenRes, ausRes, pendingIdeasRes, traduccionesRes] = await Promise.all([
    supabaseAdmin.from('visa_applications_usa').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('visa_applications_canada').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('visa_applications_uk').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('visa_applications_schengen').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('aplicaciones_turismo_australia').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('admin_tasks').select('id', { count: 'exact', head: true }).neq('status', 'hecho'),
    supabaseAdmin.from('lotes_traduccion').select('id', { count: 'exact', head: true }),
  ])

  const solicitudesCount = [usaRes, canRes, ukRes, schengenRes, ausRes].reduce((sum, r) => sum + (r.count || 0), 0)
  const ideasPendingCount = pendingIdeasRes.count || 0
  // Si la tabla todavía no existe (migración sin correr), la tarjeta se muestra
  // en cero en vez de tumbar el home entero.
  const traduccionesCount = traduccionesRes.count || 0

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#FAFAF7] via-[#FAFAF7] to-[#E9F7D9] pointer-events-none" />

      <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full pb-10">
        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-[PPMonumentExtended] text-[#0d2b0d]">Hola Latin@! 👋</h1>
        </div>

        <AdminHomeHub solicitudesCount={solicitudesCount} ideasPendingCount={ideasPendingCount} traduccionesCount={traduccionesCount} />
      </div>
    </div>
  )
}
