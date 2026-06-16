"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inter } from 'next/font/google'
import { Plane, ChevronRight, ChevronLeft, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react'

import { allCountries } from '@/lib/countries'

const inter = Inter({ subsets: ['latin'] })

const visaOptions = [
  'USA (B1/B2/C1)',
  'Canadá (Visa o eTA)',
  'Schengen (Europa)',
  'Ninguna'
]

const destinationOptions = allCountries

export default function RouteAdvisorForm() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    edad: 'No especificada',
    nacionalidad: '',
    otra_ciudadania: 'Ninguna',
    pais_residencia: 'No especificado',
    ciudad_origen: '',
    visas_vigentes: [] as string[],
    destino: '',
    proposito: 'General',
    mes: 'Pronto',
    duracion: 'Variable',
    prioridades: 'Mejor ruta',
    presupuesto: 'No especificado'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVisaToggle = (visa: string) => {
    if (visa === 'Ninguna') {
      setFormData({ ...formData, visas_vigentes: ['Ninguna'] })
      return
    }
    
    let current = formData.visas_vigentes.filter(v => v !== 'Ninguna')
    if (current.includes(visa)) {
      current = current.filter(v => v !== visa)
    } else {
      current = [...current, visa]
    }
    setFormData({ ...formData, visas_vigentes: current })
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setStep(4) // Show loading state in step 4
    try {
      const response = await fetch('/api/asesor-vuelos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('Error en la conexión')
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setResults(data)
    } catch (err: any) {
      console.error("Error submitting form:", err)
      setError(err.message || "Ocurrió un error analizando tu perfil. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const variants = {
    initial: { opacity: 0, x: 20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.95 }
  }

  const renderContent = () => {
    if (isLoading && !error) {
      return (
        <motion.div key="loading" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center py-20 text-center">
          <motion.div
            animate={{ 
              x: [0, 40, 0, -40, 0],
              y: [0, -20, 0, -10, 0],
              rotate: [0, 15, 0, -15, 0] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <Plane className="w-16 h-16 text-[#C8FF00]" />
          </motion.div>
          <h3 className="text-2xl font-[PPMonumentExtended] text-white mb-3">Analizando conexiones...</h3>
          <p className="text-white/60">Cruzando tus datos con requisitos migratorios y rutas viables.</p>
        </motion.div>
      )
    }

    if (error) {
      return (
        <motion.div key="error" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-[PPMonumentExtended] text-white mb-3">Ocurrió un error</h3>
          <p className="text-white/60 mb-8 max-w-sm">{error}</p>
          <button 
            onClick={() => handleSubmit()}
            className="bg-[#C8FF00] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#aee600] transition-colors mb-4"
          >
            Volver a intentar
          </button>
          <button 
            onClick={() => setStep(3)}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Regresar al formulario
          </button>
        </motion.div>
      )
    }

    if (step === 4 && results) {
      return (
        <motion.div key="results" variants={variants} initial="initial" animate="animate" exit="exit" className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
          <div className="text-center mb-10 pt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8FF00]/20 mb-6 border border-[#C8FF00]/50 shadow-[0_0_20px_rgba(200,255,0,0.2)]">
              <CheckCircle2 className="w-8 h-8 text-[#C8FF00]" />
            </div>
            <h2 className="text-3xl font-[PPMonumentExtended] text-white mb-4">Tu Estrategia de Ruta</h2>
            <p className="text-white/80 text-lg">Hemos generado las opciones óptimas para tu viaje.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 mb-10 shadow-lg">
            <h3 className="text-[#C8FF00] font-semibold tracking-wider mb-3 uppercase text-xs">Resumen Estratégico</h3>
            <p className="text-white/95 text-lg leading-relaxed">{results.summary_insight}</p>
          </div>

          <div className="space-y-6 mb-12">
            {results.strategies.map((strategy: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                key={idx} 
                className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:border-[#C8FF00]/40 transition-all duration-300 shadow-lg"
              >
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-[#C8FF00] text-black text-xs font-bold px-2.5 py-1 rounded-full">OPCIÓN {strategy.rank}</span>
                    </div>
                    <h3 className="text-xl text-white font-[PPMonumentExtended]">{strategy.name}</h3>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1.5">Aerolíneas Sugeridas</p>
                    <p className="text-white font-medium text-sm">{strategy.suggested_airlines.join(', ')}</p>
                  </div>
                </div>
                
                <div className="p-6 grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[#C8FF00] text-[10px] font-bold uppercase tracking-widest mb-3">Por qué es ideal para ti</h4>
                    <p className="text-white/80 text-sm leading-relaxed mb-6">{strategy.why_it_fits}</p>
                    
                    <h4 className="text-[#C8FF00] text-[10px] font-bold uppercase tracking-widest mb-3">Ruta Sugerida</h4>
                    <div className="flex flex-wrap items-center gap-2 text-white">
                      {strategy.suggested_hubs.map((hub: string, hIdx: number) => (
                        <span key={hIdx} className="flex items-center gap-2">
                          <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg text-sm shadow-inner">{hub}</span>
                          {hIdx < strategy.suggested_hubs.length - 1 && <Plane className="w-4 h-4 text-white/30" />}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[#C8FF00] text-[10px] font-bold uppercase tracking-widest mb-3">Documentos Extra</h4>
                      <ul className="space-y-2.5">
                        {strategy.extra_documents_needed.map((doc: string, dIdx: number) => (
                          <li key={dIdx} className="flex items-start gap-2.5 text-sm text-white/80">
                            <CheckCircle2 className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {strategy.risks_or_considerations && (
                      <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                        <h4 className="text-red-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                          <ShieldAlert className="w-3.5 h-3.5" /> Consideraciones
                        </h4>
                        <p className="text-white/70 text-sm leading-relaxed">{strategy.risks_or_considerations}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-[#C8FF00]/5 backdrop-blur-md border border-[#C8FF00]/30 rounded-2xl p-8 text-center mb-8 relative overflow-hidden shadow-[0_0_30px_rgba(200,255,0,0.1)]">
            <h3 className="text-2xl text-white font-[PPMonumentExtended] mb-4">¿Listo para asegurar tu ruta?</h3>
            <p className="text-white/70 mb-8 leading-relaxed max-w-xl mx-auto">Agenda una sesión de consultoría táctica con nuestros expertos. Evaluaremos tus fechas, buscaremos el mejor precio real y te acompañaremos en la compra.</p>
            <a 
              href="https://cal.com/latam-visa" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#C8FF00] text-black px-8 py-4 rounded-xl font-bold hover:bg-[#aee600] transition-colors shadow-lg hover:shadow-[#C8FF00]/20"
            >
              Agendar Asesoría (USD $59) <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      )
    }

    return (
      <div className="w-full flex flex-col h-full justify-between">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit">
                <h2 className="text-3xl font-[PPMonumentExtended] text-white mb-2 text-center">¿Hacia dónde te diriges?</h2>
                <p className="text-white/50 text-center mb-8 text-sm">Crea tu ruta de vuelo ideal</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">¿Desde dónde viajas?</label>
                    <input required type="text" name="ciudad_origen" value={formData.ciudad_origen} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all" placeholder="Ej. Bogotá (BOG)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">¿Cuál es tu destino principal?</label>
                    <div className="relative">
                      <select required name="destino" value={formData.destino} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all appearance-none">
                        <option value="" className="bg-gray-900">Selecciona tu destino</option>
                        {destinationOptions.map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronRight className="w-4 h-4 text-white/50 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit">
                <h2 className="text-3xl font-[PPMonumentExtended] text-white mb-2 text-center">Tu perfil migratorio</h2>
                <p className="text-white/50 text-center mb-8 text-sm">Para determinar escalas y permisos</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Nacionalidad Principal</label>
                    <input required type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all" placeholder="Ej. Colombia" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">¿Tienes alguna de estas visas vigentes?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visaOptions.map(visa => {
                        const isSelected = formData.visas_vigentes.includes(visa)
                        return (
                          <button
                            key={visa}
                            type="button"
                            onClick={() => handleVisaToggle(visa)}
                            className={`flex items-center justify-between px-4 py-4 rounded-xl border transition-all duration-300 ${
                              isSelected 
                                ? 'bg-[#C8FF00]/20 border-[#C8FF00] text-[#C8FF00] shadow-[0_0_15px_rgba(200,255,0,0.1)]' 
                                : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                            }`}
                          >
                            <span className="text-sm font-medium">{visa}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-[#C8FF00]' : 'border-white/40'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-[#C8FF00] rounded-full" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit">
                <h2 className="text-3xl font-[PPMonumentExtended] text-white mb-2 text-center">¿Dónde te contactamos?</h2>
                <p className="text-white/50 text-center mb-8 text-sm">Para enviarte la estrategia final</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Nombre Completo</label>
                    <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all" placeholder="Ej. Carlos Mendoza" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all" placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">WhatsApp</label>
                    <input required type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all" placeholder="+57 300 000 0000" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
          <button 
            onClick={prevStep} 
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Atrás
          </button>
          
          {step < 3 ? (
            <button 
              onClick={nextStep}
              disabled={step === 1 && (!formData.ciudad_origen || !formData.destino)}
              className="flex items-center gap-2 bg-[#C8FF00] text-black px-6 py-2.5 rounded-xl font-bold hover:bg-[#aee600] transition-all shadow-lg shadow-[#C8FF00]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!formData.nombre || !formData.email || !formData.whatsapp}
              className="flex items-center gap-2 bg-[#C8FF00] text-black px-6 py-2.5 rounded-xl font-bold hover:bg-[#aee600] transition-all shadow-lg shadow-[#C8FF00]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generar Ruta <Plane className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] min-h-[600px] flex items-center justify-center p-4 md:p-8 ${inter.className}`}>
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Sec1/ezgif-frame-001.png" 
          alt="Window View" 
          className="w-full h-full object-cover scale-105" 
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        {/* Subtle gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Main Glass Panel */}
      <motion.div 
        layout
        className={`relative z-10 w-full ${step === 4 && results ? 'max-w-4xl' : 'max-w-lg'} bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl transition-all duration-500`}
      >
        {renderContent()}
      </motion.div>
    </div>
  )
}
