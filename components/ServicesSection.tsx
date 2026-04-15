'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, GraduationCap, Plane, ChevronLeft, ChevronRight } from 'lucide-react'

// ─── headline word data ────────────────────────────────────────────────────
const headlineWords = [
  { text: 'Tramitamos',  highlight: false },
  { text: 'visas',       highlight: false },
  { text: 'de',          highlight: false },
  { text: 'turismo',     highlight: false },
  { text: 'para',        highlight: false },
  { text: '6 destinos',  highlight: true  },
]

// ─── data ──────────────────────────────────────────────────────────────────
const tourismDestinations = [
  { flag: '🇺🇸', country: 'Estados Unidos', visa: 'B1/B2',            hoverText: 'Times Square, los parques nacionales y el Gran Cañón — una aventura sin límites te espera.' },
  { flag: '🇨🇦', country: 'Canadá',          visa: 'Visitor Visa',     hoverText: 'Vancouver, las Rocosas y la aurora boreal. Naturaleza y cosmopolitismo en un solo país.' },
  { flag: '🇳🇿', country: 'Nueva Zelanda',   visa: 'Visitor Visa',     hoverText: 'Paisajes de película y aventuras en Queenstown. El paraíso del fin del mundo.' },
  { flag: '🇦🇺', country: 'Australia',        visa: 'Subclass 600',     hoverText: 'Sydney, la Gran Barrera de Coral, el Uluru... Australia sorprende en cada rincón.' },
  { flag: '🇯🇵', country: 'Japón',            visa: 'Turismo',          hoverText: 'Tokio de noche, Kioto en primavera, sushi en Tsukiji. Japón es un mundo que enamora.' },
  { flag: '🇬🇧', country: 'Reino Unido',      visa: 'Standard Visitor', hoverText: 'El Big Ben, los Cotswolds, una tarde de té en Londres. La historia cobra vida aquí.' },
]

