'use client'
import { motion } from 'framer-motion'
import { Shield, Clock, MessageSquare, Globe } from 'lucide-react'
import { buildVariants, staggerContainerVariants } from './Reveal'

const reasons = [
  {
    icon: Shield,
    title: 'Expertos certificados',
    body: 'Nuestros asesores tienen experiencia directa con el Departamento de Home Affairs de Australia. Conocemos los criterios reales de aprobación.',
  },
  {
    icon: MessageSquare,
    title: 'Asesoría en español',
    body: 'Todo el proceso lo hacemos en tu idioma. Sin malentendidos, sin traducciones imprecisas que puedan costarle tu visa.',
  },
  {
    icon: Clock,
    title: 'Acompañamiento real',
    body: 'No desaparecemos después de la consulta. Estamos contigo desde la evaluación inicial hasta que recibes la respuesta del gobierno australiano.',
  },
  {
    icon: Globe,
    title: 'Presencia en Australia',
    body: 'Estamos en Brisbane. Conocemos las escuelas, los procesos locales y las instituciones con las que trabajamos directamente.',
  },
]

const diffs = [
  { label: 'Tramitar solo',   items: ['Proceso desorganizado', 'Errores documentales frecuentes', 'Sin orientación estratégica', 'Alto riesgo de rechazo'], isHighlight: false },
  { label: 'Con LATAM VISA', items: ['Estrategia personalizada', 'Documentación sin errores', 'Acompañamiento experto', 'Expediente sólido desde el inicio'], isHighlight: true },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const cardVariant = {
  hidden: { opacity: 0, y: 80, filter: 'blur(10px)', scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 1.2, ease: EASE, delay: i * 0.15 },
  }),
}

const pillarVariant = {
  hidden: { opacity: 0, y: 38, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: EASE } },
}

export default function WhyUsSection() {
  return (
    <section
      className="bg-transparent py-14 px-6 relative z-10 -mt-[1px]"
      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(245,255,200,0.6) 50%, rgba(255,255,255,1) 100%)' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header — right aligned with tight transparent white background */}
        <div className="flex justify-end mb-16 px-4">
          <motion.div
            className="p-8 md:p-10 rounded-[2rem] bg-white/40 backdrop-blur-lg border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.04)] w-fit text-right"
            variants={buildVariants('up', 30, 0, 0.72)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-80px' }}
          >
            <span className="font-funnel text-[#5B6A00] text-xs tracking-[0.3em] uppercase block mb-4">
              Por qué elegirnos
            </span>
            <h2 className="font-monument font-black text-xl md:text-3xl tracking-tight text-[#111111]">
              La diferencia entre
              <br />
              <span className="text-[#5B6A00] italic">aprobar o no aprobar</span>
            </h2>
          </motion.div>
        </div>

        {/* Comparison — staggered cinematic reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto px-4">
          {diffs.map((d, i) => (
            <motion.div
              key={d.label}
              custom={i}
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-10px' }}
              className={`p-8 md:p-10 border transition-all duration-700 ${
                d.isHighlight
                  ? 'border-[#C8FF00]/60 bg-white/80 backdrop-blur-md shadow-[0_20px_50px_rgba(200,255,0,0.15)] relative lg:scale-105 z-10'
                  : 'border-[#111111]/10 bg-black/5 bg-opacity-30 backdrop-blur-sm grayscale-[0.5] opacity-80'
              }`}
            >
              <h3 className={`font-funnel font-black text-sm md:text-base tracking-widest uppercase mb-8 ${d.isHighlight ? 'text-[#111111]' : 'text-[#8A8A8A]'}`}>
                {d.label}
              </h3>
              <ul className="space-y-4">
                {d.items.map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${d.isHighlight ? 'bg-[#C8FF00] shadow-[0_0_10px_rgba(200,255,0,0.8)]' : 'bg-[#111111]/20'}`} />
                    <span className={`font-iceland text-sm md:text-base ${d.isHighlight ? 'text-[#111111] font-medium' : 'text-[#777777]/70 line-through'}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* 4 pillars — stagger fade-up */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainerVariants(0.12, 0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-80px' }}
        >
          {reasons.map((r) => (
            <motion.div
              key={r.title}
              variants={pillarVariant}
              className="group border border-transparent hover:border-[#C8FF00]/30 hover:shadow-[0_0_20px_rgba(200,255,0,0.07)] p-4 -m-4 transition-all duration-500"
            >
              <div className="w-10 h-10 border border-[#C8FF00]/50 flex items-center justify-center mb-5 group-hover:shadow-[0_0_10px_rgba(200,255,0,0.15)] transition-all duration-500">
                <r.icon size={18} className="text-[#5B6A00]" />
              </div>
              <h3 className="font-funnel font-semibold text-[#111111] text-xs uppercase tracking-widest mb-2">{r.title}</h3>
              <p className="font-iceland text-[#777777] text-[11px] uppercase tracking-wide leading-relaxed">{r.body}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
