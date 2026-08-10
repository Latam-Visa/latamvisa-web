import { supabaseAdmin } from '@/lib/supabase/admin'
import { TasksBoardClient } from './_components/TasksBoardClient'
import type { AdminTask } from './_components/types'

export const dynamic = 'force-dynamic'

export default async function AdminIdeasPage() {
  const { data, error } = await supabaseAdmin
    .from('admin_tasks')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    return <div className="p-8 text-center text-[#DC2626]">Error cargando el board de ideas.</div>
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A]">Ideas &amp; Tareas</h2>
        <p className="text-sm text-[#6B6B6B]">Board interno para organizar ideas y próximos pasos de LATAM VISA</p>
      </div>

      <TasksBoardClient initialTasks={(data || []) as AdminTask[]} />
    </div>
  )
}
