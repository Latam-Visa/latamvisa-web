"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Loader2, Save, Trash2, Plus, Send, AlertCircle, Check, X, Pencil } from 'lucide-react'
import { TranslatedDocuments } from '../../../_components/TranslatedDocuments'
import { labelPais, type TranslatedDocument } from '@/lib/traducciones/shared'
import { DocumentosPicker } from '../../_components/DocumentosPicker'
import { subirArchivos, type ProgresoSubida } from '../../_components/subirArchivos'
import { actualizarLote, eliminarLote, enviarLoteAn8n, reenviarLote } from '../../_actions/traducciones-actions'

interface Lote {
  id: string
  nombre_cliente: string
  pais: string | null
  notas: string | null
  created_at: string
}

/* El pipeline de n8n tarda entre 14 y 17 minutos. Mientras falten documentos
   la página se refresca sola: es más honesto que dejar al admin recargando a
   mano sin saber si ya terminó. */
const REFRESCO_MS = 30_000
/* Tope de ~40 minutos: bien por encima de los 17 que tarda el pipeline. Sin
   esto, un lote que n8n nunca terminó deja la pestaña recargándose para
   siempre. Pasado el tope el admin recarga a mano. */
const MAX_REFRESCOS = 80

export function LoteDetailClient({
  lote,
  documentos,
  archivosSubidos,
}: {
  lote: Lote
  documentos: TranslatedDocument[]
  archivosSubidos: number
}) {
  const router = useRouter()

  const [nombre, setNombre] = useState(lote.nombre_cliente)
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [guardandoNombre, setGuardandoNombre] = useState(false)

  const [notas, setNotas] = useState(lote.notas || '')
  const [guardandoNotas, setGuardandoNotas] = useState(false)
  const [notasGuardadas, setNotasGuardadas] = useState(false)

  const [agregando, setAgregando] = useState(false)
  const [nuevos, setNuevos] = useState<File[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState<ProgresoSubida | null>(null)

  const [reenviando, setReenviando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const nombreInputRef = useRef<HTMLInputElement>(null)

  /* Falta procesar mientras n8n no haya escrito una fila por cada archivo
     subido. Con 0 archivos (nada subido) no hay nada que esperar. */
  const procesando = archivosSubidos > 0 && documentos.length < archivosSubidos

  useEffect(() => {
    if (!procesando) return
    let ticks = 0
    const id = setInterval(() => {
      ticks += 1
      if (ticks > MAX_REFRESCOS) return clearInterval(id)
      router.refresh()
    }, REFRESCO_MS)
    return () => clearInterval(id)
  }, [procesando, router])

  useEffect(() => {
    if (editandoNombre) nombreInputRef.current?.focus()
  }, [editandoNombre])

  const guardarNombre = async () => {
    if (!nombre.trim()) return setError('El nombre del cliente no puede quedar vacío.')
    setGuardandoNombre(true)
    setError('')
    const res = await actualizarLote(lote.id, { nombre_cliente: nombre })
    setGuardandoNombre(false)
    if (!res.success) return setError(res.error || 'No pudimos guardar el nombre.')
    setEditandoNombre(false)
    router.refresh()
  }

  const guardarNotas = async () => {
    setGuardandoNotas(true)
    setError('')
    const res = await actualizarLote(lote.id, { notas })
    setGuardandoNotas(false)
    if (!res.success) return setError(res.error || 'No pudimos guardar las notas.')
    setNotasGuardadas(true)
    setTimeout(() => setNotasGuardadas(false), 2500)
  }

  const subirNuevos = async () => {
    if (nuevos.length === 0) return
    setSubiendo(true)
    setError('')
    setAviso('')

    const { subidos, fallidos } = await subirArchivos(lote.id, nuevos, setProgreso)
    setProgreso(null)

    if (fallidos.length > 0) {
      setAviso(`No se subieron: ${fallidos.map((f) => f.nombre).join(', ')}.`)
    }

    if (subidos.length === 0) {
      setSubiendo(false)
      return setError('No se pudo subir ningún archivo.')
    }

    // Solo los nuevos: los que ya estaban se procesaron en su propio envío.
    const envio = await enviarLoteAn8n(lote.id, subidos)
    setSubiendo(false)

    if (!envio.success) {
      setError(envio.error || 'Los archivos se subieron pero n8n no respondió. Usa "Reintentar envío".')
    }

    setNuevos([])
    setAgregando(false)
    router.refresh()
  }

  const reintentar = async () => {
    setReenviando(true)
    setError('')
    const res = await reenviarLote(lote.id)
    setReenviando(false)
    if (!res.success) return setError(res.error || 'Seguimos sin poder avisarle a n8n.')
    setAviso(`Reenviado: ${res.enviados} documento(s). Vuelve en unos 15 minutos.`)
    router.refresh()
  }

  const borrar = async () => {
    if (!confirm(`¿Eliminar la traducción de ${lote.nombre_cliente}? Se borran sus documentos y no se puede deshacer.`)) return
    setEliminando(true)
    const res = await eliminarLote(lote.id)
    if (!res.success) {
      setEliminando(false)
      return setError(res.error || 'No pudimos eliminar la traducción.')
    }
    router.push('/admin/traducciones')
  }

  const ocupado = subiendo || reenviando || eliminando

  return (
    <div className="space-y-5">
      {/* Cabecera del lote */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {editandoNombre ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={nombreInputRef}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') guardarNombre()
                    if (e.key === 'Escape') { setNombre(lote.nombre_cliente); setEditandoNombre(false) }
                  }}
                  aria-label="Nombre del cliente"
                  className="flex-1 min-w-[180px] bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-3 py-2 text-lg font-bold text-[#0A0A0A] min-h-[44px] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
                />
                <button
                  type="button"
                  onClick={guardarNombre}
                  disabled={guardandoNombre}
                  aria-label="Guardar nombre"
                  className="w-11 h-11 rounded-lg bg-[#C8FF00] text-[#2F4A00] flex items-center justify-center hover:bg-[#b8ef00] transition-colors disabled:opacity-60"
                >
                  {guardandoNombre ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setNombre(lote.nombre_cliente); setEditandoNombre(false) }}
                  aria-label="Cancelar edición"
                  className="w-11 h-11 rounded-lg bg-[#F5F5F0] border border-[#E5E5E5] text-[#525252] flex items-center justify-center hover:bg-[#E5E5E5] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditandoNombre(true)}
                className="group flex items-center gap-2 text-left min-h-[44px]"
              >
                <span className="text-lg font-bold text-[#0A0A0A] break-words">{lote.nombre_cliente}</span>
                <Pencil className="w-3.5 h-3.5 text-[#A3A3A3] group-hover:text-[#0A0A0A] transition-colors shrink-0" />
              </button>
            )}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-[#6B6B6B]">
              {lote.pais && (
                <span className="font-bold text-[10px] uppercase tracking-wider bg-[#F5F5F0] text-[#0A0A0A] px-2 py-0.5 rounded-md border border-[#E5E5E5]">
                  {labelPais(lote.pais)}
                </span>
              )}
              <span>{format(new Date(lote.created_at), "d 'de' MMMM, yyyy", { locale: es })}</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="notas" className="block text-xs font-medium text-[#6B6B6B] mb-1.5">Notas</label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="Contexto para tu equipo…"
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
          />
          <button
            type="button"
            onClick={guardarNotas}
            disabled={guardandoNotas}
            className="mt-2 inline-flex items-center gap-2 bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#E5E5E5] transition-colors min-h-[44px] disabled:opacity-60"
          >
            {guardandoNotas ? <Loader2 className="w-4 h-4 animate-spin" /> : notasGuardadas ? <Check className="w-4 h-4 text-[#2F4A00]" /> : <Save className="w-4 h-4" />}
            {notasGuardadas ? 'Guardado' : 'Guardar notas'}
          </button>
        </div>
      </div>

      {procesando && (
        <div className="bg-[#F4FFC4] border border-[#D9EFB0] rounded-xl p-4 flex gap-3" role="status" aria-live="polite">
          <Loader2 className="w-5 h-5 text-[#2F4A00] shrink-0 mt-0.5 animate-spin" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#2F4A00]">Los documentos se están traduciendo</p>
            <p className="text-xs text-[#3D5A00] mt-0.5">
              Esto toma unos 15 minutos. La página se actualiza sola, no hace falta que recargues.
              {documentos.length > 0 && ` Van ${documentos.length} de ${archivosSubidos}.`}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 break-words min-w-0">{error}</p>
        </div>
      )}

      {aviso && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4">
          <p className="text-sm text-[#92400E] break-words">{aviso}</p>
        </div>
      )}

      {/* Documentos */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
        <h3 className="text-base font-bold text-[#0A0A0A] border-b border-[#E5E5E5] pb-3 mb-4">Documentos</h3>
        <TranslatedDocuments
          documents={documentos}
          emptyMessage={
            archivosSubidos > 0
              ? 'Todavía no llegan los documentos traducidos.'
              : 'Esta traducción no tiene documentos. Agrega archivos para enviarlos a traducir.'
          }
        />
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 space-y-4">
        {agregando ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0A0A0A]">Agregar más documentos</h3>
            <DocumentosPicker archivos={nuevos} onChange={setNuevos} disabled={subiendo} />

            {subiendo && progreso && (
              <div role="status" aria-live="polite">
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

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={subirNuevos}
                disabled={subiendo || nuevos.length === 0}
                className="inline-flex items-center justify-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#b8ef00] transition-colors min-h-[44px] disabled:opacity-50"
              >
                {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {subiendo ? 'Subiendo…' : `Enviar ${nuevos.length || ''} a traducir`}
              </button>
              <button
                type="button"
                onClick={() => { setAgregando(false); setNuevos([]) }}
                disabled={subiendo}
                className="inline-flex items-center justify-center gap-2 bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E5E5E5] transition-colors min-h-[44px] disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setAgregando(true)}
              disabled={ocupado}
              className="inline-flex items-center justify-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#b8ef00] transition-colors min-h-[44px] disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              Agregar más documentos
            </button>

            <button
              type="button"
              onClick={reintentar}
              disabled={ocupado || archivosSubidos === 0}
              title={archivosSubidos === 0 ? 'No hay archivos subidos en este lote' : undefined}
              className="inline-flex items-center justify-center gap-2 bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E5E5E5] transition-colors min-h-[44px] disabled:opacity-50"
            >
              {reenviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Reintentar envío
            </button>
          </div>
        )}

        <div className="border-t border-[#E5E5E5] pt-4">
          <button
            type="button"
            onClick={borrar}
            disabled={ocupado}
            className="inline-flex items-center justify-center gap-2 text-[#DC2626] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors min-h-[44px] disabled:opacity-60"
          >
            {eliminando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar lote
          </button>
        </div>
      </div>
    </div>
  )
}
