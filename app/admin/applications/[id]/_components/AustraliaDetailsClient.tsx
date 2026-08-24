"use client"

import { useState } from 'react'
import { updateApplicationStatus, updateApplicationNotes, deleteApplication } from '../../../_actions/admin-actions'
import { useRouter } from 'next/navigation'
import { FileText, Save, Trash2, Loader2, ExternalLink, Copy, Download } from 'lucide-react'
import { formatCalendarDate } from '@/lib/dates'

interface SignedPhotoUrls {
  [key: string]: string | string[] | undefined
}

interface TranslatedDocument {
  id: string
  nombre_original: string
  nombre_archivo: string
  status: string
  created_at: string
  downloadUrl?: string
}

interface Props {
  application: any
  signedPhotoUrls: SignedPhotoUrls
  translatedDocuments: TranslatedDocument[]
}

function val(v: any): string {
  if (v === undefined || v === null || v === '') return '—'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  return String(v)
}

function bool(v: any): string {
  if (v === undefined || v === null || v === '') return '—'
  return v === true || v === 'true' ? 'Sí' : 'No'
}

function fmtDate(d: string | undefined): string {
  return formatCalendarDate(d)
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
      <span className="text-[#888] text-sm w-44 shrink-0">{label}</span>
      <span className="text-[#0A0A0A] text-sm font-medium flex-1">{value || '—'}</span>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6">
      <h3 className="text-base font-bold text-[#0A0A0A] border-b border-[#E5E5E5] pb-3 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function DocumentLink({ url, label }: { url: string | string[] | undefined; label: string }) {
  if (!url) return null
  const urls = Array.isArray(url) ? url : [url]
  if (urls.length === 0) return null
  
  return (
    <div className="mt-4 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl p-4 flex flex-col gap-3">
      <span className="text-sm font-medium text-[#0A0A0A]">📄 {label}</span>
      <div className="flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <a
            key={i}
            href={u}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#0A0A0A] bg-white border border-[#E5E5E5] px-3 py-1.5 rounded-lg hover:border-[#C8FF00] hover:text-[#C8FF00] transition-colors font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Documento {urls.length > 1 ? i + 1 : ''}
          </a>
        ))}
      </div>
    </div>
  )
}

