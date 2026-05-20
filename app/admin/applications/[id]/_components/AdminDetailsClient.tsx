"use client"

import { useState } from 'react'
import { updateApplicationStatus, updateApplicationNotes, deleteApplication } from '../../../_actions/admin-actions'
import { generateApplicationPdfAction } from '../_actions/generate-pdf'
import { useRouter } from 'next/navigation'
import { FileText, Save, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SignedPhotoUrls {
  passport?: string
  visaPhoto?: string
  previousVisa?: string
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

function PhotoThumbnail({ url, label }: { url: string; label: string }) {
  return (
    <div className="mt-4 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl p-4">
      <p className="text-xs font-semibold text-[#525252] mb-3 uppercase tracking-wide">📸 {label}</p>
      <div className="flex items-start gap-4">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="w-28 h-28 object-cover rounded-lg border border-[#E5E5E5] hover:opacity-80 transition-opacity cursor-pointer"
          />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#0A0A0A] hover:text-[#C8FF00] transition-colors font-medium mt-1"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir en tamaño completo
        </a>
      </div>
    </div>
  )
}

export function AdminDetailsClient({ application, signedPhotoUrls }: Props) {
  const router = useRouter()
  const d = application.data || {}
  const c = d.step1Contact || {}
  const p = d.step2Personal || {}
  const pas = d.step3Passport || {}
  const t = d.step4Travel || {}
  const v = d.step5VisaHistory || {}
  const f = d.step6Family || {}
  const w = d.step7Work || {}
  const a = d.step8Additional || {}

  const [status, setStatus] = useState(application.status)
  const [notes, setNotes] = useState(application.admin_notes || '')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [hasPdfUrl, setHasPdfUrl] = useState(!!application.pdf_url)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsUpdatingStatus(true)
    try {
      await updateApplicationStatus(application.id, newStatus)
    } catch {
      alert('Error al actualizar estado')
    }
    setIsUpdatingStatus(false)
  }

  const handleSaveNotes = async () => {
    setIsUpdatingNotes(true)
    try {
      await updateApplicationNotes(application.id, notes)
    } catch {
      alert('Error al guardar notas')
    }
    setIsUpdatingNotes(false)
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer.')) {
      setIsDeleting(true)
      try {
        await deleteApplication(application.id)
        router.push('/admin')
      } catch {
        alert('Error al eliminar')
        setIsDeleting(false)
      }
    }
  }

  const handlePdfClick = async () => {
    setIsGeneratingPdf(true)
    try {
      const result = await generateApplicationPdfAction(application.id)
      if (result.success && result.url) {
        setHasPdfUrl(true)
        window.open(result.url, '_blank')
      } else {
        alert(result.error || 'No pudimos generar el PDF')
      }
    } catch {
      alert('Error inesperado al generar PDF')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left column — all data sections */}
      <div className="lg:col-span-2 space-y-6">

        {/* Paso 1 */}
        <SectionCard title="Paso 1 — Información de Contacto">
          <Row label="Nombre completo" value={val(c.fullName)} />
          <Row label="Email" value={val(c.email)} />
          <Row label="WhatsApp" value={val(c.whatsapp)} />
          <Row label="País de residencia" value={val(c.currentCountry)} />
          <Row label="Ciudad" value={val(c.currentCity)} />
          <Row label="Dirección" value={val(c.currentAddress)} />
          <Row label="Código postal" value={val(c.currentPostcode)} />
          <Row label="Visa actual" value={val(c.currentVisaType)} />
          {c.currentVisaOther && <Row label="Visa actual (otro)" value={val(c.currentVisaOther)} />}
          <Row label="Redes sociales" value={val(c.socialMedia)} />
        </SectionCard>

        {/* Paso 2 */}
        <SectionCard title="Paso 2 — Información Personal">
          <Row label="Género" value={val(p.gender)} />
          <Row label="Estado civil" value={val(p.maritalStatus)} />
          <Row label="Fecha de nacimiento" value={fmtDate(p.dateOfBirth)} />
          <Row label="Ciudad de nacimiento" value={val(p.cityOfBirth)} />
          <Row label="Estado/Provincia nac." value={val(p.stateOfBirth)} />
          <Row label="Nacionalidad" value={val(p.nationality)} />
          <Row label="N° identificación" value={val(p.identificationNumber)} />
          {(p.maritalStatus === 'Casado(a)' || p.maritalStatus === 'Unión libre') && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Datos del Cónyuge</p>
              <Row label="Apellidos" value={val(p.spouseSurnames)} />
              <Row label="Nombres" value={val(p.spouseGivenNames)} />
              <Row label="Fecha Nacimiento" value={fmtDate(p.spouseDateOfBirth)} />
              <Row label="Nacionalidad" value={val(p.spouseNationality)} />
              <Row label="Ciudad Nac." value={val(p.spouseBirthCity)} />
              <Row label="País Nac." value={val(p.spouseBirthCountry)} />
            </div>
          )}
        </SectionCard>

        {/* Paso 3 */}
        <SectionCard title="Paso 3 — Pasaporte">
          <Row label="Número de pasaporte" value={val(pas.passportNumber)} />
          <Row label="Fecha de emisión" value={fmtDate(pas.passportIssueDate)} />
          <Row label="Fecha de expiración" value={fmtDate(pas.passportExpiryDate)} />
          <Row label="País de emisión" value={val(pas.passportIssueCountry)} />
          <Row label="¿Perdido o robado?" value={bool(pas.passportLostStolen)} />
          {(pas.passportLostStolen === true || pas.passportLostStolen === 'true') && (
            <Row label="Detalles pérdida/robo" value={val(pas.passportLostDetails)} />
          )}
          {signedPhotoUrls.passport
            ? <PhotoThumbnail url={signedPhotoUrls.passport} label="Foto del pasaporte" />
            : <p className="mt-4 text-sm text-[#DC2626] bg-[#FFF0F0] rounded-lg px-4 py-3">⚠️ Foto de pasaporte no subida</p>
          }
        </SectionCard>

        {/* Paso 4 */}
        <SectionCard title="Paso 4 — Viaje a USA">
          <Row label="Tipo de visa" value={val(t.usaVisaType)} />
          <Row label="Fecha llegada estimada" value={fmtDate(t.arrivalDate)} />
          <Row label="Fecha salida estimada" value={fmtDate(t.departureDate)} />
          <Row label="Ciudades a visitar" value={val(t.citiesToVisit)} />
          <Row label="¿Quién paga?" value={val(t.tripPaidBy)} />
          {t.tripPayerDetails && <Row label="Detalles del pagador" value={val(t.tripPayerDetails)} />}
          {Array.isArray(t.accommodation) && t.accommodation.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Alojamiento</p>
              <div className="space-y-2">
                {t.accommodation.map((ac: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <span className="text-[#888]">Tipo:</span> <span className="font-medium">{val(ac.type)}</span>
                    <span className="mx-2 text-[#CCC]">·</span>
                    <span className="text-[#888]">Dirección:</span> <span className="font-medium">{val(ac.address)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(t.touristPlaces) && t.touristPlaces.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Lugares a visitar</p>
              <div className="space-y-2">
                {t.touristPlaces.map((tp: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium">{val(tp.place)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3">
            <Row label="¿Viaja con alguien?" value={bool(t.travelsWithOthers)} />
          </div>
          {Array.isArray(t.travelCompanions) && t.travelCompanions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Acompañantes</p>
              <div className="space-y-2">
                {t.travelCompanions.map((tc: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium">{val(tc.fullName)}</span>
                    <span className="mx-2 text-[#CCC]">·</span>
                    <span className="text-[#888]">{val(tc.relationship)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(t.usaContactGivenNames || t.usaContactSurnames || t.usaContactOrganization) && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Contacto en USA</p>
              <Row label="Nombres" value={val(t.usaContactGivenNames)} />
              <Row label="Apellidos" value={val(t.usaContactSurnames)} />
              <Row label="Organización" value={val(t.usaContactOrganization)} />
              <Row label="Relación" value={val(t.usaContactRelationship)} />
            </div>
          )}
        </SectionCard>

        {/* Paso 5 */}
        <SectionCard title="Paso 5 — Historial de Visas USA">
          <Row label="¿Visa negada antes?" value={bool(v.visaDeniedBefore)} />
          {(v.visaDeniedBefore === true || v.visaDeniedBefore === 'true') && (
            <Row label="Detalles negación" value={val(v.visaDeniedDetails)} />
          )}
          <Row label="¿Tuvo visa USA previa?" value={bool(v.hadPreviousUsaVisa)} />
          {(v.hadPreviousUsaVisa === true || v.hadPreviousUsaVisa === 'true') && (
            <>
              <Row label="Detalles visa previa" value={val(v.previousVisaDetails)} />
              <Row label="Número visa previa" value={val(v.previousVisaNumber)} />
              <Row label="Emisión visa previa" value={fmtDate(v.previousVisaIssueDate)} />
              <Row label="Expiración visa previa" value={fmtDate(v.previousVisaExpiryDate)} />
              <Row label="¿Licencia USA?" value={bool(v.hadUsDriversLicense)} />
              <Row label="¿Huellas registradas?" value={bool(v.fingerprintedBefore)} />
              {signedPhotoUrls.previousVisa && (
                <PhotoThumbnail url={signedPhotoUrls.previousVisa} label="Foto de visa anterior" />
              )}
            </>
          )}
        </SectionCard>

        {/* Paso 6 */}
        <SectionCard title="Paso 6 — Familia">
          <Row label="Nombre del padre" value={val(f.fatherFullName)} />
          <Row label="Nacionalidad del padre" value={val(f.fatherNationality)} />
          <Row label="Nac. padre" value={fmtDate(f.fatherDateOfBirth)} />
          <Row label="Nombre de la madre" value={val(f.motherFullName)} />
          <Row label="Nacionalidad de la madre" value={val(f.motherNationality)} />
          <Row label="Nac. madre" value={fmtDate(f.motherDateOfBirth)} />
          <Row label="¿Familia en USA?" value={bool(f.familyInUsa)} />
          {Array.isArray(f.familyInUsaDetails) && f.familyInUsaDetails.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[#525252] mb-2 uppercase tracking-wide">Familia en USA</p>
              <div className="space-y-2">
                {f.familyInUsaDetails.map((fm: any, i: number) => (
                  <div key={i} className="bg-[#F8F8F5] rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium">{val(fm.fullName)}</span>
                    <span className="mx-2 text-[#CCC]">·</span>
                    <span className="text-[#888]">{val(fm.relationship)}</span>
                    <span className="mx-2 text-[#CCC]">·</span>
                    <span className="text-[#888]">{val(fm.statusInUsa)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Paso 7 */}
        <SectionCard title="Paso 7 — Trabajo y Educación">
          <Row label="Ocupación" value={val(w.occupation)} />
          <Row label="Empleador actual" value={val(w.currentEmployer)} />
          <Row label="Dirección empleador" value={val(w.currentEmployerAddress)} />
          <Row label="CP empleador" value={val(w.currentEmployerZip)} />
          <Row label="Tel. empleador" value={val(w.currentEmployerPhone)} />
          <Row label="Email empleador" value={val(w.currentEmployerEmail)} />
          <Row label="Salario mensual USD" value={w.monthlySalaryUsd ? `USD ${w.monthlySalaryUsd}` : '—'} />
          <Row label="Responsabilidades" value={val(w.currentJobResponsibilities)} />
          <Row label="¿Trabajo anterior?" value={bool(w.hadPreviousJob)} />
          {(w.hadPreviousJob === true || w.hadPreviousJob === 'true') && (
            <>
              <Row label="Empleador anterior" value={val(w.previousEmployer)} />
              <Row label="Dirección ant." value={val(w.previousEmployerAddress)} />
              <Row label="Tel. ant." value={val(w.previousEmployerPhone)} />
              <Row label="Inicio ant." value={fmtDate(w.previousJobStartDate)} />
              <Row label="Fin ant." value={fmtDate(w.previousJobEndDate)} />
              <Row label="Supervisor ant." value={val(w.previousJobSupervisor)} />
              <Row label="Responsabilidades ant." value={val(w.previousJobResponsibilities)} />
            </>
          )}
          <Row label="Nivel de educación" value={val(w.highestEducation)} />
          <Row label="Institución educativa" value={val(w.educationInstitution)} />
          <Row label="Dirección institución" value={val(w.educationAddress)} />
          <Row label="Fechas de estudio" value={val(w.educationDates)} />
          <Row label="Título/Grado" value={val(w.educationDegree)} />
          <Row label="Idiomas" value={val(w.languages)} />
          <Row label="Países visitados (5 años)" value={val(w.countriesVisited5Years)} />
          <Row label="Membresías/organizaciones" value={val(w.organizationsMembership)} />
        </SectionCard>

        {/* Paso 8 */}
        <SectionCard title="Paso 8 — Información Adicional">
          <Row label="¿Servicio militar?" value={bool(a.militaryService)} />
          {(a.militaryService === true || a.militaryService === 'true') && (
            <>
              <Row label="Ciudad servicio militar" value={val(a.militaryCity)} />
              <Row label="Rango" value={val(a.militaryRank)} />
              <Row label="Inicio servicio" value={fmtDate(a.militaryStartDate)} />
              <Row label="Fin servicio" value={fmtDate(a.militaryEndDate)} />
              <Row label="Funciones" value={val(a.militaryDuties)} />
            </>
          )}
          <Row label="¿Antecedentes penales?" value={val(a.criminalRecord)} />
          <Row label="¿Condiciones médicas?" value={val(a.medicalConditions)} />
          <Row label="¿Historial deportación?" value={val(a.deportationHistory)} />
          {signedPhotoUrls.visaPhoto
            ? <PhotoThumbnail url={signedPhotoUrls.visaPhoto} label="Foto tipo visa" />
            : <p className="mt-4 text-sm text-[#DC2626] bg-[#FFF0F0] rounded-lg px-4 py-3">⚠️ Foto tipo visa no subida</p>
          }
        </SectionCard>

      </div>

      {/* Right column — actions */}
      <div className="space-y-6">

        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 space-y-4">
          <h3 className="font-bold text-lg border-b border-[#E5E5E5] pb-2">Gestión</h3>

          <div>
            <label className="block text-sm font-medium text-[#525252] mb-1">Estado de solicitud</label>
            <select
              value={status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
            >
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
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isGeneratingPdf ? 'Generando...' : hasPdfUrl ? 'Descargar PDF' : 'Generar PDF'}
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
