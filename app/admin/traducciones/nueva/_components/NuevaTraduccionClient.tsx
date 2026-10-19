"use client"

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PAISES_TRADUCCION, PAIS_TRADUCCION_DEFAULT, carpetasDePais } from '@/lib/traducciones/shared'
import { CargaDocumentos } from '../../_components/CargaDocumentos'
import { actualizarLote, crearLote } from '../../_actions/traducciones-actions'

const campo =
  'w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] disabled:opacity-60'

export function NuevaTraduccionClient() {
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState<string>(PAIS_TRADUCCION_DEFAULT)
  const carpetasPais = carpetasDePais(pais)
  const [notas, setNotas] = useState('')

  /* Los archivos suben apenas se sueltan, y para eso el lote tiene que
     existir: se crea con el primer archivo. Desde ahí nombre y país quedan
     fijos (las carpetas dependen del país); las notas se guardan al terminar. */
  const [loteId, setLoteId] = useState<string | null>(null)
  const creando = useRef<Promise<string> | null>(null)

  const obtenerLoteId = () => {
    if (loteId) return Promise.resolve(loteId)
    if (!creando.current) {
      creando.current = crearLote({ nombre_cliente: nombre, pais, notas }).then((res) => {
        if (!res.success || !res.id) {
          creando.current = null
          throw new Error(res.error || 'No pudimos crear la traducción.')
        }
        setLoteId(res.id)
        return res.id
      })
    }
    return creando.current
  }

  const notasAlCrear = useRef(notas)
  if (!loteId) notasAlCrear.current = notas

  const alEnviar = async (_enviados: number, id: string) => {
    if (notas.trim() !== notasAlCrear.current.trim()) await actualizarLote(id, { notas })
    router.push(`/admin/traducciones/${id}`)
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 space-y-5">
        <div>
          <label htmlFor="nombre_cliente" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Nombre del cliente <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="nombre_cliente"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={!!loteId}
            required
            placeholder="Ej. María Restrepo"
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="pais" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">País</label>
          <select id="pais" value={pais} onChange={(e) => setPais(e.target.value)} disabled={!!loteId} className={campo}>
            {PAISES_TRADUCCION.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {carpetasPais && (
            <details className="mt-1.5 text-[12px] text-[#6B6B6B]">
              <summary className="cursor-pointer truncate">
                Los documentos se van a organizar en {carpetasPais.length} carpetas de ImmiAccount: {carpetasPais.join(', ')}
              </summary>
              <ol className="mt-1 ml-4 list-decimal space-y-0.5">
                {carpetasPais.map((c) => <li key={c}>{c}</li>)}
              </ol>
            </details>
          )}
          {loteId && <p className="mt-1.5 text-[12px] text-[#6B6B6B]">La traducción ya está creada: el nombre y el país quedan fijos.</p>}
        </div>

        <div>
          <label htmlFor="notas" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Notas <span className="text-[#A3A3A3] font-normal">(opcional)</span>
          </label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Contexto para tu equipo: de dónde llegaron los documentos, qué falta…"
            className={`${campo} resize-none`}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#0A0A0A] mb-3">Documentos</h3>
        <CargaDocumentos
          obtenerLoteId={obtenerLoteId}
          antesDeSoltar={() => (nombre.trim() ? null : 'Escribe primero el nombre del cliente: los documentos se guardan en su traducción.')}
          onEnviado={alEnviar}
        />
      </div>
    </div>
  )
}
