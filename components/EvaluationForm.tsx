'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { N8N_WEBHOOK_URL, LATAM_COUNTRY_NAMES } from '@/lib/constants'

type VisaType = 'turismo' | 'estudiante' | ''

type FormData = {
  nombre: string
  tipo_visa: VisaType
  pais_origen: string
  edad: string
  email: string
  acepta: boolean
  // Turismo
  pais_destino: string
  tiempo_estadia: string
  viajes_previos: string
  pasaporte: string
  situacion_actual: string
  // Estudiante
  que_estudiar: string
  nivel_ingles: string
  tiempo_estudio: string
  situacion_laboral: string
}

const INITIAL: FormData = {
  nombre: '', tipo_visa: '', pais_origen: '', edad: '', email: '', acepta: false,
  pais_destino: '', tiempo_estadia: '', viajes_previos: '', pasaporte: '', situacion_actual: '',
  que_estudiar: '', nivel_ingles: '', tiempo_estudio: '', situacion_laboral: '',
}

// Steps: 0=nombre, 1=tipo_visa, 2=pais_origen, 3=edad, 4-8=branch(5), 9=email → total 10
const TOTAL_STEPS = 10

function getLabel(step: number, visa: VisaType): string {
  if (step === 0) return 'Tu nombre'
  if (step === 1) return '¿Qué tipo de visa te interesa?'
  if (step === 2) return '¿De qué país eres?'
  if (step === 3) return '¿Cuántos años tienes?'
  if (step === 9) return 'Tu correo electrónico'
  if (visa === 'turismo') {
    if (step === 4) return '¿A qué país quieres viajar?'
    if (step === 5) return '¿Cuánto tiempo planeas quedarte?'
    if (step === 6) return '¿Has viajado al extranjero antes?'
    if (step === 7) return '¿Tienes pasaporte vigente?'
    if (step === 8) return '¿Cuál es tu situación actual?'
  }
  if (visa === 'estudiante') {
    if (step === 4) return '¿Qué quieres estudiar en Australia?'
    if (step === 5) return '¿Cómo describes tu inglés actual?'
    if (step === 6) return '¿Cuánto tiempo quieres estudiar?'
    if (step === 7) return '¿Tienes pasaporte vigente?'
    if (step === 8) return '¿Estás trabajando actualmente?'
  }
  return ''
}

function RadioOption({ value, selected, onSelect }: { value: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left px-4 py-3 border-2 transition-all duration-200 font-monument font-medium text-xs md:text-[13px] rounded-lg ${
        selected
          ? 'border-[#C8FF00] bg-white text-[#111111] shadow-[0_10px_30px_rgba(200,255,0,0.2)] -translate-y-[2px]'
          : 'border-transparent bg-white/80 text-[#555555] shadow-sm hover:shadow-md hover:-translate-y-[2px] hover:border-white'
      }`}
    >
      <span className={`mr-3 inline-block w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 relative align-middle transition-colors ${selected ? 'border-[#C8FF00] bg-[#C8FF00]' : 'border-[#CCCCCC] bg-transparent'}`}>
        {selected && <span className="absolute inset-0 m-auto w-1.5 h-1.5 bg-[#111111] rounded-full" />}
      </span>
      {value}
    </button>
  )
}

function VisaCard({ label, desc, icon, selected, onSelect }: { label: string; desc: string; icon: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left px-5 py-4 border-2 rounded-xl transition-all duration-200 ${
        selected
          ? 'border-[#C8FF00] bg-white shadow-[0_10px_30px_rgba(200,255,0,0.25)] -translate-y-[2px]'
          : 'border-transparent bg-white/80 shadow-sm hover:shadow-md hover:-translate-y-[2px]'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <p className="font-monument font-black text-sm text-[#111111]">{label}</p>
          <p className="font-iceland text-xs text-[#777777] mt-0.5">{desc}</p>
        </div>
        <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${selected ? 'border-[#C8FF00] bg-[#C8FF00]' : 'border-[#CCCCCC]'}`}>
          {selected && <span className="block w-2 h-2 bg-[#111111] rounded-full m-auto mt-[2px]" />}
        </div>
      </div>
    </button>
  )
}

