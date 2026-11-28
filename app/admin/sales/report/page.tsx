import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, esFecha, startOfWeek, todayBrisbane } from '@/lib/deadlines/dates'
import { SEGMENTS, aud } from '@/lib/sales'
import { cargarActividades, cargarProspectos } from '@/lib/sales/datos'
import { fechaEn, weeklyReport } from '@/lib/sales/report'
import { SalesHeader } from '../_components/SalesHeader'
import { CopyText } from './CopyText'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function SalesReportPage({ searchParams }: { searchParams: { week?: string } }) {
  const lunes = startOfWeek(esFecha(searchParams.week) ? searchParams.week : todayBrisbane())
  const [prospects, activities] = await Promise.all([cargarProspectos(), cargarActividades()])
  const { columns, rows, text } = weeklyReport(prospects, activities, lunes)
  const nav = 'flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E8E3] bg-white hover:bg-[#F2FBDD]'

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5 pb-24">
      <SalesHeader active="report" />
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/sales/report?week=${addDays(lunes, -7)}`} aria-label="Previous week" className={nav}><ChevronLeft className="h-4 w-4" /></Link>
        <Link href={`/admin/sales/report?week=${addDays(lunes, 7)}`} aria-label="Next week" className={nav}><ChevronRight className="h-4 w-4" /></Link>
        <p className="text-sm font-bold text-[#0d2b0d]">{fechaEn(lunes)} – {fechaEn(addDays(lunes, 6))} {lunes.slice(0, 4)}</p>
        <form className="flex gap-2">
          <input type="date" name="week" defaultValue={lunes} aria-label="Pick a week" className="rounded-lg border border-[#E8E8E3] bg-white px-2 py-1.5 text-xs" />
          <button className="rounded-lg border border-[#E8E8E3] bg-white px-3 py-1.5 text-xs font-bold">Go</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E8E8E3] bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-[#FBFBF8] text-left text-xs text-[#6B6B6B]">
            <tr><th className="p-3">Metric</th>{columns.map((c) => <th key={c} className="p-3 text-right">{c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2EC]">
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="p-3 font-medium text-[#0d2b0d]">{r.label}</td>
                {r.values.map((v, i) => <td key={i} className={`p-3 text-right ${i === SEGMENTS.length ? 'font-bold' : ''}`}>{r.money ? aud(v) : v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#6B6B6B]">Pipeline value is the open value as of today, not as of the selected week. Replies, meetings, quotes and wins count each prospect once.</p>

      <CopyText text={text} />
    </div>
  )
}
