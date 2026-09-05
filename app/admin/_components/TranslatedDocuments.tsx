"use client"

import { FileText, Download } from 'lucide-react'
import { normalizeDocStatus, type DocStatus, type TranslatedDocument } from '@/lib/traducciones/shared'

/* Bloque de documentos traducidos. Lo comparten la ficha de una solicitud del
   formulario (AustraliaDetailsClient) y el detalle de un lote de traducción
   manual: las dos leen las mismas filas de `documentos_traducidos` y las
   agrupan igual, así que el markup vive en un solo lado. */

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
    normalized === 'traducido' ? 'bg-[#C8FF00]/20 text-[#5B6A00]' :
    normalized === 'no_traducido' ? 'bg-[#E9EEF2] text-[#4B5A66]' :
    'bg-red-100 text-red-700'
  return (
    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded shrink-0 ${classes}`}>
      {label}
    </span>
  )
}

function DocumentRow({ doc, sectionKey }: { doc: TranslatedDocument; sectionKey: DocStatus }) {
  const showMotivo = sectionKey !== 'traducido' && !!doc.motivo
  return (
    <div className="bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl p-4 flex flex-wrap items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5E5] shrink-0 flex items-center justify-center">
        <FileText className="w-5 h-5 text-[#3D5A00]" />
      </div>
      <div className="flex-1 min-w-0 basis-full sm:basis-0">
        <p className="text-sm font-medium text-[#0A0A0A] break-words">{doc.nombre_archivo || doc.nombre_original}</p>
        {showMotivo && (
          <p className={`text-xs mt-0.5 break-words ${sectionKey === 'error' ? 'text-red-700' : 'text-[#888]'}`}>
            {doc.motivo}
          </p>
        )}
      </div>
      {translatedStatusBadge(doc.status)}
      {doc.downloadUrl ? (
        <a
          href={doc.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#0A0A0A] bg-white border border-[#E5E5E5] px-3 py-1.5 rounded-lg hover:border-[#C8FF00] hover:text-[#C8FF00] transition-colors font-medium shrink-0"
        >
          <Download className="w-4 h-4" />
          Descargar
        </a>
      ) : (
        <span className="text-xs text-[#888] shrink-0">Sin archivo</span>
      )}
    </div>
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
    return (
      <div className="p-6 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl text-sm text-[#525252] text-center">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {DOC_STATUS_SECTIONS.map((section) => {
        const docs = documents.filter((d) => normalizeDocStatus(d.status) === section.key)
        if (docs.length === 0) return null
        return (
          <div key={section.key}>
            <h4 className="text-sm font-bold text-[#0A0A0A] mb-3">
              {section.title} <span className="text-[#888] font-medium">({docs.length})</span>
            </h4>
            <div className="space-y-3">
              {docs.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} sectionKey={section.key} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
