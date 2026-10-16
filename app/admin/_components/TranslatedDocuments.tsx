"use client"

import { Download } from 'lucide-react'
import { normalizeDocStatus, type DocStatus, type TranslatedDocument } from '@/lib/traducciones/shared'

/* Bloque de documentos traducidos. Lo comparten la ficha de una solicitud del
   formulario (AustraliaDetailsClient) y el detalle de un lote de traducción
   manual: las dos leen las mismas filas de `documentos_traducidos` y las
   agrupan igual, así que el markup vive en un solo lado.

   Es denso a propósito: una línea de 36px por documento, para que un lote de
   12 quepa entero en una pantalla de portátil. No dibuja tarjeta propia; la
   pone quien lo usa. */

const DOC_STATUS_SECTIONS: { key: DocStatus; title: string }[] = [
  { key: 'traducido', title: 'Traducidos' },
  { key: 'no_traducido', title: 'No traducidos' },
  { key: 'error', title: 'Con error' },
]

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

function DocumentRow({ doc, sectionKey }: { doc: TranslatedDocument; sectionKey: DocStatus }) {
  const nombre = doc.nombre_archivo || doc.nombre_original
  const motivo = sectionKey !== 'traducido' ? doc.motivo : null
  return (
    <li className="h-9 flex items-center gap-3 px-2 -mx-2 rounded-md hover:bg-[#F5F5F0] transition-colors">
      {/* El nombre manda; el motivo usa lo que sobre y se corta antes. */}
      <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
        <span className="shrink-0 max-w-full truncate text-[13px] text-[#0A0A0A]" title={nombre}>
          {nombre}
        </span>
        {motivo && (
          <span
            className={`hidden sm:block min-w-0 truncate text-[11px] ${sectionKey === 'error' ? 'text-red-700' : 'text-[#6B6B6B]'}`}
            title={motivo}
          >
            · {motivo}
          </span>
        )}
      </div>
      {translatedStatusBadge(doc.status)}
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

export function TranslatedDocuments({
  documents,
  emptyMessage = 'Aún no hay documentos para esta solicitud.',
}: {
  documents: TranslatedDocument[]
  emptyMessage?: string
}) {
  if (documents.length === 0) {
    return <p className="py-2 text-[13px] text-[#6B6B6B]">{emptyMessage}</p>
  }

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
            <ul className="space-y-1">
              {docs.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} sectionKey={section.key} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
