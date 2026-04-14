'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const schools = [
  'ILSC Brisbane',
  'Kaplan International',
  'TAFE Queensland',
  'Griffith University',
  'Brisbane Language Centre',
  'QUEENSFORD College',
  'BROWNS English Language School',
  'Lexis English',
  'CEA Languages',
  'Australian Institute of Business',
  'Holmes Institute',
  'Monarch Institute',
  'ACAP',
  'Pacific Training Group',
  'Swinburne Online',
]

const doubled = [...schools, ...schools]

export default function SchoolsTicker() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-80px' })

  return (
    <section className="bg-transparent py-20 relative z-10" style={{ background: 'linear-gradient(to bottom, rgba(252,251,249,0.55) 0%, rgba(252,251,249,0.72) 25%, rgba(252,251,249,0.72) 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 mb-10" ref={ref}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="font-monument font-black text-xs text-[#111111] tracking-[0.3em] uppercase text-center"
        >
          Escuelas e instituciones partner en Australia
        </motion.p>
      </div>

      <div className="overflow-hidden">
        <div className="flex gap-12 animate-ticker-left whitespace-nowrap">
          {doubled.map((school, i) => (
            <div key={i} className="flex items-center gap-12 flex-shrink-0">
              <span className="font-monument font-black text-[#111111]/70 text-sm tracking-widest uppercase hover:text-[#111111] transition-colors cursor-default">
                {school}
              </span>
              <span className="text-[#C8FF00] text-xs">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
