import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { StaffingCandidate } from '@/lib/staffing'
import { CandidatesClient } from '../_components/CandidatesClient'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function CandidatesPage() {
  const { data } = await supabaseAdmin
    .from('staffing_candidates')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(500)

  const candidates = (data || []) as StaffingCandidate[]

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 pb-12">
      <div className="flex items-start gap-4">
        <Link href="/admin/staffing" aria-label="Volver al calendario" className="flex shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white p-2 text-[#0A0A0A] transition-colors hover:border-[#0A0A0A]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="font-[PPMonumentExtended] text-2xl font-bold text-[#0d2b0d]">Candidatos</h2>
          <p className="text-sm text-[#6B6B6B]">Pipeline de reclutamiento</p>
        </div>
      </div>

      <CandidatesClient candidates={candidates} />
    </div>
  )
}
