import { addDays, type Fecha } from '@/lib/deadlines/dates'
import {
  SEGMENTS, SEGMENT_LABEL, aud, diaBrisbane, distintos, stageDe, valorAbierto,
  type Activity, type Prospect,
} from './index'

// "28 Nov"
export const fechaEn = (f: Fecha) =>
  new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${f}T00:00:00Z`))

export function weeklyReport(prospects: Prospect[], activities: Activity[], lunes: Fecha) {
  const domingo = addDays(lunes, 6)
  const enSemana = (ts: string) => { const d = diaBrisbane(ts); return d >= lunes && d <= domingo }
  const semana = activities.filter((a) => enSemana(a.happened_at))

  const medir = (ps: Prospect[]) => {
    const ids = new Set(ps.map((p) => p.id))
    const acts = semana.filter((a) => ids.has(a.prospect_id))
    const tipo = (t: Activity['type']) => acts.filter((a) => a.type === t).length
    return {
      nuevos: ps.filter((p) => enSemana(p.created_at)).length,
      emails: tipo('email'),
      followUps: tipo('follow_up'),
      visitas: tipo('visit'),
      replies: distintos(acts.filter((a) => stageDe(a) === 'replied')),
      meetings: distintos(acts.filter((a) => a.type === 'meeting' || stageDe(a) === 'meeting')),
      quotes: distintos(acts.filter((a) => a.type === 'quote' || stageDe(a) === 'quoted')),
      won: distintos(acts.filter((a) => stageDe(a) === 'won')),
      valor: valorAbierto(ps),
    }
  }

  const grupos = [...SEGMENTS.map((s) => medir(prospects.filter((p) => p.segment === s))), medir(prospects)]
  const total = grupos[SEGMENTS.length]
  const filas: { label: string; key: keyof typeof total; money?: boolean }[] = [
    { label: 'New prospects', key: 'nuevos' }, { label: 'Emails sent', key: 'emails' },
    { label: 'Follow-ups', key: 'followUps' }, { label: 'Visits', key: 'visitas' },
    { label: 'Replies', key: 'replies' }, { label: 'Meetings', key: 'meetings' },
    { label: 'Quotes', key: 'quotes' }, { label: 'Won', key: 'won' },
    { label: 'Pipeline value (open, today)', key: 'valor', money: true },
  ]

  const n = (v: number, uno: string, varios = `${uno}s`) => `${v} ${v === 1 ? uno : varios}`
  const porSegmento = SEGMENTS.map((s, i) => {
    const g = grupos[i]
    return `- ${SEGMENT_LABEL[s]}: ${n(g.emails, 'email')}, ${n(g.followUps, 'follow-up')}, ${n(g.visitas, 'visit')}, ${n(g.replies, 'reply', 'replies')}, ${n(g.meetings, 'meeting')}, ${n(g.quotes, 'quote')}, ${g.won} won. Open pipeline: ${aud(g.valor)}.`
  })
  const text = [
    `Hi Max, here's the sales update for ${fechaEn(lunes)} to ${fechaEn(domingo)}.`,
    '',
    `We added ${n(total.nuevos, 'new prospect')}, sent ${n(total.emails, 'email')} and ${n(total.followUps, 'follow-up')}, and made ${n(total.visitas, 'visit')}. We got ${n(total.replies, 'reply', 'replies')}, ${n(total.meetings, 'meeting')}, ${n(total.quotes, 'quote')} and ${n(total.won, 'win')}. Open pipeline today: ${aud(total.valor)}.`,
    '',
    ...porSegmento,
  ].join('\n')

  return {
    columns: [...SEGMENTS.map((s) => SEGMENT_LABEL[s]), 'Total'],
    rows: filas.map((f) => ({ label: f.label, money: f.money, values: grupos.map((g) => g[f.key]) })),
    text,
  }
}
