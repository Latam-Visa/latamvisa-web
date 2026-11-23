import { FlaskConical } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { LabClient, LabHeaderBack } from './_components/LabClient'
import type { IdeaRow } from './_components/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // la simulación con Claude puede tardar ~40-55s (Vercel aplica el cap del plan)

export default async function LabIdeasPage() {
  // Historial (si la tabla existe). Si no, seguimos sin él.
  let rows: IdeaRow[] = []
  let tablaLista = false
  try {
    const { data, error } = await supabaseAdmin
      .from('ideas_lab')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error) {
      tablaLista = true
      rows = (data || []) as IdeaRow[]
    }
  } catch {
    // tabla ausente: historial deshabilitado
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-10">
      <LabHeaderBack />
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C8FF00]">
          <FlaskConical className="h-4 w-4 text-[#2F4A00]" />
        </div>
        <div>
          <h2 className="font-[PPMonumentExtended] text-[17px] font-bold text-[#0A0A0A]">Laboratorio de Ideas</h2>
          <p className="max-w-[60ch] text-[12px] leading-snug text-[#6B6B6B]">
            Pon a prueba una idea: la IA simula un panel de personas del público objetivo y predice quién lo haría,
            por qué, las objeciones y los mensajes que mejor convierten.
          </p>
        </div>
      </div>

      <LabClient initialRows={rows} tablaLista={tablaLista} />
    </div>
  )
}
