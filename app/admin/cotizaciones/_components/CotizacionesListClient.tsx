"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, FileText, Wallet } from 'lucide-react'
import {
  estadoEfectivo,
  formatFecha,
  formatMoney,
  labelPaisCotizacion,
  type Cotizacion,
  type EstadoCotizacion,
} from '@/lib/cotizaciones'
import { EstadoBadge } from './EstadoBadge'

export interface ResumenConvenio {
  convenio_id: string
  nombre: string
  pagadas: number
  comision_total: number
  comision_pendiente: number
}

const DIRECTO = '__directo__'

const ESTADOS: { value: EstadoCotizacion | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'pagada', label: 'Pagadas' },
  { value: 'vencida', label: 'Vencidas' },
  { value: 'anulada', label: 'Anuladas' },
]

const selectClase =
  'w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-3 text-sm text-[#0A0A0A] min-h-[44px] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]'

export function CotizacionesListClient({
  cotizaciones,
  convenios,
  resumen,
}: {
  cotizaciones: Cotizacion[]
  convenios: { id: string; nombre: string }[]
  resumen: ResumenConvenio[]
}) {
  const [query, setQuery] = useState('')
  const [convenio, setConvenio] = useState('')
  const [estado, setEstado] = useState<EstadoCotizacion | ''>('')

  const nombreConvenio = useMemo(() => new Map(convenios.map((c) => [c.id, c.nombre])), [convenios])

  const filas = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cotizaciones
      .map((c) => ({ ...c, efectivo: estadoEfectivo(c) }))
      .filter((c) => {
        if (convenio === DIRECTO && c.convenio_id) return false
        if (convenio && convenio !== DIRECTO && c.convenio_id !== convenio) return false
        if (estado && c.efectivo !== estado) return false
        if (q && !c.cliente_nombre.toLowerCase().includes(q) && !c.numero.toLowerCase().includes(q)) return false
        return true
      })
  }, [cotizaciones, query, convenio, estado])

  return (
    <div className="space-y-6">
      {resumen.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resumen.map((r) => (
            <div key={r.convenio_id} className="bg-white rounded-2xl border border-[#E5E5E5] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-[#2F4A00]" />
                <h3 className="text-sm font-bold text-[#0A0A0A]">{r.nombre}</h3>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-[#6B6B6B]">Pagadas</dt>
                  <dd className="text-base font-bold text-[#0A0A0A]">{r.pagadas}</dd>
                </div>
                <div>
                  <dt className="text-[#6B6B6B]">Comisión</dt>
                  <dd className="text-sm font-bold text-[#0A0A0A]">{formatMoney(r.comision_total)}</dd>
                </div>
                <div>
                  <dt className="text-[#6B6B6B]">Por pagar</dt>
                  <dd className={`text-sm font-bold ${r.comision_pendiente > 0 ? 'text-[#B45309]' : 'text-[#2F4A00]'}`}>
                    {formatMoney(r.comision_pendiente)}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px_200px] gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente o número..."
            aria-label="Buscar por cliente o número"
            className="w-full bg-white border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
          />
        </div>
        <select value={convenio} onChange={(e) => setConvenio(e.target.value)} aria-label="Filtrar por convenio" className={selectClase}>
          <option value="">Todos los convenios</option>
          <option value={DIRECTO}>Directo</option>
          {convenios.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoCotizacion | '')} aria-label="Filtrar por estado" className={selectClase}>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {cotizaciones.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F2FBDD] to-[#E4F5C6] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-[#2F4A00]" />
          </div>
          <h3 className="text-base font-bold text-[#0A0A0A] mb-1">Todavía no hay cotizaciones</h3>
          <p className="text-sm text-[#6B6B6B]">Crea la primera y comparte el link de pago con el cliente.</p>
        </div>
      ) : filas.length === 0 ? (
        <div className="p-8 text-center text-sm text-[#6B6B6B] bg-white border border-[#E5E5E5] rounded-xl">
          Ninguna cotización coincide con los filtros.
        </div>
      ) : (
        <>
          {/* Móvil: tarjetas */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filas.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cotizaciones/${c.id}`}
                className="block bg-white rounded-xl border border-[#E5E5E5] p-4 active:bg-[#FAFAF7]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-[#6B6B6B]">{c.numero}</p>
                    <p className="text-sm font-bold text-[#0A0A0A] break-words">{c.cliente_nombre}</p>
                  </div>
                  <EstadoBadge estado={c.efectivo} />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3 text-xs text-[#6B6B6B]">
                  <div className="space-y-0.5">
                    <p>
                      {(c.convenio_id && nombreConvenio.get(c.convenio_id)) || 'Directo'} · {labelPaisCotizacion(c.pais_destino)} ·{' '}
                      {c.personas} pers.
                    </p>
                    <p>Vence {formatFecha(c.vence_el)}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0A0A0A] tabular-nums">{formatMoney(c.monto, c.moneda)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Escritorio: tabla */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E5E5E5] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6B6B6B] border-b border-[#E5E5E5]">
                  <th className="px-4 py-3 font-semibold">Número</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Convenio</th>
                  <th className="px-4 py-3 font-semibold">País</th>
                  <th className="px-4 py-3 font-semibold text-right">Pers.</th>
                  <th className="px-4 py-3 font-semibold text-right">Monto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Vence</th>
                  <th className="px-4 py-3 font-semibold">Creada</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((c) => (
                  <tr key={c.id} className="border-b border-[#F0F0EC] last:border-0 hover:bg-[#FAFAF7] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/admin/cotizaciones/${c.id}`} className="font-bold text-[#0A0A0A] hover:underline">
                        {c.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0A0A0A]">
                      <Link href={`/admin/cotizaciones/${c.id}`} className="hover:underline">{c.cliente_nombre}</Link>
                    </td>
                    <td className="px-4 py-3 text-[#525252]">{(c.convenio_id && nombreConvenio.get(c.convenio_id)) || 'Directo'}</td>
                    <td className="px-4 py-3 text-[#525252]">{labelPaisCotizacion(c.pais_destino)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.personas}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap">{formatMoney(c.monto, c.moneda)}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={c.efectivo} /></td>
                    <td className={`px-4 py-3 whitespace-nowrap ${c.efectivo === 'vencida' ? 'text-[#B91C1C]' : 'text-[#525252]'}`}>
                      {formatFecha(c.vence_el)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#525252]">{formatFecha(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
