'use client'
import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = 1 | '2a' | '2b' | 3 | 'success'

interface ClientInfo {
  full_name: string
  email: string
  whatsapp: string
  country_of_origin: string
  visa_type: string
}

interface DocItem {
  id: string
  name_es: string
  name_en: string
  required: boolean
}

interface TripContext {
  description: string
  date_from: string
  date_to: string
  who_pays: string
  sponsor_name: string
  sponsor_relationship: string
  sponsor_city: string
  main_reason: string
}

interface USAData {
  estado_civil: string; nacionalidades_adicionales: string; direccion_residencia: string
  telefonos: string; correos_usados: string
  facebook: string; instagram: string; twitter: string; linkedin: string; tiktok: string; otra_red: string
  fecha_inicio: string; fecha_fin: string; ciudades_usa: string
  otro_paga: string; sponsor_nombre: string; sponsor_relacion: string
  contacto_nombre: string; contacto_direccion: string; contacto_telefono: string
  contacto_email: string; contacto_relacion: string
  nombre_padre: string; nombre_madre: string
  familiares_usa: string; familiar_nombre: string; familiar_relacion: string; familiar_status: string
  ocupacion: string; empresa: string; cargo: string; salario: string; funciones: string
  antecedentes: string; deportado: string; fuerzas_armadas: string
}

// ── Static Data ────────────────────────────────────────────────────────────────
const VISA_OPTIONS = [
  { label: '🇦🇺 Visa Turismo Australia (Subclass 600)', value: 'australia' },
  { label: '🇨🇦 Visa Turismo Canadá',                  value: 'canada'    },
  { label: '🇯🇵 Visa Turismo Japón',                   value: 'japan'     },
  { label: '🇳🇿 Visa Turismo Nueva Zelanda',           value: 'newzealand'},
  { label: '🇬🇧 Visa Turismo UK',                      value: 'uk'        },
  { label: '🇺🇸 Visa Turismo USA (B1/B2)',             value: 'usa'       },
]

const COUNTRIES = [
  'Colombia','México','Perú','Bolivia','Argentina','Ecuador',
  'Venezuela','Chile','Paraguay','Uruguay','Brasil',
]

const VISA_DOCS: Record<string, DocItem[]> = {
  australia: [
    { id:'passport',     name_es:'Pasaporte vigente',                                                                              name_en:'Passport',                        required:true  },
    { id:'dni',          name_es:'Documento Nacional de Identidad',                                                                name_en:'National ID',                     required:true  },
    { id:'bank_stmts',   name_es:'Evidencia financiera — extractos bancarios, certificaciones, tarjetas de crédito',               name_en:'Proof of Funds',                  required:true  },
    { id:'family_reg',   name_es:'Registro civil y composición familiar — partidas de nacimiento, matrimonio, defunción si aplica',name_en:'Family Register',                 required:true  },
    { id:'tourism_ev',   name_es:'Evidencia de actividades turísticas — itinerario, reservas de vuelo y hotel',                    name_en:'Evidence of Planned Tourism',     required:false },
    { id:'travel_hist',  name_es:'Historial de viajes previos — pasaportes anteriores, visas previas',                             name_en:'Evidence of Previous Travel',     required:false },
    { id:'invitation',   name_es:'Carta de invitación de familiar o amigo en Australia',                                           name_en:'Invitation from Family/Friends',  required:false },
    { id:'travel_docs',  name_es:'Documentos de viaje — pasaporte actual completo',                                                name_en:'Travel Documents',                required:false },
    { id:'visitor_stmt', name_es:'Declaración del visitante — carta explicando propósito del viaje y razones de retorno',          name_en:'Visitor Statement',               required:false },
    { id:'sponsor_fin',  name_es:'Soporte financiero del sponsor — extractos, carta laboral, contrato de arriendo, visa del sponsor',name_en:'Sponsor Financial Support',    required:false },
  ],
  canada: [
    { id:'passport',   name_es:'Pasaporte vigente',                             name_en:'Valid Passport',   required:true  },
    { id:'bank_stmts', name_es:'Fondos para la estadía — extractos bancarios',  name_en:'Bank Statements',  required:true  },
    { id:'itinerary',  name_es:'Itinerario de viaje detallado',                 name_en:'Travel Itinerary', required:false },
  ],
  japan: [
    { id:'passport',   name_es:'Pasaporte y VEVO (si aplica desde Australia)',  name_en:'Passport & VEVO',         required:true },
    { id:'flight_res', name_es:'Reserva de vuelos confirmada',                  name_en:'Flight Reservation',      required:true },
    { id:'itinerary',  name_es:'Itinerario diario y reserva de hotel',          name_en:'Daily Itinerary & Hotel', required:true },
    { id:'bank_stmts', name_es:'Extractos bancarios últimos 3 meses',           name_en:'Bank Statements (3 mo.)', required:true },
  ],
  newzealand: [
    { id:'passport',    name_es:'Pasaporte vigente',                                        name_en:'Valid Passport',               required:true  },
    { id:'proof_funds', name_es:'Prueba de fondos NZD $1,000/mes',                          name_en:'Proof of Funds NZD $1000/mo',  required:true  },
    { id:'exit_ticket', name_es:'Tiquete de salida de Nueva Zelanda',                       name_en:'Exit Ticket from NZ',          required:true  },
    { id:'police_cert', name_es:'Certificado policial y médico (solo estadías +6 meses)',   name_en:'Police & Medical Certificate', required:false },
  ],
  uk: [
    { id:'passport',  name_es:'Pasaporte vigente',   name_en:'Valid Passport',     required:true },
    { id:'fin_proof', name_es:'Pruebas financieras', name_en:'Financial Evidence', required:true },
  ],
}

