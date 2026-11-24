import { supabaseAdmin } from '@/lib/supabase/admin'
import type { StaffingCandidate } from '@/lib/staffing'
import { CandidatesClient } from '../_components/CandidatesClient'
import { StaffingHeader } from '../_components/StaffingHeader'

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
    <div className="mx-auto w-full max-w-[1200px] space-y-14 pb-24">
      <StaffingHeader kicker="Reclutamiento" title="Candidatos" subtitle="Pipeline de reclutamiento, de aplicación a contratación." />

      <CandidatesClient candidates={candidates} />
    </div>
  )
}
