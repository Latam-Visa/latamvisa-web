'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  { 
    q: '¿Garantizan que me aprueben la visa?', 
    a: 'No, y desconfía de quien lo prometa. La decisión final es exclusiva del oficial consular. Lo que SÍ garantizamos es un expediente sin errores, estrategia personalizada y preparación profesional.' 
  },
  { 
    q: '¿Qué pasa si me niegan la visa?', 
    a: 'Analizamos contigo las razones de la negativa y te asesoramos sobre cuándo y cómo reaplicar. El servicio incluye una sesión post-negativa si ocurre.' 
  },
  { 
    q: '¿Cuánto demora el proceso?', 
    a: 'El expediente se arma en 3-5 días hábiles desde tu pago. La cita consular depende de disponibilidad en tu ciudad (generalmente 2-8 semanas).' 
  },
  { 
    q: '¿Ustedes son agentes migratorios registrados?', 
    a: 'No. LATAM VISA es una Travel & Education Consultancy. No ofrecemos asesoría legal migratoria. Para eso recomendamos consultar un Registered Migration Agent (OMARA) o abogado especializado. Nuestro rol es preparar tu expediente de turismo con excelencia operacional.' 
  }
]

export default function TurismoUsaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  // Animation variants
  const orbVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 10,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  }

  return (
    <>
      <title>Visa Turismo USA | LATAM VISA</title>
      <meta name="description" content="Preparamos tu expediente completo para la visa B1/B2. Sin complicaciones, sin letra pequeña." />
      
      <main className="min-h-screen bg-[#050505] text-[#FFFFFF] overflow-hidden selection:bg-[#C8FF00] selection:text-[#050505] relative z-0">
        
        {/* BACKGROUND ORBS */}
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute inset-0 bg-[#FFFFFF] transition-colors duration-1000"></div>
          <motion.div 
            variants={orbVariants}
            animate="animate"
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#C8FF00]/40 blur-3xl mix-blend-multiply" 
          />
          <motion.div 
            variants={orbVariants}
            animate="animate"
            transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, delay: 2 }}
            className="absolute top-[30%] left-[25%] w-[40vw] h-[40vw] rounded-full bg-[#9FFF00]/30 blur-3xl mix-blend-multiply" 
          />
          <motion.div 
            variants={orbVariants}
            animate="animate"
            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, delay: 1 }}
            className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#E9FF99]/40 blur-3xl mix-blend-multiply" 
          />
        </div>

        {/* 1. HERO SECTION */}
        <section className="relative min-h-screen flex flex-col justify-center items-center px-6 text-center z-10 pt-20 pb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[120px] md:text-[180px] leading-none mb-4 drop-shadow-2xl"
          >
            🇺🇸
          </motion.div>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-monument font-black text-6xl md:text-8xl tracking-tight text-[#050505] mb-6 uppercase"
          >
            VISA TURISMO USA
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-funnel text-lg md:text-xl text-[#555555] max-w-2xl mx-auto"
          >
            Preparamos tu expediente completo para la visa B1/B2. Sin complicaciones, sin letra pequeña.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="font-iceland text-xs uppercase tracking-widest text-[#555555]">Scroll</span>
            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-[1px] h-12 bg-gradient-to-b from-[#555555] to-transparent"
            />
          </motion.div>
        </section>

        {/* 2. PRICING CARD */}
        <section className="py-20 px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-[32px] p-8 md:p-16 text-center border-b-[8px] border-b-[#C8FF00] transform transition-all duration-300 hover:-translate-y-2"
            >
              <div className="uppercase tracking-[0.2em] text-[#5B6A00] text-[0.7rem] font-bold mb-6">
                Inversión Única
              </div>
              <h2 className="font-monument text-6xl md:text-8xl text-[#050505] tracking-tight mb-2">
                $190 <span className="text-3xl md:text-5xl text-[#555555]">USD</span>
              </h2>
              <p className="font-funnel text-[#555555] text-lg mb-10">
                Sin costos ocultos · Pago único
              </p>
              
              <a 
                href="https://buy.stripe.com/9B6aEY1cC4NF4z88yAbo400" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block w-full max-w-md bg-[#C8FF00] text-[#050505] font-monument font-black text-xs md:text-sm uppercase tracking-widest py-6 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 shadow-[0_10px_30px_rgba(200,255,0,0.3)] hover:shadow-[0_15px_40px_rgba(200,255,0,0.4)]"
              >
                PAGAR Y COMENZAR
              </a>
              <p className="font-iceland text-xs text-[#777777] mt-6 flex items-center justify-center gap-2">
                <span className="text-[#5B6A00]">🔒</span> Pago seguro procesado por Stripe
              </p>
            </motion.div>
          </div>
        </section>

        {/* 3. QUÉ INCLUYE */}
        <section className="py-24 px-6 relative z-10 bg-[#050505]/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-monument font-black text-2xl md:text-4xl text-center text-[#050505] mb-16 uppercase">
              QUÉ INCLUYE TU EXPEDIENTE
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '📋', title: 'Formulario DS-160', desc: 'Diligenciamos tu DS-160 completo, revisado línea por línea para evitar errores que causen rechazo' },
                { icon: '✅', title: 'Revisión Crítica', desc: 'Analizamos cada respuesta sensible (viajes previos, vínculos con USA, antecedentes) con estrategia' },
                { icon: '📅', title: 'Agendamiento Cita', desc: 'Te conseguimos la cita consular en la fecha más conveniente para ti' },
                { icon: '🎯', title: 'Prep Entrevista', desc: 'Sesión 1:1 donde te preparamos con las preguntas reales del consulado' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-8 hover:scale-[1.02] hover:border-[#C8FF00] transition-all duration-300 group"
                >
                  <div className="text-5xl mb-6 transform transition-transform group-hover:scale-110 origin-left">{item.icon}</div>
                  <h3 className="font-monument font-bold text-[#050505] text-lg mb-3 tracking-tight">{item.title}</h3>
                  <p className="font-funnel text-[#555555] leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. POR QUÉ USA NO NECESITA TRADUCCIÓN */}
        <section className="py-24 px-6 relative z-10 overflow-hidden">
          {/* Subtle side orb */}
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#C8FF00]/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
          
          <div className="max-w-4xl mx-auto bg-[#050505] text-white rounded-[32px] p-8 md:p-16 border border-[#222222] shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
            <h2 className="font-monument font-black text-2xl md:text-3xl text-[#FFFFFF] mb-8 uppercase">
              ¿Por qué nuestro precio es más bajo para usa?
            </h2>
            <p className="font-funnel text-[#AAAAAA] text-lg leading-relaxed mb-10">
              A diferencia de otros destinos, el proceso de visa para Estados Unidos se maneja 100% en inglés a través del formulario DS-160 online. <strong className="text-white">No necesitas traducir documentos oficiales</strong> porque el consulado trabaja directamente con tu formulario digital. Por eso nuestro servicio para USA cuesta $190 USD (vs $250+ para otros países que sí requieren traducción certificada).
            </p>
            
            <ul className="space-y-4 font-iceland text-lg text-[#DDDDDD]">
              {['Todo se hace online en inglés', 'Sin gastos de traducción certificada', 'Sin envío físico de documentos'].map((listItem, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-[#C8FF00] text-xl">✓</span>
                  {listItem}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5. CÓMO TRABAJAMOS (3 PASOS) */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-monument font-black text-2xl md:text-4xl text-center text-[#050505] mb-20 uppercase">
              CÓMO TRABAJAMOS
            </h2>
            
            <div className="flex flex-col md:flex-row gap-12 md:gap-6 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-[45px] left-10 right-10 h-[2px] bg-gradient-to-r from-[#C8FF00]/0 via-[#C8FF00]/50 to-[#C8FF00]/0"></div>
              
              {[
                { num: '01', title: 'PAGAS', desc: 'Un único pago de $190 USD vía Stripe. Al instante recibes acceso a tu portal privado.' },
                { num: '02', title: 'PORTAL', desc: 'Ingresas a tu dashboard personalizado donde te guiamos paso a paso.' },
                { num: '03', title: 'TE GUIAMOS', desc: 'Completamos tu DS-160 juntos, agendamos tu cita y te preparamos para la entrevista.' }
              ].map((step, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
                  <div className="w-24 h-24 rounded-full bg-[#050505] border-4 border-[#C8FF00] text-[#C8FF00] flex items-center justify-center font-monument font-black text-3xl mb-6 shadow-[0_0_30px_rgba(200,255,0,0.2)]">
                    {step.num}
                  </div>
                  <h3 className="font-monument font-bold text-xl text-[#050505] mb-4 uppercase tracking-tight flex items-center gap-2">
                    <span className="text-[#5B6A00] hidden md:inline">·</span> {step.title}
                  </h3>
                  <p className="font-funnel text-[#555555] opacity-90">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="py-24 px-6 relative z-10 bg-[#050505] text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-monument font-black text-2xl md:text-4xl text-[#FFFFFF] mb-12 uppercase text-center">
              Preguntas Frecuentes
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-[#222222] bg-[#0A0A0A] rounded-2xl overflow-hidden transition-colors hover:border-[#333333]">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-6 md:p-8 flex justify-between items-center gap-4 focus:outline-none"
                    aria-expanded={openFaq === idx}
                  >
                    <span className="font-monument text-sm md:text-base text-[#FFFFFF] tracking-tight">{faq.q}</span>
                    <motion.div 
                      animate={{ rotate: openFaq === idx ? 180 : 0 }}
                      className="text-[#C8FF00] shrink-0"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 md:px-8 pb-8 pt-0 font-funnel text-[#AAAAAA] leading-relaxed border-t border-[#222222] mt-2 pt-6">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. CTA FINAL */}
        <section className="py-32 px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-monument font-black text-3xl md:text-5xl text-[#050505] tracking-tight mb-12 uppercase">
              ¿Listo para empezar tu viaje a USA?
            </h2>
            <a 
              href="https://buy.stripe.com/9B6aEY1cC4NF4z88yAbo400" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center w-full max-w-md bg-[#C8FF00] text-[#050505] font-monument font-black text-xs md:text-sm uppercase tracking-widest py-6 px-4 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 shadow-[0_10px_30px_rgba(200,255,0,0.3)] hover:shadow-[0_15px_40px_rgba(200,255,0,0.4)]"
            >
              COMENZAR MI EXPEDIENTE → $190 USD
            </a>
          </div>
        </section>

        {/* 8. FOOTER LEGAL DISCLAIMER */}
        <footer className="py-12 border-t border-[#000000]/10 bg-[#FFFFFF] relative z-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <p className="text-[#888888] text-xs font-iceland max-w-2xl leading-relaxed">
              LATAM VISA es una Travel & Education Consultancy registrada en Australia. No somos agentes migratorios registrados (MARA/OMARA). Brindamos servicios de planeación de viaje y preparación de expedientes documentales. La aprobación de cualquier visa es decisión exclusiva de las autoridades consulares correspondientes.
            </p>
            <a href="mailto:future@latamvisas.com.au" className="text-[#555555] text-xs font-monument font-bold tracking-widest hover:text-[#050505] transition-colors">
              FUTURE@LATAMVISAS.COM.AU
            </a>
          </div>
        </footer>

      </main>
    </>
  )
}
