'use client'
import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Search,
  Map,
  FileText,
  MessageCircle,
  ChevronDown,
  ArrowRight,
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

// ── Data ───────────────────────────────────────────────────────────────────────
const CAL_URL = 'https://cal.com/cristian-montenegro-tzeuce/consulta-migratoria-personalizada'

const includes = [
  {
    icon: Search,
    title: 'Revisión completa de tu perfil',
    desc: 'Analizamos tu situación financiera, historial de viajes, vínculos familiares y todo lo que el oficial de visas revisará.',
  },
  {
    icon: Map,
    title: 'Ruta migratoria personalizada',
    desc: 'Te decimos exactamente qué visa aplica para tu caso, cuánto cuesta, cuánto tarda y cuál es tu probabilidad real de aprobación.',
  },
  {
    icon: FileText,
    title: 'Lista de documentos requeridos',
    desc: 'Recibirás un checklist detallado con todos los documentos que necesitas presentar, priorizado por impacto.',
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
    desc: 'Selecciona el horario que más te convenga en Cal.com y completa el pago de USD $50. Inmediatamente recibirás una confirmación con el enlace de la videollamada.',
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
    desc: 'Dentro de las 24 horas siguientes te enviamos por email tu plan migratorio personalizado: visa recomendada, documentos, costos y próximos pasos.',
  },
]

