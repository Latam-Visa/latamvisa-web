"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Languages, AlertCircle } from 'lucide-react'
import { labelPais } from '@/lib/traducciones/shared'

export interface LoteResumen {
  id: string
  nombre_cliente: string
  pais: string | null
  created_at: string
  traducidos: number
  originales: number
  conError: number
  // Cargados sin enviar a traducir.
  pendientes: number
}

export function TraduccionesListClient({ lotes }: { lotes: LoteResumen[] }) {
  const [query, setQuery] = useState('')

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lotes
    return lotes.filter((l) => l.nombre_cliente.toLowerCase().includes(q))
  }, [lotes, query])

  if (lotes.length === 0) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Languages className="w-4 h-4 text-[#2F4A00] shrink-0" />
        <p className="text-[13px] text-[#525252] flex-1 min-w-0">
          Todavía no hay traducciones. Crea la primera para traducir documentos que te llegan por Gmail o WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-[360px]">
        <Search className="w-3.5 h-3.5 text-[#A3A3A3] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre del cliente..."
          aria-label="Buscar por nombre del cliente"
          className="w-full h-8 bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 text-[13px] text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="py-2 text-[13px] text-[#6B6B6B]">Ningún cliente coincide con “{query.trim()}”.</p>
      ) : (
        <ul className="bg-white border border-[#E5E5E5] rounded-xl px-2 py-1 divide-y divide-[#F0F0F0]">
          {filtrados.map((lote) => {
            const total = lote.traducidos + lote.originales + lote.conError
            return (
              <li key={lote.id}>
                <Link
                  href={`/admin/traducciones/${lote.id}`}
                  className="h-10 px-2 flex items-center gap-2 text-[13px] rounded-md hover:bg-[#F5F5F0] transition-colors"
                >
                  <span className="min-w-0 truncate font-semibold text-[#0A0A0A]" title={lote.nombre_cliente}>
                    {lote.nombre_cliente}
                  </span>
                  {lote.pais && (
                    <span className="shrink-0 font-bold text-[10px] uppercase tracking-wider bg-[#F5F5F0] text-[#0A0A0A] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                      {labelPais(lote.pais)}
                    </span>
                  )}
                  <span className="hidden sm:inline shrink-0 text-[12px] text-[#6B6B6B]">
                    · {format(new Date(lote.created_at), 'd MMM yyyy', { locale: es })}
                  </span>
                  <span className="ml-auto shrink-0 flex items-center gap-2 text-[12px] text-[#525252]">
                    {total === 0 ? (
                      <span className="text-[#6B6B6B]">Procesando…</span>
                    ) : (
                      <span>
                        {lote.traducidos}<span className="hidden sm:inline"> {lote.traducidos === 1 ? 'traducido' : 'traducidos'}</span>
                        <span className="sm:hidden"> trad.</span>
                        {' · '}
                        {lote.originales}<span className="hidden sm:inline"> {lote.originales === 1 ? 'original' : 'originales'}</span>
                        <span className="sm:hidden"> orig.</span>
                      </span>
                    )}
                    {lote.pendientes > 0 && (
                      <span
                        className="inline-flex items-center gap-1 font-medium text-[#92400E]"
                        title={`${lote.pendientes} cargados sin enviar a traducir`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" aria-hidden />
                        {lote.pendientes}<span className="hidden sm:inline"> sin enviar</span>
                      </span>
                    )}
                    {lote.conError > 0 && (
                      <span className="inline-flex items-center gap-1 font-medium text-[#DC2626]" title={`${lote.conError} con error`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {lote.conError}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
