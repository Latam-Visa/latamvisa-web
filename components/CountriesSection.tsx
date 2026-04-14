'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { LATAM_COUNTRIES } from '@/lib/constants'

const stats = [
  { value: 12, suffix: '+', label: 'Países Atendidos' },
  { value: 500, suffix: '+', label: 'Clientes Asesorados' },
  { value: 3, suffix: '', label: 'Ciudades en Australia' },
  { value: 1, prefix: '#', suffix: '', label: 'Agencia LATAM en Brisbane' },
]

const tickerItems = [...LATAM_COUNTRIES, ...LATAM_COUNTRIES]

function AnimatedCounter({ value, suffix, prefix, inView }: { value: number; suffix: string; prefix?: string; inView: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), value)
      setCount(current)
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span>
      {prefix ?? ''}{count}{suffix}
    </span>
  )
}

export default function CountriesSection() {
  const ref = useRef(null)
  const statsRef = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-100px' })
  const statsInView = useInView(statsRef, { once: false, margin: '-80px' })

  return (
    <section id="paises" className="py-14 overflow-hidden relative z-10 -mt-[1px]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.98) 0%, rgba(255,255,255,1) 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="mb-8 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            className="font-funnel text-[#5B6A00] text-xs tracking-[0.3em] uppercase block mb-4"
          >
            Presencia regional
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="font-monument font-black text-sm md:text-3xl tracking-tight text-[#111111]"
          >
            Atendemos clientes en todo
            <br />
            <span className="text-[#5B6A00] italic">Latinoamérica</span>
          </motion.h2>
        </div>
      </div>

      {/* Ticker row 1 — left */}
      <div className="overflow-hidden mb-3">
        <div className="flex gap-6 animate-ticker-left whitespace-nowrap">
          {tickerItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xl">{item.flag}</span>
              <span className="font-iceland text-[#111111]/50 text-xs tracking-widest uppercase">{item.name}</span>
              <span className="text-[#5B6A00]/40 mx-2">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker row 2 — right */}
      <div className="overflow-hidden mb-8">
        <div className="flex gap-6 animate-ticker-right whitespace-nowrap">
          {[...tickerItems].reverse().map((item, i) => (
            <div key={i} className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xl">{item.flag}</span>
              <span className="font-iceland text-[#111111]/30 text-xs tracking-widest uppercase">{item.name}</span>
              <span className="text-[#5B6A00]/30 mx-2">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats — animated counters */}
      <div ref={statsRef} className="max-w-7xl mx-auto px-6">
        <div className="divider-neon mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.1 }}
              className="text-center"
            >
              <div className="font-monument font-black text-sm md:text-2xl text-[#5B6A00] mb-2 tabular-nums">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} inView={statsInView} />
              </div>
              <div className="font-funnel text-xs text-[#777777] tracking-widest uppercase">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