const studentCities = [
  { name: 'Brisbane',   img: 'https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=800&q=85',  desc: 'Capital de Queensland con clima perfecto todo el año. Universidades top, institutos VET de calidad y una vibrante vida estudiantil multicultural. Ideal para cursos de inglés y pathway universitario.' },
  { name: 'Sydney',     img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=85',  desc: 'La ciudad más icónica de Australia. Ofrece instituciones de clase mundial, una escena cultural inigualable y amplias oportunidades laborales para estudiantes internacionales con permiso de trabajo.' },
  { name: 'Melbourne',  img: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=85',  desc: 'Elegida repetidamente la ciudad más habitable del mundo. Referente académico con campus innovadores, arte, gastronomía y una comunidad latinoamericana muy activa.' },
  { name: 'Adelaide',   img: 'https://images.unsplash.com/photo-1677893111398-0ebb0ed2aa85?w=800&q=85',  desc: 'Una de las ciudades más seguras y asequibles de Australia. Educación de excelencia a menor costo de vida, ambiente tranquilo y programas de salud, agronomía y tecnología únicos.' },
  { name: 'Perth',      img: 'https://images.unsplash.com/photo-1596358711484-0b2b0f2344ac?w=800&q=85',  desc: 'En la costa oeste con playas espectaculares. Economía en expansión, universidades con programas líderes en minería, ingeniería y ciencias marinas. Alta demanda laboral para estudiantes.' },
  { name: 'Gold Coast', img: 'https://images.unsplash.com/photo-1671418087163-9a29e29caefa?w=800&q=85',  desc: 'Playas, sol y calidad de vida incomparable. Institutos especializados en turismo, hotelería y diseño. Perfecta para quienes quieren estudiar inglés o VET en un entorno único y dinámico.' },
]

// ─── CityCardInner — flip 3D igual a AustraliaCities ─────────────────────
const CityCardInner = ({ city, i }: { city: typeof studentCities[0]; i: number }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', perspective: 1400, cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { window.location.href = '#evaluacion' }}
    >
      <motion.div
        animate={{ 
          rotateY: hovered ? 180 : 0,
          scale: hovered ? 1.05 : 1,
          y: hovered ? -12 : 0,
          z: hovered ? 30 : 0
        }}
        transition={{ type: 'spring', stiffness: 45, damping: 13, mass: 1.4 }}
        style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
      >
        {/* Efecto premium: Destello de luz en los bordes que SOLO se ve a mitad del giro */}
        {/*
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? [0, 1, 0] : [0, 1, 0] }}
          transition={{ duration: 1.2, times: [0, 0.5, 1], ease: "easeInOut" }}
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '26px',
            background: 'linear-gradient(90deg, transparent 10%, #C8FF00 50%, transparent 90%)',
            filter: 'blur(14px)',
            transform: 'translateZ(-1px)',
            pointerEvents: 'none',
          }}
        />
        */}
        {/* ── FRONT ── */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '20px', overflow: 'hidden',
          backfaceVisibility: 'hidden',
          backgroundImage: `url(${city.img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          border: '1px solid rgba(200,255,0,0.3)',
          boxShadow: '0 30px 60px rgba(200,255,0,0.15)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', top: 14, left: 16, fontFamily: "'PPMonumentExtended',sans-serif", fontWeight: 900, fontSize: '24px', color: '#C8FF00', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(200,255,0,0.55)', lineHeight: 1 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div style={{ position: 'absolute', top: 18, right: 16, width: 6, height: 6, borderRadius: '50%', background: '#C8FF00', boxShadow: '0 0 10px rgba(200,255,0,1)' }} />
          <p style={{ position: 'absolute', bottom: 18, left: 16, right: 16, margin: 0, fontFamily: "'FunnelDisplay',sans-serif", fontWeight: 700, fontSize: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
            {city.name}
          </p>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, #C8FF00, transparent)' }} />
        </div>

        {/* ── BACK ── */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '20px', overflow: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, #C8FF00 0%, #91b800 40%, #C8FF00 100%)',
          padding: '2px',
          boxShadow: '0 30px 64px rgba(200,255,0,0.2), 0 0 48px rgba(200,255,0,0.1)',
        }}>
          <div style={{ background: '#050505', width: '100%', height: '100%', borderRadius: '18px', padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,255,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <p style={{ margin: '0 0 10px 0', fontFamily: "'FunnelDisplay',sans-serif", fontWeight: 800, fontSize: '16px', color: '#C8FF00', letterSpacing: '0.06em', textTransform: 'uppercase', position: 'relative', zIndex: 1, textShadow: '0 0 20px rgba(200,255,0,0.45)' }}>
              <span style={{ fontFamily: "'PPMonumentExtended',sans-serif", fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7, marginRight: 6 }}>{String(i + 1).padStart(2, '0')}</span>{city.name}
            </p>
            <p style={{ margin: 0, fontFamily: "'FunnelDisplay',sans-serif", fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, letterSpacing: '0.01em', position: 'relative', zIndex: 1 }}>
              {city.desc}
            </p>
            <div style={{ marginTop: 16, width: 28, height: 2, background: '#C8FF00', borderRadius: 1 }} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── StudentCardGallery ───────────────────────────────────────────────────
export function StudentCardGallery() {
  const [activeIdx, setActiveIdx] = useState(0)

  const handleNext = () => setActiveIdx((prev) => (prev + 1) % studentCities.length)
  const handlePrev = () => setActiveIdx((prev) => (prev - 1 + studentCities.length) % studentCities.length)

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 40) handlePrev()
    if (info.offset.x < -40) handleNext()
  }

  const getPos = (index: number) => {
    const len = studentCities.length
    let diff = index - activeIdx
    // Perfect cyclic indexing for any length
    if (diff > len / 2) diff -= len
    else if (diff <= -len / 2) diff += len
    return diff
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '310px', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: '460px', height: '230px',
        top: '48%', left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90vw'
      }}>
        <AnimatePresence initial={false}>
          {studentCities.map((city, i) => {
            const pos = getPos(i)
            
            // Send pos > 2 (the 6th element) to x=0, scale=0 (center vanishing point) to avoid side sweeps
            const xOffset = pos === 0 ? 0 : pos === 1 ? 250 : pos === -1 ? -250 : pos === 2 ? 450 : pos === -2 ? -450 : 0
            const scaleAmt = pos === 0 ? 1 : Math.abs(pos) === 1 ? 0.8 : Math.abs(pos) === 2 ? 0.6 : 0
            const opacityAmt = pos === 0 ? 1 : Math.abs(pos) === 1 ? 0.6 : Math.abs(pos) === 2 ? 0.25 : 0
            const zAmt = 10 - Math.abs(pos)

            return (
              <motion.div
                key={city.name}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={false}
                animate={{
                  x: xOffset,
                  scale: scaleAmt,
                  opacity: opacityAmt,
                  zIndex: zAmt,
                  rotateY: pos === 0 ? 0 : pos * -5
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  userSelect: 'none',
                  pointerEvents: pos === 0 ? 'auto' : 'none'
                }}
              >
                <CityCardInner city={city} i={i} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 200 }}>
        <button
          onClick={handlePrev}
          className="group flex items-center justify-center p-2.5 border border-[#111111]/15 bg-white/70 text-[#111111] outline-none cursor-pointer rounded-full transition-all duration-300 ease-out hover:-translate-y-[1px] hover:border-[#C8FF00] hover:bg-[#C8FF00] hover:shadow-[0_4px_16px_rgba(200,255,0,0.4)]"
          aria-label="Anterior"
        >
          <svg className="transition-transform duration-300 group-hover:-translate-x-1" width="13" height="9" viewBox="0 0 18 10" fill="none"><path d="M17 5H1M1 5L6 1M1 5L6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button
          onClick={handleNext}
          className="group flex items-center justify-center p-2.5 border border-[#111111]/15 bg-white/70 text-[#111111] outline-none cursor-pointer rounded-full transition-all duration-300 ease-out hover:-translate-y-[1px] hover:border-[#C8FF00] hover:bg-[#C8FF00] hover:shadow-[0_4px_16px_rgba(200,255,0,0.4)]"
          aria-label="Siguiente"
        >
          <svg className="transition-transform duration-300 group-hover:translate-x-1" width="13" height="9" viewBox="0 0 18 10" fill="none"><path d="M1 5H17M17 5L12 1M17 5L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ServicesSection() {
  const sectionRef           = useRef<HTMLDivElement>(null)
  const headlineRef          = useRef<HTMLHeadingElement>(null)
  const wordRefs             = useRef<(HTMLSpanElement | null)[]>([])
  const cardRefs             = useRef<(HTMLDivElement | null)[]>([])
  const gridRef              = useRef<HTMLDivElement>(null)
  const estudianteBadgeRef   = useRef<HTMLDivElement>(null)
  const estudianteTitleRef   = useRef<HTMLHeadingElement>(null)
  const estudianteSubRef     = useRef<HTMLParagraphElement>(null)
  const estudiantePointsRef  = useRef<HTMLDivElement>(null)
  const estudianteCaptionRef = useRef<HTMLParagraphElement>(null)

  const inViewRef = useRef(null)
  const inView = useInView(inViewRef, { once: false, margin: '-100px' })

  useEffect(() => {
    let ctx: any = null

    const init = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const cards    = cardRefs.current.filter(Boolean) as HTMLDivElement[]
      const grid     = gridRef.current
      const headline = headlineRef.current

      const wordEntries = wordRefs.current
        .map((el, i) => ({ el, highlight: headlineWords[i]?.highlight ?? false }))
        .filter((e): e is { el: HTMLSpanElement; highlight: boolean } => e.el !== null)
      const allWords     = wordEntries.map(e => e.el)
      const highlightEls = wordEntries.filter(e => e.highlight).map(e => e.el)

      if (!allWords.length || !cards.length || !grid || !headline) return

      ctx = gsap.context(() => {
        // Headline words
        const tlWords = gsap.timeline({
          defaults: { ease: 'power4.out', immediateRender: false },
          scrollTrigger: { trigger: headline, start: 'top 85%', toggleActions: 'play reverse play reverse' },
        })
        tlWords.fromTo(allWords, { opacity: 0, y: -18 }, { opacity: 1, y: 0, stagger: 0.09, duration: 0.7, ease: 'power2.out' })
        tlWords.from(highlightEls, { scale: 0.82, ease: 'back.out(2)', duration: 0.8 }, '<0.3')

        // Tourism cards scrub
        gsap.fromTo(cards, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: 'none',
          scrollTrigger: { trigger: grid, start: 'top 88%', end: 'bottom 75%', scrub: 0.5 },
        })

        // Estudiante header
        const headerEls = [estudianteBadgeRef.current, estudianteTitleRef.current, estudianteSubRef.current].filter(Boolean)
        gsap.fromTo(headerEls, { opacity: 0, y: 36, filter: 'blur(4px)' }, {
          opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.18, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: estudianteBadgeRef.current, start: 'top 82%', toggleActions: 'play reverse play reverse' },
        })

        // Caption
        if (estudianteCaptionRef.current) {
          gsap.fromTo(estudianteCaptionRef.current, { opacity: 0, y: 12 }, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: estudianteCaptionRef.current, start: 'top 90%', toggleActions: 'play reverse play reverse' },
          })
        }

        // Feature points
        if (estudiantePointsRef.current) {
          const points = estudiantePointsRef.current.querySelectorAll('[data-point]')
          gsap.fromTo(points, { opacity: 0, x: -28 }, {
            opacity: 1, x: 0, stagger: 0.13, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: estudiantePointsRef.current, start: 'top 88%', toggleActions: 'play reverse play reverse' },
          })
        }

        ScrollTrigger.refresh()
      }, sectionRef)
    }

    init()
    return () => { ctx?.revert() }
  }, [])

  return (
    <section
      id="servicios"
      ref={sectionRef}
      className="bg-transparent py-14 px-6 relative z-10"
      style={{ background: 'linear-gradient(to bottom, rgba(252,251,249,0.72) 0%, rgba(253,252,250,0.92) 100%)' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div ref={inViewRef} className="mb-12 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="font-funnel text-[#5B6A00] text-xs tracking-[0.3em] uppercase block mb-2"
          >
            Lo que hacemos
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="font-monument font-black text-2xl md:text-5xl tracking-tight text-[#111111]"
          >
            Nuestros <span className="text-[#5B6A00] italic pr-2">Servicios</span>
          </motion.h2>
        </div>

        <div className="relative mb-8 border border-[#C8FF00]/40 shadow-2xl rounded-[2rem] p-5 md:px-8 md:py-6 overflow-hidden backdrop-blur-md" style={{
          background: 'linear-gradient(135deg, rgba(200,255,0,0.15) 0%, rgba(255,255,255,0.45) 50%, rgba(200,255,0,0.1) 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.05), inset 0 0 30px rgba(255,255,255,0.6)'
        }}>
          {/* Soft pearlescent neon effect */}
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(200,255,0,0.25)_0%,_transparent_75%)] pointer-events-none mix-blend-screen" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(200,255,0,0.2)_0%,_transparent_75%)] pointer-events-none mix-blend-screen" />
          
          <div className="flex flex-col items-center text-center gap-0 relative z-10 w-full mb-4">
            <a href="#evaluacion" className="group font-funnel font-bold text-[10px] md:text-[11px] tracking-widest uppercase text-[#111111] border border-[#C8FF00] bg-white/80 backdrop-blur-sm hover:bg-[#C8FF00] px-3 py-1 rounded-full inline-flex items-center gap-1 transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_rgba(200,255,0,0.4)] no-underline cursor-pointer">
              <Plane size={11} className="text-[#89ad00] group-hover:text-[#111111] transition-colors duration-300" />
              Visas Turismo
            </a>

            {/* Moved immediately below the button and forced single-line */}
            <p className="font-funnel text-[13px] md:text-lg font-bold text-[#111111]/80 tracking-wide mt-4 mb-3 text-center max-w-full">
              Desde Australia o desde cualquier país de Latinoamérica
            </p>

            <h3
              ref={headlineRef}
              className="font-monument font-black text-[#111111] text-[18px] md:text-3xl leading-[1.3] md:leading-tight tracking-tight max-w-[95%] md:max-w-[85%]"
              style={{ textAlign: 'center' }}
            >
              {headlineWords.map((w, i) => (
                <span
                  key={i}
                  ref={el => { wordRefs.current[i] = el }}
                  style={{ display: 'inline-block', opacity: 0, marginRight: '0.22em', marginBottom: '0.1em' }}
                  className={w.highlight
                    ? 'bg-[#C8FF00] text-[#111111] px-2 py-0.5 rounded-md font-iceland italic tracking-normal'
                    : 'text-[#111111]'}
                >
                  {w.text}
                </span>
              ))}
            </h3>
          </div>

          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5 md:mb-6">
            {tourismDestinations.map((d, i) => (
              <a
                key={d.country}
                href="#evaluacion"
                ref={el => { cardRefs.current[i] = el as unknown as HTMLDivElement }}
                className="group relative border border-[#C8FF00]/50 bg-white hover:border-[#C8FF00] p-5 flex flex-col items-center gap-2 cursor-pointer overflow-hidden hover:shadow-[0_8px_28px_rgba(200,255,0,0.22)] hover:-translate-y-1 min-h-[110px] rounded-xl no-underline"
                style={{ transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.4s ease, box-shadow 0.5s ease' }}
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-90 group-hover:-translate-y-1 relative z-10 drop-shadow-sm">{d.flag}</span>
                <span className="font-monument font-black text-[#111111] text-[10px] text-center tracking-wide uppercase relative z-10">{d.country}</span>
                <span className="font-funnel text-[10px] md:text-xs tracking-widest text-[#777777] uppercase text-center transition-opacity duration-200 group-hover:opacity-0 relative z-10">{d.visa}</span>
                <div className="absolute inset-0 bg-[#C8FF00] flex flex-col justify-center p-3 translate-y-[101%] group-hover:translate-y-0 z-20" style={{ transition: 'transform 0.55s cubic-bezier(0.16,1,0.3,1)' }}>
                  <span className="font-monument font-black text-[#111111] text-[9px] tracking-widest uppercase mb-1 md:mb-1.5 block text-center">{d.country}</span>
                  <p className="font-funnel text-[11px] md:text-[12px] font-normal text-[#111111]/95 leading-[1.15] text-center">{d.hoverText}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#E0E0E0] pt-8">
            {['Evaluación de perfil', 'Estrategia de aplicación', 'Gestión documental', 'Asesoría en español'].map(p => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] flex-shrink-0" />
                <span className="font-funnel text-[13px] md:text-sm text-[#333333] font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ESTUDIANTE ───────────────────────────────────────────────────── */}
        <div className="relative mb-8 border border-[#C8FF00]/40 shadow-2xl rounded-[2rem] p-5 md:px-8 md:py-6 overflow-hidden backdrop-blur-md" style={{
          background: 'linear-gradient(135deg, rgba(200,255,0,0.15) 0%, rgba(255,255,255,0.45) 50%, rgba(200,255,0,0.1) 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.05), inset 0 0 30px rgba(255,255,255,0.6)'
        }}>
          {/* Soft pearlescent neon effect */}
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(200,255,0,0.25)_0%,_transparent_75%)] pointer-events-none mix-blend-screen" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(200,255,0,0.2)_0%,_transparent_75%)] pointer-events-none mix-blend-screen" />

          {/* Header — centrado similar a Turismo */}
          <div className="flex flex-col items-center text-center gap-1 md:gap-1.5 relative z-10 w-full mb-8">
            <a href="#evaluacion" ref={estudianteBadgeRef} className="group font-funnel font-bold text-[10px] md:text-[11px] tracking-widest uppercase text-[#111111] border border-[#111111]/20 bg-white/60 backdrop-blur-sm hover:bg-[#111111] hover:text-[#C8FF00] px-3 py-1 rounded-full inline-flex items-center gap-1 transition-all duration-300 shadow-sm no-underline cursor-pointer">
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-[#C8FF00] opacity-75"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C8FF00]" />
              </span>
              <GraduationCap size={13} className="text-[#111111] group-hover:text-[#C8FF00] transition-colors duration-300" />
              Visa Estudiante · 500
            </a>

            <h3
              ref={estudianteTitleRef}
              className="font-monument font-black text-[#111111] text-[16px] md:text-2xl leading-[1.3] md:leading-tight tracking-tight mt-1 max-w-[95%] md:max-w-full text-center"
            >
              AUSTRALIA — <span className="text-[#5B6A00] italic pr-1">CUALQUIER CIUDAD</span>
            </h3>

            <p
              ref={estudianteSubRef}
              className="font-funnel text-sm md:text-lg font-medium text-[#111111]/80 tracking-wide mt-1 w-full max-w-full"
            >
              Inglés, VET, pathway universitario — con permiso de trabajo incluido
            </p>
          </div>

          {/* ── GSAP Infinite Card Gallery ── */}
          <div className="relative z-10 mb-2">
            <StudentCardGallery />
          </div>

          <p
            ref={estudianteCaptionRef}
            className="font-funnel text-xs text-[#555555] italic mb-4 md:mb-5 relative z-10 text-center"
          >
            Usa las flechas para explorar las distintas ciudades
          </p>

          {/* Feature points */}
          <div
            ref={estudiantePointsRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#E0E0E0] pt-6 relative z-10"
          >
            {['Evaluación de elegibilidad', 'Elección de escuela', 'Gestión documental completa', 'Acompañamiento hasta el arribo'].map(p => (
              <motion.div
                key={p}
                data-point
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="flex items-center gap-2 cursor-default"
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] flex-shrink-0"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
                />
                <span className="font-funnel text-[13px] md:text-sm text-[#333333] font-medium">{p}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Opcional (Reducido para igualar balance) */}
          <div className="mt-8 flex justify-center relative z-10">
            <motion.a
              href="#evaluacion"
              whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(200,255,0,0.4)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="group relative inline-flex items-center gap-2 font-monument font-black text-[10px] tracking-widest uppercase overflow-hidden border-2 border-[#111111] text-[#111111] px-6 py-2.5 rounded-full no-underline"
            >
              <span
                className="absolute inset-0 bg-[#C8FF00] translate-y-full group-hover:translate-y-0 rounded-full"
                style={{ transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)', zIndex: 0 }}
              />
              <span className="relative z-10">Evalúa tu perfil</span>
              <motion.span
                className="relative z-10"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight size={12} />
              </motion.span>
            </motion.a>
          </div>
        </div>

      </div>
    </section>
  )
}
