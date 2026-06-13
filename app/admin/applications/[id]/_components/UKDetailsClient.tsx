"use client"

import { useState } from 'react'
import { Download, Loader2, Sparkles, RefreshCw, FileText } from 'lucide-react'
// import { generateIntentionLetterBg } from '@/app/aplicar/turismo-uk/_actions/generate-intention-letter'

function DataRow({ label, value, className = '' }: { label: string, value: any, className?: string }) {
  if (value === null || value === undefined || value === '') return null
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
      <a href={target} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#C8FF00] hover:underline bg-[#0A0A0A] px-3 py-2 rounded-lg transition-colors">
        <Download className="w-4 h-4" /> Ver Documento
      </a>
    </div>
  )
}

export function UKDetailsClient({ application, signedPhotoUrls }: { application: any, signedPhotoUrls: any }) {
  const [activeTab, setActiveTab] = useState<'datos' | 'documentos' | 'carta' | 'raw'>('datos')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiLetter, setAiLetter] = useState(application.ai_intention_letter)
  const [letterStatus, setLetterStatus] = useState(application.ai_letter_status)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handlePdfClick = async () => {
    setIsGeneratingPdf(true)
    try {
      const response = await fetch('/api/admin/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id, destination: 'uk' })
      })
      const result = await response.json()
      if (result.success && result.url) {
        const a = document.createElement('a')
        a.href = result.url
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        alert(result.error || 'Error al generar el PDF')
      }
    } catch {
      alert('Error de red al intentar generar el PDF')
    }
    setIsGeneratingPdf(false)
  }

  const handleGenerateLetter = async () => {
    setIsGenerating(true)
    setLetterStatus('generating')
    try {
      const response = await fetch('/api/admin/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id, destination: 'uk' })
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
              {application.first_name} {application.last_name}
            </h1>
            <p className="text-[#525252]">{application.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDE4] text-[#2F4A00] border border-[#C8FF00]">UK Visitor Visa</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">{application.status}</span>
            <span className="text-sm text-[#888] flex items-center ml-2">
              {new Date(application.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handlePdfClick}
              disabled={isGeneratingPdf}
              className="ml-auto flex items-center gap-2 bg-[#C8FF00] text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-[#b8ef00] transition-colors disabled:opacity-50"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Generar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex overflow-x-auto border-b border-[#E5E5E5] bg-transparent">
          <button onClick={() => setActiveTab('datos')} className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'datos' ? 'border-[#C8FF00] bg-[#FAFAF7] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>Datos del Formulario</button>
          <button onClick={() => setActiveTab('documentos')} className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'documentos' ? 'border-[#C8FF00] bg-[#FAFAF7] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>Documentos Adjuntos</button>
          <button onClick={() => setActiveTab('carta')} className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'carta' ? 'border-[#C8FF00] bg-[#FAFAF7] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>
            Carta AI <Sparkles className="w-4 h-4 text-[#C8FF00] fill-[#C8FF00]" />
          </button>
          <button onClick={() => setActiveTab('raw')} className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'raw' ? 'border-[#C8FF00] bg-[#FAFAF7] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>JSON Crudo</button>
        </div>

        <div className="p-6">
          {activeTab === 'datos' && (
            <div className="space-y-8 mt-0 focus-visible:outline-none">
              
              <Section title="1. Detalles del Viaje">
                <DataRow label="Propósito de Visita" value={application.purpose_of_visit} />
                <DataRow label="Fecha Entrada" value={application.proposed_entry_date} />
                <DataRow label="Fecha Salida" value={application.proposed_exit_date} />
                <DataRow label="Visitó UK Antes" value={application.visited_uk_before ? 'Sí' : 'No'} />
                {application.visited_uk_before && <DataRow label="Detalles Visita UK" value={application.visited_uk_details} />}
                <DataRow label="Tiene Contactos en UK" value={application.has_uk_contacts ? 'Sí' : 'No'} />
                {application.has_uk_contacts && renderArray(application.uk_contacts, (c) => (
                  <>
                    <DataRow label="Nombre" value={c.name} />
                    <DataRow label="Dirección" value={c.address} />
                    <DataRow label="Relación" value={c.relationship} />
                  </>
                ))}
              </Section>

              <Section title="2. Datos Personales y Pasaporte">
                <DataRow label="Nombres" value={application.first_name} />
                <DataRow label="Apellidos" value={application.last_name} />
                <DataRow label="Otros Nombres" value={application.other_names_used} />
                <DataRow label="Fecha Nacimiento" value={application.date_of_birth} />
                <DataRow label="Lugar Nacimiento" value={application.place_of_birth} />
                <DataRow label="País Nacimiento" value={application.country_of_birth} />
                <DataRow label="Género" value={application.gender} />
                <DataRow label="Pasaporte" value={application.passport_number} />
                <DataRow label="Fecha Emisión" value={application.passport_issue_date} />
                <DataRow label="Fecha Expiración" value={application.passport_expiry_date} />
                <DataRow label="País Emisor" value={application.passport_issuing_country} />
                <DataRow label="Autoridad Emisora" value={application.passport_issuing_authority} />
              </Section>

              <Section title="3. Nacionalidad e Identidad">
                <DataRow label="Nacionalidad Actual" value={application.current_nationality} />
                <DataRow label="Otra Nacionalidad" value={application.has_other_nationality ? application.other_nationality : 'No'} />
                <DataRow label="Documento Nacional" value={application.has_national_id ? application.national_id_number : 'No'} />
                <DataRow label="País de Residencia" value={application.country_of_residence} />
                <DataRow label="Tiempo en Residencia" value={application.time_in_current_residence} />
              </Section>

              <Section title="4. Dirección y Contacto">
                <DataRow label="Dirección 1" value={application.residential_address_line1} />
                <DataRow label="Dirección 2" value={application.residential_address_line2} />
                <DataRow label="Ciudad" value={application.residential_city} />
                <DataRow label="Estado" value={application.residential_state} />
                <DataRow label="Código Postal" value={application.residential_postal_code} />
                <DataRow label="País" value={application.residential_country} />
                <DataRow label="Tiempo en Dirección" value={application.time_at_current_address} />
                <DataRow label="Teléfono" value={application.phone} />
                <DataRow label="Email" value={application.email} />
              </Section>

              <Section title="5. Ocupación y Finanzas">
                <DataRow label="Situación Ocupación" value={application.occupation_status} />
                <DataRow label="Empleador/Empresa" value={application.employer_name} />
                <DataRow label="Dirección Empleador" value={application.employer_address} />
                <DataRow label="Cargo" value={application.job_title} />
                <DataRow label="Ingreso Mensual" value={`${application.monthly_income} ${application.monthly_income_currency}`} />
                <DataRow label="Fondos para Viaje" value={`${application.available_funds_gbp} GBP`} />
                <DataRow label="Financiado por Otro" value={application.trip_financed_by_other ? 'Sí' : 'No'} />
                {application.trip_financed_by_other && <DataRow label="Detalles Financiador" value={application.trip_financer_details} />}
              </Section>

              <Section title="6. Historial de Viajes">
                <div className="py-2"><strong className="text-sm">Viajes Anteriores:</strong></div>
                {renderArray(application.travel_history, (t) => (
                  <>
                    <DataRow label="País" value={t.country} />
                    <DataRow label="Fecha" value={t.date} />
                    <DataRow label="Motivo" value={t.purpose} />
                    <DataRow label="Duración" value={t.duration} />
                  </>
                ))}
                <DataRow label="Tiene Visas Vigentes" value={application.has_valid_visa ? 'Sí' : 'No'} />
                {application.has_valid_visa && renderArray(application.valid_visas, (v) => (
                  <>
                    <DataRow label="País" value={v.country} />
                    <DataRow label="Visa #" value={v.visa_number} />
                    <DataRow label="Expiración" value={v.expiry_date} />
                  </>
                ))}
              </Section>

              <Section title="7. Historial Penal y Visas">
                <DataRow label="Visa Negada Antes" value={application.visa_refused_before ? 'Sí' : 'No'} />
                {application.visa_refused_before && <DataRow label="Detalles Negación" value={application.visa_refusal_details} />}
                <DataRow label="Deportado o Expulsado" value={application.deported_or_removed ? 'Sí' : 'No'} />
                {application.deported_or_removed && <DataRow label="Detalles Deportación" value={application.deportation_details} />}
                <DataRow label="Condena Penal" value={application.criminal_conviction ? 'Sí' : 'No'} />
                {application.criminal_conviction && <DataRow label="Detalles Penales" value={application.criminal_conviction_details} />}
              </Section>

              <Section title="8. Familia">
                <DataRow label="Estado Civil" value={application.marital_status} />
                <DataRow label="Nombres Pareja" value={application.spouse_first_name} />
                <DataRow label="Apellidos Pareja" value={application.spouse_last_name} />
                <DataRow label="Nacimiento Pareja" value={application.spouse_date_of_birth} />
                <DataRow label="Nacionalidad Pareja" value={application.spouse_nationality} />
                <DataRow label="Pareja Viaja" value={application.spouse_traveling} />
                <DataRow label="Tiene Hijos" value={application.has_children ? 'Sí' : 'No'} />
                {application.has_children && renderArray(application.children, (c) => (
                  <>
                    <DataRow label="Nombre" value={c.name} />
                    <DataRow label="Fecha Nacimiento" value={c.date_of_birth} />
                    <DataRow label="Viaja" value={c.traveling} />
                  </>
                ))}
              </Section>

              <Section title="9. Salud">
                <DataRow label="Tuberculosis" value={application.has_tuberculosis ? 'Sí' : 'No'} />
                {application.has_tuberculosis && <DataRow label="Detalles TB" value={application.tuberculosis_details} />}
                <DataRow label="Tratamiento Médico" value={application.requires_medical_treatment ? 'Sí' : 'No'} />
                {application.requires_medical_treatment && <DataRow label="Detalles Tratamiento" value={application.medical_treatment_details} />}
              </Section>

            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="p-6 space-y-2">
                  <DocLink label="1. Pasaporte (Escaneo)" url={signedPhotoUrls.passport} />
                  <DocLink label="2. Foto estilo Pasaporte" url={signedPhotoUrls.photo} />
                  <DocLink label="3. Extractos Bancarios" urls={signedPhotoUrls.bankStatements} />
                  <DocLink label="4. Prueba de Empleo" url={signedPhotoUrls.employmentProof} />
                  <DocLink label="5. Prueba de Lazos" url={signedPhotoUrls.tiesProof} />
                  <DocLink label="6. Visas Anteriores" urls={signedPhotoUrls.otherVisa} />
                  <DocLink label="7. Itinerario" urls={signedPhotoUrls.itinerary} />
                  {signedPhotoUrls.extraDocs && signedPhotoUrls.extraDocs.map((doc: any, i: number) => (
                    <DocLink key={i} label={`8.${i+1} ${doc.name}`} url={doc.signedUrl} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'carta' && (
            <div className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="bg-[#F5F5F0] border-b border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between p-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A0A0A] m-0">Carta de Intención Generada por AI</h3>
                    <p className="text-sm text-[#525252] font-normal mt-1">Escrita profesionalmente basada en los datos del formulario.</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${letterStatus === 'completed' ? 'bg-[#C8FF00] text-black' : letterStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {letterStatus === 'generating' ? 'Generando...' : letterStatus === 'completed' ? 'Completado' : letterStatus === 'failed' ? 'Falló' : 'Sin generar'}
                    </span>
                    <button 
                      onClick={handleGenerateLetter} 
                      disabled={isGenerating}
                      className="flex items-center gap-2 border border-[#E5E5E5] hover:bg-[#FAFAF7] bg-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Re-generar
                    </button>
                  </div>
                </div>
                <div className="p-8 bg-[#FAFAF7]">
                  {aiLetter ? (
                    <div className="prose prose-sm max-w-none text-[#0A0A0A] bg-white p-8 rounded-lg border border-[#E5E5E5] shadow-sm font-serif leading-relaxed whitespace-pre-wrap">
                      {aiLetter}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-[#525252] mb-4">La carta aún no se ha generado o hubo un error.</p>
                      <button onClick={handleGenerateLetter} disabled={isGenerating} className="bg-[#C8FF00] text-black hover:bg-[#B5E600] font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                        Generar ahora
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="bg-[#F5F5F0] border-b border-[#E5E5E5] px-6 py-4">
                  <h3 className="text-lg font-bold text-[#0A0A0A] m-0">Datos Originales (JSON)</h3>
                </div>
                <div className="p-6">
                  <pre className="bg-[#0A0A0A] text-[#C8FF00] p-4 rounded-lg overflow-x-auto text-sm border border-[#333]">
                    {JSON.stringify(application.form_data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
