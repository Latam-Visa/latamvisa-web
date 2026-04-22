'use client'
import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Search,
  Map,
  FileText,
  MessageCircle,
  ChevronDown,
  CheckCircle,
  CreditCard,
  Phone,
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

// ── Flip Hover Text Helper ─────────────────────────────────────────────────────
function FlipText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={`inline-flex flex-wrap gap-[0.25em] justify-center flip-hover-group cursor-default ${className}`}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="word-group">
          {/* Default Layer (Before) */}
          <span className="inline-flex before-layer" aria-hidden="true">
            {word.split('').map((char, cIdx) => (
              <span key={`b-${cIdx}`} className="char-el">
                {char}
              </span>
            ))}
          </span>
          {/* Hover Layer (After) */}
          <span className="inline-flex after-layer">
            {word.split('').map((char, cIdx) => (
              <span key={`a-${cIdx}`} className="char-el font-black">
                {char}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────────
const CAL_URL = 'https://cal.com/cristian-montenegro-tzeuce/consulta-migratoria-personalizada'

const includes = [
  {
    icon: Search,
    title: 'Revisión completa de tu perfil',
    desc: 'Analizamos tu situación financiera, historial de viajes, intereses educativos y todo lo que definirá tus mejores opciones en Australia.',
  },
  {
    icon: Map,
    title: 'Ruta de estudio y viaje personalizada',
    desc: 'Te decimos exactamente qué cursos o destinos aplican para tu caso, cuánto cuestan, cómo iniciar el traslado y cuál es tu ruta ideal.',
  },
  {
    icon: FileText,
    title: 'Lista de preparación requerida',
    desc: 'Recibirás un checklist detallado con todos los recaudos o requerimientos que necesitas preparar para tu viaje y estudio.',
  },
  {
    icon: MessageCircle,
    title: 'Respuestas a todas tus preguntas',
    desc: '45 minutos contigo, sin límite de preguntas. Saldrás con claridad total sobre tu proceso y los próximos pasos.',
  },
]

const testimonials = [
  {
    name: 'Valentina Ríos',
    country: 'Colombia',
    visa: 'Visa Turismo Australia',
    text: 'Tenía mil dudas y miedos sobre si calificaba. En la consulta me explicaron todo en detalle, me dieron confianza y en 6 semanas tenía mi visa aprobada.',
    rating: 5,
  },
  {
    name: 'Andrés Molina',
    country: 'México',
    visa: 'Visa Estudiante Australia (Subclass 500)',
    text: 'El análisis de mi perfil fue brutalmente honesto y preciso. Sabía exactamente qué documentos preparar. Vale cada centavo y mucho más.',
    rating: 5,
  },
  {
    name: 'Camila Herrera',
    country: 'Perú',
    visa: 'Visa Turismo USA (B1/B2)',
    text: 'Había intentado sola antes y me rechazaron. Después de la consulta entendí qué había fallado y cómo corregirlo. Mi segunda aplicación fue aprobada.',
    rating: 5,
  },
]

const steps = [
  {
    num: '01',
    icon: CreditCard,
    title: 'Agendas y pagas',
    desc: 'Selecciona el horario que más te convenga en Cal.com y completa el pago. Inmediatamente recibirás una confirmación con el enlace de la videollamada.',
  },
  {
    num: '02',
    icon: Phone,
    title: 'Tenemos la llamada',
    desc: 'Nos reunimos por videollamada durante 45 minutos. Trae tus preguntas, documentos y cualquier duda. Analizamos tu caso en vivo.',
  },
  {
    num: '03',
    icon: FileText,
    title: 'Recibes tu plan detallado',
    desc: 'Dentro de las 24 horas siguientes te enviamos por email tu plan de educación y viaje personalizado: escuelas recomendadas, requisitos, costos y próximos pasos.',
  },
]

const faqs = [
  {
    q: '¿Qué pasa con los USD $59 si contrato el servicio completo?',
    a: 'Los $59 son totalmente reembolsables al contratar cualquiera de nuestros paquetes completos de asesoría. El monto se descuenta de tu factura final.',
  },
  {
    q: '¿Necesito preparar algo antes de la llamada?',
    a: 'Solo traer tus preguntas y una idea general de tu situación. Si tienes pasaporte vigente o viajes anteriores, puedes tenerlos a mano, pero no es obligatorio.',
  },
  {
    q: '¿La asesoría educativa es garantía de un resultado en mis procesos?',
    a: 'No. Ninguna agencia puede garantizar aprobaciones de terceros o de instituciones. Lo que sí garantizamos es que saldrás con claridad total sobre tu caso, tus opciones educativas y el mejor camino a seguir.',
  },
  {
    q: '¿Puedo agendar si todavía no sé qué quiero estudiar o visitar?',
    a: 'Sí, de hecho es el escenario ideal. Evaluamos tu perfil para conectarte con las mejores instituciones educativas y definir tus objetivos.',
  },
]

// ── Sub-components (each calls hooks at top level) ─────────────────────────────
function IncludeCard({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: React.ElementType
  title: string
  desc: string
  delay: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className="group bg-[#E8FF7A]/40 border border-[#111111]/10 rounded-2xl p-6 hover:border-[#1A2A00]/30 transition-all duration-300 hover:bg-[#E8FF7A]/80 shadow-sm"
    >
      <div className="w-11 h-11 rounded-xl bg-white/50 flex items-center justify-center mb-5 group-hover:bg-white transition-colors duration-300">
        <Icon size={20} className="text-[#1A2A00]" />
      </div>
      <h3
        className="font-monument font-black text-[13px] md:text-sm tracking-tight text-[#111111] mb-2 leading-snug"
        style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
      >
        {title}
      </h3>
      <p className="font-iceland text-[#111111]/70 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function TestimonialCard({
  name,
  country,
  visa,
  text,
  rating,
  delay,
}: {
  name: string
  country: string
  visa: string
  text: string
  rating: number
  delay: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className="bg-[#E8FF7A]/40 border border-[#111111]/10 rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex">
        {[...Array(rating)].map((_, j) => (
          <span key={j} className="text-[#1A2A00] text-sm">★</span>
        ))}
      </div>
      <p className="font-iceland text-[#111111]/80 text-sm md:text-base leading-relaxed flex-1 font-medium">
        &ldquo;{text}&rdquo;
      </p>
      <div>
        <p
          className="font-monument font-black text-[12px] text-[#111111] tracking-tight"
          style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
        >
          {name}
        </p>
        <p className="font-iceland text-[#111111]/60 text-xs mt-0.5 font-bold uppercase tracking-wider">
          {country} · {visa}
        </p>
      </div>
    </motion.div>
  )
}

function StepCard({
  num,
  icon: Icon,
  title,
  desc,
  delay,
  isLast,
}: {
  num: string
  icon: React.ElementType
  title: string
  desc: string
  delay: number
  isLast: boolean
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className="relative"
    >
      {!isLast && (
        <div
          aria-hidden
          className="hidden md:block absolute top-7 left-[calc(100%_-_16px)] w-full h-px bg-gradient-to-r from-[#111111]/20 to-transparent"
        />
      )}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span
            className="font-monument font-black text-5xl md:text-6xl text-[#1A2A00]/15 leading-none select-none"
            style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
          >
            {num}
          </span>
          <div className="w-10 h-10 rounded-xl bg-white/50 border border-[#1A2A00]/10 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-[#1A2A00]" />
          </div>
        </div>
        <h3
          className="font-monument font-black text-sm md:text-base tracking-tight text-[#111111]"
          style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
        >
          {title}
        </h3>
        <p className="font-iceland text-[#111111]/70 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 16 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      className="border-t border-[#111111]/10"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-funnel font-bold text-[#111111]/90 text-[13px] md:text-[15px] group-hover:text-[#1A2A00] transition-colors duration-200 leading-tight">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center border rounded-sm transition-colors duration-200 ${
            open
              ? 'border-[#1A2A00] text-[#1A2A00] bg-white/30'
              : 'border-[#111111]/20 text-[#111111]/40 group-hover:border-[#1A2A00]/50'
          }`}
        >
          <ChevronDown size={14} />
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
            <p className="font-iceland text-[#111111]/70 text-[14px] md:text-[15px] leading-relaxed pb-6 pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function AgendarClient() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-white via-[#FAFFEB] to-[#C8FF00]/40 text-[#111111]">
      
      {/* Capa de textura de ruido (Grain effect) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative z-10 w-full">
        {/* 
          NOTA: Para asegurar que el Navbar se adapte visualmente sin romperse
          en el fondo perlado, mantenemos el esquema original.
        */}
        <Navbar />

      {/* ═══════════════════════ HERO ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-40 mix-blend-screen"
          style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <FadeUp delay={0.12}>
            <h1
              className="font-monument font-black text-3xl sm:text-4xl md:text-5xl leading-[1.2] tracking-tight mb-6 uppercase flex flex-col gap-1 items-center"
              style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
            >
              <FlipText text="AGENDA TU SESIÓN" className="text-[#111111]" />
              <FlipText text="DE PLANEACIÓN" className="text-[#1A2A00]" />
            </h1>
          </FadeUp>

          <FadeUp delay={0.18}>
            <p className="font-funnel text-[#111111]/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-6">
              45 minutos con un experto. Analizamos tu perfil, te ayudamos a planificar tu experiencia de estudio y viaje,
              y respondes todas tus dudas — por{' '}
              <span className="text-[#1A2A00] font-black text-2xl bg-white/40 px-2 py-0.5 rounded-md">$59 <span className="text-xs font-normal">usd</span></span>.
            </p>
          </FadeUp>

          {/* GANCHO RESALTADO */}
          <FadeUp delay={0.24}>
            <div className="inline-block border border-[#1A2A00]/20 bg-white/40 backdrop-blur-md px-6 py-4 rounded-xl mb-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all">
              <p className="font-iceland text-[#1A2A00] font-bold text-lg md:text-xl leading-relaxed">
                Reembolsables al contratar el servicio completo.<br className="hidden md:block"/> Sin compromiso inicial, con claridad total.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.3} className="w-full flex justify-center">
            {/* Contenedor del Calendario (Asegurar que esté por encima del ruido) */}
            <div className="relative z-10 w-full max-w-[1000px] h-[700px] rounded-xl shadow-2xl overflow-hidden border border-gray-100/20">
              <iframe
                src={`${CAL_URL}?embed=true&theme=dark`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Agendar Consulta Latam Visa"
              ></iframe>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════ QUÉ INCLUYE ════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="mb-14 text-center">
              <span className="font-funnel text-[#1A2A00] text-xs tracking-[0.25em] uppercase block mb-3 font-bold">
                Lo que obtienes
              </span>
              <h2
                className="font-monument font-black text-3xl md:text-4xl tracking-tight text-[#111111]"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                Qué incluye la consulta
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {includes.map(({ icon, title, desc }, i) => (
              <IncludeCard key={i} icon={icon} title={title} desc={desc} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ POR QUÉ 59 ════════════════════════════════════ */}
      <section className="py-20 px-6 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/40 backdrop-blur-md border border-[#1A2A00]/10 rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:bg-white/50 transition-colors">
            <FadeUp>
              <span className="font-funnel text-[#1A2A00] font-bold text-xs tracking-[0.25em] uppercase block mb-4">
                Transparencia total
              </span>
              <h2
                className="font-monument font-black text-2xl md:text-3xl tracking-tight text-[#111111] mb-6 leading-[1.1]"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                ¿Por qué cobrar{' '}
                <span className="text-[#1A2A00]">$59</span> <span className="text-sm font-normal text-[#1A2A00]/70 uppercase tracking-widest">usd</span>?
              </h2>
            </FadeUp>

            <div className="space-y-5">
              {[
                {
                  bold: 'Son reembolsables.',
                  body: 'Si decides continuar con nosotros para tramitar tu visa, los $59 se descuentan del costo total del servicio. No pierdes nada.',
                },
                {
                  bold: 'Es un filtro de seriedad mutua.',
                  body: 'Atendemos a personas que realmente quieren avanzar. El pago garantiza que ambos llegamos preparados y comprometidos a la sesión.',
                },
                {
                  bold: 'Cobran los mejores.',
                  body: 'Un consultor de alto nivel experto en Australia cobra entre AUD $300 y $500 por una entrevista de estructuración. Tú accedes a este nivel de análisis por $59.',
                },
              ].map(({ bold, body }, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <div className="flex items-start gap-4">
                    <CheckCircle size={18} className="text-[#1A2A00] flex-shrink-0 mt-0.5" />
                    <p className="font-iceland text-sm md:text-base leading-relaxed">
                      <span className="text-[#111111] font-bold">{bold}</span>{' '}
                      <span className="text-[#111111]/70">{body}</span>
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIOS ═════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="mb-14 text-center">
              <span className="font-funnel text-[#1A2A00] font-bold text-xs tracking-[0.25em] uppercase block mb-3">
                Clientes reales
              </span>
              <h2
                className="font-monument font-black text-3xl md:text-4xl tracking-tight text-[#111111]"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                Lo que dicen quienes{' '}
                <span className="text-[#1A2A00]">ya agendaron</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PROCESO 3 PASOS ════════════════════════════════ */}
      <section className="py-20 px-6 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="mb-14 text-center">
              <span className="font-funnel text-[#1A2A00] font-bold text-xs tracking-[0.25em] uppercase block mb-3">
                Así funciona
              </span>
              <h2
                className="font-monument font-black text-3xl md:text-4xl tracking-tight text-[#111111]"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                3 pasos simples
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map(({ num, icon, title, desc }, i) => (
              <StepCard
                key={i}
                num={num}
                icon={icon}
                title={title}
                desc={desc}
                delay={i * 0.1}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16 items-start">
            <FadeUp className="lg:sticky lg:top-32">
              <span className="font-funnel text-[#1A2A00] font-bold text-xs tracking-[0.25em] uppercase block mb-3">
                Dudas frecuentes
              </span>
              <h2
                className="font-monument font-black text-xl md:text-2xl tracking-tight text-[#111111] mb-4 leading-[1.1]"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                Preguntas
                <br />
                <span className="text-[#1A2A00]/60">rápidas</span>
              </h2>
            </FadeUp>

            <div className="pt-2 lg:pt-0">
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
              <div className="border-t border-[#111111]/10" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  )
}
