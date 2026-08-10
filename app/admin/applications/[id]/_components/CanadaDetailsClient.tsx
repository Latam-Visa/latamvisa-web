"use client"

import { useState } from 'react'
import { updateApplicationStatus, updateApplicationNotes, deleteApplication } from '../../../_actions/admin-actions'
import { useRouter } from 'next/navigation'
import { FileText, Save, Trash2, Loader2, ExternalLink, Copy } from 'lucide-react'
// import { generateIntentionLetterBg } from '@/app/aplicar/turismo-canada/_actions/generate-intention-letter'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SignedPhotoUrls {
  docIdPassport?: string | string[]
  docTies?: string | string[]
  docBankStatements?: string | string[]
  docTravelItinerary?: string | string[]
  docFormsLetters?: string | string[]
  docUsVisa?: string | string[]
}

interface Props {
  application: any
  signedPhotoUrls: SignedPhotoUrls
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
  if (!d) return '—'
  try {
    return format(new Date(d), "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return d
  }
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

function DocumentLink({ url, label }: { url: string | string[]; label: string }) {
  const urls = Array.isArray(url) ? url : [url]
  
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

export function CanadaDetailsClient({ application, signedPhotoUrls }: Props) {
  const router = useRouter()
  const s1 = application || {}
  const s2 = application || {}
  const s3 = application || {}
  const s4 = application || {}
  const s5 = application || {}
  const s6 = application || {}
  const s7 = application || {}
  const s8 = application || {}
  const s9 = application || {}
  const s10 = application || {}

  const [status, setStatus] = useState(application.status || 'nuevo')
  const [notes, setNotes] = useState(application.admin_notes || '')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  

  const [activeTab, setActiveTab] = useState<'datos' | 'cartas'>('datos')
  const [aiLetterStatus, setAiLetterStatus] = useState(application.ai_letter_status || 'pending')
  const [aiLetter, setAiLetter] = useState(application.ai_intention_letter || '')
  const [aiLetterGeneratedAt, setAiLetterGeneratedAt] = useState(application.ai_letter_generated_at || null)

  const handleRegenerateLetter = async () => {
    setAiLetterStatus('generating')
    try {
      const response = await fetch('/api/admin/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id, destination: 'canada' })
      })
      const res = await response.json()
      if (res.success) {
        setAiLetter(res.letter)
        setAiLetterStatus('completed')
        setAiLetterGeneratedAt(new Date().toISOString())
      } else {
        alert(res.error || 'Error al generar la carta')
        setAiLetterStatus('failed')
      }
    } catch (e) {
      alert('Error de red al intentar generar la carta')
      setAiLetterStatus('failed')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(aiLetter)
    alert('Carta copiada al portapapeles')
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsUpdatingStatus(true)
    try {
      await updateApplicationStatus(application.id, newStatus, 'canada')
    } catch {
      alert('Error al actualizar estado')
    }
    setIsUpdatingStatus(false)
  }

  const handleSaveNotes = async () => {
    setIsUpdatingNotes(true)
    try {
      await updateApplicationNotes(application.id, notes, 'canada')
    } catch {
      alert('Error al guardar notas')
    }
    setIsUpdatingNotes(false)
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer.')) {
      setIsDeleting(true)
      try {
        await deleteApplication(application.id, 'canada')
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
        </div>

        {activeTab === 'datos' ? (
          <>
            <SectionCard title="Paso 1 — Detalles de Visita">
          <Row label="Visa que aplica" value={val(s1.apply_for)} />
          <Row label="Motivo" value={val(s1.visa_reason)} />
          <Row label="Actividades" value={val(s1.activities_in_canada)} />
          <Row label="Fecha entrada" value={fmtDate(s1.entry_date)} />
          <Row label="Fecha salida" value={fmtDate(s1.leave_date)} />
          <Row label="UCI (Si tiene)" value={val(s1.uci)} />
          <Row label="Aplica en nombre de otro" value={bool(s1.applying_on_behalf)} />
        </SectionCard>

        <SectionCard title="Paso 2 — Personal">
          <Row label="Apellidos" value={val(s2.surname)} />
          <Row label="Nombres" value={val(s2.given_name)} />
          <Row label="Fecha de nacimiento" value={fmtDate(s2.date_of_birth)} />
          <Row label="Género" value={val(s2.gender)} />
          <Row label="Pasaporte" value={val(s2.passport_number)} />
          <Row label="Emisión" value={fmtDate(s2.passport_issue_date)} />
          <Row label="Expiración" value={fmtDate(s2.passport_expiry_date)} />
          <Row label="¿Green card?" value={bool(s2.us_green_card)} />
          <Row label="¿Visa canadiense (10a)?" value={bool(s2.held_canadian_visa_10y)} />
          <Row label="¿Visa USA actual?" value={bool(s2.holds_us_nonimmigrant_visa)} />
          {s2.holds_us_nonimmigrant_visa === 'true' && (
            <>
              <Row label="Número Visa USA" value={val(s2.us_visa_number)} />
              <Row label="Exp. Visa USA" value={fmtDate(s2.us_visa_expiry)} />
            </>
          )}
          <Row label="¿Viaja por aire?" value={bool(s2.travelling_by_air)} />
        </SectionCard>

        <SectionCard title="Paso 3 — Ciudadanía y Nacimiento">
          <Row label="País de nacimiento" value={val(s3.birth_country)} />
          <Row label="Ciudad de nacimiento" value={val(s3.birth_city)} />
          <Row label="Ciudadanía principal" value={val(s3.citizenship_country)} />
          <Row label="¿Ciudadano desde nac.?" value={bool(s3.citizen_since_birth)} />
          <Row label="¿Tiene ID nacional?" value={bool(s3.has_national_id)} />
          {s3.has_national_id === 'true' && (
            <>
              <Row label="Número ID" value={val(s3.national_id_number)} />
              <Row label="Emisión ID" value={fmtDate(s3.national_id_issue_date)} />
            </>
          )}
          
          {Array.isArray(s3.other_names) && s3.other_names.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Otros nombres</p>
              <div className="space-y-2">
                {s3.other_names.map((n: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium">{val(n.given_name)} {val(n.surname)}</span> ({val(n.type)})
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Paso 4 — Direcciones">
          <Row label="País de residencia" value={val(s4.residential_country)} />
          <Row label="Ciudad" value={val(s4.residential_city)} />
          <Row label="Dirección" value={val(s4.residential_street)} />
          
          {Array.isArray(s4.residence_history) && s4.residence_history.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Historial Residencial</p>
              <div className="space-y-2">
                {s4.residence_history.map((h: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <div><span className="font-medium">{val(h.country)}</span> ({fmtDate(h.from)} a {fmtDate(h.to)})</div>
                    <div className="text-[#888]">Estatus: {val(h.status)} {h.status_other_detail ? `- ${h.status_other_detail}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Row label="¿Biométricos recientes?" value={bool(s4.provided_biometrics_10y)} />
        </SectionCard>

        <SectionCard title="Paso 5 — Finanzas y Ocupación">
          <Row label="Fondos (CAD)" value={val(s5.funds_cad)} />
          <Row label="¿Alguien más financia?" value={bool(s5.someone_else_funding)} />

          {Array.isArray(s5.education_history) && s5.education_history.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Historial Educativo</p>
              <div className="space-y-2">
                {s5.education_history.map((h: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <div className="font-medium">{val(h.school)} ({val(h.level)})</div>
                    <div className="text-[#888]">{val(h.field)} · {val(h.city)}, {val(h.country)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(s5.work_history) && s5.work_history.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Historial Laboral</p>
              <div className="space-y-2">
                {s5.work_history.map((h: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <div className="font-medium">{val(h.job_title)} en {val(h.employer)}</div>
                    <div className="text-[#888]">{fmtDate(h.from)} a {h.ongoing ? 'Actualidad' : fmtDate(h.to)}</div>
                    <div className="text-[#888]">Actividad: {val(h.activity)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Paso 6 — Viajes">
          <Row label="¿Viajado últ. 5 años?" value={bool(s6.travelled_past_5y)} />
          {Array.isArray(s6.travel_history) && s6.travel_history.length > 0 && (
            <div className="mt-3">
              <div className="space-y-2">
                {s6.travel_history.map((h: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <div><span className="font-medium">{val(h.country)}</span> ({fmtDate(h.from)} a {fmtDate(h.to)})</div>
                    <div className="text-[#888]">Motivo: {val(h.purpose)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Row label="¿Estancia ilegal CAN?" value={bool(s6.stayed_illegally_canada)} />
          <Row label="¿Visa denegada antes?" value={bool(s6.refused_visa)} />
          {s6.refused_visa === 'true' && <Row label="Detalles denegación" value={val(s6.refusal_details)} />}
        </SectionCard>

        <SectionCard title="Paso 7 & 8 — Seguridad y Médicos">
          <div className="text-sm space-y-2 bg-[#FEF2F2] p-4 rounded-lg text-[#DC2626]">
            {s7.committed_crime === 'true' && <p>⚠️ Tiene antecedentes de crímenes.</p>}
            {s7.arrested === 'true' && <p>⚠️ Ha sido arrestado.</p>}
            {s7.charged === 'true' && <p>⚠️ Ha sido acusado de un delito.</p>}
            {s7.convicted === 'true' && <p>⚠️ Ha sido condenado.</p>}
            {s8.medical_exam_12m === 'true' && <p>⚠️ Examen médico reciente (Canadá).</p>}
            {s8.tb_diagnosed_2y === 'true' && <p>⚠️ TB Diagnosticada últimos 2 años.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Paso 9 — Familia">
          <Row label="Estado Civil" value={val(s9.marital_status)} />
          {s9.spouse_surname && (
            <>
              <Row label="Nombre cónyuge" value={`${s9.spouse_given_name} ${s9.spouse_surname}`} />
              <Row label="Nac. cónyuge" value={fmtDate(s9.spouse_date_of_birth)} />
            </>
          )}

          {Array.isArray(s9.children) && s9.children.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Hijos</p>
              <div className="space-y-2">
                {s9.children.map((c: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium">{val(c.first_name)} {val(c.last_name)}</span> - {fmtDate(c.dob)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(s9.parents) && s9.parents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Padres</p>
              <div className="space-y-2">
                {s9.parents.map((p: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <div><span className="font-medium">{val(p.given_name)} {val(p.surname)}</span> ({val(p.relationship)})</div>
                    <div className="text-[#888]">{val(p.occupation)} · {val(p.country)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Paso 10 — Idiomas y Documentos">
          <Row label="Idioma Nativo" value={val(s10.native_language)} />
          <Row label="Email" value={val(s10.email)} />
          {Array.isArray(s10.phones) && s10.phones.length > 0 && (
            <div className="mt-3 space-y-1">
              {s10.phones.map((p: any, i: number) => (
                <Row key={i} label={`Tel. ${p.type}`} value={`${p.dial_code} ${p.number}`} />
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
            <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Documentos Subidos</p>
            {signedPhotoUrls.docIdPassport && <DocumentLink url={signedPhotoUrls.docIdPassport} label="Pasaporte" />}
            {signedPhotoUrls.docTies && <DocumentLink url={signedPhotoUrls.docTies} label="Lazos y arraigo" />}
            {signedPhotoUrls.docBankStatements && <DocumentLink url={signedPhotoUrls.docBankStatements} label="Extractos Bancarios" />}
            {signedPhotoUrls.docTravelItinerary && <DocumentLink url={signedPhotoUrls.docTravelItinerary} label="Itinerario" />}
            {signedPhotoUrls.docFormsLetters && <DocumentLink url={signedPhotoUrls.docFormsLetters} label="Cartas Adicionales" />}
            {signedPhotoUrls.docUsVisa && <DocumentLink url={signedPhotoUrls.docUsVisa} label="Visa Americana" />}
          </div>
        </SectionCard>
          </>
        ) : (
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
                {aiLetterGeneratedAt && (
                  <span className="text-xs text-[#888]">
                    Generada el {format(new Date(aiLetterGeneratedAt), "d MMM yyyy, HH:mm", { locale: es })}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleRegenerateLetter} disabled={aiLetterStatus === 'generating'} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#0A0A0A] bg-white border border-[#E5E5E5] rounded-md hover:bg-gray-50 disabled:opacity-50">
                  {aiLetterStatus === 'generating' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                  Regenerar carta
                </button>
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
                <p className="text-xs text-[#888] mt-2 text-center max-w-sm">Esto puede tardar unos 15 a 30 segundos mientras analizamos el perfil y redactamos la intención.</p>
              </div>
            ) : aiLetter ? (
              <div className="p-6 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl text-sm text-[#0A0A0A] whitespace-pre-wrap font-serif leading-relaxed h-[600px] overflow-y-auto shadow-inner">
                {aiLetter}
              </div>
            ) : (
              <div className="p-6 bg-[#FEF2F2] border border-red-200 rounded-xl text-sm text-red-700">
                Ocurrió un error al generar la carta. Por favor intenta regenerarla.
              </div>
            )}
          </SectionCard>
        )}

      </div>

      {/* Right column — actions */}
      <div className="space-y-6">

        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 space-y-4">
          <h3 className="font-bold text-lg border-b border-[#E5E5E5] pb-2">Gestión (Canadá)</h3>

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
            <p><strong>Recibida:</strong> {format(new Date(application.created_at), "d MMM yyyy, HH:mm", { locale: es })}</p>
            <p><strong>IP:</strong> {application.ip_address || '—'}</p>
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
