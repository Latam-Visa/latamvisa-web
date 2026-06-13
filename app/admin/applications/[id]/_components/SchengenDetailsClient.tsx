"use client"

import { useState } from 'react'
import { Download, Loader2, Sparkles, RefreshCw, FileText } from 'lucide-react'
// import { generateIntentionLetterBg } from '@/app/aplicar/turismo-schengen/_actions/generate-intention-letter'

function DataRow({ label, value, className = '' }: { label: string, value: any, className?: string }) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') value = value ? 'Sí' : 'No'
  return (
    <div className={`flex flex-col sm:flex-row py-3 border-b border-[#E5E5E5] last:border-0 ${className}`}>
      <span className="text-sm text-[#525252] sm:w-1/3 mb-1 sm:mb-0">{label}</span>
      <span className="text-sm font-medium text-[#0A0A0A] sm:w-2/3 break-words">{String(value)}</span>
    </div>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden mb-6">
      <div className="bg-[#F5F5F0] border-b border-[#E5E5E5] px-6 py-4">
        <h3 className="text-lg font-bold text-[#0A0A0A] m-0">{title}</h3>
      </div>
      <div className="px-6 py-2">
        {children}
      </div>
    </div>
  )
}

function DocLink({ label, url, urls }: { label: string, url?: string | string[], urls?: string | string[] }) {
  const target = urls || url
  if (!target) return null
  
  if (Array.isArray(target)) {
    if (target.length === 0) return null;
    return (
      <div className="py-3 border-b border-[#E5E5E5] last:border-0">
        <span className="text-sm text-[#525252] block mb-2">{label}</span>
        <div className="flex flex-col gap-2">
          {target.map((u, i) => (
            <a key={i} href={u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#C8FF00] hover:underline bg-[#0A0A0A] px-3 py-2 rounded-lg w-fit transition-colors">
              <Download className="w-4 h-4" /> Ver Documento {i + 1}
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="py-3 border-b border-[#E5E5E5] last:border-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <span className="text-sm text-[#525252]">{label}</span>
      <a href={target as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#C8FF00] hover:underline bg-[#0A0A0A] px-3 py-2 rounded-lg transition-colors">
        <Download className="w-4 h-4" /> Ver Documento
      </a>
    </div>
  )
}

export function SchengenDetailsClient({ application, signedPhotoUrls }: { application: any, signedPhotoUrls: any }) {
  const [activeTab, setActiveTab] = useState<'datos' | 'documentos' | 'carta' | 'raw'>('datos')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiLetter, setAiLetter] = useState(application.ai_intention_letter)
  const [letterStatus, setLetterStatus] = useState(application.ai_letter_status)


  const handleGenerateLetter = async () => {
    setIsGenerating(true)
    setLetterStatus('generating')
    try {
      const response = await fetch('/api/admin/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id, destination: 'schengen' })
      })
      const res = await response.json()
      if (res.success) {
        setAiLetter(res.letter)
        setLetterStatus('completed')
      } else {
        alert(res.error || 'Error al generar la carta')
        setLetterStatus('failed')
      }
    } catch (e) {
      alert('Error de red al intentar generar la carta')
      setLetterStatus('failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderArray = (arr: any[], renderItem: (item: any, idx: number) => React.ReactNode) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return null
    return (
      <div className="space-y-4 py-3">
        {arr.map((item, idx) => (
          <div key={idx} className="bg-[#FAFAF7] p-4 rounded-lg border border-[#E5E5E5]">
            {renderItem(item, idx)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
      <div className="border-b border-[#E5E5E5] p-6 bg-[#FAFAF7]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">
              {application.first_names} {application.surname}
            </h1>
            <p className="text-[#525252]">{application.home_email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDE4] text-[#2F4A00] border border-[#C8FF00]">Schengen Visa</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">{application.status}</span>
            <span className="text-sm text-[#888] flex items-center ml-2">
              {new Date(application.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>

          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex overflow-x-auto border-b border-[#E5E5E5] bg-transparent">
          <button onClick={() => setActiveTab('datos')} className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'datos' ? 'border-[#C8FF00] bg-[#FAFAF7] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>Datos del Formulario</button>
          <button onClick={() => setActiveTab('documentos')} className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'documentos' ? 'border-[#C8FF00] bg-[#FAFAF7] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>Documentos</button>
          <button onClick={() => setActiveTab('carta')} className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'carta' ? 'border-[#C8FF00] bg-[#FAFAF7] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>Carta de Intención AI</button>
          <button onClick={() => setActiveTab('raw')} className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'raw' ? 'border-[#C8FF00] bg-[#FAFAF7] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>JSON Bruto</button>
        </div>

        <div className="p-6 bg-white min-h-[500px]">
          {activeTab === 'datos' && (
            <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
              
              <Section title="1. Identidad">
                <DataRow label="Apellidos" value={application.surname} />
                <DataRow label="Nombres" value={application.first_names} />
                <DataRow label="Apellidos de nacimiento" value={application.surname_at_birth} />
                <DataRow label="Fecha de nacimiento" value={application.date_of_birth} />
                <DataRow label="Lugar de nacimiento" value={application.place_of_birth} />
                <DataRow label="País de nacimiento" value={application.country_of_birth} />
                <DataRow label="Nacionalidad actual" value={application.current_nationality} />
                <DataRow label="Nacionalidad al nacer" value={application.nationality_at_birth} />
                <DataRow label="Otras nacionalidades" value={application.other_nationalities} />
                <DataRow label="Sexo" value={application.sex} />
                <DataRow label="Estado civil" value={application.civil_status} />
                <DataRow label="Otro estado civil" value={application.civil_status_other} />
                <DataRow label="Autoridad parental" value={application.parental_authority_name} />
                <DataRow label="Dirección autoridad" value={application.parental_authority_address} />
                <DataRow label="ID Nacional" value={application.national_id_number} />
              </Section>

              <Section title="2. Documento de Viaje">
                <DataRow label="Tipo de documento" value={application.travel_document_type} />
                <DataRow label="Otro tipo" value={application.travel_document_other} />
                <DataRow label="Número de pasaporte" value={application.passport_number} />
                <DataRow label="Fecha de emisión" value={application.passport_issue_date} />
                <DataRow label="Fecha de expiración" value={application.passport_expiry_date} />
                <DataRow label="País emisor" value={application.passport_issuing_country} />
              </Section>

              <Section title="3. Contacto y Ocupación">
                <DataRow label="Dirección de casa" value={application.home_address} />
                <DataRow label="Email" value={application.home_email} />
                <DataRow label="Teléfono" value={application.home_phone} />
                <DataRow label="¿Reside en otro país?" value={application.residence_other_country} />
                <DataRow label="Número de permiso" value={application.residence_permit_number} />
                <DataRow label="Permiso válido hasta" value={application.residence_permit_valid_until} />
                <DataRow label="Ocupación actual" value={application.current_occupation} />
                <DataRow label="Nombre del empleador" value={application.employer_name} />
                <DataRow label="Dirección empleador" value={application.employer_address} />
                <DataRow label="Teléfono empleador" value={application.employer_phone} />
              </Section>

              <Section title="4. El Viaje">
                <DataRow label="Propósito del viaje" value={application.purpose_of_journey} />
                <DataRow label="Otro propósito" value={application.purpose_other} />
                <DataRow label="Destino principal" value={application.member_state_destination} />
                <DataRow label="Otros destinos" value={application.additional_destinations} />
                <DataRow label="Primera entrada" value={application.member_state_first_entry} />
                <DataRow label="Número de entradas" value={application.number_of_entries} />
                <DataRow label="Fecha de llegada" value={application.intended_arrival_date} />
                <DataRow label="Fecha de salida" value={application.intended_departure_date} />
                <DataRow label="Duración de estadía" value={application.duration_of_stay_days} />
              </Section>

              <Section title="5. Historial de Visas">
                <DataRow label="¿Visas Schengen previas?" value={application.previous_schengen_visas} />
                {renderArray(application.previous_visas, (v, i) => (
                  <>
                    <DataRow label="Desde" value={v.date_from} />
                    <DataRow label="Hasta" value={v.date_to} />
                    <DataRow label="Sticker" value={v.sticker_number} />
                  </>
                ))}
                <DataRow label="¿Huellas dactilares previas?" value={application.fingerprints_collected} />
                <DataRow label="Permiso destino final" value={application.final_destination_permit} />
                <DataRow label="Permiso emitido por" value={application.final_permit_issued_by} />
                <DataRow label="Válido desde" value={application.final_permit_valid_from} />
                <DataRow label="Válido hasta" value={application.final_permit_valid_until} />
              </Section>

              <Section title="6. Alojamiento y Costos">
                <DataRow label="Persona/Hotel invita" value={application.inviting_person_or_hotel} />
                <DataRow label="Dirección invitación" value={application.inviting_address} />
                <DataRow label="Teléfono invitación" value={application.inviting_phone} />
                <DataRow label="Empresa" value={application.inviting_company} />
                <DataRow label="Contacto empresa" value={application.inviting_company_contact} />
                <DataRow label="Costos cubiertos por" value={application.costs_covered_by} />
                <DataRow label="Detalles del sponsor" value={application.sponsor_details} />
                <DataRow label="Medios de subsistencia" value={application.means_of_support ? application.means_of_support.join(', ') : null} />
              </Section>

              <Section title="7. Familiar UE">
                <DataRow label="¿Familiar UE?" value={application.eu_family_member} />
                <DataRow label="Apellidos" value={application.eu_family_surname} />
                <DataRow label="Nombres" value={application.eu_family_first_name} />
                <DataRow label="Nacionalidad" value={application.eu_family_nationality} />
                <DataRow label="Parentesco" value={application.eu_family_relationship} />
              </Section>
              
              <Section title="8. Confirmaciones">
                <DataRow label="Seguro confirmado" value={application.travel_insurance_confirmed} />
                <DataRow label="Fondos confirmados" value={application.proof_of_funds_eur} />
                <DataRow label="Alojamiento confirmado" value={application.accommodation_proof} />
                <DataRow label="Boleto confirmado" value={application.return_ticket_confirmed} />
                <DataRow label="Arraigo confirmado" value={application.ties_to_home_country} />
                <DataRow label="Firma aceptada" value={application.signature_confirmed} />
                <DataRow label="Lugar y Fecha" value={application.place_and_date} />
              </Section>

            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Section title="Archivos Adjuntos">
                <div className="space-y-2">
                  <DocLink label="Pasaporte" url={signedPhotoUrls?.passport} />
                  <DocLink label="Foto tipo Pasaporte" url={signedPhotoUrls?.photo} />
                  <DocLink label="Seguro Médico" url={signedPhotoUrls?.travelInsurance} />
                  <DocLink label="Extractos Bancarios" urls={signedPhotoUrls?.bankStatements} />
                  <DocLink label="Reserva Alojamiento" url={signedPhotoUrls?.accommodation} />
                  <DocLink label="Reserva de Vuelos" url={signedPhotoUrls?.flightItinerary} />
                  <DocLink label="Certificado Trabajo/Estudios" url={signedPhotoUrls?.employmentProof} />
                  <DocLink label="Pruebas de Arraigo" url={signedPhotoUrls?.tiesProof} />
                </div>
              </Section>

              {signedPhotoUrls?.extraDocs && signedPhotoUrls.extraDocs.length > 0 && (
                <Section title="Documentos Adicionales (Raw)">
                  <div className="space-y-2">
                    {signedPhotoUrls.extraDocs.map((doc: any, i: number) => (
                      <DocLink key={i} label={doc.name || `Documento adicional ${i+1}`} url={doc.signedUrl} />
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {activeTab === 'carta' && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#0A0A0A]">Carta de Intención (Borrador)</h3>
                  <p className="text-[#525252] text-sm">Base generada por AI. Úsala como plantilla.</p>
                </div>
                <button
                  onClick={handleGenerateLetter}
                  disabled={isGenerating || letterStatus === 'generating'}
                  className="flex items-center gap-2 bg-[#F5F5F0] border border-[#E5E5E5] px-4 py-2 rounded-xl text-sm font-semibold hover:border-[#0A0A0A] disabled:opacity-50 transition-colors"
                >
                  {isGenerating || letterStatus === 'generating' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerar
                </button>
              </div>

              {letterStatus === 'generating' && !aiLetter && (
                <div className="bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-10 h-10 text-[#C8FF00] animate-pulse mb-4" />
                  <p className="font-bold text-[#0A0A0A] mb-1">La IA está escribiendo la carta...</p>
                  <p className="text-sm text-[#525252]">Esto puede tomar unos 30 segundos.</p>
                </div>
              )}

              {letterStatus === 'failed' && (
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
                  Hubo un error al generar la carta. Reintenta en unos minutos.
                </div>
              )}

              {(letterStatus === 'completed' || aiLetter) && (
                <div className="bg-white border border-[#E5E5E5] p-8 md:p-12 rounded-xl shadow-sm whitespace-pre-wrap font-serif leading-relaxed text-[#222]">
                  {aiLetter || 'No hay contenido disponible.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#0A0A0A] rounded-xl p-6 overflow-auto border border-[#333]">
                <pre className="text-[#C8FF00] text-sm font-mono leading-relaxed">
                  {JSON.stringify(application, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
