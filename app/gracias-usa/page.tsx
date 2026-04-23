'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, FolderOpen, Phone } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// ═══ Local components ═══
const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const FlipText = ({ text, className = "" }: { text: string, className?: string }) => {
  return (
    <span className={`inline-block ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="inline-block relative overflow-hidden group/char cursor-default">
          <span className="inline-block transition-transform duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/char:-translate-y-full">
            {char === ' ' ? '\u00A0' : char}
          </span>
          <span className="absolute top-0 left-0 inline-block translate-y-full transition-transform duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/char:translate-y-0 text-[#C8FF00]">
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </span>
  )
}

function AnimatedCheckmark() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] mx-auto drop-shadow-[0_8px_24px_rgba(200,255,0,0.4)]">
      <motion.circle
        cx="60" cy="60" r="55"
        fill="#C8FF00"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M 40 60 L 55 75 L 85 45"
        stroke="#111111"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

function GraciasUsaContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || '00000000'
  const displayId = `ORD-${sessionId.slice(-8).toUpperCase()}`

  useEffect(() => {
    document.title = "¡Pago confirmado! | LATAM VISA"
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#FAFFEB] to-[#C8FF00]/40 text-[#111111] overflow-hidden selection:bg-[#111111] selection:text-[#C8FF00] relative">
      
      {/* Texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      />

      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* ═══ SECCIÓN 1: HERO DE CONFIRMACIÓN ═══ */}
          <section className="flex flex-col justify-center items-center text-center mt-12 mb-24">
            <FadeUp>
              <div className="mb-8 w-full flex justify-center">
                <AnimatedCheckmark />
              </div>
            </FadeUp>
            
            <FadeUp delay={0.2}>
              <h1 className="font-monument font-black text-4xl md:text-6xl tracking-tight text-[#111111] mb-4 uppercase">
                <FlipText text="¡PAGO CONFIRMADO!" />
              </h1>
              <p className="font-funnel text-[#555555] text-lg md:text-xl font-medium mb-8">
                Bienvenido a LATAM VISA
              </p>
            </FadeUp>
            
            <FadeUp delay={0.4}>
              <div className="bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-2xl px-6 py-4 mb-8">
                <p className="font-iceland font-bold text-[#1A2A00] tracking-widest uppercase md:text-lg">
                  Número de orden: <span className="text-[#111111] font-black">{displayId}</span>
                </p>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.5}>
              <p className="font-funnel text-[#555555] max-w-2xl mx-auto leading-relaxed">
                Tu pago fue procesado exitosamente. Recibirás un email de confirmación en los próximos minutos con todos los detalles.
              </p>
            </FadeUp>
          </section>

          {/* ═══ SECCIÓN 2: PRÓXIMOS PASOS ═══ */}
          <section className="mb-24">
            <FadeUp>
              <h2 className="font-monument font-black text-2xl md:text-4xl text-center text-[#111111] mb-12 uppercase">
                <FlipText text="¿QUÉ SIGUE AHORA?" />
              </h2>
            </FadeUp>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  icon: <Mail className="w-8 h-8 text-[#1A2A00]" strokeWidth={1.5} />, 
                  title: '01 · REVISA TU EMAIL', 
                  desc: 'En los próximos 5 minutos te llegará un correo con el recibo de pago y los detalles de tu expediente.' 
                },
                { 
                  icon: <FolderOpen className="w-8 h-8 text-[#1A2A00]" strokeWidth={1.5} />, 
                  title: '02 · PREPARA DOCUMENTOS', 
                  desc: 'Nuestro equipo te contactará en las próximas 24 horas para solicitarte los documentos necesarios (pasaporte, soportes económicos, etc.).' 
                },
                { 
                  icon: <Phone className="w-8 h-8 text-[#1A2A00]" strokeWidth={1.5} />, 
                  title: '03 · TE ACOMPAÑAMOS', 
                  desc: 'Armamos juntos tu DS-160, agendamos tu cita consular y te preparamos para la entrevista. Paso a paso, sin complicaciones.' 
                }
              ].map((card, idx) => (
                <FadeUp key={idx} delay={0.2 + (idx * 0.1)}>
                  <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.03)] rounded-[24px] p-8 h-full transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:border-[#C8FF00]/50">
                    <div className="w-16 h-16 rounded-2xl bg-[#C8FF00]/20 flex items-center justify-center mb-6">
                      {card.icon}
                    </div>
                    <h3 className="font-monument font-bold text-sm md:text-base text-[#111111] mb-3">{card.title}</h3>
                    <p className="font-funnel text-[#555555] leading-relaxed text-sm md:text-base">{card.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </section>

          {/* ═══ SECCIÓN 3: CONTACTO / SOPORTE ═══ */}
          <section className="mb-24 flex justify-center">
            <FadeUp>
              <div className="w-full max-w-2xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.04)] rounded-[32px] p-8 md:p-12 text-center text-[#111111]">
                <h2 className="font-monument font-black text-2xl md:text-3xl mb-4 uppercase">
                  <FlipText text="¿TIENES DUDAS?" />
                </h2>
                <p className="font-funnel text-[#555555] mb-8 lg:text-lg">
                  Estamos aquí para acompañarte. Escríbenos cuando quieras:
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <a href="mailto:future@latamvisas.com.au" className="font-iceland font-bold text-lg tracking-widest uppercase hover:text-[#1A2A00] transition-colors border-b-2 border-transparent hover:border-[#C8FF00]">
                    future@latamvisas.com.au
                  </a>
                  <span className="hidden sm:inline text-[#555555]">·</span>
                  <a href="https://wa.me/61426779734" target="_blank" rel="noopener noreferrer" className="font-iceland font-bold text-lg tracking-widest uppercase text-[#1A2A00] hover:text-[#111111] transition-colors border-b-2 border-transparent hover:border-[#C8FF00]">
                    WhatsApp: +61 426 779 734
                  </a>
                </div>
              </div>
            </FadeUp>
          </section>

          {/* ═══ SECCIÓN 4: BOTÓN VOLVER AL INICIO ═══ */}
          <section className="flex justify-center pb-10">
            <FadeUp>
              <a 
                href="/"
                className="inline-flex justify-center items-center bg-[#111111] text-[#C8FF00] font-monument font-black text-xs md:text-sm uppercase tracking-widest py-5 px-10 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:bg-[#1A2A00] shadow-[0_10px_30px_rgba(17,17,17,0.2)] hover:shadow-[0_15px_40px_rgba(17,17,17,0.3)]"
              >
                VOLVER AL INICIO
              </a>
            </FadeUp>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  )
}

function Loader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FAFFEB] to-[#C8FF00]/40 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#C8FF00] border-t-transparent animate-spin"></div>
    </div>
  )
}

export default function GraciasUsaPage() {
  return (
    <Suspense fallback={<Loader />}>
      <GraciasUsaContent />
    </Suspense>
  )
}