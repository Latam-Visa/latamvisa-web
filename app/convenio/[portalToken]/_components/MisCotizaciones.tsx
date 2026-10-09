'use client'

import { estadoEfectivo, formatFecha, formatMoney, type Cotizacion } from '@/lib/cotizaciones'
import { AccionesCompartir, type EnviarEmail } from '@/components/cotizacion/AccionesCompartir'

export type FilaPortal = Pick<
  Cotizacion,
  | 'id'
  | 'numero'
  | 'token'
  | 'cliente_nombre'
  | 'personas'
  | 'monto'
  | 'moneda'
  | 'estado'
  | 'vence_el'
  | 'comision_total'
  | 'comision_pagada_el'
  | 'email_enviado_a'
  | 'created_at'
>

const ESTADOS = {
  pendiente: { label: 'Sin pagar', clase: 'bg-[#FFF7E0] text-[#7A4B00]' },
  pagada: { label: 'Pagada', clase: 'bg-[#C8FF00] text-[#0d2b0d]' },
  vencida: { label: 'Vencida', clase: 'bg-[#EFEFEA] text-[#0d2b0d]/70' },
  anulada: { label: 'Anulada', clase: 'bg-red-50 text-red-700' },
} as const

export function MisCotizaciones({ cotizaciones, enviarEmail }: { cotizaciones: FilaPortal[]; enviarEmail: EnviarEmail }) {
  const pagadas = cotizaciones.filter((c) => c.estado === 'pagada')
  const ganada = pagadas.reduce((s, c) => s + c.comision_total, 0)
  const porCobrar = pagadas.filter((c) => !c.comision_pagada_el).reduce((s, c) => s + c.comision_total, 0)

  return (
    <section aria-labelledby="mis" className="space-y-4">
      <h2 id="mis" className="font-monument text-sm uppercase tracking-wide">Mis cotizaciones</h2>

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-4">
          <dt className="text-xs uppercase tracking-wider text-[#0d2b0d]/60">Comisión ganada</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums">{formatMoney(ganada)}</dd>
          <dd className="text-xs text-[#0d2b0d]/60">{pagadas.length} {pagadas.length === 1 ? 'venta pagada' : 'ventas pagadas'}</dd>
        </div>
        <div className="rounded-2xl bg-[#0d2b0d] text-[#FAFAF7] p-4">
          <dt className="text-xs uppercase tracking-wider text-[#FAFAF7]/70">Pendiente de pago a ti</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums">{formatMoney(porCobrar)}</dd>
        </div>
      </dl>

      {cotizaciones.length === 0 ? (
        <p className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-6 text-center text-sm text-[#0d2b0d]/70">
          Aún no has generado cotizaciones.
        </p>
      ) : (
        <ul className="space-y-3">
          {cotizaciones.map((c) => {
            const estado = estadoEfectivo(c)
            return (
              <li key={c.id} className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-[#0d2b0d]/60">{c.numero} · {formatFecha(c.created_at)}</p>
                    <p className="font-bold break-words">{c.cliente_nombre || 'Sin nombre'}</p>
                    <p className="text-sm text-[#0d2b0d]/70">
                      {c.personas} {c.personas === 1 ? 'persona' : 'personas'} · {formatMoney(c.monto, c.moneda)}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${ESTADOS[estado].clase}`}>
                    {ESTADOS[estado].label}
                  </span>
                </div>
                <p className="text-sm">
                  Comisión: <span className="font-bold tabular-nums">{formatMoney(c.comision_total, c.moneda)}</span>
                  {estado === 'pagada' && (
                    <span className={`ml-2 text-xs font-semibold ${c.comision_pagada_el ? 'text-[#2F4A00]' : 'text-[#7A4B00]'}`}>
                      {c.comision_pagada_el ? `· Pagada el ${formatFecha(c.comision_pagada_el)}` : '· Por pagarte'}
                    </span>
                  )}
                </p>
                {estado !== 'anulada' && (
                  <AccionesCompartir cot={c} enviarEmail={enviarEmail} emailInicial={c.email_enviado_a ?? ''} compacto />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
