'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Minus } from 'lucide-react'

const visas = [
  {
    flag: '🇦🇺',
    code: 'SC-500',
    name: 'Visa Estudiante',
    country: 'Australia',
    highlight: true,
    tag: 'Más solicitada',
    duration: 'Hasta 5 años',
  },
  {
    flag: '🇦🇺',
    code: 'SC-600',
    name: 'Visa Turismo',
    country: 'Australia',
    highlight: false,
    tag: null,
    duration: 'Hasta 12 meses',
  },
  {
    flag: '🇺🇸',
    code: 'B1/B2',
    name: 'Visa Turismo',
    country: 'Estados Unidos',
    highlight: false,
    tag: null,
    duration: 'Hasta 10 años',
  },
  {
    flag: '🇨🇦',
    code: 'TRV',
    name: 'Visa Turismo',
    country: 'Canadá',
    highlight: false,
    tag: null,
    duration: 'Hasta 10 años',
  },
  {
    flag: '🇯🇵',
    code: 'JP-TUR',
    name: 'Visa Turismo',
    country: 'Japón',
    highlight: false,
    tag: null,
    duration: 'Hasta 90 días',
  },
  {
    flag: '🇬🇧',
    code: 'SV',
    name: 'Visitor Visa',
    country: 'Reino Unido',
    highlight: false,
    tag: null,
    duration: 'Hasta 6 meses',
  },
]

const features = [
  { label: 'Permiso de trabajo',       vals: [true,  false, false, false, false, false] },
  { label: 'Estudio incluido',          vals: [true,  false, false, false, false, false] },
  { label: 'Estadía +6 meses',         vals: [true,  false, true,  true,  false, false] },
  { label: 'Renovable en destino',      vals: [true,  null,  false, false, false, false] },
  { label: 'Sin entrevista consular',   vals: [true,  true,  false, true,  true,  true ] },
  { label: 'Proceso 100% online',       vals: [true,  true,  false, true,  true,  true ] },
  { label: 'Trae a tu familia',         vals: [true,  false, false, false, false, false] },
]

type Val = boolean | null
function Cell({ v, isActive }: { v: Val; isActive: boolean }) {
  if (v === true)  return <Check  size={14} className={isActive ? 'text-[#5B6A00] mx-auto' : 'text-[#111111]/60 mx-auto'} strokeWidth={2.5} />
  if (v === false) return <Minus  size={14} className="text-[#111111]/15 mx-auto" strokeWidth={2} />
  return <span className="block text-center text-[#5B6A00]/70 text-xs">~</span>
}

