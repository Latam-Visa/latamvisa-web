"use client"

import { useState } from 'react'
import { updateApplicationStatus, updateApplicationNotes, deleteApplication } from '../../../_actions/admin-actions'
import { useRouter } from 'next/navigation'
import { FileText, Save, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SignedPhotoUrls {
  docIdPassport?: string
  docTies?: string
  docBankStatements?: string
  docTravelItinerary?: string
  docFormsLetters?: string
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

function DocumentLink({ url, label }: { url: string; label: string }) {
  return (
    <div className="mt-4 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl p-4 flex items-center justify-between">
      <span className="text-sm font-medium text-[#0A0A0A]">📄 {label}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-[#0A0A0A] bg-white border border-[#E5E5E5] px-3 py-1.5 rounded-lg hover:border-[#C8FF00] hover:text-[#C8FF00] transition-colors font-medium"
      >
        <ExternalLink className="w-4 h-4" />
        Ver Documento
      </a>
    </div>
  )
}

export function CanadaDetailsClient({ application, signedPhotoUrls }: Props) {
  const router = useRouter()
  const d = application.data || {}
  const s1 = d.step1 || {}
  const s2 = d.step2 || {}
  const s3 = d.step3 || {}
  const s4 = d.step4 || {}
  const s5 = d.step5 || {}
  const s6 = d.step6 || {}
  const s7 = d.step7 || {}
  const s8 = d.step8 || {}
  const s9 = d.step9 || {}
  const s10 = d.step10 || {}

  const [status, setStatus] = useState(application.status || 'nuevo')
  const [notes, setNotes] = useState(application.admin_notes || '')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Fake state for PDF generator (Canada doesn't have it yet, we just stub it to not break UI)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

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
        router.push('/admin')
      } catch {
        alert('Error al eliminar')
        setIsDeleting(false)
      }
    }
  }

  const handlePdfClick = async () => {
    alert('La generación de PDF para Canadá aún no está implementada.')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="lg:col-span-2 space-y-6">

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
          </div>
        </SectionCard>

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

          <button
            onClick={handlePdfClick}
            disabled={isGeneratingPdf}
            className="w-full flex items-center justify-center gap-2 bg-[#C8FF00] text-black py-2 rounded-lg text-sm font-bold hover:bg-[#b8ef00] transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> Generar PDF
          </button>
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
