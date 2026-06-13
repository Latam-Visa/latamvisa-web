"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inter } from 'next/font/google'
import { Plane, ChevronRight, ChevronLeft, Check, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react'

import { allCountries } from '@/lib/countries'

const inter = Inter({ subsets: ['latin'] })

const visaOptions = [
  'USA (B1/B2, F1, J1, etc.)',
  'USA (Tránsito C1)',
  'Canadá (Visa o eTA)',
  'Schengen (Europa)',
  'UK (Reino Unido)',
  'Residencia en Chile',
  'Residencia en Argentina',
  'Pasaporte Unión Europea'
]

const destinationOptions = allCountries

const purposeOptions = ['Estudios (Inglés/VET)', 'Estudios Universitarios', 'Turismo', 'Trabajo/Working Holiday', 'Visita Familiar']

const priorityOptions = ['Precio más bajo (sin importar escalas)', 'Menor tiempo de vuelo posible', 'Comodidad y buenas aerolíneas', 'Evitar visas de tránsito a toda costa']

export default function RouteAdvisorForm() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    edad: '',
    nacionalidad: '',
    otra_ciudadania: '',
    pais_residencia: '',
    ciudad_origen: '',
    visas_vigentes: [] as string[],
    destino: '',
    proposito: '',
    mes: '',
    duracion: '',
    prioridades: '',
    presupuesto: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVisaToggle = (visa: string) => {
    const current = formData.visas_vigentes
    if (current.includes(visa)) {
      setFormData({ ...formData, visas_vigentes: current.filter(v => v !== visa) })
    } else {
      setFormData({ ...formData, visas_vigentes: [...current, visa] })
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 5))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/asesor-vuelos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('Network response was not ok')
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setResults(data)
      setStep(6) // Step 6 is Results
    } catch (err: any) {
      console.error("Error submitting form:", err)
      setError(err.message || "Ocurrió un error analizando tu perfil. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-1 rounded-full transition-colors duration-300 ${step >= i ? 'bg-[#C8FF00]' : 'bg-[#1A1A1A]'}`} />
        </div>
      ))}
    </div>
  )

  if (step === 6 && results) {
    return (
      <div className={`max-w-4xl mx-auto ${inter.className} animate-in fade-in duration-700`}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8FF00]/10 mb-6 border border-[#C8FF00]/20">
            <CheckCircle2 className="w-8 h-8 text-[#C8FF00]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-[PPMonumentExtended] text-white mb-4">Tu Estrategia de Ruta</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Basado en tu perfil migratorio, hemos generado las mejores opciones para tu viaje.</p>
        </div>

        <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-6 md:p-8 mb-10 shadow-2xl">
          <h3 className="text-[#C8FF00] font-medium tracking-wide mb-2 uppercase text-sm">Resumen Estratégico</h3>
          <p className="text-white text-lg md:text-xl leading-relaxed">{results.summary_insight}</p>
        </div>

        <div className="space-y-6 mb-12">
          {results.strategies.map((strategy: any, idx: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              key={idx} 
              className="bg-[#0D0D0D] border border-white/5 rounded-2xl overflow-hidden hover:border-[#C8FF00]/30 transition-colors duration-300"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#C8FF00] text-black text-xs font-bold px-2 py-1 rounded">OPCIÓN {strategy.rank}</span>
                  </div>
                  <h3 className="text-2xl text-white font-[PPMonumentExtended]">{strategy.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 uppercase tracking-widest">Aerolíneas</p>
                  <p className="text-white">{strategy.suggested_airlines.join(', ')}</p>
                </div>
              </div>
              
              <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 bg-gradient-to-b from-transparent to-black/20">
                <div>
                  <h4 className="text-[#C8FF00] text-sm uppercase tracking-wider mb-2">Por qué es ideal para ti</h4>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">{strategy.why_it_fits}</p>
                  
                  <h4 className="text-[#C8FF00] text-sm uppercase tracking-wider mb-2">Ruta Sugerida</h4>
                  <div className="flex flex-wrap items-center gap-2 text-white">
                    {strategy.suggested_hubs.map((hub: string, hIdx: number) => (
                      <span key={hIdx} className="flex items-center gap-2">
                        <span className="bg-white/10 px-3 py-1 rounded text-sm">{hub}</span>
                        {hIdx < strategy.suggested_hubs.length - 1 && <Plane className="w-4 h-4 text-gray-500" />}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[#C8FF00] text-sm uppercase tracking-wider mb-2">Documentos Extra</h4>
                    <ul className="space-y-1">
                      {strategy.extra_documents_needed.map((doc: string, dIdx: number) => (
                        <li key={dIdx} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <h4 className="text-[#C8FF00] text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Consideraciones
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{strategy.risks_or_considerations}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-[#C8FF00]/5 border border-[#C8FF00]/20 rounded-2xl p-8 text-center max-w-2xl mx-auto mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C8FF00] to-transparent opacity-50"></div>
          <h3 className="text-2xl text-white font-[PPMonumentExtended] mb-4">¿Listo para asegurar tu ruta?</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">Agenda una sesión de consultoría táctica con nuestros expertos. Evaluaremos tus fechas, buscaremos el mejor precio real y te acompañaremos en la compra.</p>
          <a 
            href="https://cal.com/latam-visa" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#C8FF00] text-black px-8 py-4 rounded-full font-medium hover:bg-[#A8D900] transition-colors"
          >
            Agendar Asesoría (USD $59) <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    )
  }

  if (isLoading || error) {
    return (
      <div className={`w-full max-w-5xl mx-auto bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[60vh] ${inter.className}`}>
        {/* Left Panel (Static Context) */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#f0fdf4] to-white p-10 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200 relative">
          <div className="absolute top-10 left-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C8FF00]/20 border border-[#C8FF00] text-black text-xs uppercase tracking-widest font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse"></span> LATAM VISA
            </div>
          </div>
          <h3 className="text-4xl md:text-5xl font-[PPMonumentExtended] text-black mt-10 mb-6 leading-tight">Analizando<br/>Perfil...</h3>
          <p className="text-gray-600 text-lg max-w-sm leading-relaxed">Evaluando opciones de tránsito, requisitos migratorios y optimización estratégica de rutas.</p>
        </div>

        {/* Right Panel (Dynamic Content) */}
        <div className="md:w-1/2 bg-white/20 p-10 md:p-16 flex flex-col items-center justify-center relative">
          {isLoading && !error && (
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-t-2 border-[#C8FF00] rounded-full animate-spin"></div>
                <Plane className="w-8 h-8 text-black animate-pulse" />
              </div>
              <h4 className="text-black font-semibold text-lg mb-2">Conectando con servidores consulares...</h4>
              <div className="w-full h-1 bg-gray-100 rounded-full mt-4 overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-[#C8FF00] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border-2 border-red-500/20 p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-black font-[PPMonumentExtended] text-xl mb-3">Interrupción</h4>
              <p className="text-gray-600 mb-8 text-sm">{error}</p>
              <button 
                onClick={() => handleSubmit()}
                className="w-full bg-black text-white hover:bg-[#C8FF00] hover:text-black py-4 rounded-xl font-medium transition-colors border border-black hover:border-[#C8FF00]"
              >
                VOLVER A INTENTAR
              </button>
              <button 
                onClick={() => setError(null)}
                className="w-full bg-transparent text-gray-500 hover:text-black mt-4 text-sm font-medium transition-colors"
              >
                VOLVER AL FORMULARIO
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto bg-[#0D0D0D] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden ${inter.className}`}>
      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit">
            <h2 className="text-2xl font-[PPMonumentExtended] text-white mb-6">Datos de Contacto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. Carlos Mendoza" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="tu@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">WhatsApp</label>
                  <input required type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="+57 300 000 0000" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Edad</label>
                  <input required type="number" name="edad" value={formData.edad} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. 28" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit">
            <h2 className="text-2xl font-[PPMonumentExtended] text-white mb-6">Origen y Ciudadanía</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nacionalidad Principal</label>
                <input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. Colombia" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">¿Tienes otra ciudadanía o pasaporte?</label>
                <input type="text" name="otra_ciudadania" value={formData.otra_ciudadania} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. Pasaporte Italiano (Opcional)" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">País donde resides actualmente</label>
                <input type="text" name="pais_residencia" value={formData.pais_residencia} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. Chile" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ciudad de Origen (Aeropuerto más cercano)</label>
                <input type="text" name="ciudad_origen" value={formData.ciudad_origen} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. Bogotá (BOG)" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit">
            <h2 className="text-2xl font-[PPMonumentExtended] text-white mb-2">Visas Vigentes</h2>
            <p className="text-gray-400 text-sm mb-6">Selecciona las visas de las que actualmente eres titular. Esto es crítico para determinar tus opciones de tránsito.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visaOptions.map(visa => (
                <button
                  key={visa}
                  onClick={() => handleVisaToggle(visa)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200 ${
                    formData.visas_vigentes.includes(visa) 
                      ? 'bg-[#C8FF00]/10 border-[#C8FF00] text-white' 
                      : 'bg-[#1A1A1A] border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">{visa}</span>
                  {formData.visas_vigentes.includes(visa) && <Check className="w-4 h-4 text-[#C8FF00]" />}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">*Si no tienes ninguna de las anteriores, puedes continuar al siguiente paso.</p>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit">
            <h2 className="text-2xl font-[PPMonumentExtended] text-white mb-6">Detalles del Viaje</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">País de Destino Principal</label>
                <select name="destino" value={formData.destino} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                  <option value="">Selecciona un destino</option>
                  {destinationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Propósito del Viaje</label>
                <select name="proposito" value={formData.proposito} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                  <option value="">Selecciona el propósito</option>
                  {purposeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mes Estimado</label>
                  <input type="text" name="mes" value={formData.mes} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. Marzo 2027" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duración (Tiempo fuera)</label>
                  <input type="text" name="duracion" value={formData.duracion} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. 1 Año" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" variants={variants} initial="initial" animate="animate" exit="exit">
            <h2 className="text-2xl font-[PPMonumentExtended] text-white mb-6">Tus Prioridades</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">¿Qué es lo más importante en tu ruta?</label>
                <select name="prioridades" value={formData.prioridades} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                  <option value="">Selecciona tu prioridad #1</option>
                  {priorityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Presupuesto aproximado (USD)</label>
                <input type="text" name="presupuesto" value={formData.presupuesto} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8FF00] transition-colors" placeholder="Ej. $1,500 - $2,000" />
                <p className="text-xs text-gray-500 mt-2">Solo para darnos una idea. No tenemos inventario en vivo, los precios varían cada hora.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
        <button 
          onClick={prevStep} 
          disabled={step === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white'}`}
        >
          <ChevronLeft className="w-5 h-5" /> Atrás
        </button>
        
        {step < 5 ? (
          <button 
            onClick={nextStep}
            className="flex items-center gap-2 bg-[#C8FF00] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#A8D900] transition-colors"
          >
            Siguiente <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-[#C8FF00] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#A8D900] transition-colors"
          >
            Generar Estrategia <Plane className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
