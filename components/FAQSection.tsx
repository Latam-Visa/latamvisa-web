'use client'
import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

const faqs = [
  {
    q: '¿Cuánto tiempo tarda en aprobarse una visa de estudiante para Australia?',
    a: 'El tiempo promedio es de 4 a 8 semanas. Puede variar según tu país de origen, historial de viajes y la completud de tu documentación. Con nuestra asesoría, maximizamos las chances de que tu expediente sea revisado sin observaciones.',
  },
  {
    q: '¿Necesito hablar inglés perfectamente para obtener la visa?',
    a: 'No. La visa Subclass 500 está diseñada precisamente para quienes quieren aprender inglés en Australia. Se exige demostrar capacidad financiera y verdadera intención de estudio, no un nivel de inglés previo.',
  },
  {
    q: '¿Puedo trabajar mientras estudio en Australia?',
    a: 'Sí. Con la visa de estudiante (Subclass 500) puedes trabajar hasta 48 horas cada dos semanas durante el período de clases, y sin límite de horas durante las vacaciones escolares.',
  },
  {
    q: '¿Cuánto dinero necesito demostrar en banco para la visa?',
    a: 'El monto varía según el curso y duración. Generalmente se pide demostrar fondos para el primer año: costo del curso + AUD $21,041 para manutención + AUD $8,000 si llevas dependientes. Te orientamos en cada caso.',
  },
  {
    q: '¿Qué pasa si me rechazan la visa?',
    a: 'Un rechazo no es el fin del camino. Analizamos los motivos, fortalecemos el expediente y podemos apelar o presentar una nueva aplicación. Por eso el acompañamiento experto desde el inicio es crítico.',
  },
  {
    q: '¿Desde qué países de LATAM atienden?',
    a: 'Atendemos clientes de toda Latinoamérica: Colombia, México, Perú, Argentina, Chile, Venezuela, Ecuador, Bolivia, Paraguay, Uruguay, Brasil, Guatemala, Costa Rica, Rep. Dominicana, entre otros. También asesoramos a personas que ya están en Australia y quieren tramitar una visa para otro destino.',
  },
  {
    q: '¿Hacen visas de turismo para Japón, Inglaterra y Canadá?',
    a: 'Sí. Tramitamos visas de turismo para Japón 🇯🇵, Inglaterra 🇬🇧 y Canadá 🍁. Puedes iniciar el proceso desde Australia o desde cualquier país de Latinoamérica. Cada destino tiene sus propios requisitos y documentación — te acompañamos en cada paso para maximizar las chances de aprobación.',
  },
  {
    q: '¿LATAM VISA garantiza la aprobación de mi visa?',
    a: 'No. Ninguna agencia legítima puede garantizar la aprobación, ya que la decisión final corresponde exclusivamente a las autoridades migratorias australianas. Lo que sí garantizamos es asesoría experta, expediente sólido y acompañamiento en cada paso.',
  },
  {
    q: '¿Cuánto cuesta el servicio de asesoría?',
    a: 'El costo depende del tipo de visa y la complejidad del caso. Ofrecemos una evaluación de perfil gratuita donde te explicamos el proceso y los costos antes de cualquier compromiso.',
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
      className="border-t border-[#1a2a00]/10"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="font-funnel font-semibold text-[#1a2a00]/90 text-[13px] md:text-[15px] group-hover:text-[#5B6A00] transition-colors duration-200 leading-tight">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center border transition-colors duration-200 rounded-sm ${
            open ? 'border-[#5B6A00] text-[#5B6A00]' : 'border-[#1a2a00]/20 text-[#1a2a00]/40 group-hover:border-[#5B6A00]/60'
          }`}
        >
          <Plus size={12} />
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
            <p className="font-iceland text-[#1a2a00]/70 text-[13px] md:text-[14px] leading-relaxed pb-6 pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-60px' })

  return (
    <section
      className="py-16 lg:py-24 px-6 relative z-10 -mt-[1px]"
      style={{ background: 'linear-gradient(to bottom, #C8FF00 0%, #d4ff00 20%, #f0ff99 42%, #fafff0 65%, #FFFFFF 100%)' }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-10 lg:gap-16 items-start">
          
          {/* Left — header */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-32"
          >
            <span className="font-funnel text-[#5B6A00] text-xs md:text-sm tracking-[0.2em] uppercase block mb-3">
              DUDAS FRECUENTES
            </span>
            <h2 className="font-monument font-black text-xl md:text-3xl tracking-tight text-[#1a2a00] mb-6 leading-[1.1]">
              RESPUESTAS <br className="hidden md:block"/>
              <span className="text-[#1a2a00]/40">RÁPIDAS</span>
            </h2>
            <p className="font-iceland text-[#1a2a00]/60 text-base md:text-lg leading-relaxed">
              ¿Tienes más preguntas? Escríbenos por WhatsApp — respondemos enseguida.
            </p>
          </motion.div>

          {/* Right — accordion */}
          <div className="divide-y-0 pt-2 lg:pt-0">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
            <div className="border-t border-[#1a2a00]/10" />
          </div>
          
        </div>
      </div>
    </section>
  )
}
