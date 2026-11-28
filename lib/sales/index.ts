import { addDays, todayBrisbane, type Fecha } from '@/lib/deadlines/dates'

export const SEGMENTS = ['luxury_retail', 'office_cleaning', 'construction_cleaning'] as const
export type Segment = (typeof SEGMENTS)[number]
export const SEGMENT_LABEL: Record<Segment, string> = {
  luxury_retail: 'Luxury retail',
  office_cleaning: 'Office cleaning',
  construction_cleaning: 'Construction cleaning',
}

export const STAGES = ['new', 'contacted', 'replied', 'meeting', 'quoted', 'won', 'lost', 'do_not_contact'] as const
export type Stage = (typeof STAGES)[number]
export const PIPELINE_STAGES = STAGES.filter((s) => s !== 'do_not_contact')
export const STAGE_LABEL: Record<Stage, string> = {
  new: 'New', contacted: 'Contacted', replied: 'Replied', meeting: 'Meeting',
  quoted: 'Quoted', won: 'Won', lost: 'Lost', do_not_contact: 'Do not contact',
}

export const EMAIL_STATUSES = ['verified', 'unverified', 'pending', 'not_found'] as const
export type EmailStatus = (typeof EMAIL_STATUSES)[number]
export const EMAIL_BADGE: Record<EmailStatus, { label: string; cls: string }> = {
  verified: { label: 'Verified', cls: 'bg-[#DCFCE7] text-[#166534]' },
  unverified: { label: 'Unverified', cls: 'bg-[#FEF3C7] text-[#92400E]' },
  pending: { label: 'Pending', cls: 'bg-[#F0F0EC] text-[#55554F]' },
  not_found: { label: 'Not found', cls: 'bg-[#FEE2E2] text-[#991B1B]' },
}

export const PRIORITY_DOT: Record<number, string> = { 1: 'bg-red-500', 2: 'bg-amber-400', 3: 'bg-gray-300' }

export const ACTIVITY_TYPES = ['email', 'follow_up', 'visit', 'call', 'meeting', 'quote', 'note'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export interface Prospect {
  id: string
  full_name: string
  job_title: string | null
  company: string | null
  email: string | null
  email_status: EmailStatus
  segment: Segment
  city: string | null
  source: string | null
  stage: Stage
  priority: number
  next_step: string | null
  next_step_date: string | null
  estimated_value: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  prospect_id: string
  type: ActivityType
  summary: string | null
  happened_at: string
}

// Las tablas no guardan historial de etapas: cada cambio se anota como una
// actividad `note` con este formato, y de ahí salen las fechas del reporte.
export const stageNote = (de: Stage, a: Stage) => `Stage: ${de} -> ${a}`
export const stageDe = (a: Activity): Stage | null => {
  const m = a.type === 'note' ? /^Stage: \w+ -> (\w+)$/.exec(a.summary || '') : null
  return m ? (m[1] as Stage) : null
}

export const diaBrisbane = (ts: string): Fecha => todayBrisbane(new Date(ts))

const CONTACTO: ActivityType[] = ['email', 'follow_up', 'call', 'visit']
export const esContacto = (a: Activity) => CONTACTO.includes(a.type) || stageDe(a) === 'contacted'

export const distintos = (acts: Activity[]) => new Set(acts.map((a) => a.prospect_id)).size

// Contactado hace 4+ días, sin respuesta (sigue en `contacted`) y sin actividad posterior.
export function followUpsDue(prospects: Prospect[], activities: Activity[], hoy: Fecha): Prospect[] {
  const ultima: Record<string, string> = {}
  for (const a of activities) {
    if (!ultima[a.prospect_id] || Date.parse(a.happened_at) > Date.parse(ultima[a.prospect_id])) ultima[a.prospect_id] = a.happened_at
  }
  const limite = addDays(hoy, -4)
  return prospects.filter((p) => p.stage === 'contacted' && diaBrisbane(ultima[p.id] || p.updated_at) <= limite)
}

export const valorAbierto = (ps: Prospect[]) =>
  ps.filter((p) => !['won', 'lost', 'do_not_contact'].includes(p.stage)).reduce((s, p) => s + Number(p.estimated_value || 0), 0)

export const aud = (n: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n)
