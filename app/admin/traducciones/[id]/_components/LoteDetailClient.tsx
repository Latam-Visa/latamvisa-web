"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Loader2, Plus, Send, AlertCircle, Pencil, ArrowLeft, RotateCw, Trash2 } from 'lucide-react'
import { TranslatedDocuments } from '../../../_components/TranslatedDocuments'
import { labelPais, normalizeDocStatus, type TranslatedDocument } from '@/lib/traducciones/shared'
import { CargaDocumentos } from '../../_components/CargaDocumentos'
import { actualizarLote, eliminarLote, reenviarLote } from '../../_actions/traducciones-actions'

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

const btnSecundario =
  'inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-[13px] font-medium bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F5F5F0] transition-colors disabled:opacity-50'

export function LoteDetailClient({
  lote,
  documentos,
  archivosSubidos,
  pendientes,
}: {
  lote: Lote
  documentos: TranslatedDocument[]
  archivosSubidos: number
  // Cargados en documentos_lote y nunca enviados a n8n (enviado_at NULL).
  pendientes: number
}) {
  const router = useRouter()

  const [nombre, setNombre] = useState(lote.nombre_cliente)
  const [editandoNombre, setEditandoNombre] = useState(false)

  const [notas, setNotas] = useState(lote.notas || '')
  const [editandoNotas, setEditandoNotas] = useState(false)
  const [guardandoNotas, setGuardandoNotas] = useState(false)

  const [agregando, setAgregando] = useState(false)
  const [enviandoPendientes, setEnviandoPendientes] = useState(false)

  const [reenviando, setReenviando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const nombreInputRef = useRef<HTMLInputElement>(null)
  const notasInputRef = useRef<HTMLInputElement>(null)
  // Enter y Escape terminan la edición y el blur que sigue no debe volver a guardar.
  const saliendoNotas = useRef(false)

  /* Falta procesar mientras n8n no haya escrito una fila por cada archivo
     subido. Con 0 archivos (nada subido) no hay nada que esperar. */
  const procesando = archivosSubidos > 0 && documentos.length < archivosSubidos
  const hayErrores = documentos.some((d) => normalizeDocStatus(d.status) === 'error')

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
    if (editandoNombre) nombreInputRef.current?.select()
  }, [editandoNombre])

  useEffect(() => {
    if (editandoNotas) notasInputRef.current?.focus()
  }, [editandoNotas])

  const guardarNombre = async () => {
    if (nombre.trim() === lote.nombre_cliente) return setEditandoNombre(false)
    if (!nombre.trim()) return setError('El nombre del cliente no puede quedar vacío.')
    setError('')
    const res = await actualizarLote(lote.id, { nombre_cliente: nombre })
    if (!res.success) return setError(res.error || 'No pudimos guardar el nombre.')
    setEditandoNombre(false)
    router.refresh()
  }

  const guardarNotas = async () => {
    setEditandoNotas(false)
    if (notas.trim() === (lote.notas || '').trim()) return
    setGuardandoNotas(true)
    setError('')
    const res = await actualizarLote(lote.id, { notas })
    setGuardandoNotas(false)
    if (!res.success) return setError(res.error || 'No pudimos guardar las notas.')
    router.refresh()
  }

  /* Misma acción que "Ya terminé" (POST /api/traducciones/[id]/enviar), desde
     el aviso ámbar: archivos que quedaron cargados y nadie mandó a traducir. */
  const enviarPendientesAhora = async () => {
    setEnviandoPendientes(true)
    setError('')
    try {
      const res = await fetch(`/api/traducciones/${lote.id}/enviar`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No pudimos enviar a traducir.')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'No pudimos enviar a traducir.')
    } finally {
      setEnviandoPendientes(false)
    }
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

  const ocupado = reenviando || eliminando || enviandoPendientes

  return (
    <div className="space-y-3">
      {/* Encabezado: una franja, sin tarjeta. En móvil: nombre / badge+fecha / botones. */}
      <header className="space-y-1">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-x-2 gap-y-1 min-w-0 flex-1">
            <Link
              href="/admin/traducciones"
              aria-label="Volver a traducciones"
              title="Volver a traducciones"
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-[#525252] hover:bg-[#F5F5F0] hover:text-[#0A0A0A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {editandoNombre ? (
              <input
                ref={nombreInputRef}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onBlur={guardarNombre}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                  if (e.key === 'Escape') { setNombre(lote.nombre_cliente); setEditandoNombre(false) }
                }}
                aria-label="Nombre del cliente"
                className="min-w-0 flex-1 md:max-w-[420px] h-8 bg-white border border-[#C8FF00] rounded-md px-2 text-[20px] font-bold text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#C8FF00]"
              />
            ) : (
              <div className="flex items-center gap-1 min-w-0 flex-1 md:flex-initial">
                <h1 className="text-[20px] leading-7 font-bold text-[#0A0A0A] truncate" title={lote.nombre_cliente}>
                  {lote.nombre_cliente}
                </h1>
                <button
                  type="button"
                  onClick={() => setEditandoNombre(true)}
                  aria-label="Editar nombre del cliente"
                  title="Editar nombre"
                  className="w-6 h-6 shrink-0 flex items-center justify-center rounded text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 basis-full md:basis-auto shrink-0 sm:pl-10 md:pl-0">
              {lote.pais && (
                <span className="font-bold text-[10px] uppercase tracking-wider bg-[#F5F5F0] text-[#0A0A0A] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                  {labelPais(lote.pais)}
                </span>
              )}
              {lote.pais && <span className="text-[12px] text-[#A3A3A3]" aria-hidden>·</span>}
              <time dateTime={lote.created_at} className="text-[12px] text-[#6B6B6B]">
                {format(new Date(lote.created_at), 'd MMM yyyy', { locale: es })}
              </time>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:pl-10 md:pl-0">
            <button type="button" onClick={() => setAgregando(true)} disabled={ocupado || agregando} className={btnSecundario}>
              <Plus className="w-3.5 h-3.5" />
              Documentos
            </button>
            {hayErrores && (
              <button type="button" onClick={reintentar} disabled={ocupado} className={btnSecundario}>
                {reenviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
                Reintentar
              </button>
            )}
            <button
              type="button"
              onClick={borrar}
              disabled={ocupado}
              title="Eliminar traducción"
              className="inline-flex items-center gap-1.5 h-8 px-2 rounded-lg text-[13px] text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F0] transition-colors disabled:opacity-50"
            >
              {eliminando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 sm:hidden" />}
              <span className="sr-only sm:not-sr-only">Eliminar</span>
            </button>
          </div>
        </div>

        {/* Notas: texto plano en una línea; el lápiz las vuelve editables. */}
        <div className="sm:pl-10 h-6 flex items-center gap-1 min-w-0">
          {editandoNotas ? (
            <input
              ref={notasInputRef}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={() => {
                if (saliendoNotas.current) return void (saliendoNotas.current = false)
                guardarNotas()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { saliendoNotas.current = true; guardarNotas() }
                if (e.key === 'Escape') { saliendoNotas.current = true; setNotas(lote.notas || ''); setEditandoNotas(false) }
              }}
              placeholder="Contexto para tu equipo…"
              aria-label="Notas"
              className="flex-1 min-w-0 max-w-[720px] h-6 bg-white border border-[#C8FF00] rounded px-1.5 text-[13px] text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#C8FF00]"
            />
          ) : notas.trim() ? (
            <>
              <p className="min-w-0 truncate text-[13px] text-[#6B6B6B]" title={notas}>{notas}</p>
              <button
                type="button"
                onClick={() => setEditandoNotas(true)}
                aria-label="Editar notas"
                title="Editar notas"
                className="w-6 h-6 shrink-0 flex items-center justify-center rounded text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditandoNotas(true)}
              className="text-[13px] text-[#6B6B6B] hover:text-[#0A0A0A] hover:underline"
            >
              + nota
            </button>
          )}
          {guardandoNotas && <Loader2 className="w-3 h-3 animate-spin text-[#A3A3A3] shrink-0" aria-label="Guardando notas" />}
        </div>
      </header>

      {procesando && (
        <div className="bg-[#F4FFC4] border border-[#D9EFB0] rounded-lg px-3 py-2 flex items-center gap-2" role="status" aria-live="polite">
          <Loader2 className="w-4 h-4 text-[#2F4A00] shrink-0 animate-spin" />
          <p className="text-[13px] text-[#2F4A00] min-w-0">
            <span className="font-bold">Traduciendo.</span> Toma unos 15 minutos y la página se actualiza sola.
            {documentos.length > 0 && ` Van ${documentos.length} de ${archivosSubidos}.`}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-[#FEF2F2] border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
          <p className="text-[13px] text-red-700 break-words min-w-0">{error}</p>
        </div>
      )}

      {aviso && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2">
          <p className="text-[13px] text-[#92400E] break-words">{aviso}</p>
        </div>
      )}

      {pendientes > 0 && !agregando && (
        <div role="status" className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="flex-1 min-w-0 text-[13px] text-[#92400E]">
            <span className="font-semibold">{pendientes} {pendientes === 1 ? 'documento cargado' : 'documentos cargados'}</span>{' '}
            que no {pendientes === 1 ? 'se ha' : 'se han'} enviado a traducir
          </p>
          <button
            type="button"
            onClick={enviarPendientesAhora}
            disabled={ocupado}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-bold bg-[#C8FF00] text-[#2F4A00] hover:bg-[#b8ef00] transition-colors disabled:opacity-60"
          >
            {enviandoPendientes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Enviar a traducir
          </button>
        </div>
      )}

      {agregando && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">Agregar documentos</h2>
            <button type="button" onClick={() => { setAgregando(false); router.refresh() }} className={btnSecundario}>
              Cerrar
            </button>
          </div>
          <CargaDocumentos
            obtenerLoteId={async () => lote.id}
            pendientesPrevios={pendientes}
            onEnviado={(enviados) => {
              setAgregando(false)
              setAviso(enviados > 0 ? '' : 'No había documentos nuevos para enviar.')
              router.refresh()
            }}
          />
        </div>
      )}

      {/* Las tres secciones en una sola tarjeta. */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] px-4 py-2">
        <TranslatedDocuments
          documents={documentos}
          pais={lote.pais}
          nombreCliente={lote.nombre_cliente}
          emptyMessage={
            archivosSubidos > 0
              ? 'Todavía no llegan los documentos traducidos.'
              : 'Esta traducción no tiene documentos. Usa "+ Documentos" para enviarlos a traducir.'
          }
        />
      </div>
    </div>
  )
}