export default function VisaComparisonTable() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [hoveredCol, setHoveredCol] = useState<number | null>(null)

  const isActive = (ci: number) => hoveredCol === ci || visas[ci].highlight

  return (
    <section className="bg-transparent py-14 px-6 relative z-10" style={{ background: 'linear-gradient(to bottom, rgba(200,255,0,0.78) 0%, rgba(250,250,250,0.93) 100%)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div ref={ref} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              className="font-funnel text-[#5B6A00] text-xs tracking-[0.3em] uppercase block mb-4"
            >
              Comparativa de visas
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-monument font-light text-sm md:text-2xl tracking-tight text-[#111111]"
            >
              ¿Qué visa es <span className="italic text-[#5B6A00]">para ti?</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="font-iceland text-xs text-[#777777] max-w-xs leading-relaxed"
          >
            Comparamos todas las visas que tramitamos para que entiendas exactamente qué aplica a tu caso.
          </motion.p>
        </div>

        {/* Visa header cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="overflow-x-auto"
        >
          <div style={{ minWidth: '720px' }}>

            {/* Column headers */}
            <div className="grid gap-px mb-px" style={{ gridTemplateColumns: '220px repeat(6, 1fr)' }}>
              <div className="bg-transparent" />

              {visas.map((v, ci) => (
                <div
                  key={v.code}
                  onMouseEnter={() => setHoveredCol(ci)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={`relative p-4 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${
                    isActive(ci)
                      ? 'bg-[#C8FF00]/8 border border-[#C8FF00]/40 shadow-[0_0_20px_rgba(200,255,0,0.08)]'
                      : 'bg-[#F5F5F5] border border-[#C8FF00]/40 hover:border-[#C8FF00]/20'
                  }`}
                >
                  {v.tag && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8FF00] text-[#050505] font-funnel text-[8px] tracking-widest uppercase px-2 py-0.5 whitespace-nowrap">
                      {v.tag}
                    </span>
                  )}
                  <span className="text-lg">{v.flag}</span>
                  <span className={`font-funnel text-[9px] tracking-widest uppercase transition-colors duration-200 ${isActive(ci) ? 'text-[#5B6A00]' : 'text-[#777777]'}`}>
                    {v.code}
                  </span>
                  <span className={`font-funnel font-semibold text-xs text-center leading-tight transition-colors duration-200 ${isActive(ci) ? 'text-[#111111]' : 'text-[#111111]/70'}`}>
                    {v.name}
                  </span>
                  <span className="font-iceland text-[9px] text-[#777777] text-center">{v.country}</span>
                  <span className={`font-iceland text-[9px] mt-1 transition-colors duration-200 ${isActive(ci) ? 'text-[#5B6A00]/80' : 'text-[#777777]/60'}`}>
                    {v.duration}
                  </span>
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {features.map((row, ri) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + ri * 0.06 }}
                className="grid gap-px"
                style={{ gridTemplateColumns: '220px repeat(6, 1fr)' }}
              >
                <div className={`flex items-center px-4 py-3 ${ri % 2 === 0 ? 'bg-[#F5F5F5]' : 'bg-transparent'}`}>
                  <span className="font-iceland text-xs text-[#777777]">{row.label}</span>
                </div>

                {row.vals.map((v, ci) => (
                  <div
                    key={ci}
                    onMouseEnter={() => setHoveredCol(ci)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className={`flex items-center justify-center py-3 transition-colors duration-200 cursor-pointer ${
                      isActive(ci)
                        ? ri % 2 === 0 ? 'bg-[#C8FF00]/6' : 'bg-[#C8FF00]/3'
                        : ri % 2 === 0 ? 'bg-[#F5F5F5]' : 'bg-transparent'
                    }`}
                  >
                    <Cell v={v} isActive={isActive(ci)} />
                  </div>
                ))}
              </motion.div>
            ))}

            {/* Bottom CTA row */}
            <div className="grid gap-px mt-px" style={{ gridTemplateColumns: '220px repeat(6, 1fr)' }}>
              <div className="py-6 px-4 flex items-center">
                <a
                  href="#evaluacion"
                  className="font-iceland text-xs text-[#5B6A00] tracking-wider hover:underline"
                >
                  ¿No sabes cuál es la tuya? →
                </a>
              </div>
              {visas.map((v, ci) => (
                <div
                  key={v.code}
                  onMouseEnter={() => setHoveredCol(ci)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={`py-6 flex items-center justify-center transition-colors duration-200 ${
                    isActive(ci) ? 'bg-[#C8FF00]/5 border-x border-[#C8FF00]/20' : ''
                  }`}
                >
                  <a
                    href="#evaluacion"
                    className={`font-funnel text-[9px] tracking-widest uppercase transition-all duration-200 border px-3 py-1.5 ${
                      isActive(ci)
                        ? 'text-[#050505] bg-[#C8FF00] border-[#C8FF00] hover:bg-white hover:text-[#111111] hover:border-[#E0E0E0]'
                        : 'text-[#777777] border-[#C8FF00]/40 hover:border-[#C8FF00]/40 hover:text-[#111111]'
                    }`}
                  >
                    Evaluar →
                  </a>
                </div>
              ))}
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}
