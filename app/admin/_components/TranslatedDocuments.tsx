"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, FolderInput, Loader2 } from 'lucide-react'
import { moverDocumento } from '../_actions/documentos-actions'
import { carpetasDePais, normalizeDocStatus, type DocStatus, type TranslatedDocument } from '@/lib/traducciones/shared'
import { descargarCarpetaZip, nombreZip } from '@/lib/traducciones/zip-carpeta'

/* Bloque de documentos traducidos. Lo comparten la ficha de una solicitud del
   formulario (AustraliaDetailsClient) y el detalle de un lote de traducción
   manual: las dos leen las mismas filas de `documentos_traducidos` y las
   agrupan igual, así que el markup vive en un solo lado.

   Es denso a propósito: una línea de 36px por documento, para que un lote de
   12 quepa entero en una pantalla de portátil. No dibuja tarjeta propia; la
   pone quien lo usa.

   La vista la decide el país: si tiene carpetas de ImmiAccount (ver
   CARPETAS_POR_PAIS) se agrupa por `carpeta`, que ya llega resuelta del
   servidor (manual > n8n > palabras clave, ver lib/docs/categorias.ts); si
   no, por estado. Este componente no clasifica: solo agrupa y deja mover. */

const DOC_STATUS_SECTIONS: { key: DocStatus; title: string }[] = [
  { key: 'traducido', title: 'Traducidos' },
  { key: 'no_traducido', title: 'No traducidos' },
  { key: 'error', title: 'Con error' },
]

const ORDEN_ESTADO: Record<DocStatus, number> = { traducido: 0, no_traducido: 1, error: 2 }

export function translatedStatusBadge(status: string) {
  const normalized = normalizeDocStatus(status)
  const label =
    normalized === 'traducido' ? 'Traducido' :
    normalized === 'no_traducido' ? 'Original' :
    'Error'
  const classes =
    normalized === 'traducido' ? 'bg-[#C8FF00]/25 text-[#3D5A00]' :
    normalized === 'no_traducido' ? 'bg-[#E9EEF2] text-[#4B5A66]' :
    'bg-red-100 text-red-700'
  return (
    <span className={`w-[96px] py-0.5 text-center text-[10px] leading-4 font-bold uppercase tracking-wider rounded shrink-0 ${classes}`}>
      {label}
    </span>
  )
}

/* "Mover a…": un <select> nativo transparente encima de un botón blanco. Así
   en móvil abre el selector del sistema y nunca queda con fondo oscuro. */
