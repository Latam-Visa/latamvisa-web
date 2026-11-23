import Link from 'next/link'
import { FlaskConical } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { TasksBoardClient } from './_components/TasksBoardClient'
import type { AdminTask, AnalisisEntry } from './_components/types'
import type { Reporte } from './lab/_components/types'

export const dynamic = 'force-dynamic'

export default async function AdminIdeasPage() {
  const { data, error } = await supabaseAdmin
    .from('admin_tasks')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    return <div className="p-8 text-center text-[#DC2626]">Error cargando el board de ideas.</div>
  }

  // Análisis del lab ya guardados para las tarjetas del board (si la tabla existe)
  const analyses: Record<string, AnalisisEntry> = {}
  try {
    const { data: rows } = await supabaseAdmin
      .from('ideas_lab')
      .select('resultado')
      .eq('resultado->>source', 'board')
    for (const row of (rows || []) as { resultado: any }[]) {
      const res = row.resultado
      if (!res?.taskId) continue
      if (res.aplica === false) {
        analyses[res.taskId] = { taskId: res.taskId, aplica: false, motivo: res.motivoNoAplica || 'No es una oferta a clientes.' }
      } else {
        const reporte = { ...res }
        delete reporte.source
        delete reporte.taskId
        analyses[res.taskId] = { taskId: res.taskId, aplica: true, reporte: reporte as Reporte }
      }
    }
  } catch {
    // tabla ausente: board sin análisis
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A]">Ideas &amp; Tareas</h2>
          <p className="text-sm text-[#6B6B6B]">Board interno para organizar ideas y próximos pasos de LATAM VISA</p>
        </div>
        <Link
          href="/admin/ideas/lab"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#C8FF00] px-4 py-2.5 text-sm font-bold text-[#2F4A00] transition-colors hover:bg-[#bdf000]"
        >
          <FlaskConical className="h-4 w-4" />
          Laboratorio de Ideas
        </Link>
      </div>

      <TasksBoardClient initialTasks={(data || []) as AdminTask[]} initialAnalyses={analyses} />
    </div>
  )
}
