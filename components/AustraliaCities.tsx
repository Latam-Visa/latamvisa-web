'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const cities = [
  {
    emoji: '🏙️',
    name: 'Brisbane',
    tag: 'Sede principal',
    description:
      'Nuestra sede principal. Convenios con escuelas locales y acceso directo a nuestro equipo.',
  },
  {
    emoji: '🌉',
    name: 'Sydney',
    tag: 'La más cosmopolita',
    description:
      'La ciudad más grande y cosmopolita. Escuelas top con excelente oferta académica.',
  },
  {
    emoji: '🏛️',
    name: 'Melbourne',
    tag: 'Capital cultural',
    description:
      'Capital cultural y educativa. Amplia oferta de cursos VET y carrera universitaria.',
  },
]

function CityCard({ city, i, inView }: { city: typeof cities[0]; i: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.15 }}
      style={{ perspective: 1000 }}
      className="h-[280px] w-full"
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        animate={{ rotateY: hovered ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setHovered(!hovered)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 w-full h-full p-[2px] overflow-hidden rounded-xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: 'rgba(210,210,210,0.5)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}
        >
          <div className="bg-white w-full h-full rounded-xl p-8 flex flex-col justify-center items-center text-center gap-4 relative">
            <span className="text-5xl mb-2 inline-block drop-shadow-sm">
              {city.emoji}
            </span>
            <div className="relative">
              <h3 className="font-monument font-normal text-xl text-[#111111] mb-1 tracking-wide">
                {city.name}
              </h3>
              <span className="font-monument font-light text-[10px] tracking-widest uppercase text-[#5B6A00]">
                {city.tag}
              </span>
            </div>
            <div className="absolute bottom-4 mx-auto text-[#111111]/30 text-xs flex flex-col items-center">
              <span className="mb-0.5 uppercase tracking-widest text-[8px] font-monument">Flip</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 w-full h-full p-[2px] overflow-hidden rounded-xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #C8FF00 0%, #91b800 40%, #C8FF00 100%)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.13), 0 0 48px rgba(200,255,0,0.18)',
          }}
        >
          <div className="bg-[#050505] w-full h-full rounded-xl p-6 md:p-8 flex flex-col text-center items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C8FF00]/10 to-transparent pointer-events-none" />
            
            <h4 className="font-monument text-sm text-[#C8FF00] mb-3 md:mb-4 tracking-widest uppercase relative z-10 w-full border-b border-[#C8FF00]/20 pb-3 md:pb-4">
              {city.name}
            </h4>
            <p className="font-monument font-light text-xs md:text-sm text-white/90 leading-relaxed relative z-10">
              {city.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AustraliaCities() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-100px' })

  return (
    <section
      className="py-14 px-6 relative z-10"
      style={{
        background:
          'linear-gradient(to bottom, rgba(250,250,250,0.93) 0%, rgba(200,255,0,0.78) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={ref} className="mb-8">
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            className="font-monument font-light text-[#5B6A00] text-xs tracking-[0.3em] uppercase block mb-4"
          >
            Presencia local
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="font-monument font-black text-sm md:text-3xl tracking-tight text-[#111111]"
          >
            Operamos en las principales ciudades
            <br />
            <span className="text-[#5B6A00] italic">de Australia</span>
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cities.map((city, i) => (
            <CityCard key={city.name} city={city} i={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
