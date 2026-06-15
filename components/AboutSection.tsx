'use client'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useRef, useState } from 'react'

// ── Word-by-word split reveal — direction-aware ───────────────────────────
// scrollDir: 'down' = words enter from below ↑ | 'up' = words enter from above ↓
function SplitReveal({
  text,
  tag = 'span',
  className,
  style,
  inView,
  scrollDir = 'down',
  baseDelay = 0,
  stagger = 0.13,
}: {
  text: string
  tag?: 'span' | 'h2'
  className?: string
  style?: React.CSSProperties
  inView: boolean
  scrollDir?: 'down' | 'up'
  baseDelay?: number
  stagger?: number
}) {
  const words = text.split(' ')
  const Tag = tag as keyof JSX.IntrinsicElements
  // When scrolling down: words come from below (positive y)
  // When scrolling up: words come from above (negative y)
  const fromY = scrollDir === 'down' ? '115%' : '-115%'

  return (
    <Tag className={className} style={{ ...style, display: 'block' }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            marginRight: i < words.length - 1 ? '0.3em' : 0,
            paddingBottom: '0.15em',
            marginBottom: '-0.15em',
          }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: fromY, opacity: 0 }}
            animate={
              inView
                ? { y: '0%', opacity: 1, transition: { type: 'spring', stiffness: 70, damping: 8, mass: 0.1, delay: baseDelay + i * stagger } }
                : { y: fromY, opacity: 0, transition: { duration: 0.1, delay: -1} }
            }
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

// ── Fade-up for pillar cards ───────────────────────────────────────────────
const cardReveal = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: i * 0.1,
    },
  }),
}

const pillars = [
  {
    num: '1',
    title: 'Planeación con Especialistas',
    body: 'Trabajamos contigo desde la evaluación inicial hasta tu matrícula final.',
  },
  {
    num: '2',
    title: 'Tu Proyecto, Nuestra Prioridad',
    body: 'Asesoría ágil y organizada para que tu viaje se concrete.',
  },
  {
    num: '3',
    title: 'Acompañamiento en Cada Etapa',
    body: 'Cero sorpresas. Sabes exactamente qué pasos dar, cuándo y cómo.',
  },
  {
    num: '4',
    title: 'Red Educativa en Australia',
    body: 'Alianzas directas con instituciones en Brisbane, Sydney y Melbourne.',
  },
]

function Pillar({ num, title, body, index }: { num: string; title: string; body: string; index: number }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', () => {
    const el = ref.current as HTMLElement | null
    if (!el) return
    const { top, bottom } = el.getBoundingClientRect()
    setInView(top < window.innerHeight * 0.88 && bottom > 0)
  })

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardReveal}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 0 0 2px #C8FF00, 0 20px 50px rgba(200,255,0,0.25), inset 0 0 20px rgba(200,255,0,0.1)',
        backgroundColor: 'rgba(255,255,255,1)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      className="group border border-[#C8FF00]/40 bg-white/60 backdrop-blur-md p-8 flex flex-col justify-end cursor-default rounded-2xl relative overflow-hidden min-h-[220px]"
    >
      {/* Huge background number */}
      <motion.span
        className="absolute -top-4 -right-1 font-funnel font-black italic select-none z-0 pointer-events-none"
        style={{ 
          fontSize: '140px', 
          lineHeight: '1',
          color: 'rgba(200,255,0,0.4)',
        }}
        whileHover={{ 
          color: '#C8FF00', 
          scale: 1.05, 
          x: -10, 
          y: 5, 
          rotate: -4 
        }}
        transition={{ duration: 0.3 }}
      >
        {num}
      </motion.span>

      {/* Foreground text */}
      <div className="relative z-10 mt-auto pt-16">
        <h3 className="font-funnel font-bold text-[#111111] text-base md:text-xl mb-3 leading-tight group-hover:text-[#3e4800] transition-colors duration-300 min-h-[40px] md:min-h-[56px] flex items-end">{title}</h3>
        <p className="font-funnel font-normal text-[#444444] text-sm leading-relaxed mb-1 group-hover:text-[#111111] transition-colors duration-300 min-h-[44px] md:min-h-[66px]">{body}</p>
      </div>
    </motion.div>
  )
}

export default function AboutSection() {
  const headerRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [scrollDir, setScrollDir] = useState<'down' | 'up'>('down')
  const lastY = useRef(0)
  const { scrollY } = useScroll()

  // Fire when header is visually in viewport — ignores DOM z-index overlap from HeroScroll canvas
  useMotionValueEvent(scrollY, 'change', (y) => {
    const dir = y > lastY.current ? 'down' : 'up'
    setScrollDir(dir)
    lastY.current = y
    const el = headerRef.current as HTMLElement | null
    if (!el) return
    const { top, bottom } = el.getBoundingClientRect()
    const vh = window.innerHeight
    // AboutSection overlaps HeroScroll by 80vh (marginTop:-80vh).
    // Canvas fade starts at scrollY≈1.12*vh — trigger as soon as canvas begins dissolving.
    const pastHero = dir === 'up' || y > vh * 1.12
    setInView(pastHero && top < vh * 0.75 && bottom > 60)
  })

  return (
    <section className="bg-transparent pt-20 pb-14 px-6 relative z-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(252,251,249,0.50) 15%, rgba(252,251,249,0.72) 100%)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div ref={headerRef} className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-2xl">

            {/* "Nuestro Compromiso" — inspired by "Discover Innovation" image */}
            <div className="flex flex-row flex-wrap items-baseline gap-x-3 md:gap-x-5 gap-y-1 mb-4">
              <SplitReveal
                text="Nuestro"
                tag="h2"
                className="font-monument font-black text-white text-2xl sm:text-4xl md:text-[3.9rem] tracking-tight leading-none"
                style={{ WebkitTextStroke: '0.6px rgba(0,0,0,0.55)', textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}
                inView={inView}
                scrollDir={scrollDir}
                baseDelay={0}
                stagger={0.12}
              />
              <SplitReveal
                text="COMPROMISO"
                tag="h2"
                className="font-monument font-black text-white text-3xl sm:text-5xl md:text-[4.1rem] tracking-tight leading-none"
                style={{ WebkitTextStroke: '0.6px rgba(0,0,0,0.55)', textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}
                inView={inView}
                scrollDir={scrollDir}
                baseDelay={0.3}
                stagger={0.1}
              />
            </div>

            {/* h2 subtitle — split word reveal */}
            <SplitReveal
              text="Planeamos tu proyecto de educación y viaje con precisión y transparencia."
              tag="h2"
              className="font-funnel font-bold text-[#111111] text-sm md:text-xl leading-[1.3] mt-4 max-w-[90%]"
              inView={inView}
              scrollDir={scrollDir}
              baseDelay={0.22}
              stagger={0.07}
            />

          </div>

          {/* Paragraph — split word reveal */}
          <SplitReveal
            text="Desde la primera sesión hasta tu llegada a Australia, te guiamos con un proceso estructurado para que inicies tu curso sin complicaciones."
            tag="span"
            className="font-funnel font-normal text-[#444444] text-[13px] md:text-[15px] leading-relaxed max-w-sm"
            inView={inView}
            scrollDir={scrollDir}
            baseDelay={0.45}
            stagger={0.045}
          />
        </div>

        {/* 4 pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {pillars.map((p, i) => (
            <Pillar key={p.num} {...p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
