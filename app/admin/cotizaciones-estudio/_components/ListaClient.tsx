"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, GraduationCap } from 'lucide-react'
import { EstadoBadgeEstudio } from './EstadoBadgeEstudio'
import { fmtAUD, ESTADOS_ESTUDIO, type CotizacionEstudio, type EstadoEstudio } from '@/lib/cotizaciones-estudio'

type Fila = Pick<CotizacionEstudio, 'id' | 'nombre' | 'colegio' | 'colegio_nombre_completo' | 'curso' | 'tipo' | 'estado' | 'total' | 'created_at'>

export function ListaClient({ filas, colegios }: { filas: Fila[]; colegios: string[] }) {
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState<'todas' | EstadoEstudio>('todas')
  const [colegio, setColegio] = useState<'todos' | string>('todos')

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase()
    return filas.filter((f) => {
      if (estado !== 'todas' && f.estado !== estado) return false
      if (colegio !== 'todos' && (f.colegio || '') !== colegio) return false
      if (term && !(f.nombre || '').toLowerCase().includes(term)) return false
      return true
    })
  }, [filas, q, estado, colegio])

  return (
    <div className="space-y-5">
      {/* Controles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-lg border border-[#E5E5E5] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#2F4A00] focus:outline-none"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as 'todas' | EstadoEstudio)}
          className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#2F4A00] focus:outline-none"
        >
          <option value="todas">Todos los estados</option>
          {ESTADOS_ESTUDIO.map((e) => (
            <option key={e} value={e}>{e[0].toUpperCase() + e.slice(1)}</option>
          ))}
        </select>
        <select
          value={colegio}
          onChange={(e) => setColegio(e.target.value)}
          className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm text-[#0A0A0A] focus:border-[#2F4A00] focus:outline-none"
        >
          <option value="todos">Todos los colegios</option>
          {colegios.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E5E5] bg-white p-10 text-center">
          <GraduationCap className="mx-auto mb-3 h-8 w-8 text-[#C4C4C4]" />
          <p className="text-sm text-[#6B6B6B]">No hay cotizaciones que coincidan.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtradas.map((f) => (
            <li key={f.id}>
              <Link
                href={`/admin/cotizaciones-estudio/${f.id}`}
                className="flex items-center gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#D9EFB0] sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F2FBDD] to-[#E4F5C6]">
                  <GraduationCap className="h-5 w-5 text-[#2F4A00]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-[#0A0A0A]">{f.nombre || 'Sin nombre'}</p>
                    <EstadoBadgeEstudio estado={f.estado} />
                  </div>
                  <p className="truncate text-xs text-[#6B6B6B]">
                    {[f.colegio, f.curso, f.tipo].filter(Boolean).join(' · ') || 'Sin curso'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-[PPMonumentExtended] text-sm text-[#0d2b0d]">{fmtAUD(f.total)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
