import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esFecha, formatEs, startOfWeek, todayBrisbane, diasDeLaSemana, type Fecha } from '@/lib/deadlines/dates'
import { adminAutenticado, deadlinesDesbloqueado } from '@/lib/deadlines/unlock'
import { PlannerClient, type Semana } from './_components/PlannerClient'
import { UnlockScreen } from './_components/UnlockScreen'
import type { Tarea } from './_components/ui'

// Igual que /admin/traducciones: sin esto supabase-js puede servir datos
// cacheados y una tarea recién marcada aparecería sin marcar al recargar.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = { title: 'Deadlines | Admin', robots: { index: false, follow: false } }

export default async function DeadlinesPage({ searchParams }: { searchParams: { week?: string } }) {
  // Candado 1: el admin normal (también lo exige middleware.ts).
  if (!adminAutenticado()) redirect('/admin/login')
  // Candado 2: sin la cookie de desbloqueo se muestra solo el formulario.
  if (!deadlinesDesbloqueado()) return <UnlockScreen />

  const hoy = todayBrisbane()
  const lunes: Fecha = esFecha(searchParams.week) ? startOfWeek(searchParams.week) : startOfWeek(hoy)
  const dias = diasDeLaSemana(lunes)
  const fechasHabitos = Array.from(new Set([...dias, hoy]))

  const [{ data: semanasDb, error: e1 }, { data: tareasDb, error: e2 }, { data: logs, error: e3 }] = await Promise.all([
    supabaseAdmin.from('admin_weeks').select('week_number, start_date, focus').order('week_number'),
    supabaseAdmin
      .from('admin_deadlines')
      .select('id, due_date, slot, category, title, notes, done')
      .order('due_date')
      .order('created_at'),
    supabaseAdmin.from('admin_habit_logs').select('log_date, habit').in('log_date', fechasHabitos),
  ])

  if (e1 || e2 || e3) {
    console.error('[DEADLINES] Error cargando datos:', e1 || e2 || e3)
    return (
      <div className="max-w-[720px] mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        No pudimos cargar el planner. Recarga la página en un momento.
      </div>
    )
  }

  const tareas = (tareasDb || []) as Tarea[]

  // Chips: S1…S12 + cualquier semana con tareas fuera de esas 12 + la elegida.
  const porLunes = new Map<Fecha, Semana>()
  for (const s of semanasDb || []) porLunes.set(s.start_date, { lunes: s.start_date, etiqueta: `S${s.week_number}`, focus: s.focus })
  for (const t of tareas) {
    const l = startOfWeek(t.due_date)
    if (!porLunes.has(l)) porLunes.set(l, { lunes: l, etiqueta: formatEs(l), focus: null })
  }
  if (!porLunes.has(lunes)) porLunes.set(lunes, { lunes, etiqueta: formatEs(lunes), focus: null })
  const semanas = Array.from(porLunes.values()).sort((a, b) => a.lunes.localeCompare(b.lunes))

  return (
    <PlannerClient
      hoy={hoy}
      lunes={lunes}
      semanas={semanas}
      tareas={tareas}
      habitos={(logs || []).map((l) => `${l.log_date}|${l.habit}`)}
    />
  )
}
