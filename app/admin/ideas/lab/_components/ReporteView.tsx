"use client"

import { Users, Quote, AlertTriangle } from 'lucide-react'
import type { Reporte, Voto, Nivel } from './types'

export const votoChip: Record<Voto, string> = {
  'sí': 'bg-[#DCFCE7] text-[#166534]',
  'quizás': 'bg-[#FEF3C7] text-[#92400E]',
  'no': 'bg-[#FEE2E2] text-[#991B1B]',
}
const nivelDot: Record<Nivel, string> = { alto: 'bg-[#22C55E]', medio: 'bg-[#F59E0B]', bajo: 'bg-[#D4D4CE]' }
const nivelTxt: Record<Nivel, string> = { alto: 'text-[#166534]', medio: 'text-[#92400E]', bajo: 'text-[#8A8A82]' }

// Micro-encabezado de sección (minimalista)
function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A9A94]">{children}</span>
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="text-[13px] font-semibold text-[#0A0A0A]">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFEFEA]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export function ReporteView({ r }: { r: Reporte }) {
  const confColor =
    r.confianza === 'alta' ? 'text-[#166534]' : r.confianza === 'media' ? 'text-[#92400E]' : 'text-[#8A8A82]'
  return (
    <div className="space-y-4">
      {/* Veredicto — tarjeta liviana con acento, ya no el bloque negro */}
      <div className="rounded-xl border border-[#E8E8E3] bg-white p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2F4A00]" />
          <Label>Veredicto</Label>
          <span className={`text-[10px] font-semibold ${confColor}`}>· confianza {r.confianza}</span>
        </div>
        <p className="text-[14px] font-semibold leading-snug text-[#0A0A0A]">{r.veredicto}</p>
        <p className="mt-1.5 max-w-[72ch] text-[12.5px] leading-relaxed text-[#6B6B6B]">{r.resumen}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[#F0F0EC] bg-[#FBFBF8] p-3"><Meter label="Lo consideraría" value={r.adopcionPct} color="#8FC400" /></div>
          <div className="rounded-lg border border-[#F0F0EC] bg-[#FBFBF8] p-3"><Meter label="Convertiría" value={r.conversionPct} color="#1C7AE5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Segmentos */}
        <div className="rounded-xl border border-[#E8E8E3] bg-white p-4">
          <div className="mb-2.5"><Label>Segmentos</Label></div>
          <ul className="space-y-2.5">
            {r.segmentos.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${nivelDot[s.interes]}`} />
                <div>
                  <p className="text-[12.5px] font-semibold text-[#0A0A0A]">{s.nombre} <span className={`text-[10px] font-semibold uppercase ${nivelTxt[s.interes]}`}>· {s.interes}</span></p>
                  <p className="text-[11.5px] leading-snug text-[#6B6B6B]">{s.nota}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Objeciones + precio */}
        <div className="rounded-xl border border-[#E8E8E3] bg-white p-4">
          <div className="mb-2.5"><Label>Objeciones a resolver</Label></div>
          <ul className="space-y-1.5">
            {r.objeciones.map((o, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] leading-snug text-[#374151]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#DC2626]" />{o}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-lg border border-[#F0F0EC] bg-[#FBFBF8] p-2.5">
            <Label>Sensibilidad al precio</Label>
            <p className="mt-1 text-[11.5px] leading-snug text-[#374151]">{r.sensibilidadPrecio}</p>
          </div>
        </div>
      </div>

      {/* Mensajes ganadores */}
      <div className="rounded-xl border border-[#E8E8E3] bg-white p-4">
        <div className="mb-2.5"><Label>Mensajes que mejor convierten</Label></div>
        <ul className="space-y-2">
          {r.mensajes.map((m, i) => (
            <li key={i} className="flex gap-2 rounded-lg border border-[#EFEFEA] bg-[#FCFDF7] p-2.5">
              <Quote className="h-3.5 w-3.5 shrink-0 text-[#2F4A00]" />
              <span className="text-[12px] leading-snug text-[#0A0A0A]">{m}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Panel de personas */}
      <div>
        <div className="mb-2.5 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#9A9A94]" />
          <Label>El panel · {r.personas.length} personas</Label>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {r.personas.map((p, i) => (
            <div key={i} className="rounded-xl border border-[#E8E8E3] bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#0A0A0A]">{p.nombre}</p>
                  <p className="text-[10px] leading-snug text-[#9A9A94]">{p.perfil}</p>
                </div>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize ${votoChip[p.voto]}`}>{p.voto}</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-snug text-[#374151]">{p.razon}</p>
              {p.objecion && <p className="mt-1.5 text-[11px] leading-snug text-[#991B1B]"><b>Pero:</b> {p.objecion}</p>}
              {p.queLoConvenceria && <p className="mt-1 text-[11px] leading-snug text-[#166534]"><b>Lo convencería:</b> {p.queLoConvenceria}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Riesgos */}
      {r.riesgos?.length > 0 && (
        <div className="rounded-xl border border-[#F0E8C8] bg-[#FDFBF0] p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-[#B08A0A]" />
            <Label>Riesgos / supuestos</Label>
          </div>
          <ul className="space-y-1">
            {r.riesgos.map((x, i) => (
              <li key={i} className="text-[11.5px] leading-snug text-[#7A5B06]">• {x}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-center text-[10px] text-[#B6B6AE]">Simulación ilustrativa generada por IA · no sustituye investigación de mercado real</p>
    </div>
  )
}