const NET_LABELS: Record<string, string> = {
  facebook:'Facebook', instagram:'Instagram', twitter:'Twitter / X',
  linkedin:'LinkedIn', tiktok:'TikTok', otra_red:'Otra Red Social',
}

const INIT_USA: USAData = {
  estado_civil:'', nacionalidades_adicionales:'', direccion_residencia:'',
  telefonos:'', correos_usados:'',
  facebook:'', instagram:'', twitter:'', linkedin:'', tiktok:'', otra_red:'',
  fecha_inicio:'', fecha_fin:'', ciudades_usa:'',
  otro_paga:'No', sponsor_nombre:'', sponsor_relacion:'',
  contacto_nombre:'', contacto_direccion:'', contacto_telefono:'', contacto_email:'', contacto_relacion:'',
  nombre_padre:'', nombre_madre:'',
  familiares_usa:'No', familiar_nombre:'', familiar_relacion:'', familiar_status:'',
  ocupacion:'', empresa:'', cargo:'', salario:'', funciones:'',
  antecedentes:'No', deportado:'No', fuerzas_armadas:'No',
}

const INIT_TRIP: TripContext = {
  description:'', date_from:'', date_to:'', who_pays:'self',
  sponsor_name:'', sponsor_relationship:'', sponsor_city:'', main_reason:'',
}

