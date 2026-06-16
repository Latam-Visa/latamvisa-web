"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inter } from 'next/font/google'
import { Plane, ChevronRight, ChevronLeft, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react'

import { allCountries } from '@/lib/countries'

const inter = Inter({ subsets: ['latin'] })

const visaOptions = [
  'USA (B1/B2, F1, J1, etc.)',
  'USA (Tránsito C1)',
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
    origen: '',
    destino: '',
    nacionalidad: '',
    visas_vigentes: [] as string[]
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
    setStep(4) // Show loading state
    try {
      const response = await fetch('/api/asesor-vuelos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (!response.ok || data.error) throw new Error(data.error || 'Error en la conexión')
      
      setResults(data)
    } catch (err: any) {
      console.error("Error submitting form:", err)
      setError(err.message || "Ocurrió un error analizando tu perfil. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const renderContent = () => {
    if (isLoading && !error) {
      return (
        <motion.div key="loading" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center py-24 text-center">
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
          <h3 className="text-2xl md:text-3xl font-[PPMonumentExtended] text-white mb-3 drop-shadow-md">Analizando conexiones...</h3>
          <p className="text-white/90 drop-shadow-sm">Cruzando tus datos con requisitos migratorios y rutas viables.</p>
        </motion.div>
      )
    }

    if (error) {
      return (
        <motion.div key="error" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-[PPMonumentExtended] text-white mb-3 drop-shadow-md">Ocurrió un error</h3>
          <p className="text-white/90 mb-8 max-w-sm mx-auto drop-shadow-sm">{error}</p>
          <button 
            onClick={() => handleSubmit()}
            className="bg-[#C8FF00] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#aee600] transition-colors mb-4 shadow-lg shadow-[#C8FF00]/20"
          >
            Volver a intentar
          </button>
          <button 
            onClick={() => setStep(3)}
            className="text-white/80 hover:text-white text-sm transition-colors drop-shadow-sm"
          >
            Regresar al formulario
          </button>
        </motion.div>
      )
    }

    if (step === 4 && results) {
      return (
        <motion.div key="results" variants={variants} initial="initial" animate="animate" exit="exit" className="p-6 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-8 border border-[#C8FF00]/50 shadow-[0_0_30px_rgba(200,255,0,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-[#C8FF00]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-[PPMonumentExtended] text-white mb-6 drop-shadow-lg">Cotización Lista</h2>
          
          <div className="bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 backdrop-blur-md text-center max-w-2xl mx-auto shadow-2xl">
            <h3 className="text-[#C8FF00] font-semibold tracking-widest uppercase text-xs mb-3 drop-shadow-sm">Ruta Sugerida</h3>
            <p className="text-white text-xl md:text-2xl mb-10 font-light drop-shadow-md">{results.rutaSugerida}</p>
            
            <h3 className="text-[#C8FF00] font-semibold tracking-widest uppercase text-xs mb-3 drop-shadow-sm">Inversión Estimada</h3>
            <p className="text-5xl md:text-6xl font-light text-white mb-3 drop-shadow-lg">${results.displayedPrice} <span className="text-xl md:text-2xl text-white/80">USD</span></p>
            <p className="text-white/80 text-sm drop-shadow-sm">Incluye tarifa base y honorarios de gestión.</p>
          </div>

          <a 
            href="https://cal.com/latam-visa" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#C8FF00] text-black px-8 py-4 rounded-xl font-bold hover:bg-[#aee600] transition-colors shadow-lg shadow-[#C8FF00]/20 text-lg"
          >
            Agendar Asesoría y Asegurar Ruta <ArrowRight className="w-6 h-6" />
          </a>
        </motion.div>
      )
    }

    return (
      <div className="w-full flex flex-col justify-center p-6 md:p-12 min-h-[500px]">
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h2 className="text-3xl md:text-4xl font-[PPMonumentExtended] text-white mb-2 text-center drop-shadow-lg">¿Hacia dónde te diriges?</h2>
                <p className="text-white/90 text-center mb-10 font-light drop-shadow-sm">Crea tu ruta de vuelo ideal</p>
                <div className="space-y-6 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2 drop-shadow-md">¿Desde dónde viajas?</label>
                    <input required type="text" name="origen" value={formData.origen} onChange={handleChange} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-4 text-white placeholder:text-white/50 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all shadow-inner" placeholder="Ej. Bogotá (BOG)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2 drop-shadow-md">¿Cuál es tu destino principal?</label>
                    <div className="relative">
                      <select required name="destino" value={formData.destino} onChange={handleChange} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all appearance-none shadow-inner">
                        <option value="" className="text-black">Selecciona tu destino</option>
                        {destinationOptions.map(opt => <option key={opt} value={opt} className="text-black">{opt}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronRight className="w-4 h-4 text-white/70 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h2 className="text-3xl md:text-4xl font-[PPMonumentExtended] text-white mb-2 text-center drop-shadow-lg">Tu perfil migratorio</h2>
                <p className="text-white/90 text-center mb-10 font-light drop-shadow-sm">Para determinar escalas y permisos</p>
                <div className="space-y-6 max-w-lg mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2 drop-shadow-md">Nacionalidad Principal</label>
                    <input required type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-4 text-white placeholder:text-white/50 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all shadow-inner" placeholder="Ej. Colombia" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-3 drop-shadow-md">¿Tienes alguna de estas visas vigentes?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visaOptions.map(visa => {
                        const isSelected = formData.visas_vigentes.includes(visa)
                        return (
                          <button
                            key={visa}
                            type="button"
                            onClick={() => handleVisaToggle(visa)}
                            className={`flex items-center justify-between px-4 py-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                              isSelected 
                                ? 'bg-[#C8FF00]/20 border-[#C8FF00] text-[#C8FF00] shadow-[0_0_15px_rgba(200,255,0,0.2)]' 
                                : 'bg-white/5 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
                            }`}
                          >
                            <span className="text-sm font-medium drop-shadow-sm">{visa}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-[#C8FF00]' : 'border-white/50'}`}>
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
              <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h2 className="text-3xl md:text-4xl font-[PPMonumentExtended] text-white mb-2 text-center drop-shadow-lg">¿Dónde te contactamos?</h2>
                <p className="text-white/90 text-center mb-10 font-light drop-shadow-sm">Para enviarte la estrategia final</p>
                <div className="space-y-5 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5 drop-shadow-md">Nombre Completo</label>
                    <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all shadow-inner" placeholder="Ej. Carlos Mendoza" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5 drop-shadow-md">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all shadow-inner" placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5 drop-shadow-md">WhatsApp</label>
                    <input required type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all shadow-inner" placeholder="+57 300 000 0000" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-10 max-w-xl mx-auto w-full pt-6 border-t border-white/20">
          <button 
            onClick={prevStep} 
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-white/90 hover:text-white hover:bg-white/10 drop-shadow-md'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Atrás
          </button>
          
          {step < 3 ? (
            <button 
              onClick={nextStep}
              disabled={step === 1 && (!formData.origen || !formData.destino)}
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
    <div className={`relative min-h-screen bg-[url('/Sec1/ezgif-frame-001.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 md:p-8 ${inter.className}`}>
      {/* Real Glassmorphism Card */}
      <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col justify-center min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  )
}