export default function EvaluationForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(INITIAL)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [direction, setDirection] = useState(1)

  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-100px' })

  const canNext = (): boolean => {
    if (step === 0) return data.nombre.trim() !== ''
    if (step === 1) return data.tipo_visa !== ''
    if (step === 2) return data.pais_origen !== ''
    if (step === 3) return data.edad !== ''
    if (step === 9) return data.email.trim() !== '' && data.acepta
    if (data.tipo_visa === 'turismo') {
      if (step === 4) return data.pais_destino !== ''
      if (step === 5) return data.tiempo_estadia !== ''
      if (step === 6) return data.viajes_previos !== ''
      if (step === 7) return data.pasaporte !== ''
      if (step === 8) return data.situacion_actual !== ''
    }
    if (data.tipo_visa === 'estudiante') {
      if (step === 4) return data.que_estudiar !== ''
      if (step === 5) return data.nivel_ingles !== ''
      if (step === 6) return data.tiempo_estudio !== ''
      if (step === 7) return data.pasaporte !== ''
      if (step === 8) return data.situacion_laboral !== ''
    }
    return false
  }

  const navigate = (dir: 1 | -1) => {
    setDirection(dir)
    setStep(prev => prev + dir)
  }

  const handleSubmit = async () => {
    setStatus('loading')
    const payload = { ...data, edad: Number(data.edad), fecha: new Date().toISOString(), fuente: 'latamvisa.com' }
    try {
      await fetch(N8N_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setStatus('success')
    } catch {
      setStatus('success')
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0, filter: 'blur(8px)', scale: 0.95 }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)', scale: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0, filter: 'blur(8px)', scale: 0.95 }),
  }

  const orb1Variants = { animate: { x: [0, 60, -40, 0], y: [0, 40, -60, 0], scale: [1, 1.2, 0.9, 1], transition: { duration: 15, repeat: Infinity, ease: 'easeInOut' } } }
  const orb2Variants = { animate: { x: [0, -50, 50, 0], y: [0, -50, 40, 0], scale: [1, 1.3, 0.8, 1], transition: { duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 } } }
  const orb3Variants = { animate: { x: [0, 40, -30, 0], y: [0, 60, 30, 0], scale: [1, 0.9, 1.1, 1], transition: { duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 } } }

  const firstName = data.nombre ? data.nombre.split(' ')[0] : ''
  const greeting = firstName ? `, ${firstName}` : ''

  return (
    <section id="evaluacion" className="py-14 lg:py-24 px-6 relative z-10 -mt-[1px]" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 50%, #FFFFFF 100%)' }}>
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 items-center">

          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-monument font-black uppercase block mb-5" style={{ color: '#5B6A00', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
              Empieza aquí
            </span>
            <h2 className="font-monument font-black tracking-tight text-[#111111] mb-6 leading-tight" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.5rem)' }}>
              Evalúa tu perfil
              <br />
              <span style={{ color: '#5B6A00' }} className="italic">gratuitamente</span>
            </h2>
            <div className="mb-10" style={{ maxWidth: '28rem' }}>
              <p className="font-monument font-bold" style={{ color: '#222222', fontSize: '1rem', lineHeight: '1.6' }}>
                En menos de <span style={{ color: '#5B6A00' }}>2 minutos</span> sabrás si calificas y recibirás un plan personalizado en tu correo.
              </p>
              <p className="font-iceland" style={{ fontWeight: 400, fontSize: '0.9rem', color: '#666666', marginTop: '0.5rem', lineHeight: '1.5' }}>
                Todo el progreso es confidencial y no te compromete en nada.
              </p>
            </div>
            <div className="hidden lg:block border-t border-[#EAEAEA] pt-6">
              <div
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.9rem', borderRadius: '0.75rem', cursor: 'default', transition: 'background 0.25s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(200,255,0,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⚡</span>
                <div>
                  <p className="font-monument font-black uppercase" style={{ fontSize: '0.8rem', color: '#111111', letterSpacing: '0.15em' }}>Respuesta Rápida</p>
                  <p className="font-iceland" style={{ fontSize: '0.85rem', color: '#777777', marginTop: '0.15rem' }}>Análisis inicial en menos de <span style={{ color: '#5B6A00', fontWeight: 700 }}>24h</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column — Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 40, scale: 0.98 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative bg-white/40 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.08),_inset_0_0_0_1px_rgba(255,255,255,0.7)] rounded-3xl overflow-hidden flex flex-col border border-white/60"
            style={{ minHeight: '480px' }}
          >
            {/* Animated orbs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <motion.div variants={orb1Variants} animate="animate" className="absolute -top-32 -left-20 w-[400px] h-[400px] bg-[#C8FF00]/40 rounded-full mix-blend-multiply filter blur-[80px]" />
              <motion.div variants={orb2Variants} animate="animate" className="absolute top-1/4 -right-32 w-[350px] h-[350px] bg-[#9FFF00]/30 rounded-full mix-blend-multiply filter blur-[90px]" />
              <motion.div variants={orb3Variants} animate="animate" className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-[#E9FF99]/40 rounded-full mix-blend-multiply filter blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col h-full w-full">
              {/* Progress header */}
              <div className="bg-white/30 border-b border-white/40 px-8 py-5 flex-shrink-0 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-funnel font-bold text-xs text-[#111111] tracking-widest uppercase">
                    Paso {step + 1}/{TOTAL_STEPS}
                  </span>
                  <span className="font-iceland text-[#555555] text-xs uppercase tracking-widest truncate max-w-[55%] text-right">
                    {getLabel(step, data.tipo_visa)}
                  </span>
                </div>
                <div className="flex gap-1 h-[2px]">
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-full bg-black/5 overflow-hidden">
                      <motion.div
                        className="h-full bg-[#111111]"
                        initial={{ width: '0%' }}
                        animate={{ width: i <= step ? '100%' : '0%' }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form content */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center relative overflow-hidden" style={{ minHeight: '320px' }}>
                <AnimatePresence mode="popLayout" custom={direction}>

                  {status === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-5 absolute inset-0">
                      <div className="w-14 h-14 border-4 border-[#111111] border-t-transparent rounded-full animate-spin" />
                      <p className="font-iceland text-[#555555] font-bold text-sm tracking-widest uppercase">Analizando perfil...</p>
                    </motion.div>
                  )}

                  {status === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-5 text-center absolute inset-0 px-6">
                      <div className="w-20 h-20 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-4xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white">📩</div>
                      <h3 className="font-monument font-black text-2xl md:text-3xl text-[#111111]">¡Todo listo{greeting}!</h3>
                      <p className="font-iceland text-[#333333] font-bold text-sm leading-relaxed max-w-[280px]">
                        Revisa tu correo en los próximos minutos. Te enviamos un análisis preliminar de tu ruta óptima.
                      </p>
                    </motion.div>
                  )}

                  {status === 'idle' && (
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full flex flex-col justify-center"
                    >
                      <h3 className="font-monument font-black text-lg sm:text-xl text-[#111111] mb-5 text-center drop-shadow-sm">
                        {getLabel(step, data.tipo_visa)}
                      </h3>

                      {/* Step 0 — Nombre */}
                      {step === 0 && (
                        <input
                          type="text"
                          placeholder="Solo tu primer nombre (ej: María)"
                          value={data.nombre}
                          onChange={e => setData({ ...data, nombre: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Enter' && canNext()) navigate(1) }}
                          className="w-full bg-white/80 backdrop-blur-md border border-white/60 text-[#111111] px-4 py-3 font-monument font-medium text-[13px] focus:outline-none focus:border-[#C8FF00] focus:bg-white transition-all text-center rounded-lg shadow-sm placeholder-[#AAAAAA]"
                          autoFocus
                        />
                      )}

                      {/* Step 1 — Tipo de visa */}
                      {step === 1 && (
                        <div className="flex flex-col gap-3">
                          <VisaCard
                            label="Visa de Turismo"
                            desc="Viajar, visitar o explorar un nuevo país"
                            icon=""
                            selected={data.tipo_visa === 'turismo'}
                            onSelect={() => { setData({ ...data, tipo_visa: 'turismo' }); setTimeout(() => navigate(1), 150) }}
                          />
                          <VisaCard
                            label="Visa de Estudiante"
                            desc="Estudiar inglés, cursos técnicos o carreras en Australia"
                            icon=""
                            selected={data.tipo_visa === 'estudiante'}
                            onSelect={() => { setData({ ...data, tipo_visa: 'estudiante' }); setTimeout(() => navigate(1), 150) }}
                          />
                        </div>
                      )}

                      {/* Step 2 — País origen (ambas ramas) */}
                      {step === 2 && (
                        <select
                          value={data.pais_origen}
                          onChange={e => setData({ ...data, pais_origen: e.target.value })}
                          className="w-full bg-white/80 backdrop-blur-md border border-white/60 text-[#111111] px-5 py-4 font-monument font-medium text-sm focus:outline-none focus:border-[#C8FF00] focus:bg-white transition-all shadow-sm rounded-lg appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Selecciona tu país</option>
                          {LATAM_COUNTRY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}

                      {/* Step 3 — Edad (ambas ramas) */}
                      {step === 3 && (
                        <input
                          type="number"
                          min={16} max={65}
                          placeholder="Tu edad (ej: 26)"
                          value={data.edad}
                          onChange={e => setData({ ...data, edad: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Enter' && canNext()) navigate(1) }}
                          className="w-full bg-white/80 backdrop-blur-md border border-white/60 text-[#111111] px-4 py-3 font-monument font-medium text-[13px] focus:outline-none focus:border-[#C8FF00] focus:bg-white transition-all text-center rounded-lg shadow-sm placeholder-[#AAAAAA]"
                        />
                      )}

                      {/* TURISMO — Step 4: País destino */}
                      {step === 4 && data.tipo_visa === 'turismo' && (
                        <div className="grid grid-cols-2 gap-2">
                          {['Australia', 'Japón', 'Inglaterra', 'Canadá', 'Estados Unidos', 'Nueva Zelanda'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.pais_destino === opt} onSelect={() => setData({ ...data, pais_destino: opt })} />
                          ))}
                        </div>
                      )}

                      {/* TURISMO — Step 5: Tiempo estadía */}
                      {step === 5 && data.tipo_visa === 'turismo' && (
                        <div className="flex flex-col gap-2">
                          {['Menos de 1 mes', '1 a 3 meses', '3 a 6 meses', 'Más de 6 meses'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.tiempo_estadia === opt} onSelect={() => setData({ ...data, tiempo_estadia: opt })} />
                          ))}
                        </div>
                      )}

                      {/* TURISMO — Step 6: Viajes previos */}
                      {step === 6 && data.tipo_visa === 'turismo' && (
                        <div className="flex flex-col gap-2">
                          {['Nunca', '1 o 2 veces', 'Varias veces'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.viajes_previos === opt} onSelect={() => setData({ ...data, viajes_previos: opt })} />
                          ))}
                        </div>
                      )}

                      {/* TURISMO — Step 7: Pasaporte */}
                      {step === 7 && data.tipo_visa === 'turismo' && (
                        <div className="flex flex-col gap-2">
                          {['Sí, vigente', 'Vence en menos de 6 meses', 'En trámite', 'No tengo'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.pasaporte === opt} onSelect={() => setData({ ...data, pasaporte: opt })} />
                          ))}
                        </div>
                      )}

                      {/* TURISMO — Step 8: Situación actual */}
                      {step === 8 && data.tipo_visa === 'turismo' && (
                        <div className="flex flex-col gap-2">
                          {['Trabajo', 'Estudio', 'Trabajo y estudio', 'Ninguna'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.situacion_actual === opt} onSelect={() => setData({ ...data, situacion_actual: opt })} />
                          ))}
                        </div>
                      )}

                      {/* ESTUDIANTE — Step 4: Qué estudiar */}
                      {step === 4 && data.tipo_visa === 'estudiante' && (
                        <div className="flex flex-col gap-2">
                          {['Inglés general', 'Inglés + curso técnico VET', 'Ambos', 'Todavía explorando'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.que_estudiar === opt} onSelect={() => setData({ ...data, que_estudiar: opt })} />
                          ))}
                        </div>
                      )}

                      {/* ESTUDIANTE — Step 5: Nivel inglés */}
                      {step === 5 && data.tipo_visa === 'estudiante' && (
                        <div className="flex flex-col gap-2">
                          {['No hablo inglés', 'Básico', 'Intermedio', 'Avanzado'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.nivel_ingles === opt} onSelect={() => setData({ ...data, nivel_ingles: opt })} />
                          ))}
                        </div>
                      )}

                      {/* ESTUDIANTE — Step 6: Tiempo estudio */}
                      {step === 6 && data.tipo_visa === 'estudiante' && (
                        <div className="flex flex-col gap-2">
                          {['1 a 3 meses', '3 a 6 meses', '6 meses a 1 año', 'Más de 1 año'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.tiempo_estudio === opt} onSelect={() => setData({ ...data, tiempo_estudio: opt })} />
                          ))}
                        </div>
                      )}

                      {/* ESTUDIANTE — Step 7: Pasaporte */}
                      {step === 7 && data.tipo_visa === 'estudiante' && (
                        <div className="flex flex-col gap-2">
                          {['Sí, vigente', 'Vence pronto', 'En trámite', 'No tengo'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.pasaporte === opt} onSelect={() => setData({ ...data, pasaporte: opt })} />
                          ))}
                        </div>
                      )}

                      {/* ESTUDIANTE — Step 8: Situación laboral */}
                      {step === 8 && data.tipo_visa === 'estudiante' && (
                        <div className="flex flex-col gap-2">
                          {['Sí, tiempo completo', 'Sí, medio tiempo', 'No', 'Soy estudiante'].map(opt => (
                            <RadioOption key={opt} value={opt} selected={data.situacion_laboral === opt} onSelect={() => setData({ ...data, situacion_laboral: opt })} />
                          ))}
                        </div>
                      )}

                      {/* Step 9 — Email (ambas ramas) */}
                      {step === 9 && (
                        <div className="space-y-4">
                          <input
                            type="email"
                            placeholder="tu@correo.com"
                            value={data.email}
                            onChange={e => setData({ ...data, email: e.target.value })}
                            className="w-full bg-white/80 backdrop-blur-md border border-white/60 text-[#111111] px-4 py-3 font-monument font-medium text-[13px] focus:outline-none focus:border-[#C8FF00] focus:bg-white transition-all rounded-lg shadow-sm placeholder-[#AAAAAA]"
                          />
                          <label className="flex items-start gap-4 cursor-pointer p-4 border border-white/60 bg-white/40 backdrop-blur-md hover:bg-white/60 transition-colors rounded-lg shadow-sm">
                            <input
                              type="checkbox"
                              checked={data.acepta}
                              onChange={e => setData({ ...data, acepta: e.target.checked })}
                              className="mt-0.5 accent-[#C8FF00] w-4 h-4 flex-shrink-0"
                            />
                            <span className="font-iceland text-xs text-[#333333] leading-relaxed font-bold">
                              Acepto recibir información de LATAM VISA®.{' '}
                              <span className="text-[#888888] font-normal">No garantizamos la aprobación de visas.</span>
                            </span>
                          </label>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              {status === 'idle' && (
                <div className="bg-white/30 backdrop-blur-sm border-t border-white/40 p-4 flex flex-shrink-0 gap-3">
                  {step > 0 && (
                    <button
                      onClick={() => navigate(-1)}
                      className="px-5 py-3 border border-white/80 text-[#333333] shadow-sm font-monument font-bold text-[10px] uppercase tracking-widest hover:border-[#111111] hover:text-[#111111] transition-all bg-white/50 rounded-lg hover:-translate-y-0.5"
                    >
                      Volver
                    </button>
                  )}
                  {step !== 1 && (
                    <button
                      onClick={() => { if (step < TOTAL_STEPS - 1) navigate(1); else handleSubmit() }}
                      disabled={!canNext()}
                      className="flex-1 px-5 py-3 bg-[#111111] text-white shadow-xl font-monument font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_10px_30px_rgba(200,255,0,0.3)] hover:text-[#C8FF00] transition-all rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                      {step < TOTAL_STEPS - 1 ? 'Continuar' : 'Enviar'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
