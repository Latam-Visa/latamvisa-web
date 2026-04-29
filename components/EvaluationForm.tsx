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
      className={`relative w-full text-left px-4 py-2.5 border transition-all duration-200 font-monument font-medium text-xs md:text-[12px] rounded-lg ${
        selected
          ? 'border-[#C8FF00] bg-[#C8FF00]/20 text-[#2d6a00] shadow-[0_4px_16px_rgba(200,255,0,0.25)] -translate-y-[1px]'
          : 'border-white/50 bg-white/30 text-[#1a3a1a] hover:bg-white/50 hover:border-[#C8FF00]/50 hover:-translate-y-[1px]'
      }`}
    >
      <span className={`mr-2.5 inline-block w-3 h-3 rounded-full border-2 flex-shrink-0 relative align-middle transition-colors ${selected ? 'border-[#C8FF00] bg-[#C8FF00]' : 'border-[#2d6a00]/40 bg-transparent'}`}>
        {selected && <span className="absolute inset-0 m-auto w-1.5 h-1.5 bg-[#1a3a1a] rounded-full" />}
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
      className={`relative w-full text-left px-4 py-3.5 border rounded-xl transition-all duration-200 ${
        selected
          ? 'border-[#C8FF00] bg-[#C8FF00]/20 shadow-[0_4px_20px_rgba(200,255,0,0.25)] -translate-y-[1px]'
          : 'border-white/50 bg-white/30 hover:bg-white/50 hover:border-[#C8FF00]/50 hover:-translate-y-[1px]'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <div>
          <p className={`font-monument font-black text-sm ${selected ? 'text-[#2d6a00]' : 'text-[#1a3a1a]'}`}>{label}</p>
          <p className="font-iceland text-xs text-[#4a7a4a] mt-0.5">{desc}</p>
        </div>
        <div className={`ml-auto w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${selected ? 'border-[#C8FF00] bg-[#C8FF00]' : 'border-[#2d6a00]/40'}`}>
          {selected && <span className="block w-1.5 h-1.5 bg-[#1a3a1a] rounded-full m-auto mt-[1px]" />}
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
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Evaluación de Perfil',
          content_category: 'visa_consultation',
        });
      }
      setStatus('success')
    } catch {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Evaluación de Perfil',
          content_category: 'visa_consultation',
        });
      }
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
    <section id="evaluacion" className="py-14 lg:py-24 px-6 relative z-10 -mt-[1px]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(252,251,249,0.50) 100%)' }}>
      <div className="max-w-5xl lg:max-w-6xl mx-auto px-2 sm:px-4" ref={ref}>
        {/* Master Card Contenedor Principal (Split-Card Flotante) */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:grid lg:grid-cols-2 rounded-[2rem] overflow-hidden shadow-[0_32px_80px_rgba(0,80,0,0.18),0_8px_32px_rgba(200,255,0,0.1)] border border-white/60 relative backdrop-blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(220,255,200,0.35) 45%, rgba(255,255,255,0.5) 100%)' }}
        >

          {/* Left Column (Información) */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10 w-full h-full overflow-hidden">
            {/* Orb decorativo columna izquierda */}
            <div className="absolute -top-20 -right-20 w-[320px] h-[320px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(200,255,0,0.22) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-16 -left-16 w-[240px] h-[240px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(100,200,50,0.15) 0%, transparent 70%)' }} />
            {/* Badge */}
            <span
              className="inline-flex items-center gap-1.5 font-monument font-black uppercase mb-5 w-max"
              style={{ background: '#C8FF00', color: '#000000', fontSize: '0.55rem', letterSpacing: '0.2em', padding: '0.35rem 0.75rem', borderRadius: '999px' }}
            >
              ✦ Empieza aquí
            </span>

            {/* Title */}
            <h2
              className="font-monument font-black tracking-tight leading-[0.92] mb-1"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', color: '#0d2b0d' }}
            >
              Evalúa tu
            </h2>
            <h2
              className="font-monument font-black tracking-tight leading-[0.92] mb-1"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', color: '#C8FF00', WebkitTextStroke: '1px #2d6a00', textShadow: '0 2px 12px rgba(200,255,0,0.4)' }}
            >
              perfil
            </h2>
            <h2
              className="font-monument font-black italic tracking-tight mb-8 leading-[0.92]"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)', color: '#C8FF00', WebkitTextStroke: '0.8px #2d6a00', textShadow: '0 2px 10px rgba(200,255,0,0.35)' }}
            >
              gratuitamente
            </h2>

            <div className="mb-8 border-l-2 border-[#C8FF00] pl-4">
              <p className="font-monument font-bold max-w-sm" style={{ color: '#1a3a1a', fontSize: '0.82rem', lineHeight: '1.7' }}>
                En <span style={{ color: '#2d6a00', fontWeight: 900 }}>2 minutos</span> analizamos tu perfil, evaluamos tu viabilidad real y te mostramos cómo potenciarlo.
              </p>
              <p className="font-iceland font-bold text-[0.72rem] mt-3" style={{ color: '#2d6a00', letterSpacing: '0.05em' }}>
                🔒 100% privado · ✓ Gratis · Sin compromiso
              </p>
            </div>

            <div className="hidden lg:block mt-auto pt-6">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.1rem', borderRadius: '0.85rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(200,255,0,0.5)', boxShadow: '0 4px 20px rgba(200,255,0,0.15)', backdropFilter: 'blur(12px)' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⚡</span>
                <div>
                  <p className="font-monument font-black uppercase" style={{ fontSize: '0.68rem', color: '#2d6a00', letterSpacing: '0.14em' }}>Respuesta Rápida</p>
                  <p className="font-iceland" style={{ fontSize: '0.78rem', color: '#4a7a4a', marginTop: '0.08rem' }}>Análisis en menos de <span style={{ color: '#2d6a00', fontWeight: 700 }}>24h</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Form Card (Integrado al Master Card) */}
          <div
            className="relative flex flex-col w-full h-full border-t lg:border-t-0 lg:border-l border-white/50 overflow-hidden backdrop-blur-2xl"
            style={{ background: 'rgba(255,255,255,0.25)', minHeight: '400px' }}
          >
            {/* Animated orbs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <motion.div variants={orb1Variants} animate="animate" className="absolute -top-24 -left-16 w-[280px] h-[280px] bg-[#C8FF00]/25 rounded-full filter blur-[70px]" />
              <motion.div variants={orb2Variants} animate="animate" className="absolute top-1/3 -right-20 w-[240px] h-[240px] bg-[#C8FF00]/15 rounded-full filter blur-[80px]" />
              <motion.div variants={orb3Variants} animate="animate" className="absolute -bottom-28 left-1/3 w-[320px] h-[320px] bg-[#C8FF00]/20 rounded-full filter blur-[90px]" />
            </div>

            <div className="relative z-10 flex flex-col h-full w-full">
              {/* Progress header */}
              <div className="border-b border-white/50 px-6 py-4 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.35)' }}>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-funnel font-bold text-xs text-[#1a3a1a] tracking-widest uppercase">
                    Paso {step + 1}/{TOTAL_STEPS}
                  </span>
                  <span className="font-iceland text-[#4a7a4a] text-xs uppercase tracking-widest truncate max-w-[55%] text-right">
                    {getLabel(step, data.tipo_visa)}
                  </span>
                </div>
                <div className="flex gap-1 h-[2px]">
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(200,255,0,0.18)' }}>
                      <motion.div
                        className="h-full bg-[#C8FF00]"
                        initial={{ width: '0%' }}
                        animate={{ width: i <= step ? '100%' : '0%' }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center relative overflow-hidden" style={{ minHeight: '280px' }}>
                <AnimatePresence mode="popLayout" custom={direction}>

                  {status === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-5 absolute inset-0">
                      <div className="w-12 h-12 border-4 border-[#C8FF00] border-t-transparent rounded-full animate-spin" />
                      <p className="font-iceland text-[#4a7a4a] font-bold text-sm tracking-widest uppercase">Analizando perfil...</p>
                    </motion.div>
                  )}

                  {status === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-5 text-center absolute inset-0 px-6">
                      <div className="w-20 h-20 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-4xl shadow-[0_20px_40px_rgba(200,255,0,0.2)] border border-white/80">📩</div>
                      <h3 className="font-monument font-black text-2xl md:text-3xl text-[#0d2b0d]">¡Todo listo{greeting}!</h3>
                      <p className="font-iceland text-[#1a3a1a] font-bold text-sm leading-relaxed max-w-[280px]">
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
                      <h3 className="font-monument font-black text-lg sm:text-xl text-[#0d2b0d] mb-5 text-center drop-shadow-sm">
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
                          className="w-full backdrop-blur-md border text-[#0d2b0d] px-4 py-3 font-monument font-medium text-[13px] focus:outline-none transition-all text-center rounded-lg placeholder-[#7aaa7a]"
                          style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(200,255,0,0.5)' }}
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
                          className="w-full backdrop-blur-md text-[#0d2b0d] px-5 py-4 font-monument font-medium text-sm focus:outline-none transition-all rounded-lg appearance-none cursor-pointer border"
                          style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(200,255,0,0.5)' }}
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
                          className="w-full backdrop-blur-md border text-[#0d2b0d] px-4 py-3 font-monument font-medium text-[13px] focus:outline-none transition-all text-center rounded-lg placeholder-[#7aaa7a]"
                          style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(200,255,0,0.5)' }}
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
                            className="w-full backdrop-blur-md border text-[#0d2b0d] px-4 py-3 font-monument font-medium text-[13px] focus:outline-none transition-all rounded-lg placeholder-[#7aaa7a]"
                          style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(200,255,0,0.5)' }}
                          />
                          <label className="flex items-start gap-4 cursor-pointer p-3.5 border rounded-lg transition-colors" style={{ borderColor: 'rgba(200,255,0,0.45)', background: 'rgba(255,255,255,0.45)' }}>
                            <input
                              type="checkbox"
                              checked={data.acepta}
                              onChange={e => setData({ ...data, acepta: e.target.checked })}
                              className="mt-0.5 accent-[#C8FF00] w-4 h-4 flex-shrink-0"
                            />
                            <span className="font-iceland text-xs text-[#1a3a1a] leading-relaxed font-bold">
                              Acepto recibir información de LATAM VISA®.{' '}
                              <span className="text-[#4a7a4a] font-normal">No garantizamos la aprobación de visas.</span>
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
                <div className="border-t border-white/50 p-3.5 flex flex-shrink-0 gap-2.5" style={{ background: 'rgba(255,255,255,0.35)' }}>
                  {step > 0 && (
                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-2.5 font-monument font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg hover:-translate-y-0.5 border"
                      style={{ borderColor: 'rgba(200,255,0,0.5)', color: '#2d6a00', background: 'rgba(255,255,255,0.5)' }}
                    >
                      Volver
                    </button>
                  )}
                  {step !== 1 && (
                    <button
                      onClick={() => { if (step < TOTAL_STEPS - 1) navigate(1); else handleSubmit() }}
                      disabled={!canNext()}
                      className="flex-1 px-5 py-2.5 bg-[#111111] text-[#C8FF00] font-monument font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_24px_rgba(200,255,0,0.25)] transition-all rounded-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                      {step < TOTAL_STEPS - 1 ? 'Continuar' : 'Enviar'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