function translatedStatusBadge(status: string) {
  const normalized = status || 'processing'
  const label =
    normalized === 'completed' ? 'Completado' :
    normalized === 'failed' ? 'Fallido' :
    'Procesando'
  const classes =
    normalized === 'completed' ? 'bg-[#C8FF00]/20 text-[#5B6A00]' :
    normalized === 'failed' ? 'bg-red-100 text-red-700' :
    'bg-blue-100 text-blue-700'
  return (
    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${classes}`}>
      {label}
    </span>
  )
}

export function AustraliaDetailsClient({ application, signedPhotoUrls, translatedDocuments }: Props) {
  const router = useRouter()
  const s = application || {}

  const [status, setStatus] = useState(application.status || 'nuevo')
  const [notes, setNotes] = useState(application.admin_notes || '')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [activeTab, setActiveTab] = useState<'datos' | 'cartas' | 'traducidos'>('datos')
  const [aiLetterStatus, setAiLetterStatus] = useState(application.ai_letter_status || 'pending')
  const [aiLetter, setAiLetter] = useState(application.ai_intention_letter || '')

  const handleCopy = () => {
    navigator.clipboard.writeText(aiLetter)
    alert('Carta copiada al portapapeles')
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsUpdatingStatus(true)
    try {
      await updateApplicationStatus(application.id, newStatus, 'australia')
    } catch {
      alert('Error al actualizar estado')
    }
    setIsUpdatingStatus(false)
  }

  const handleSaveNotes = async () => {
    setIsUpdatingNotes(true)
    try {
      await updateApplicationNotes(application.id, notes, 'australia')
    } catch {
      alert('Error al guardar notas')
    }
    setIsUpdatingNotes(false)
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer.')) {
      setIsDeleting(true)
      try {
        await deleteApplication(application.id, 'australia')
        router.push('/admin/solicitudes')
      } catch {
        alert('Error al eliminar')
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex border-b border-[#E5E5E5] gap-6 mb-6">
          <button
            onClick={() => setActiveTab('datos')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'datos' ? 'border-[#C8FF00] text-[#0A0A0A]' : 'border-transparent text-[#888] hover:text-[#0A0A0A]'}`}
          >
            Datos de Solicitud
          </button>
          <button
            onClick={() => setActiveTab('cartas')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'cartas' ? 'border-[#C8FF00] text-[#0A0A0A]' : 'border-transparent text-[#888] hover:text-[#0A0A0A]'}`}
          >
            Cartas
            {aiLetterStatus === 'generating' && <Loader2 className="w-3 h-3 animate-spin text-[#0A0A0A]" />}
          </button>
          <button
            onClick={() => setActiveTab('traducidos')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'traducidos' ? 'border-[#C8FF00] text-[#0A0A0A]' : 'border-transparent text-[#888] hover:text-[#0A0A0A]'}`}
          >
            Documentos Traducidos
          </button>
        </div>

        {activeTab === 'datos' ? (
          <>
            <SectionCard title="Contexto de Aplicación">
              <Row label="Stream" value={val(s.visa_stream)} />
              <Row label="Motivos de Visita" value={val(s.reasons_for_visit)} />
              <Row label="Fuera de Australia" value={bool(s.currently_outside_australia)} />
              <Row label="Ubicación Actual" value={val(s.current_location_country)} />
              <Row label="Fechas Significativas" value={val(s.significant_dates_details)} />
            </SectionCard>

            <SectionCard title="Identidad y Pasaporte">
              <Row label="Apellidos" value={val(s.family_name)} />
              <Row label="Nombres" value={val(s.given_names)} />
              <Row label="Género" value={val(s.sex)} />
              <Row label="Nacimiento" value={fmtDate(s.date_of_birth)} />
              <Row label="Lugar de Nac." value={`${val(s.birth_town_city)}, ${val(s.birth_state_province)}, ${val(s.country_of_birth)}`} />
              <Row label="Nacionalidad" value={val(s.nationality_passport_holder)} />
              <Row label="Pasaporte" value={val(s.passport_number)} />
              <Row label="Emisión" value={fmtDate(s.passport_issue_date)} />
              <Row label="Expiración" value={fmtDate(s.passport_expiry_date)} />
            </SectionCard>

            <SectionCard title="Contacto">
              <Row label="Email" value={val(s.email)} />
              <Row label="Teléfono" value={val(s.phone_mobile)} />
              <Row label="Dirección" value={`${val(s.res_address)}, ${val(s.res_suburb)}, ${val(s.res_state)}, ${val(s.res_country)}`} />
            </SectionCard>

            <SectionCard title="Empleo y Finanzas">
              <Row label="Estado Laboral" value={val(s.employment_status)} />
              <Row label="Ocupación" value={val(s.occupation)} />
              <Row label="Empleador" value={val(s.employer_name)} />
              <Row label="Tipo de Fondo" value={val(s.funding_type)} />
              <Row label="Detalles Financieros" value={val(s.funds_available_details)} />
            </SectionCard>

            
            <SectionCard title="Identidad Adicional (ID Nacional)">
              <Row label="Nombres (ID)" value={val(s.nid_given_names)} />
              <Row label="Apellidos (ID)" value={val(s.nid_family_name)} />
              <Row label="Número ID" value={val(s.nid_number)} />
              <Row label="País Emisión" value={val(s.nid_country_of_issue)} />
              <Row label="Emisión" value={fmtDate(s.nid_issue_date)} />
              <Row label="Expiración" value={fmtDate(s.nid_expiry_date)} />
            </SectionCard>

            <SectionCard title="Documentos - Grupo 1: Arraigo">
              <DocumentLink url={signedPhotoUrls.doc_group1_arraigo} label="Documentos de arraigo" />
            </SectionCard>

            <SectionCard title="Documentos - Grupo 2: Fondos y Financiación">
              <DocumentLink url={signedPhotoUrls.doc_group2_fondos} label="Documentos de fondos y financiación" />
            </SectionCard>

            <SectionCard title="Documentos - Grupo 3: Viajes y otros">
              <DocumentLink url={signedPhotoUrls.doc_group3_viajes} label="Documentos de viajes anteriores" />
              <DocumentLink url={signedPhotoUrls.doc_national_id_url} label="Documento Nacional (ID)" />
            </SectionCard>
          </>

        ) : activeTab === 'cartas' ? (
          <SectionCard title="Carta de Intención">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                  aiLetterStatus === 'completed' ? 'bg-[#C8FF00]/20 text-[#5B6A00]' :
                  aiLetterStatus === 'generating' ? 'bg-blue-100 text-blue-700' :
                  aiLetterStatus === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {aiLetterStatus === 'completed' ? 'Completada' :
                   aiLetterStatus === 'generating' ? 'Generando' :
                   aiLetterStatus === 'failed' ? 'Fallida' : 'Pendiente'}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} disabled={!aiLetter} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#0A0A0A] bg-[#C8FF00] rounded-md hover:bg-[#b8ef00] disabled:opacity-50">
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
            </div>

            {(aiLetterStatus === 'pending' || aiLetterStatus === 'generating') && !aiLetter ? (
              <div className="flex flex-col items-center justify-center p-12 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00] mb-4" />
                <p className="text-sm font-medium text-[#0A0A0A]">Generando carta con IA...</p>
              </div>
            ) : aiLetter ? (
              <div className="p-6 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl text-sm text-[#0A0A0A] whitespace-pre-wrap font-serif leading-relaxed h-[600px] overflow-y-auto shadow-inner">
                {aiLetter}
              </div>
            ) : (
              <div className="p-6 bg-[#FEF2F2] border border-red-200 rounded-xl text-sm text-red-700">
                Ocurrió un error al generar la carta.
              </div>
            )}
          </SectionCard>
        ) : (
          <SectionCard title="Documentos Traducidos">
            {translatedDocuments.length === 0 ? (
              <div className="p-6 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl text-sm text-[#525252] text-center">
                Aún no hay documentos traducidos para esta solicitud.
              </div>
            ) : (
              <div className="space-y-3">
                {translatedDocuments.map((doc) => (
                  <div key={doc.id} className="bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5E5] shrink-0 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#3D5A00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{doc.nombre_archivo || doc.nombre_original}</p>
                      <p className="text-xs text-[#888] mt-0.5">{fmtDate(doc.created_at)}</p>
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
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 space-y-4">
          <h3 className="font-bold text-lg border-b border-[#E5E5E5] pb-2">Gestión (Australia)</h3>
          <div>
            <label className="block text-sm font-medium text-[#525252] mb-1">Estado de solicitud</label>
            <select
              value={status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
            >
              <option value="nuevo">Nuevo</option>
              <option value="pending">Pendiente</option>
              <option value="in-progress">En Proceso</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 space-y-3">
          <h3 className="font-bold text-lg border-b border-[#E5E5E5] pb-2">Notas Internas</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anotaciones sobre este cliente..."
            className="w-full h-32 bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
          />
          <button
            onClick={handleSaveNotes}
            disabled={isUpdatingNotes}
            className="w-full flex items-center justify-center gap-2 bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] py-2 rounded-lg text-sm font-medium hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
          >
            {isUpdatingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Notas
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 space-y-4">
          <div className="text-xs text-[#525252] space-y-1 border-b border-[#E5E5E5] pb-4">
            <p><strong>ID:</strong> <span className="font-mono break-all">{application.id}</span></p>
            <p><strong>Recibida:</strong> {fmtDate(application.created_at)}</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 text-[#DC2626] py-2 rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar Solicitud
          </button>
        </div>
      </div>
    </div>
  )
}