const VISA_COUNTRY: Record<string, string> = {
  australia:  'Australia',
  canada:     'Canadá',
  japan:      'Japón',
  newzealand: 'Nueva Zelanda',
  uk:         'UK',
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtBytes = (b: number) => b < 1024 * 1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/1024/1024).toFixed(1)} MB`

// ── Style tokens (light mode) ──────────────────────────────────────────────────
const inputCls   = 'w-full bg-white border border-gray-200 text-[#050505] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#9bcc00] transition-colors shadow-sm placeholder-gray-400'
const tareasCls  = inputCls + ' resize-none min-h-[120px]'
const labelCls   = 'block text-[10px] text-[#050505]/50 mb-1.5 uppercase tracking-widest'
const sectionHdr = 'text-xs font-black text-[#050505]/70 mt-8 mb-4 pb-2 border-b border-gray-200 uppercase tracking-widest'
const cardCls    = 'bg-white border border-gray-200 rounded-2xl p-5 shadow-sm'
const backBtn    = 'flex-1 border border-gray-300 text-[#050505]/60 py-4 rounded-full hover:border-gray-500 hover:text-[#050505] transition-colors text-xs tracking-widest uppercase bg-white'
const nextBtn    = 'flex-[2] bg-[#C8FF00] text-[#050505] font-black py-4 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b8ef00] transition-colors text-xs tracking-widest uppercase'
const fade       = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-16}, transition:{duration:0.3} }

// Page background styles
const pageBg: React.CSSProperties = {
  background: 'radial-gradient(ellipse at 50% 30%, rgba(200,255,0,0.18) 0%, rgba(200,255,0,0.06) 40%, #f8f9f4 100%)',
  backgroundImage: [
    'radial-gradient(ellipse at 50% 30%, rgba(200,255,0,0.18) 0%, rgba(200,255,0,0.06) 40%, #f8f9f4 100%)',
    'radial-gradient(circle, rgba(160,210,0,0.25) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: '100% 100%, 22px 22px',
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function SubirDocumentos() {
  const [step,    setStep]   = useState<Step>(1)
  const [client,  setClient] = useState<ClientInfo>({ full_name:'', email:'', whatsapp:'', country_of_origin:'', visa_type:'' })
  const [allFiles,setAllFiles] = useState<File[]>([])
  const [trip,    setTrip]   = useState<TripContext>(INIT_TRIP)
  const [usa,     setUsa]    = useState<USAData>(INIT_USA)
  const [loading,     setLoad]       = useState(false)
  const [error,       setErr]        = useState('')
  const [dragging,    setDragging]   = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const dropRef = useRef<HTMLInputElement | null>(null)

  const visaKey = client.visa_type
  const isUSA   = visaKey === 'usa'
  const docList = VISA_DOCS[visaKey] || []
  const reqDocs = docList.filter(d => d.required)

  const step1OK = !!(client.full_name && client.email && client.whatsapp && client.country_of_origin && client.visa_type)
  const usaOK   = !!(usa.estado_civil && usa.direccion_residencia && usa.telefonos &&
                     usa.correos_usados && usa.fecha_inicio && usa.fecha_fin &&
                     usa.ciudades_usa && usa.nombre_padre && usa.nombre_madre && usa.ocupacion)

  const stepNum = step === 1 ? 1 : (step === '2a' || step === '2b') ? 2 : step === 3 ? 3 : 4

  function setC(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setClient(p => ({ ...p, [e.target.name]: e.target.value }))
  }
  function setT(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setTrip(p => ({ ...p, [e.target.name]: e.target.value }))
  }
  function setU(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setUsa(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  function showErr(msg: string) { setErr(msg); setTimeout(() => setErr(''), 4000) }

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const valid: File[] = []
    Array.from(incoming).forEach(f => {
      if (f.size > 10 * 1024 * 1024) { showErr(`"${f.name}" supera 10MB y fue omitido.`); return }
      const ext = f.name.split('.').pop()?.toLowerCase()
      if (!['pdf','jpg','jpeg','png'].includes(ext || '')) { showErr(`"${f.name}" no es PDF/JPG/PNG y fue omitido.`); return }
      valid.push(f)
    })
    setAllFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !names.has(f.name))]
    })
  }

  function removeFile(name: string) {
    setAllFiles(prev => prev.filter(f => f.name !== name))
  }

  async function submit() {
    setLoad(true)
    setErr('')
    try {
      const fd = new FormData()

      // Client info
      fd.append('full_name',         client.full_name)
      fd.append('email',             client.email)
      fd.append('whatsapp',          client.whatsapp)
      fd.append('country_of_origin', client.country_of_origin)
      fd.append('visa_type',         VISA_OPTIONS.find(v => v.value === visaKey)?.label || visaKey)
      fd.append('flow_type',         isUSA ? 'conversational' : 'documents')
      fd.append('submitted_at',      new Date().toISOString())

      if (!isUSA) {
        fd.append('trip_description',          trip.description)
        fd.append('trip_date_from',            trip.date_from)
        fd.append('trip_date_to',              trip.date_to)
        fd.append('trip_who_pays',             trip.who_pays)
        fd.append('trip_sponsor_name',         trip.sponsor_name)
        fd.append('trip_sponsor_relationship', trip.sponsor_relationship)
        fd.append('trip_sponsor_city',         trip.sponsor_city)
        fd.append('trip_main_reason',          trip.main_reason)
        allFiles.forEach(f => fd.append('documents', f, f.name))
      } else {
        Object.entries(usa).forEach(([k, v]) => fd.append(k, v))
      }

      const res = await fetch('https://n8n-production-27dbd.up.railway.app/webhook-test/recepcion-documentos', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error()

      // Reset form and show success modal
      setClient({ full_name:'', email:'', whatsapp:'', country_of_origin:'', visa_type:'' })
      setAllFiles([])
      setTrip(INIT_TRIP)
      setUsa(INIT_USA)
      setStep(1)
      setShowSuccess(true)
    } catch {
      showErr('Error al enviar. Por favor intenta de nuevo.')
    } finally {
      setLoad(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24 text-[#050505]" style={pageBg}>

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-5 relative flex items-center justify-between shadow-sm">
        {/* Logo — absolutely centered, same size as main navbar */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <img src="/logo.png" alt="LATAM VISA" className="h-[70px] w-auto object-contain" />
        </Link>

        {/* Left spacer */}
        <div />

        {step !== 'success' && (
          <div className="flex items-center gap-2 text-[10px]" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>
            {(['Datos','Documentos','Enviar'] as const).map((label, i) => {
              const n    = i + 1
              const active = stepNum === n
              const done   = stepNum > n
              return (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-colors
                    ${done || active ? 'bg-[#C8FF00] text-[#050505]' : 'bg-gray-200 text-gray-400'}`}>
                    {done ? '✓' : n}
                  </span>
                  <span className={active || done ? 'text-[#050505]' : 'text-gray-400 hidden sm:inline'}>{label}</span>
                  {i < 2 && <span className="text-gray-300">—</span>}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Page Content ── */}
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════ STEP 1 ═══════════════════════════ */}
          {step === 1 && (
            <motion.div key="s1" {...fade}>
              <p className="text-[10px] tracking-widest uppercase mb-3 text-[#050505]/50" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Paso 1 de 3</p>
              <h1 className="text-3xl md:text-4xl font-black mb-2 text-[#050505]" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Tus Datos</h1>
              <p className="text-[#050505]/50 text-sm mb-8">Ingresa tu información para comenzar el proceso.</p>

              <div className={cardCls}>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Nombre Completo *</label>
                    <input name="full_name" value={client.full_name} onChange={setC} placeholder="Juan García López" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Correo Electrónico *</label>
                    <input name="email" type="email" value={client.email} onChange={setC} placeholder="juan@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>WhatsApp (con código de país) *</label>
                    <input name="whatsapp" type="tel" value={client.whatsapp} onChange={setC} placeholder="+57 300 123 4567" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>País de Origen *</label>
                    <select name="country_of_origin" value={client.country_of_origin} onChange={setC} className={inputCls + ' cursor-pointer'}>
                      <option value="">Selecciona tu país</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tipo de Visa *</label>
                    <select name="visa_type" value={client.visa_type} onChange={setC} className={inputCls + ' cursor-pointer'}>
                      <option value="">Selecciona la visa</option>
                      {VISA_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { if (step1OK) setStep(isUSA ? '2b' : '2a') }}
                disabled={!step1OK}
                className={nextBtn + ' mt-6 w-full'}
                style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}
              >Continuar →</button>
            </motion.div>
          )}

          {/* ═══════════════════════════════ STEP 2A ══════════════════════════ */}
          {step === '2a' && (
            <motion.div key="s2a" {...fade}>
              <p className="text-[10px] tracking-widest uppercase mb-3 text-[#050505]/50" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Paso 2 de 3</p>
              <h1 className="text-3xl md:text-4xl font-black mb-2 text-[#050505]" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Tu Viaje y Documentos</h1>
              <p className="text-[#050505]/50 text-sm mb-6">Cuéntanos el contexto y sube todos tus documentos juntos. Nuestro equipo los organizará.</p>

              {/* ── Trip Context ── */}
              <div className={cardCls + ' mb-4'}>
                <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Cuéntanos sobre tu viaje</p>
                <textarea
                  name="description"
                  value={trip.description}
                  onChange={setT}
                  placeholder="Ejemplo: Mi hija Andrea vive en Australia con visa de estudiante y quiere invitarme a visitarla en Sydney del 15 de julio al 15 de agosto. Ella pagará todos mis gastos. Yo tengo pensión y propiedades en Colombia que demuestran que voy a regresar."
                  className={tareasCls}
                />

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className={labelCls}>Fecha de llegada</label>
                    <input name="date_from" type="date" value={trip.date_from} onChange={setT} className={inputCls + ' [color-scheme:light]'} />
                  </div>
                  <div>
                    <label className={labelCls}>Fecha de regreso</label>
                    <input name="date_to" type="date" value={trip.date_to} onChange={setT} className={inputCls + ' [color-scheme:light]'} />
                  </div>
                </div>

                <div className="mt-3">
                  <label className={labelCls}>¿Quién paga el viaje?</label>
                  <select name="who_pays" value={trip.who_pays} onChange={setT} className={inputCls + ' cursor-pointer'}>
                    <option value="self">Yo misma/o</option>
                    <option value="family_in_country">Familiar en {VISA_COUNTRY[visaKey] || 'el país de destino'}</option>
                    <option value="both">Ambos</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                {(trip.who_pays === 'family_in_country' || trip.who_pays === 'both') && (
                  <div className="mt-3 space-y-3 pl-4 border-l-2 border-[#C8FF00]/40">
                    <div>
                      <label className={labelCls}>Nombre del familiar</label>
                      <input name="sponsor_name" value={trip.sponsor_name} onChange={setT} placeholder="Nombre completo" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Relación</label>
                      <input name="sponsor_relationship" value={trip.sponsor_relationship} onChange={setT} placeholder="Hija, hijo, hermano..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Ciudad donde vive</label>
                      <input name="sponsor_city" value={trip.sponsor_city} onChange={setT} placeholder="Sydney, Melbourne..." className={inputCls} />
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <label className={labelCls}>Razón principal del viaje</label>
                  <select name="main_reason" value={trip.main_reason} onChange={setT} className={inputCls + ' cursor-pointer'}>
                    <option value="">Selecciona</option>
                    <option value="Visitar familiar">Visitar familiar</option>
                    <option value="Turismo">Turismo</option>
                    <option value="Evento especial">Evento especial</option>
                    <option value="Tratamiento médico">Tratamiento médico</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* ── Single Upload Zone ── */}
              <div className={cardCls + ' mb-4'}>
                <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Sube tus documentos</p>

                {/* Drop zone */}
                <div
                  onClick={() => dropRef.current?.click()}
                  onDrop={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault()
                    setDragging(false)
                    addFiles(e.dataTransfer.files)
                  }}
                  onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  className={`border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-all duration-200
                    ${dragging
                      ? 'border-[#9bcc00] bg-[#C8FF00]/15 scale-[1.01]'
                      : 'border-gray-300 bg-gray-50 hover:border-[#9bcc00] hover:bg-[#C8FF00]/5'}`}
                >
                  <div className="text-3xl mb-3">📁</div>
                  <p className="font-bold text-[#050505] text-sm mb-1" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>
                    Arrastra todos tus documentos aquí — nosotros nos encargamos de organizarlos
                  </p>
                  <p className="text-gray-400 text-xs">Aceptamos PDF, JPG y PNG (máx. 10MB por archivo)</p>
                  <input
                    type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    ref={dropRef}
                    onChange={e => addFiles(e.target.files)}
                  />
                </div>

                {/* Uploaded files list */}
                {allFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] text-[#050505]/50 uppercase tracking-widest mb-2" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>
                      {allFiles.length} archivo{allFiles.length !== 1 ? 's' : ''} subido{allFiles.length !== 1 ? 's' : ''}
                    </p>
                    {allFiles.map(f => (
                      <div key={f.name} className="flex items-center justify-between bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#050505]/40 text-sm shrink-0">
                            {f.name.endsWith('.pdf') ? '📄' : '🖼️'}
                          </span>
                          <span className="text-[#050505] text-sm truncate">{f.name}</span>
                          <span className="text-[#050505]/40 text-xs shrink-0">{fmtBytes(f.size)}</span>
                        </div>
                        <button
                          onClick={() => removeFile(f.name)}
                          className="text-gray-400 hover:text-red-500 text-xs ml-3 shrink-0 transition-colors"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Informational Checklist ── */}
              {docList.length > 0 && (
                <div className={cardCls + ' mb-6'}>
                  <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>
                    Documentos recomendados para tu visa
                  </p>
                  <p className="text-xs text-[#050505]/50 mb-4">Esta lista es orientativa. No bloquea el envío — si falta algo, te avisaremos por correo.</p>
                  <div className="space-y-2.5">
                    {docList.map(doc => (
                      <div key={doc.id} className="flex items-start gap-3">
                        <span className="text-gray-300 text-base mt-0.5 shrink-0">○</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-[#050505]">{doc.name_es}</span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0
                          ${doc.required ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                          {doc.required ? 'Obligatorio' : 'Recomendado'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className={backBtn} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>← Volver</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={allFiles.length === 0}
                  className={nextBtn}
                  style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}
                >Continuar →</button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════ STEP 2B ══════════════════════════ */}
          {step === '2b' && (
            <motion.div key="s2b" {...fade}>
              <p className="text-[10px] tracking-widest uppercase mb-3 text-[#050505]/50" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Paso 2 de 3</p>
              <h1 className="text-3xl md:text-4xl font-black mb-2 text-[#050505]" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Datos para DS-160</h1>

              <div className="bg-[#C8FF00]/20 border border-[#9bcc00]/50 rounded-2xl p-4 mb-6">
                <p className="text-[#050505] text-sm leading-relaxed font-medium">
                  Esta información es necesaria para preparar tu aplicación DS-160. No necesitas subir documentos para esta visa.
                </p>
              </div>

              <div className={cardCls}>
                <div className="space-y-4">
                  {/* Section 1 — Datos Personales */}
                  <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Datos Personales</p>
                  <div>
                    <label className={labelCls}>Estado Civil *</label>
                    <select name="estado_civil" value={usa.estado_civil} onChange={setU} className={inputCls + ' cursor-pointer'}>
                      <option value="">Selecciona</option>
                      {['Soltero','Casado','Divorciado','Viudo','Unión libre'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Nacionalidades Adicionales</label>
                    <input name="nacionalidades_adicionales" value={usa.nacionalidades_adicionales} onChange={setU} placeholder="Si tienes, indica cuáles" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Dirección de Residencia Completa *</label>
                    <input name="direccion_residencia" value={usa.direccion_residencia} onChange={setU} placeholder="Calle, ciudad, país" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Todos tus Teléfonos *</label>
                    <input name="telefonos" value={usa.telefonos} onChange={setU} placeholder="+57 300 123 4567" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Todos los Correos Usados (últimos 5 años) *</label>
                    <input name="correos_usados" value={usa.correos_usados} onChange={setU} placeholder="email1@gmail.com, email2@hotmail.com" className={inputCls} />
                  </div>

                  {/* Section 2 — Redes */}
                  <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Redes Sociales (últimos 5 años)</p>
                  {(['facebook','instagram','twitter','linkedin','tiktok','otra_red'] as const).map(net => (
                    <div key={net}>
                      <label className={labelCls}>{NET_LABELS[net]}</label>
                      <input name={net} value={usa[net]} onChange={setU} placeholder="@usuario o URL" className={inputCls} />
                    </div>
                  ))}

                  {/* Section 3 — Plan de Viaje */}
                  <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Plan de Viaje</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Fecha de Entrada *</label>
                      <input name="fecha_inicio" type="date" value={usa.fecha_inicio} onChange={setU} className={inputCls + ' [color-scheme:light]'} />
                    </div>
                    <div>
                      <label className={labelCls}>Fecha de Salida *</label>
                      <input name="fecha_fin" type="date" value={usa.fecha_fin} onChange={setU} className={inputCls + ' [color-scheme:light]'} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Ciudades a Visitar en USA *</label>
                    <input name="ciudades_usa" value={usa.ciudades_usa} onChange={setU} placeholder="Nueva York, Miami, Los Ángeles" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>¿Alguien más paga el viaje?</label>
                    <select name="otro_paga" value={usa.otro_paga} onChange={setU} className={inputCls + ' cursor-pointer'}>
                      <option value="No">No</option>
                      <option value="Sí">Sí</option>
                    </select>
                  </div>
                  {usa.otro_paga === 'Sí' && (
                    <div className="space-y-3 pl-4 border-l-2 border-[#C8FF00]/50">
                      <div>
                        <label className={labelCls}>Nombre del Patrocinador</label>
                        <input name="sponsor_nombre" value={usa.sponsor_nombre} onChange={setU} placeholder="Nombre completo" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Relación con el Patrocinador</label>
                        <input name="sponsor_relacion" value={usa.sponsor_relacion} onChange={setU} placeholder="Padre, amigo, empleador..." className={inputCls} />
                      </div>
                    </div>
                  )}
                  <p className={labelCls + ' mt-2'}>Contacto en USA</p>
                  {([
                    ['contacto_nombre',    'Nombre'          ],
                    ['contacto_direccion', 'Dirección'       ],
                    ['contacto_telefono',  'Teléfono'        ],
                    ['contacto_email',     'Email'           ],
                    ['contacto_relacion',  'Relación contigo'],
                  ] as [keyof USAData, string][]).map(([name, label]) => (
                    <div key={name}>
                      <label className={labelCls}>{label}</label>
                      <input name={name} value={usa[name]} onChange={setU} className={inputCls} />
                    </div>
                  ))}

                  {/* Section 4 — Familiar */}
                  <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Información Familiar</p>
                  <div>
                    <label className={labelCls}>Nombre Completo del Padre *</label>
                    <input name="nombre_padre" value={usa.nombre_padre} onChange={setU} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Nombre Completo de la Madre *</label>
                    <input name="nombre_madre" value={usa.nombre_madre} onChange={setU} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>¿Tiene familiares en USA?</label>
                    <select name="familiares_usa" value={usa.familiares_usa} onChange={setU} className={inputCls + ' cursor-pointer'}>
                      <option value="No">No</option>
                      <option value="Sí">Sí</option>
                    </select>
                  </div>
                  {usa.familiares_usa === 'Sí' && (
                    <div className="space-y-3 pl-4 border-l-2 border-[#C8FF00]/50">
                      {([
                        ['familiar_nombre',   'Nombre'           ],
                        ['familiar_relacion', 'Relación'         ],
                        ['familiar_status',   'Status Migratorio'],
                      ] as [keyof USAData, string][]).map(([name, label]) => (
                        <div key={name}>
                          <label className={labelCls}>{label}</label>
                          <input name={name} value={usa[name]} onChange={setU} className={inputCls} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section 5 — Laboral */}
                  <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Información Laboral / Educativa</p>
                  {([
                    ['ocupacion', 'Ocupación Actual *'],
                    ['empresa',   'Empresa'           ],
                    ['cargo',     'Cargo'             ],
                    ['salario',   'Salario Mensual Aproximado (USD)'],
                    ['funciones', 'Funciones Principales'],
                  ] as [keyof USAData, string][]).map(([name, label]) => (
                    <div key={name}>
                      <label className={labelCls}>{label}</label>
                      <input name={name} type={name === 'salario' ? 'number' : 'text'} value={usa[name]} onChange={setU} className={inputCls} />
                    </div>
                  ))}

                  {/* Section 6 — Seguridad */}
                  <p className={sectionHdr} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Seguridad y Antecedentes</p>
                  {([
                    ['antecedentes',    '¿Tiene antecedentes penales? *'        ],
                    ['deportado',       '¿Ha sido deportado de algún país? *'   ],
                    ['fuerzas_armadas', '¿Ha servido en las fuerzas armadas? *' ],
                  ] as [keyof USAData, string][]).map(([name, label]) => (
                    <div key={name}>
                      <label className={labelCls}>{label}</label>
                      <select name={name} value={usa[name]} onChange={setU} className={inputCls + ' cursor-pointer'}>
                        <option value="No">No</option>
                        <option value="Sí">Sí</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className={backBtn} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>← Volver</button>
                <button onClick={() => setStep(3)} disabled={!usaOK} className={nextBtn} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Continuar →</button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════ STEP 3 ═══════════════════════════ */}
          {step === 3 && (
            <motion.div key="s3" {...fade}>
              <p className="text-[10px] tracking-widest uppercase mb-3 text-[#050505]/50" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Paso 3 de 3</p>
              <h1 className="text-3xl md:text-4xl font-black mb-2 text-[#050505]" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Revisión Final</h1>
              <p className="text-[#050505]/50 text-sm mb-6">Confirma que todo esté correcto antes de enviar.</p>

              {/* Client info */}
              <div className={cardCls + ' mb-4'}>
                <p className="text-[10px] text-[#050505]/40 uppercase tracking-widest mb-3" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Tus Datos</p>
                <div className="space-y-2">
                  {([
                    ['Nombre',   client.full_name ],
                    ['Email',    client.email     ],
                    ['WhatsApp', client.whatsapp  ],
                    ['País',     client.country_of_origin],
                    ['Visa',     VISA_OPTIONS.find(v => v.value === visaKey)?.label || visaKey],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 text-sm">
                      <span className="text-[#050505]/40 shrink-0">{k}</span>
                      <span className="text-[#050505] text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip context summary */}
              {!isUSA && (
                <div className={cardCls + ' mb-4'}>
                  <p className="text-[10px] text-[#050505]/40 uppercase tracking-widest mb-3" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Contexto del Viaje</p>
                  {trip.description && (
                    <p className="text-sm text-[#050505] mb-3 leading-relaxed bg-gray-50 rounded-xl p-3">{trip.description}</p>
                  )}
                  <div className="space-y-2">
                    {trip.date_from && trip.date_to && (
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-[#050505]/40">Fechas</span>
                        <span className="text-[#050505]">{trip.date_from} → {trip.date_to}</span>
                      </div>
                    )}
                    {trip.who_pays && (
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-[#050505]/40">Paga el viaje</span>
                        <span className="text-[#050505]">
                          {trip.who_pays === 'self'
                            ? 'Yo misma/o'
                            : trip.who_pays === 'family_in_country'
                            ? `Familiar en ${VISA_COUNTRY[visaKey] || 'destino'}${trip.sponsor_name ? ` (${trip.sponsor_name})` : ''}`
                            : trip.who_pays === 'both'
                            ? `Ambos${trip.sponsor_name ? ` — familiar: ${trip.sponsor_name}` : ''}`
                            : 'Otro'}
                        </span>
                      </div>
                    )}
                    {trip.main_reason && (
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-[#050505]/40">Razón</span>
                        <span className="text-[#050505]">{trip.main_reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Files uploaded */}
              {!isUSA && (
                <div className={cardCls + ' mb-4'}>
                  <p className="text-[10px] text-[#050505]/40 uppercase tracking-widest mb-3" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>
                    Archivos Subidos ({allFiles.length})
                  </p>
                  {allFiles.length === 0
                    ? <p className="text-sm text-[#050505]/40">Ningún archivo subido.</p>
                    : (
                      <div className="space-y-1.5">
                        {allFiles.map(f => (
                          <div key={f.name} className="flex items-center justify-between text-sm">
                            <span className="text-[#050505] truncate">{f.name}</span>
                            <span className="text-[#050505]/40 text-xs ml-2 shrink-0">{fmtBytes(f.size)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  {/* Checklist status */}
                  {docList.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-[10px] text-[#050505]/40 uppercase tracking-widest mb-2" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>Estado del checklist</p>
                      <div className="space-y-1.5">
                        {docList.map(doc => (
                          <div key={doc.id} className="flex items-start gap-2 text-xs">
                            <span className="mt-0.5 shrink-0 text-gray-300">○</span>
                            <span className="text-[#050505]/70 flex-1">{doc.name_es}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide shrink-0
                              ${doc.required ? 'bg-red-100 text-red-400' : 'bg-blue-100 text-blue-400'}`}>
                              {doc.required ? 'Oblig.' : 'Recom.'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#050505]/40 mt-3 italic">Si falta algún documento, te lo haremos saber por correo.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notice */}
              <div className="border border-[#9bcc00]/60 bg-[#C8FF00]/15 rounded-2xl p-5 mb-6">
                <p className="text-[#050505] text-sm leading-relaxed font-medium">
                  {isUSA
                    ? 'Tu información será procesada para preparar tu formulario DS-160. Recibirás un resumen completo a tu correo.'
                    : 'Tus documentos serán procesados y organizados por nuestro equipo. Recibirás un PDF listo para tu aplicación de visa. Tiempo estimado: 24 horas.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(isUSA ? '2b' : '2a')} className={backBtn} style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>← Volver</button>
                <button
                  onClick={submit}
                  disabled={loading}
                  className={nextBtn}
                  style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-[#050505] border-t-transparent rounded-full" />
                        Procesando documentos...
                      </span>
                    : 'Enviar documentos para procesamiento →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════ SUCCESS ══════════════════════════ */}
          {step === 'success' && (
            <motion.div key="success" {...fade} className="text-center py-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type:'spring', stiffness:220, damping:14 }}
                className="w-24 h-24 bg-[#C8FF00] rounded-full flex items-center justify-center text-4xl font-black text-[#050505] mx-auto mb-8 shadow-lg"
              >✓</motion.div>
              <h1 className="text-3xl font-black text-[#050505] mb-4" style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}>
                ¡Información enviada con éxito!
              </h1>
              <p className="text-[#050505]/60 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                Recibirás tus documentos procesados en las próximas 24 horas a{' '}
                <span className="text-[#050505] font-bold">{client.email}</span>
              </p>
              <Link
                href="/"
                className="inline-block bg-[#C8FF00] text-[#050505] font-black py-4 px-10 rounded-full hover:bg-[#b8ef00] transition-colors text-xs tracking-widest uppercase shadow-md"
                style={{ fontFamily:"'PPMonumentExtended', sans-serif" }}
              >Volver al inicio</Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Success Modal ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border border-[#C8FF00]/40"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.1 }}
                className="w-20 h-20 bg-[#C8FF00] rounded-full flex items-center justify-center text-3xl font-black text-[#050505] mx-auto mb-6 shadow-lg"
              >✓</motion.div>
              <h2
                className="text-2xl font-black text-[#050505] mb-3 leading-tight"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                ¡Documentos recibidos con éxito!
              </h2>
              <p className="text-[#050505]/60 text-sm leading-relaxed mb-8">
                Nuestro sistema de IA está procesando tu solicitud. Te contactaremos pronto con los resultados.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-[#C8FF00] text-[#050505] font-black py-3 px-8 rounded-full hover:bg-[#b8ef00] transition-colors text-xs tracking-widest uppercase shadow-md w-full"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Toast ── */}
      <AnimatePresence>
        {error && step !== 3 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full text-sm shadow-xl z-50 whitespace-nowrap"
          >{error}</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
