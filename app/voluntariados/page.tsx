'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Filter,
  MessageCircle,
  ChevronDown,
  CheckCircle,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// ── Animation helpers ──────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FlipText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={`inline-flex flex-wrap gap-[0.25em] justify-center flip-hover-group cursor-default ${className}`}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="word-group relative inline-flex">
          {/* Default Layer (Before) */}
          <span className="inline-flex before-layer" aria-hidden="true">
            {word.split('').map((char, cIdx) => (
              <span key={`b-${cIdx}`} className={`char-el`}>{char}</span>
            ))}
          </span>
          {/* Hover Layer (After) */}
          <span className="inline-flex after-layer absolute left-0 top-0">
            {word.split('').map((char, cIdx) => (
              <span key={`a-${cIdx}`} className={`char-el font-black`}>{char}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

// ── Components ────────────────────────────────────────────────────────────

function BenefitCard({ icon: Icon, title, body, delay }: { icon: any, title: string, body: string, delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className="group bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 hover:border-[#C8FF00]/30 transition-all duration-300 shadow-sm"
    >
      <div className="w-11 h-11 rounded-xl bg-[#1A1A1A] flex items-center justify-center mb-5 group-hover:bg-[#C8FF00]/20 transition-colors duration-300">
        <Icon size={20} className="text-[#C8FF00]" />
      </div>
      <h3 className="font-geist font-normal text-[16px] md:text-lg tracking-wide text-[#FFFFFF] mb-3 leading-snug">
        {title}
      </h3>
      <p className="font-sans text-[#8A8A8A] text-sm md:text-[15px] leading-relaxed font-light">{body}</p>
    </motion.div>
  )
}

function DestinationCard({ flag, country, info, badge, delay }: { flag: string, country: string, info: string, badge: string, delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const isAvailable = badge === 'Disponible'
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className={`group bg-[#0D0D0D] border ${isAvailable ? 'border-[#1A1A1A] hover:border-[#C8FF00]/30' : 'border-[#1A1A1A]/50'} rounded-2xl p-6 transition-all duration-300 shadow-sm relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{flag}</span>
        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border ${isAvailable ? 'bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]' : 'bg-[#1A1A1A] border-[#333] text-[#8A8A8A]'}`}>
          {badge}
        </span>
      </div>
      <h3 className={`font-geist font-normal text-xl tracking-wide ${isAvailable ? 'text-[#FFFFFF]' : 'text-[#8A8A8A]'} mb-2`}>
        {country}
      </h3>
      <p className="font-sans text-[#8A8A8A] text-sm leading-relaxed font-light">{info}</p>
    </motion.div>
  )
}

function StepItem({ num, title, desc, isLast }: { num: string, title: string, desc: string, isLast: boolean }) {
  return (
    <div className="relative flex-1">
      {/* Connector line for desktop */}
      {!isLast && (
        <div className="hidden lg:block absolute top-6 left-[60px] w-[calc(100%-60px)] h-[1px] bg-[#1A1A1A]" />
      )}
      
      {/* Connector line for mobile */}
      {!isLast && (
        <div className="lg:hidden absolute top-[48px] left-[23px] w-[1px] h-[calc(100%-48px+24px)] bg-[#1A1A1A]" />
      )}

      <div className="flex flex-row lg:flex-col gap-4 lg:gap-6 relative z-10 mb-8 lg:mb-0">
        <div className="w-12 h-12 rounded-full bg-[#050505] border border-[#C8FF00] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(200,255,0,0.15)]">
          <span className="font-geist text-[#C8FF00] text-sm font-medium tracking-wider">{num}</span>
        </div>
        <div>
          <h3 className="font-geist text-[#FFFFFF] text-base md:text-lg mb-2">{title}</h3>
          <p className="font-sans text-[#8A8A8A] text-sm leading-relaxed font-light">{desc}</p>
        </div>
      </div>
    </div>
  )
}

function PricingCard({ tier, price, description, features, ctaText, ctaLink, popular = false, delay }: { tier: string, price: string, description: string, features: string[], ctaText: string, ctaLink: string, popular?: boolean, delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className={`relative bg-[#0D0D0D] rounded-2xl p-8 md:p-10 flex flex-col h-full ${popular ? 'border border-[#C8FF00] shadow-[0_0_30px_rgba(200,255,0,0.05)]' : 'border border-[#1A1A1A]'}`}
    >
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#C8FF00] text-[#050505] font-geist text-[10px] md:text-xs uppercase tracking-widest px-4 py-1.5 rounded-sm font-medium whitespace-nowrap">
          ⭐ Más popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="font-geist text-xl text-[#FFFFFF] tracking-wide mb-2">{tier}</h3>
        <p className="font-sans text-[#8A8A8A] text-sm font-light h-[40px]">{description}</p>
        <div className="mt-6">
          <span className="font-geist text-4xl text-[#FFFFFF]">{price}</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((feat, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle size={18} className="text-[#C8FF00] flex-shrink-0 mt-0.5" />
            <span className="font-sans text-[#CCCCCC] text-sm leading-relaxed font-light">{feat}</span>
          </li>
        ))}
      </ul>
      
      <Link href={ctaLink} className={`w-full py-4 text-center rounded-sm font-geist text-sm uppercase tracking-widest transition-colors ${popular ? 'bg-[#C8FF00] text-[#050505] hover:bg-[#A8D900]' : 'bg-[#1A1A1A] text-[#FFFFFF] hover:bg-[#333333]'}`}>
        {ctaText}
      </Link>
    </motion.div>
  )
}

function FaqAccordion({ q, a, index }: { q: string, a: string, index: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 16 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      className="border-t border-[#1A1A1A]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left group"
        aria-expanded={open}
      >
        <span className="font-sans font-normal text-[#FFFFFF] text-[15px] md:text-[17px] group-hover:text-[#C8FF00] transition-colors duration-200 leading-tight">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
            open
              ? 'bg-[#C8FF00]/10 text-[#C8FF00]'
              : 'bg-[#1A1A1A] text-[#8A8A8A] group-hover:bg-[#1A1A1A]/80 group-hover:text-[#FFFFFF]'
          }`}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="font-sans text-[#8A8A8A] text-[15px] leading-relaxed pb-8 pr-8 font-light">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function VoluntariadosPage() {
  const processSectionRef = useRef<HTMLElement>(null)
  
  const scrollToProcess = (e: React.MouseEvent) => {
    e.preventDefault()
    if (processSectionRef.current) {
      const offset = 80 // Adjust for navbar
      const elementPosition = processSectionRef.current.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Meta Pixel Tracking Function
  const trackLead = (tier?: string) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'Lead', {
        service: 'voluntariado',
        ...(tier && { tier })
      });
    }
  }

  return (
    <>
      <title>Voluntariado en Asia | LATAM VISA</title>
      <meta name="description" content="Programas de voluntariado en Vietnam, Camboya, Tailandia e Indonesia para latinos. Curaduría experta y soporte en español. Desde $120 USD." />
      
      {/* Forcing Dark Theme variables directly on this layout */}
      <div className="relative min-h-screen w-full bg-[#050505] text-[#FFFFFF] selection:bg-[#C8FF00] selection:text-[#050505]">
        
        {/* Background Noise Texture */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
        ></div>

        <Navbar />

        {/* ════ SECTION 1: HERO ════ */}
        <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#C8FF00]/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <FadeUp delay={0.1}>
              <span className="inline-block font-geist text-[#C8FF00] text-xs md:text-sm tracking-[0.3em] uppercase mb-6 font-medium">
                NUEVO SERVICIO
              </span>
            </FadeUp>
            
            <FadeUp delay={0.2}>
              <h1 className="font-geist font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-widest leading-[1.1] mb-8 uppercase text-balance">
                Vive Asia con propósito. <br className="hidden md:block"/>
                <span className="text-[#8A8A8A]">Sin gastar una fortuna.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="font-sans font-light text-[#CCCCCC] text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto mb-6 text-balance">
                Te conectamos con proyectos de voluntariado reales en Vietnam, Camboya, Tailandia e Indonesia. Aportas tus habilidades, recibes alojamiento y comida. Nosotros nos encargamos del resto.
              </p>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="flex items-center justify-center gap-2 mb-12 text-[#8A8A8A] font-sans text-xs md:text-sm">
                <CheckCircle size={14} className="text-[#C8FF00]" />
                <span>Servicio respaldado por experiencia documentada en terreno</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.5} className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <Link 
                href="/agendar/voluntariado" 
                onClick={() => trackLead()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#C8FF00] text-[#050505] font-geist text-sm uppercase tracking-widest font-medium rounded-sm hover:bg-[#A8D900] transition-colors"
              >
                Agendar consulta gratuita
              </Link>
              <a 
                href="#como-funciona"
                onClick={scrollToProcess}
                className="w-full sm:w-auto text-[#FFFFFF] font-sans text-sm hover:text-[#C8FF00] hover:underline underline-offset-4 transition-colors"
              >
                Ver cómo funciona ↓
              </a>
            </FadeUp>
          </div>
        </section>

        {/* ════ SECTION 2: POR QUÉ NOSOTROS ════ */}
        <section className="py-20 md:py-32 px-6 border-t border-[#1A1A1A]">
          <div className="max-w-6xl mx-auto">
            <FadeUp>
              <h2 className="font-geist font-light text-3xl md:text-4xl tracking-widest uppercase text-center mb-16">
                Por qué <span className="text-[#C8FF00]">nosotros</span>
              </h2>
            </FadeUp>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <BenefitCard 
                icon={MapPin}
                title="Experiencia en terreno"
                body="No vendemos lo que no conocemos. Documentamos cada proyecto en persona para guiarte con honestidad."
                delay={0.1}
              />
              <BenefitCard 
                icon={Filter}
                title="Curaduría experta"
                body="Filtramos cientos de proyectos para entregarte solo los que realmente valen la pena. Sin orfanatos. Sin sorpresas."
                delay={0.2}
              />
              <BenefitCard 
                icon={MessageCircle}
                title="Soporte en español"
                body="Acompañamiento en tu idioma antes, durante y después del viaje. Resolvemos dudas y emergencias en tiempo real."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* ════ SECTION 3: DESTINOS DISPONIBLES ════ */}
        <section className="py-20 md:py-32 px-6 bg-[#0D0D0D]">
          <div className="max-w-6xl mx-auto">
            <FadeUp>
              <div className="mb-16">
                <h2 className="font-geist font-light text-3xl md:text-4xl tracking-widest uppercase mb-4">
                  Destinos <span className="text-[#C8FF00]">Disponibles</span>
                </h2>
                <p className="font-sans text-[#8A8A8A] font-light max-w-2xl">
                  Explora el Sudeste Asiático colaborando en proyectos locales. Alojamiento y alimentación incluidos a cambio de tu talento.
                </p>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DestinationCard flag="🇻🇳" country="Vietnam" info="E-visa online · Desde $25 USD" badge="Disponible" delay={0.1} />
              <DestinationCard flag="🇰🇭" country="Camboya" info="E-visa online · Desde $30 USD" badge="Disponible" delay={0.2} />
              <DestinationCard flag="🇹🇭" country="Tailandia" info="Visa de turista · 60 días" badge="Disponible" delay={0.3} />
              <DestinationCard flag="🇮🇩" country="Indonesia" info="Visa on arrival · Bali y más" badge="Próximamente" delay={0.4} />
            </div>
          </div>
        </section>

        {/* ════ SECTION 4: CÓMO FUNCIONA ════ */}
        <section id="como-funciona" ref={processSectionRef} className="py-20 md:py-32 px-6 border-t border-[#1A1A1A]">
          <div className="max-w-6xl mx-auto">
            <FadeUp>
              <h2 className="font-geist font-light text-3xl md:text-4xl tracking-widest uppercase text-center mb-16 md:mb-24">
                Cómo <span className="text-[#C8FF00]">Funciona</span>
              </h2>
            </FadeUp>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 relative">
              <StepItem 
                num="01" 
                title="Consulta gratuita" 
                desc="Conversamos sobre tus intereses, presupuesto y objetivos." 
                isLast={false} 
              />
              <StepItem 
                num="02" 
                title="Curaduría personalizada" 
                desc="Te presentamos proyectos verificados que se ajustan a tu perfil." 
                isLast={false} 
              />
              <StepItem 
                num="03" 
                title="Gestión de visa" 
                desc="Te guiamos con e-visa, seguro de viaje y todo el papeleo." 
                isLast={false} 
              />
              <StepItem 
                num="04" 
                title="Soporte continuo" 
                desc="Acompañamiento por WhatsApp mientras estás en destino." 
                isLast={true} 
              />
            </div>
          </div>
        </section>

        {/* ════ SECTION 5: PRICING TIERS ════ */}
        <section className="py-20 md:py-32 px-6 bg-[#0D0D0D]">
          <div className="max-w-6xl mx-auto">
            <FadeUp>
              <div className="text-center mb-16 md:mb-20">
                <h2 className="font-geist font-light text-3xl md:text-4xl tracking-widest uppercase mb-4">
                  Planes de <span className="text-[#C8FF00]">Asesoría</span>
                </h2>
                <p className="font-sans text-[#8A8A8A] font-light">
                  Elige el nivel de acompañamiento que necesitas para tu viaje a Asia.
                </p>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard
                tier="ESSENTIALS"
                price="$120 USD"
                description="Para viajeros independientes que solo necesitan una guía clara y proyectos validados."
                features={[
                  "1 destino a elegir",
                  "Guía completa en PDF de plataformas",
                  "Gestión de e-visa",
                  "Recomendación de seguro de viaje",
                  "Lista de 3-5 proyectos pre-validados",
                  "1 sesión de 30 minutos"
                ]}
                ctaText="Empezar"
                ctaLink="/agendar/voluntariado?plan=essentials"
                delay={0.1}
              />
              <PricingCard
                tier="PLUS"
                price="$249 USD"
                description="Nuestro plan más completo. Nosotros encontramos y contactamos los proyectos por ti."
                features={[
                  "Todo lo del plan Essentials",
                  "Curaduría personalizada (te contactamos 2-3 proyectos)",
                  "Gestión de antecedentes penales",
                  "Plantilla de CV y carta de motivación",
                  "Soporte por WhatsApp durante el viaje",
                  "2 sesiones de 45 minutos"
                ]}
                ctaText="Elegir Plus"
                ctaLink="/agendar/voluntariado?plan=plus"
                popular={true}
                delay={0.2}
              />
              <PricingCard
                tier="PREMIUM"
                price="$490 USD"
                description="Para quienes buscan un viaje largo combinando múltiples destinos y experiencias."
                features={[
                  "Todo lo del plan Plus",
                  "Itinerario multi-país (ej: Vietnam + Camboya)",
                  "Gestión de visas múltiples",
                  "Conexión con red de ex-voluntarios",
                  "Soporte continuo extendido"
                ]}
                ctaText="Solicitar Premium"
                ctaLink="/agendar/voluntariado?plan=premium"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* ════ SECTION 6: EL FUNDADOR EN TERRENO ════ */}
        <section className="py-20 md:py-32 px-6 border-t border-[#1A1A1A]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeUp className="order-2 lg:order-1">
                <div className="relative w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden border border-[#C8FF00]/30 shadow-[0_0_40px_rgba(200,255,0,0.05)]">
                  {/* Placeholder Image */}
                  <Image 
                    src="/images/cristian-vietnam.jpg" 
                    alt="Cristian documentando voluntariados en Vietnam"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Fallback if image doesn't exist yet */}
                  <div className="absolute inset-0 bg-[#1A1A1A] flex flex-col items-center justify-center -z-10 text-[#8A8A8A] font-sans">
                    <Image 
                      src="/logo.png" 
                      alt="LATAM VISA" 
                      width={120} 
                      height={40} 
                      className="opacity-20 mb-4"
                    />
                    <span className="text-xs tracking-widest uppercase">/images/cristian-vietnam.jpg</span>
                  </div>
                </div>
              </FadeUp>

              <div className="order-1 lg:order-2">
                <FadeUp delay={0.1}>
                  <span className="inline-block font-geist text-[#C8FF00] text-xs tracking-[0.25em] uppercase mb-6">
                    Detrás del servicio
                  </span>
                  <h2 className="font-geist font-light text-3xl md:text-4xl tracking-widest uppercase mb-8 leading-[1.2]">
                    No te vendemos un folleto. <br/>
                    <span className="text-[#8A8A8A]">Te compartimos un camino real.</span>
                  </h2>
                </FadeUp>
                
                <FadeUp delay={0.2}>
                  <p className="font-sans font-light text-[#CCCCCC] text-[15px] md:text-base leading-relaxed mb-8">
                    Soy Cristian, fundador de LATAM VISA. Antes de ofrecer este servicio, decidí vivir la experiencia yo mismo. Estoy viajando a Vietnam para hacer voluntariado real, documentar cada paso, y traerte información que no encuentras en ningún blog. Porque guiar bien a alguien requiere haber caminado primero.
                  </p>
                  
                  <a href="#" className="inline-flex items-center gap-2 font-geist text-[#C8FF00] text-sm uppercase tracking-widest hover:text-[#FFFFFF] transition-colors group">
                    Sigue el viaje en Instagram 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* ════ SECTION 7: FAQ ════ */}
        <section className="py-20 md:py-32 px-6 bg-[#0D0D0D]">
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div className="text-center mb-16">
                <h2 className="font-geist font-light text-3xl md:text-4xl tracking-widest uppercase">
                  Preguntas <span className="text-[#C8FF00]">Frecuentes</span>
                </h2>
              </div>
            </FadeUp>

            <div>
              <FaqAccordion 
                index={0}
                q="¿Necesito hablar inglés?" 
                a="Un nivel intermedio es suficiente para la mayoría de proyectos. Te ayudamos a evaluar tu nivel y elegir un proyecto donde puedas comunicarte con confianza." 
              />
              <FaqAccordion 
                index={1}
                q="¿Cuánto tiempo dura un voluntariado?" 
                a="La mayoría de proyectos requieren mínimo 3-4 semanas. Recomendamos 4-8 semanas para una experiencia significativa. El plan Premium permite combinar varios países en estadías más largas." 
              />
              <FaqAccordion 
                index={2}
                q="¿Qué incluye exactamente cada plan?" 
                a="Cada plan está detallado en la sección de precios. La diferencia principal está en el nivel de curaduría personalizada y el acompañamiento durante el viaje. En la consulta inicial te ayudamos a elegir el plan ideal." 
              />
              <FaqAccordion 
                index={3}
                q="¿Ustedes son una agencia de migración?" 
                a="No. LATAM VISA es una consultoría de viajes y educación. No tramitamos visas de residencia ni damos asesoría migratoria. Te guiamos con visas de turista y e-visas, y te conectamos con proyectos de voluntariado a través de plataformas reconocidas." 
              />
              <FaqAccordion 
                index={4}
                q="¿Puedo combinar varios países?" 
                a="Sí, con el plan Premium diseñamos itinerarios multi-país, por ejemplo Vietnam más Camboya, aprovechando rutas terrestres entre ambos." 
              />
              <FaqAccordion 
                index={5}
                q="¿Qué pasa si tengo una emergencia en destino?" 
                a="Los planes Plus y Premium incluyen soporte por WhatsApp durante todo tu viaje. Además, todo voluntario debe contratar un seguro de viaje internacional, que te ayudamos a elegir." 
              />
              <div className="border-t border-[#1A1A1A]" />
            </div>
          </div>
        </section>

        {/* ════ SECTION 8: FINAL CTA ════ */}
        <section className="py-24 md:py-32 px-6 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#C8FF00]/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <FadeUp>
              <h2 className="font-geist font-light text-3xl md:text-5xl tracking-widest uppercase mb-6">
                ¿Listo para vivir <span className="text-[#C8FF00]">Asia de verdad?</span>
              </h2>
              <p className="font-sans font-light text-[#CCCCCC] text-base md:text-lg mb-10">
                Agenda tu consulta gratuita. Sin compromiso. En español.
              </p>
              <Link 
                href="/agendar/voluntariado" 
                onClick={() => trackLead()}
                className="inline-flex items-center justify-center px-10 py-5 bg-[#C8FF00] text-[#050505] font-geist text-sm md:text-base uppercase tracking-widest font-medium rounded-sm hover:bg-[#FFFFFF] hover:text-[#050505] transition-all hover:scale-105 duration-300"
              >
                Reservar consulta — Gratis
              </Link>
            </FadeUp>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