function MoverA({ doc, nombre, carpetas, pais, onError }: {
  doc: TranslatedDocument
  nombre: string
  carpetas: readonly string[]
  pais?: string | null
  onError: (mensaje: string) => void
}) {
  const router = useRouter()
  const [pendiente, setPendiente] = useState(false)
  const manual = doc.carpetaOrigen === 'manual'

  const cambiar = async (valor: string) => {
    if (!valor) return
    setPendiente(true)
    onError('')
    const res = await moverDocumento(doc.id, valor === '__auto__' ? null : valor, pais)
    setPendiente(false)
    if (!res.success) return onError(res.error || 'No pudimos mover el documento.')
    router.refresh()
  }

  return (
    <div className="relative shrink-0 h-7" title={manual ? 'Movido a mano. Mover a…' : 'Mover a…'}>
      <span
        aria-hidden
        className={`h-7 min-w-7 px-1.5 sm:px-2 flex items-center justify-center gap-1 rounded-md border bg-white text-[11px] transition-colors ${
          manual ? 'border-[#C8FF00] text-[#2F4A00]' : 'border-[#E5E5E5] text-[#525252]'
        }`}
      >
        {pendiente ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderInput className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">Mover a…</span>
      </span>
      <select
        value=""
        onChange={(e) => cambiar(e.target.value)}
        disabled={pendiente}
        aria-label={`Mover ${nombre} a…`}
        style={{ colorScheme: 'light' }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait bg-white text-[#0A0A0A]"
      >
        <option value="" disabled>Mover a…</option>
        {carpetas.map((c) => (
          <option key={c} value={c} disabled={c === doc.carpeta}>
            {c === doc.carpeta ? `✓ ${c}` : c}
          </option>
        ))}
        {manual && <option value="__auto__">↺ Volver a automático</option>}
      </select>
    </div>
  )
}

function DocumentRow({ doc, carpetas, pais }: { doc: TranslatedDocument; carpetas?: readonly string[] | null; pais?: string | null }) {
  const [errorMover, setErrorMover] = useState('')
  const nombre = doc.nombre_archivo || doc.nombre_original
  const estado = normalizeDocStatus(doc.status)
  const motivo = estado !== 'traducido' ? doc.motivo : null
  return (
    <li className="h-9 flex items-center gap-2 sm:gap-3 px-2 -mx-2 rounded-md hover:bg-[#F5F5F0] transition-colors">
      {/* El nombre manda; el motivo usa lo que sobre y se corta antes. */}
      <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
        <span className="shrink-0 max-w-full truncate text-[13px] text-[#0A0A0A]" title={nombre}>
          {nombre}
        </span>
        {errorMover ? (
          <span role="alert" className="min-w-0 truncate text-[11px] text-red-700" title={errorMover}>
            · {errorMover}
          </span>
        ) : motivo && (
          <span
            className={`hidden sm:block min-w-0 truncate text-[11px] ${estado === 'error' ? 'text-red-700' : 'text-[#6B6B6B]'}`}
            title={motivo}
          >
            · {motivo}
          </span>
        )}
      </div>
      {translatedStatusBadge(doc.status)}
      {carpetas && <MoverA doc={doc} nombre={nombre} carpetas={carpetas} pais={pais} onError={setErrorMover} />}
      {doc.downloadUrl ? (
        <a
          href={doc.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Descargar"
          aria-label={`Descargar ${nombre}`}
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-[#525252] hover:bg-[#C8FF00] hover:text-[#2F4A00] transition-colors"
        >
          <Download className="w-4 h-4" />
        </a>
      ) : (
        <span
          title="Sin archivo"
          aria-label="Sin archivo"
          className="w-7 h-7 shrink-0 flex items-center justify-center text-[#C4C4C4]"
        >
          <Download className="w-4 h-4" />
        </span>
      )}
    </li>
  )
}

function DocumentList({ docs, carpetas, pais }: { docs: TranslatedDocument[]; carpetas?: readonly string[] | null; pais?: string | null }) {
  return (
    <ul className="space-y-1">
      {docs.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} carpetas={carpetas} pais={pais} />
      ))}
    </ul>
  )
}

/* ── Vista por estado (países sin carpetas) ───────────────────────────────── */

function VistaPorEstado({ documents }: { documents: TranslatedDocument[] }) {
  return (
    <div className="divide-y divide-[#EDEDED]">
      {DOC_STATUS_SECTIONS.map((section) => {
        const docs = documents.filter((d) => normalizeDocStatus(d.status) === section.key)
        if (docs.length === 0) return null
        return (
          <section key={section.key} className="pb-1.5 last:pb-0">
            <h4 className="my-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
              {section.title} ({docs.length})
            </h4>
            <DocumentList docs={docs} />
          </section>
        )
      })}
    </div>
  )
}

/* ── Vista por carpeta de ImmiAccount ─────────────────────────────────────── */

function BotonZip({ docs, carpeta, nombreCliente }: { docs: TranslatedDocument[]; carpeta: string; nombreCliente: string }) {
  const [progreso, setProgreso] = useState<{ hechos: number; total: number } | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'parcial'; texto: string } | null>(null)

  const descargar = async () => {
    setAviso(null)
    setProgreso({ hechos: 0, total: docs.length })
    try {
      const { faltaron } = await descargarCarpetaZip(
        docs.map((d) => d.id),
        nombreZip(nombreCliente, carpeta),
        (hechos, total) => setProgreso({ hechos, total }),
      )
      if (faltaron.length > 0) setAviso({ tipo: 'parcial', texto: `Zip sin: ${faltaron.join(', ')}` })
    } catch (err: any) {
      setAviso({ tipo: 'error', texto: err?.message || 'No se pudo armar el zip.' })
    } finally {
      // Pase lo que pase, el botón vuelve a quedar usable.
      setProgreso(null)
    }
  }

  return (
    <>
      {aviso && (
        <span
          role="status"
          title={aviso.texto}
          className={`hidden sm:block min-w-0 truncate text-[11px] ${aviso.tipo === 'error' ? 'text-red-700' : 'text-[#92400E]'}`}
        >
          {aviso.texto}
        </span>
      )}
      <button
        type="button"
        onClick={descargar}
        disabled={progreso !== null}
        title={aviso ? aviso.texto : `Descargar ${carpeta} (.zip)`}
        aria-label={`Descargar carpeta ${carpeta}`}
        className={`ml-auto shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium border bg-white hover:bg-[#F5F5F0] transition-colors disabled:opacity-70 ${
          aviso?.tipo === 'error' ? 'border-red-200 text-red-700' : aviso ? 'border-[#FDE68A] text-[#92400E]' : 'border-[#E5E5E5] text-[#0A0A0A]'
        }`}
      >
        {progreso ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
        {progreso ? (
          <span className="tabular-nums">{progreso.hechos}/{progreso.total}</span>
        ) : (
          <span className="hidden sm:inline">Descargar carpeta</span>
        )}
      </button>
    </>
  )
}

function SeccionCarpeta({
  titulo,
  docs,
  nombreCliente,
  carpetas,
  pais,
  sinClasificar = false,
}: {
  titulo: string
  docs: TranslatedDocument[]
  nombreCliente: string
  carpetas: readonly string[]
  pais?: string | null
  sinClasificar?: boolean
}) {
  const n = docs.length
  return (
    <section className={n > 0 ? 'pb-1' : undefined}>
      {/* Vacía = una sola línea más baja: se ve que falta, sin ocupar. */}
      <div className={`${n > 0 ? 'h-7' : 'h-6'} flex items-center gap-2 min-w-0`}>
        {sinClasificar ? (
          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#92400E]">
            {titulo}
          </span>
        ) : (
          <h4 className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]" title={titulo}>
            {titulo}
          </h4>
        )}
        <span className={`shrink-0 text-[11px] ${n === 0 ? 'text-[#B5B5B5]' : 'text-[#6B6B6B]'}`}>
          — {n} {n === 1 ? 'documento' : 'documentos'}
        </span>
        {n > 0 && <BotonZip docs={docs} carpeta={titulo} nombreCliente={nombreCliente} />}
      </div>
      {n > 0 && <DocumentList docs={docs} carpetas={carpetas} pais={pais} />}
    </section>
  )
}

function VistaPorCarpeta({
  documents,
  carpetas,
  nombreCliente,
  pais,
}: {
  documents: TranslatedDocument[]
  carpetas: readonly string[]
  nombreCliente: string
  pais?: string | null
}) {
  const ordenar = (docs: TranslatedDocument[]) =>
    [...docs].sort((a, b) => ORDEN_ESTADO[normalizeDocStatus(a.status)] - ORDEN_ESTADO[normalizeDocStatus(b.status)])

  // Lo que no calza exacto con una carpeta conocida no se pierde: va a "Sin clasificar".
  const conocidas = new Set(carpetas)
  const sinClasificar = documents.filter((d) => !d.carpeta || !conocidas.has(d.carpeta))

  const conteo = { traducido: 0, no_traducido: 0, error: 0 }
  for (const d of documents) conteo[normalizeDocStatus(d.status)] += 1
  const n = documents.length

  return (
    <div>
      <p className="py-1 text-[12px] leading-[18px] text-[#6B6B6B]">
        {n} {n === 1 ? 'documento' : 'documentos'} · {conteo.traducido} {conteo.traducido === 1 ? 'traducido' : 'traducidos'} ·{' '}
        {conteo.no_traducido} {conteo.no_traducido === 1 ? 'original' : 'originales'} · {conteo.error} con error
      </p>
      <div className="divide-y divide-[#EDEDED] border-t border-[#EDEDED]">
        {carpetas.map((carpeta) => (
          <SeccionCarpeta
            key={carpeta}
            titulo={carpeta}
            docs={ordenar(documents.filter((d) => d.carpeta === carpeta))}
            nombreCliente={nombreCliente}
            carpetas={carpetas}
            pais={pais}
          />
        ))}
        {sinClasificar.length > 0 && (
          <SeccionCarpeta
            titulo="Sin clasificar"
            docs={ordenar(sinClasificar)}
            nombreCliente={nombreCliente}
            carpetas={carpetas}
            pais={pais}
            sinClasificar
          />
        )}
      </div>
    </div>
  )
}

export function TranslatedDocuments({
  documents,
  pais,
  nombreCliente = 'Cliente',
  emptyMessage = 'Aún no hay documentos para esta solicitud.',
}: {
  documents: TranslatedDocument[]
  pais?: string | null
  // Para el nombre del zip: <Cliente>_<Carpeta>.zip
  nombreCliente?: string
  emptyMessage?: string
}) {
  const carpetas = carpetasDePais(pais)

  // Con carpetas se muestran aunque esté vacío: así se ve qué categoría falta.
  if (carpetas) return <VistaPorCarpeta documents={documents} carpetas={carpetas} nombreCliente={nombreCliente} pais={pais} />

  if (documents.length === 0) {
    return <p className="py-2 text-[13px] text-[#6B6B6B]">{emptyMessage}</p>
  }
  return <VistaPorEstado documents={documents} />
}
