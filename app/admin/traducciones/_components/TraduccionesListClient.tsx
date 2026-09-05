"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Eye, Search, Languages, AlertCircle } from 'lucide-react'
import { labelPais } from '@/lib/traducciones/shared'

export interface LoteResumen {
  id: string
  nombre_cliente: string
  pais: string | null
  created_at: string
  traducidos: number
  originales: number
  conError: number
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
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F2FBDD] to-[#E4F5C6] flex items-center justify-center mx-auto mb-4">
          <Languages className="w-6 h-6 text-[#2F4A00]" />
        </div>
        <h3 className="text-base font-bold text-[#0A0A0A] mb-1">Todavía no hay traducciones</h3>
        <p className="text-sm text-[#6B6B6B] mb-6">
          Crea la primera para traducir documentos que te llegan por Gmail o WhatsApp.
        </p>
        <Link
          href="/admin/traducciones/nueva"
          className="inline-flex items-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#b8ef00] transition-colors min-h-[44px]"
        >
          Nueva traducción
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre del cliente..."
          aria-label="Buscar por nombre del cliente"
          className="w-full bg-white border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="p-8 text-center text-sm text-[#6B6B6B] bg-white border border-[#E5E5E5] rounded-xl">
          Ningún cliente coincide con “{query.trim()}”.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtrados.map((lote, index) => (
            <motion.div
              key={lote.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/admin/traducciones/${lote.id}`}
                className="group block relative overflow-hidden bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300 ease-out"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8FF00] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom" />

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#0A0A0A] break-words">{lote.nombre_cliente}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-[#6B6B6B]">
                      {lote.pais && (
                        <span className="font-bold text-[10px] uppercase tracking-wider bg-[#F5F5F0] text-[#0A0A0A] px-2 py-0.5 rounded-md border border-[#E5E5E5]">
                          {labelPais(lote.pais)}
                        </span>
                      )}
                      <span>{format(new Date(lote.created_at), "d MMM, yyyy", { locale: es })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[#0A0A0A] font-medium">
                      {lote.traducidos + lote.originales + lote.conError === 0 ? (
                        <span className="text-[#6B6B6B]">Procesando…</span>
                      ) : (
                        <>
                          {lote.traducidos} {lote.traducidos === 1 ? 'traducido' : 'traducidos'}
                          {' · '}
                          {lote.originales} {lote.originales === 1 ? 'original' : 'originales'}
                        </>
                      )}
                    </span>

                    {lote.conError > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#DC2626]"
                        title={`${lote.conError} con error`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {lote.conError}
                      </span>
                    )}

                    <div className="p-2 rounded-lg bg-[#FAFAF7] group-hover:bg-[#C8FF00] transition-colors ml-auto sm:ml-0">
                      <Eye className="w-4 h-4 text-[#0A0A0A]" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