const faqs = [
  {
    q: '¿Qué pasa con los USD $50 si contrato el servicio completo?',
    a: 'Los $50 son totalmente reembolsables al contratar cualquiera de nuestros paquetes completos de asesoría. El monto se descuenta de tu factura final.',
  },
  {
    q: '¿Necesito preparar algo antes de la llamada?',
    a: 'Solo traer tus preguntas y una idea general de tu situación. Si tienes pasaporte vigente o viajes anteriores, puedes tenerlos a mano, pero no es obligatorio.',
  },
  {
    q: '¿La consulta es garantía de que me aprobarán la visa?',
    a: 'No. Ninguna agencia legítima puede garantizar la aprobación. Lo que sí garantizamos es que saldrás con claridad total sobre tu caso, tu probabilidad real y el mejor camino a seguir.',
  },
  {
    q: '¿Puedo agendar si todavía no sé qué visa quiero tramitar?',
    a: 'Sí, de hecho es el escenario ideal. Te ayudamos a identificar cuál visa es la correcta para tu perfil y tus objetivos.',
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
      className="group bg-[#111] border border-white/[0.08] rounded-2xl p-6 hover:border-[#C8FF00]/40 transition-all duration-300 hover:bg-[#141414]"
    >
      <div className="w-11 h-11 rounded-xl bg-[#C8FF00]/10 flex items-center justify-center mb-5 group-hover:bg-[#C8FF00]/20 transition-colors duration-300">
        <Icon size={20} className="text-[#C8FF00]" />
      </div>
      <h3
        className="font-monument font-black text-[13px] md:text-sm tracking-tight text-white mb-2 leading-snug"
        style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
      >
        {title}
      </h3>
      <p className="font-iceland text-white/50 text-sm leading-relaxed">{desc}</p>
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
      className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4"
    >
      <div className="flex">
        {[...Array(rating)].map((_, j) => (
          <span key={j} className="text-[#C8FF00] text-sm">★</span>
        ))}
      </div>
      <p className="font-iceland text-white/70 text-sm md:text-base leading-relaxed flex-1">
        &ldquo;{text}&rdquo;
      </p>
      <div>
        <p
          className="font-monument font-black text-[12px] text-white tracking-tight"
          style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
        >
          {name}
        </p>
        <p className="font-iceland text-white/40 text-xs mt-0.5">
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
          className="hidden md:block absolute top-7 left-[calc(100%_-_16px)] w-full h-px bg-gradient-to-r from-[#C8FF00]/30 to-transparent"
        />
      )}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span
            className="font-monument font-black text-5xl md:text-6xl text-[#C8FF00]/15 leading-none select-none"
            style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
          >
            {num}
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#C8FF00]/10 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-[#C8FF00]" />
          </div>
        </div>
        <h3
          className="font-monument font-black text-sm md:text-base tracking-tight text-white"
          style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
        >
          {title}
        </h3>
        <p className="font-iceland text-white/50 text-sm leading-relaxed">{desc}</p>
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
      className="border-t border-white/10"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-funnel font-semibold text-white/80 text-[13px] md:text-[15px] group-hover:text-white transition-colors duration-200 leading-tight">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center border rounded-sm transition-colors duration-200 ${
            open
              ? 'border-[#C8FF00] text-[#C8FF00]'
              : 'border-white/20 text-white/30 group-hover:border-[#C8FF00]/50'
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
            <p className="font-iceland text-white/50 text-[14px] md:text-[15px] leading-relaxed pb-6 pr-8">
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
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* ═══════════════════════ HERO ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #C8FF00 0%, transparent 70%)' }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <FadeUp delay={0.05}>
            <span className="inline-block font-funnel text-[#C8FF00] text-xs tracking-[0.25em] uppercase mb-6 border border-[#C8FF00]/30 rounded-full px-4 py-1.5">
              Consulta Migratoria Personalizada
            </span>
          </FadeUp>

          <FadeUp delay={0.12}>
            <h1
              className="font-monument font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight mb-6"
              style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
            >
              Agenda tu{' '}
              <span className="text-[#C8FF00]">consulta</span>
              <br />
              migratoria
            </h1>
          </FadeUp>

          <FadeUp delay={0.18}>
            <p className="font-funnel text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4">
              45 minutos con un experto. Analizamos tu perfil, te damos tu ruta exacta
              y respondes todas tus dudas — por{' '}
              <span className="text-white font-semibold">USD $50</span>.
            </p>
          </FadeUp>

          <FadeUp delay={0.24}>
            <p className="font-iceland text-white/40 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-12">
              Reembolsables al contratar el servicio completo. Sin compromiso inicial,
              con claridad total.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#C8FF00] text-[#050505] font-black text-sm tracking-widest uppercase px-10 py-5 rounded-full hover:bg-[#d4ff40] transition-all duration-200 shadow-[0_0_40px_rgba(200,255,0,0.25)] hover:shadow-[0_0_60px_rgba(200,255,0,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
            >
              Agendar mi consulta — USD $50
              <ArrowRight size={16} />
            </a>
          </FadeUp>

          <FadeUp delay={0.38}>
            <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-sm font-iceland">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#C8FF00] text-xs">★</span>
                ))}
              </div>
              <span>+200 consultas realizadas · 94% de aprobación</span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════ QUÉ INCLUYE ════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="mb-14 text-center">
              <span className="font-funnel text-[#C8FF00] text-xs tracking-[0.25em] uppercase block mb-3">
                Lo que obtienes
              </span>
              <h2
                className="font-monument font-black text-3xl md:text-4xl tracking-tight"
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

      {/* ═══════════════════════ POR QUÉ $50 ════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0e1200] border border-[#C8FF00]/20 rounded-3xl p-8 md:p-12">
            <FadeUp>
              <span className="font-funnel text-[#C8FF00] text-xs tracking-[0.25em] uppercase block mb-4">
                Transparencia total
              </span>
              <h2
                className="font-monument font-black text-2xl md:text-3xl tracking-tight text-white mb-6 leading-[1.1]"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                ¿Por qué pagar{' '}
                <span className="text-[#C8FF00]">USD $50</span>?
              </h2>
            </FadeUp>

            <div className="space-y-5">
              {[
                {
                  bold: 'Son reembolsables.',
                  body: 'Si decides continuar con nosotros para tramitar tu visa, los $50 se descuentan del costo total del servicio. No pierdes nada.',
                },
                {
                  bold: 'Es un filtro de seriedad mutua.',
                  body: 'Atendemos a personas que realmente quieren avanzar. El pago garantiza que ambos llegamos preparados y comprometidos a la sesión.',
                },
                {
                  bold: 'Cobran los mejores.',
                  body: 'Un abogado migratorio en Australia cobra entre AUD $300 y $500 por una consulta inicial. Tú accedes al mismo nivel de expertise por $50.',
                },
              ].map(({ bold, body }, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <div className="flex items-start gap-4">
                    <CheckCircle size={18} className="text-[#C8FF00] flex-shrink-0 mt-0.5" />
                    <p className="font-iceland text-sm md:text-base leading-relaxed">
                      <span className="text-white font-semibold">{bold}</span>{' '}
                      <span className="text-white/60">{body}</span>
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIOS ═════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="mb-14 text-center">
              <span className="font-funnel text-[#C8FF00] text-xs tracking-[0.25em] uppercase block mb-3">
                Clientes reales
              </span>
              <h2
                className="font-monument font-black text-3xl md:text-4xl tracking-tight"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                Lo que dicen quienes{' '}
                <span className="text-[#C8FF00]">ya agendaron</span>
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
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="mb-14 text-center">
              <span className="font-funnel text-[#C8FF00] text-xs tracking-[0.25em] uppercase block mb-3">
                Así funciona
              </span>
              <h2
                className="font-monument font-black text-3xl md:text-4xl tracking-tight"
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

      {/* ═══════════════════════ CTA FINAL ══════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(200,255,0,0.12) 0%, transparent 65%)',
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <FadeUp>
            <h2
              className="font-monument font-black text-3xl md:text-5xl tracking-tight leading-[1.05] mb-6"
              style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
            >
              ¿Listo para tener{' '}
              <span className="text-[#C8FF00]">claridad total</span>?
            </h2>
            <p className="font-iceland text-white/50 text-base md:text-lg leading-relaxed mb-10">
              45 minutos que pueden cambiar el rumbo de tu proceso migratorio.
              Sin vueltas, sin promesas vacías.
            </p>
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#C8FF00] text-[#050505] font-black text-sm tracking-widest uppercase px-10 py-5 rounded-full hover:bg-[#d4ff40] transition-all duration-200 shadow-[0_0_40px_rgba(200,255,0,0.3)] hover:shadow-[0_0_70px_rgba(200,255,0,0.5)] hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
            >
              Agendar mi consulta — USD $50
              <ArrowRight size={16} />
            </a>
            <p className="mt-5 font-iceland text-white/25 text-sm">
              Pago seguro vía Cal.com · Reembolsable al contratar el servicio completo
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═════════════════════════════════════════════ */}
      <section
        className="py-20 px-6"
        style={{
          background:
            'linear-gradient(to bottom, #050505 0%, #080f00 40%, #0d1500 70%, #C8FF00 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16 items-start">
            <FadeUp className="lg:sticky lg:top-32">
              <span className="font-funnel text-[#C8FF00] text-xs tracking-[0.25em] uppercase block mb-3">
                Dudas frecuentes
              </span>
              <h2
                className="font-monument font-black text-xl md:text-2xl tracking-tight text-white mb-4 leading-[1.1]"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                Preguntas
                <br />
                <span className="text-white/30">rápidas</span>
              </h2>
              <p className="font-iceland text-white/40 text-sm md:text-base leading-relaxed">
                ¿Tienes más preguntas? Escríbenos por WhatsApp y te respondemos enseguida.
              </p>
            </FadeUp>

            <div className="pt-2 lg:pt-0">
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
              <div className="border-t border-white/10" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
