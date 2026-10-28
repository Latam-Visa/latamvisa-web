"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Send, AlertCircle, RotateCw } from 'lucide-react'
import { DocumentosPicker } from '../traducciones/_components/DocumentosPicker'
import { subirArchivos, type ProgresoSubida } from '../traducciones/_components/subirArchivos'
import { enviarAn8n } from '../traducciones/_actions/traducciones-actions'
import { SELECCION_VACIA, type SeleccionArchivos } from '@/lib/traducciones/preparar-archivos'
import type { DispatchDoc } from '@/lib/traducciones/dispatch'
import type { Destino } from '@/lib/traducciones/shared'

/* Botón "Agregar documentos" + su panel, reutilizable. Hoy lo usa solo la ficha
   de Australia (/admin/applications/[id]), pero está escrito contra un `Destino`
   para que UK, Canadá, Schengen y Japón lo cuelguen igual cuando toque.

   Reusa la misma maquinaria de los lotes de traducción: el DocumentosPicker
   (drag & drop, hash, dedup, límites de shared.ts), la subida de a uno con
   signed upload URL y progreso real, y el mismo webhook de n8n — solo que el
   destino es una solicitud y los documentos van marcados origen='admin'. */

/* El pipeline de n8n tarda 14-17 minutos; mientras, la página se refresca sola.
   Mismos números que el detalle de un lote (LoteDetailClient). */
const REFRESCO_MS = 30_000
const MAX_REFRESCOS = 80

const btnSecundario =
  'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F5F5F0] transition-colors disabled:opacity-50'

export function AgregarDocumentos({ destino }: { destino: Destino }) {
  const router = useRouter()

  const [agregando, setAgregando] = useState(false)
  const [seleccion, setSeleccion] = useState<SeleccionArchivos>(SELECCION_VACIA)
  const nuevos = seleccion.nuevos

  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState<ProgresoSubida | null>(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  // Documentos ya subidos cuyo envío a n8n falló: permiten reintentar solo el
  // aviso, sin volver a subir los archivos.
  const [reintento, setReintento] = useState<DispatchDoc[] | null>(null)
  const [reenviando, setReenviando] = useState(false)

  // Tras un envío OK: se espera a que lleguen las traducciones, refrescando.
  const [esperando, setEsperando] = useState(false)

  useEffect(() => {
    if (!esperando) return
    let ticks = 0
    const id = setInterval(() => {
      ticks += 1
      if (ticks > MAX_REFRESCOS) return clearInterval(id)
      router.refresh()
    }, REFRESCO_MS)
    return () => clearInterval(id)
  }, [esperando, router])

  const subirNuevos = async () => {
    if (nuevos.length === 0) return
    setSubiendo(true)
    setError('')
    setAviso('')

    const { subidos, repetidos, fallidos } = await subirArchivos(destino, nuevos, setProgreso)
    setProgreso(null)

    const partes: string[] = []
    if (repetidos.length > 0) partes.push(`Ya se habían subido, se omitieron: ${repetidos.map((r) => r.nombre).join(', ')}.`)
    if (fallidos.length > 0) partes.push(`No se subieron: ${fallidos.map((f) => f.nombre).join(', ')}.`)
    if (partes.length > 0) setAviso(partes.join(' '))

    if (subidos.length === 0) {
      setSubiendo(false)
      // Sin nada nuevo no se dispara n8n: no hay nada que traducir.
      if (fallidos.length === 0) {
        setSeleccion(SELECCION_VACIA)
        setAgregando(false)
      } else {
        setError('No se pudo subir ningún archivo.')
      }
      return
    }

    const envio = await enviarAn8n(destino, subidos)
    setSubiendo(false)
    setSeleccion(SELECCION_VACIA)
    setAgregando(false)

    if (!envio.success) {
      setReintento(subidos)
      setError(envio.error || 'Los archivos se subieron, pero n8n no respondió. Usa "Reintentar".')
      return
    }

    setReintento(null)
    setEsperando(true)
    router.refresh()
  }

  const reintentar = async () => {
    if (!reintento) return
    setReenviando(true)
    setError('')
    const res = await enviarAn8n(destino, reintento)
    setReenviando(false)
    if (!res.success) {
      setError(res.error || 'Seguimos sin poder avisarle a n8n.')
      return
    }
    setReintento(null)
    setEsperando(true)
    router.refresh()
  }

  return (
    <div className="mb-3">
      {/* Fila de acciones: el botón arriba, junto al contador de la lista. */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {reintento && !agregando && (
          <button type="button" onClick={reintentar} disabled={reenviando} className={btnSecundario}>
            {reenviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
            Reintentar envío
          </button>
        )}
        {!agregando && (
          <button
            type="button"
            onClick={() => { setAgregando(true); setError(''); setAviso('') }}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-bold bg-[#C8FF00] text-[#2F4A00] hover:bg-[#b8ef00] transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar documentos
          </button>
        )}
      </div>

      {esperando && (
        <div className="mt-3 bg-[#F4FFC4] border border-[#D9EFB0] rounded-lg px-3 py-2 flex items-center gap-2" role="status" aria-live="polite">
          <Loader2 className="w-4 h-4 text-[#2F4A00] shrink-0 animate-spin" />
          <p className="text-[13px] text-[#2F4A00] min-w-0">
            <span className="font-bold">Enviado a traducir.</span> Toma unos 15 minutos y la página se actualiza sola.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-[#FEF2F2] border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
          <p className="text-[13px] text-red-700 break-words min-w-0">{error}</p>
        </div>
      )}

      {aviso && (
        <div className="mt-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2">
          <p className="text-[13px] text-[#92400E] break-words">{aviso}</p>
        </div>
      )}

      {agregando && (
        <div className="mt-3 bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">Agregar documentos</h3>
          <DocumentosPicker seleccion={seleccion} onChange={setSeleccion} destino={destino} disabled={subiendo} />

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

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={subirNuevos}
              disabled={subiendo || nuevos.length === 0}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-bold bg-[#C8FF00] text-[#2F4A00] hover:bg-[#b8ef00] transition-colors disabled:opacity-50"
            >
              {subiendo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {subiendo ? 'Subiendo…' : `Enviar ${nuevos.length || ''} a traducir`}
            </button>
            <button
              type="button"
              onClick={() => { setAgregando(false); setSeleccion(SELECCION_VACIA) }}
              disabled={subiendo}
              className={btnSecundario}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
