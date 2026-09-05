"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import { PAISES_TRADUCCION, PAIS_TRADUCCION_DEFAULT } from '@/lib/traducciones/shared'
import { DocumentosPicker } from '../../_components/DocumentosPicker'
import { subirArchivos, type ProgresoSubida } from '../../_components/subirArchivos'
import { crearLote, enviarLoteAn8n } from '../../_actions/traducciones-actions'
import type { DispatchDoc } from '@/lib/traducciones/dispatch'

type Fase = 'form' | 'creando' | 'subiendo' | 'enviando'

export function NuevaTraduccionClient() {
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState<string>(PAIS_TRADUCCION_DEFAULT)
  const [notas, setNotas] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])

  const [fase, setFase] = useState<Fase>('form')
  const [progreso, setProgreso] = useState<ProgresoSubida | null>(null)
  const [error, setError] = useState('')
  const [avisos, setAvisos] = useState<string[]>([])

  /* Si el webhook falla, el lote y los archivos ya subidos se conservan: se
     guarda lo necesario para reintentar solo el envío, sin volver a subir. */
  const [reintento, setReintento] = useState<{ loteId: string; docs: DispatchDoc[] } | null>(null)

  const ocupado = fase !== 'form'

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAvisos([])

    if (!nombre.trim()) return setError('Escribe el nombre del cliente.')
    if (archivos.length === 0) return setError('Agrega al menos un documento.')

    setFase('creando')
    const lote = await crearLote({ nombre_cliente: nombre, pais, notas })
    if (!lote.success || !lote.id) {
      setFase('form')
      return setError(lote.error || 'No pudimos crear la traducción.')
    }

    setFase('subiendo')
    const { subidos, fallidos } = await subirArchivos(lote.id, archivos, setProgreso)
    setProgreso(null)

    if (fallidos.length > 0) {
      setAvisos(fallidos.map((f) => `${f.nombre}: ${f.error}`))
    }

    if (subidos.length === 0) {
      setFase('form')
      return setError('No se pudo subir ningún archivo. La traducción quedó creada, pero vacía.')
    }

    setFase('enviando')
    const envio = await enviarLoteAn8n(lote.id, subidos)

    if (!envio.success) {
      setFase('form')
      setReintento({ loteId: lote.id, docs: subidos })
      return setError(envio.error || 'No pudimos avisarle a n8n.')
    }

    router.push(`/admin/traducciones/${lote.id}`)
  }

  const reintentarEnvio = async () => {
    if (!reintento) return
    setError('')
    setFase('enviando')
    const envio = await enviarLoteAn8n(reintento.loteId, reintento.docs)
    if (!envio.success) {
      setFase('form')
      return setError(envio.error || 'Seguimos sin poder avisarle a n8n.')
    }
    router.push(`/admin/traducciones/${reintento.loteId}`)
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
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
            disabled={ocupado}
            required
            placeholder="Ej. María Restrepo"
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="pais" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">País</label>
          <select
            id="pais"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            disabled={ocupado}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] disabled:opacity-60"
          >
            {PAISES_TRADUCCION.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notas" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Notas <span className="text-[#A3A3A3] font-normal">(opcional)</span>
          </label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            disabled={ocupado}
            rows={3}
            placeholder="Contexto para tu equipo: de dónde llegaron los documentos, qué falta…"
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] disabled:opacity-60"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#0A0A0A] mb-3">Documentos</h3>
        <DocumentosPicker archivos={archivos} onChange={setArchivos} disabled={ocupado} />
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-red-700 break-words">{error}</p>
            {reintento && (
              <button
                type="button"
                onClick={reintentarEnvio}
                disabled={ocupado}
                className="mt-3 inline-flex items-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#b8ef00] transition-colors min-h-[44px] disabled:opacity-60"
              >
                {fase === 'enviando' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Reintentar envío
              </button>
            )}
          </div>
        </div>
      )}

      {avisos.length > 0 && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4">
          <p className="text-sm font-medium text-[#92400E] mb-1">Algunos archivos no se subieron:</p>
          <ul className="text-xs text-[#92400E] list-disc pl-5 space-y-0.5">
            {avisos.map((a, i) => <li key={i} className="break-words">{a}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="submit"
          disabled={ocupado || archivos.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-5 py-3 rounded-lg hover:bg-[#b8ef00] transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ocupado ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {fase === 'form' && 'Crear y enviar a traducir'}
          {fase === 'creando' && 'Creando traducción…'}
          {fase === 'subiendo' && 'Subiendo documentos…'}
          {fase === 'enviando' && 'Enviando a traducir…'}
        </button>

        {fase === 'subiendo' && progreso && (
          <div className="flex-1 min-w-0" role="status" aria-live="polite">
            <p className="text-xs text-[#6B6B6B] mb-1.5 truncate">
              Archivo {progreso.actual} de {progreso.total} · {progreso.nombre}
            </p>
            <div className="h-1.5 rounded-full bg-[#F5F5F0] overflow-hidden">
              <div
                className="h-full bg-[#C8FF00] transition-[width] duration-300"
                style={{ width: `${Math.round((progreso.actual / progreso.total) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
