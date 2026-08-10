'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion, useInView, useScroll, useTransform, type Variants } from 'framer-motion'
import { PenLine, MapPin, Stamp, Mailbox, Heart, ChevronDown, Ruler, type LucideIcon } from 'lucide-react'
import styles from './postcard.module.css'

// TODO: reemplazar con el link real de Google una vez esté verificada la ubicación del negocio.
const GOOGLE_REVIEW_URL = 'REEMPLAZAR_CON_LINK_DE_GOOGLE'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const CENTER_BAND = '-45% 0px -45% 0px'

type Highlight = 'left' | 'right-margin' | 'stamp' | 'none'

type Step = {
  number: string
  title: string
  eyebrow: string
  icon: LucideIcon
  body: string
  note?: { kind: 'tip' | 'rule'; text: string }
  addressExample?: boolean
  image: { src: string; alt: string; aspect: string; highlight: Highlight }
}

const steps: Step[] = [
  {
    number: '01',
    title: 'El mensaje',
    eyebrow: 'Lado izquierdo',
    icon: PenLine,
    body: 'Escribe lo que te dicte el corazón en la mitad izquierda de la postal, respetando la línea vertical que divide el mensaje de la dirección.',
    note: { kind: 'tip', text: 'Usa bolígrafo de tinta seca para que no se corra durante el viaje.' },
    image: {
      src: '/postcard-dorso.png',
      alt: 'Dorso de la postal LATAM VISA con la mitad izquierda señalada para escribir el mensaje',
      aspect: '1748 / 1240',
      highlight: 'left',
    },
  },
  {
    number: '02',
    title: 'La dirección',
    eyebrow: 'Lado derecho',
    icon: MapPin,
    body: 'Escribe la dirección de tu familia en las líneas del lado derecho.',
    note: {
      kind: 'rule',
      text: 'Deja al menos 15mm libres de escritura en el borde inferior y 15mm en el borde derecho. Escribe la CIUDAD y el PAÍS en INGLÉS y en MAYÚSCULAS al final.',
    },
    addressExample: true,
    image: {
      src: '/postcard-dorso.png',
      alt: 'Dorso de la postal LATAM VISA con el lado derecho señalado para escribir la dirección',
      aspect: '1748 / 1240',
      highlight: 'right-margin',
    },
  },
  {
    number: '03',
    title: 'La estampilla',
    eyebrow: 'Arriba a la derecha',
    icon: Stamp,
    body: 'Pega la estampilla internacional en el recuadro superior derecho. Esa zona ocupa los primeros 40mm desde el borde superior.',
    note: { kind: 'tip', text: 'Pide una estampilla para International Postcard en cualquier oficina de Australia Post.' },
    image: {
      src: '/postcard-dorso.png',
      alt: 'Dorso de la postal LATAM VISA con el recuadro de la estampilla señalado en la esquina superior derecha',
      aspect: '1748 / 1240',
      highlight: 'stamp',
    },
  },
  {
    number: '04',
    title: 'El buzón rojo',
    eyebrow: 'En cualquier calle',
    icon: Mailbox,
    body: 'Busca cualquier buzón rojo en la calle (Red Street Post Box) y déjala caer por la ranura. Del resto nos encargamos nosotros y el correo del mundo.',
    image: {
      src: '/Postcards/aus.post.letterbox.webp',
      alt: 'Buzón rojo de Australia Post en una calle residencial',
      aspect: '1200 / 677',
      highlight: 'none',
    },
  },
]

const addressExample = ['Ana María Gómez', 'Carrera 7 # 45-12', 'Bogotá', 'COLOMBIA']

const reviewPrompts = [
  '¿Qué era lo que más miedo te daba antes de empezar?',
  '¿Qué fue lo que más te sorprendió del proceso?',
  '¿Qué le dirías a alguien que está donde tú estabas?',
]

// ── Fixed decorative background: real postcard art, dimmed + tinted, subtle parallax ──
function PostcardBackdrop({ reduce }: { reduce: boolean }) {
  const { scrollYProgress } = useScroll()
  const yMotion = useTransform(scrollYProgress, [0, 1], [-22, 22])

  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden bg-[#b5e533]">
      <motion.div
        style={{ y: reduce ? 0 : yMotion }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-[210vw] max-w-[1300px] shrink-0" style={{ aspectRatio: '1748 / 1240' }}>
          <Image src="/postcard-frente.png" alt="" fill sizes="1300px" className="object-contain opacity-[0.42]" />
        </div>
      </motion.div>
      {/* Uniform veil: keeps the decorative art from ever reading as full-strength color */}
      <div className="absolute inset-0 bg-[#b5e533]/25" />
    </div>
  )
}

// Soft, generously-sized wash placed directly behind text that sits on the raw
// background (hero + footer) — guarantees AA contrast regardless of what the
// decorative postcard art underneath is doing at that scroll position.
function TextSafeScrim() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-x-10 -inset-y-8 z-0"
      style={{
        background: 'radial-gradient(ellipse 65% 60% at 50% 45%, rgba(181,229,51,0.94) 60%, rgba(181,229,51,0) 100%)',
      }}
    />
  )
}

function AnnotatedPostcard({ image, delay, reduce }: { image: Step['image']; delay: number; reduce: boolean }) {
  const drawTransition = { duration: reduce ? 0.01 : 0.55, ease: EASE, delay: reduce ? 0 : delay }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-[#006837]/15 bg-white"
      style={{ aspectRatio: image.aspect }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 768px) 100vw, 480px"
        className="object-cover"
      />

      {image.highlight === 'left' && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={drawTransition}
          style={{ transformOrigin: 'left center' }}
          className="absolute inset-y-0 left-0 w-[63%] border-r-2 border-dashed border-[#006837]/70 bg-[#006837]/10"
        />
      )}

      {image.highlight === 'right-margin' && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={drawTransition}
          className="absolute inset-y-0 right-0 w-[37%] bg-[#006837]/10"
        />
      )}

      {image.highlight === 'stamp' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={drawTransition}
          className="absolute left-[72%] top-[5.5%] h-[32%] w-[20%] rounded-md border-2 border-[#006837] bg-[#006837]/10"
        />
      )}
    </div>
  )
}

function StepNote({ note }: { note: NonNullable<Step['note']> }) {
  const isRule = note.kind === 'rule'
  return (
    <div className={`flex gap-3 border-l-2 pl-4 ${isRule ? 'border-[#006837]' : 'border-[#006837]/35'}`}>
      <Ruler
        size={16}
        strokeWidth={1.75}
        className={`mt-1 shrink-0 ${isRule ? 'text-[#006837]' : 'text-[#006837]/60'}`}
      />
      <p
        className={`leading-relaxed ${
          isRule
            ? 'text-[clamp(0.95rem,2.6vw,1rem)] font-semibold'
            : 'text-[clamp(0.9375rem,2.4vw,0.975rem)] font-medium text-[#006837]/80'
        }`}
      >
        {isRule && <span className="font-black uppercase tracking-wide">Regla de Australia Post: </span>}
        {note.text}
      </p>
    </div>
  )
}

function StepCard({
  step,
  reduce,
  monumentClassName,
  cardRef,
}: {
  step: Step
  reduce: boolean
  monumentClassName: string
  cardRef: React.RefObject<HTMLElement>
}) {
  const Icon = step.icon
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.55, ease: EASE } },
  }

  return (
    <motion.article
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={`${styles.glassCard} relative scroll-mt-24 overflow-hidden rounded-[28px] border border-white/50 p-6 shadow-[0_18px_40px_-16px_rgba(0,104,55,0.3)] sm:p-7`}
    >
      <span
        aria-hidden
        className={`${monumentClassName} pointer-events-none absolute -top-3 right-3 select-none text-[clamp(4.5rem,22vw,6rem)] leading-none text-[#006837]/[0.1]`}
      >
        {step.number}
      </span>

      <div className="relative mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#006837] text-[#f4f4e8]">
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#006837]/55">
            Paso {step.number} · {step.eyebrow}
          </p>
          <h3 className={`${monumentClassName} text-[clamp(1.5rem,5vw,1.75rem)] uppercase leading-tight tracking-tight`}>
            {step.title}
          </h3>
        </div>
      </div>

      <div className="relative my-6">
        <AnnotatedPostcard image={step.image} delay={0.35} reduce={reduce} />
      </div>

      <p className="mb-5 text-[clamp(1.0625rem,2.6vw,1.125rem)] leading-[1.55] text-[#006837]">
        {step.body}
      </p>

      {step.addressExample && (
        <div className="mb-5 rounded-2xl border border-[#006837]/15 bg-white/60 p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#006837]/55">
            Ejemplo bien escrito
          </p>
          <div className="font-mono text-[clamp(0.85rem,2.3vw,0.95rem)] leading-relaxed text-[#006837]">
            {addressExample.map((line, i) => (
              <p key={i} className={i === addressExample.length - 1 ? 'font-bold tracking-wide' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {step.note && <StepNote note={step.note} />}
    </motion.article>
  )
}

// Single-color Google "G" mark — no brand colors, so it doesn't fight the page palette.
function GoogleGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M12 11v2.8h6.6c-.3 1.5-1.9 4.5-6.6 4.5-4 0-7.2-3.3-7.2-7.3s3.2-7.3 7.2-7.3c2.3 0 3.8.9 4.7 1.8l3.2-3.1C17.8 1 15.1 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c6.9 0 11.5-4.9 11.5-11.8 0-.8-.1-1.4-.2-2H12z" />
    </svg>
  )
}

const STAR_PATH = 'M12 3.2l2.7 5.6 6.1.6-4.6 4.2 1.3 6-5.5-3-5.5 3 1.3-6-4.6-4.2 6.1-.6L12 3.2z'

function Star({ index, reduce }: { index: number; reduce: boolean }) {
  return (
    <motion.svg
      width={30}
      height={30}
      viewBox="0 0 24 24"
      stroke="#006837"
      strokeWidth={1.4}
      strokeLinejoin="round"
      initial={{ scale: 0.5, opacity: 0, fill: 'rgba(0,104,55,0)' }}
      whileInView={{ scale: 1, opacity: 1, fill: '#006837' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: reduce ? 0.01 : 0.4, ease: EASE, delay: reduce ? 0 : index * 0.12 }}
    >
      <path d={STAR_PATH} />
    </motion.svg>
  )
}

function StarRating({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative flex items-center gap-2 overflow-hidden py-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} index={i} reduce={reduce} />
      ))}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-10"
        style={{
          background: 'linear-gradient(105deg, transparent, rgba(244,244,232,0.95), transparent)',
          mixBlendMode: 'overlay',
        }}
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 220, opacity: [0, 1, 0] }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: reduce ? 0.01 : 0.7, delay: reduce ? 0 : 0.85, ease: 'easeInOut' }}
      />
    </div>
  )
}

function ReviewPromptCard({ question, reduce }: { question: string; reduce: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.button
      type="button"
      layout
      onClick={() => setExpanded((v) => !v)}
      aria-expanded={expanded}
      transition={{ layout: { duration: reduce ? 0.01 : 0.4, ease: EASE } }}
      className={`${styles.glassCard} flex w-[78%] max-w-[290px] shrink-0 snap-start flex-col rounded-[22px] border border-white/50 p-5 text-left shadow-[0_14px_32px_-14px_rgba(0,104,55,0.3)]`}
    >
      <p className="text-[1.0625rem] font-semibold leading-snug text-[#006837]">{question}</p>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.35, ease: EASE }}
            className="flex items-center gap-2 overflow-hidden border-t border-[#006837]/15 pt-3 text-[13px] font-bold uppercase tracking-wide text-[#006837]/70"
          >
            <PenLine size={14} strokeWidth={2} className="shrink-0" />
            Responde esto en tu reseña
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// Small geometric burst — brand shapes, not confetti — fired on tap. Purely
// decorative and never blocks navigation: the anchor's own target="_blank"
// opens immediately regardless of this animation.
const BURST_SHAPES = [
  { x: -46, y: -30, r: -35, square: true },
  { x: 40, y: -34, r: 20, square: false },
  { x: -58, y: 14, r: 10, square: false },
  { x: 54, y: 18, r: -20, square: true },
  { x: -18, y: -48, r: 45, square: false },
  { x: 18, y: -50, r: -15, square: true },
]

function ReviewCTA({ reduce }: { reduce: boolean }) {
  const [burstId, setBurstId] = useState(0)

  function handleClick() {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('trackCustom', 'ReviewClick', { service: 'postcard' })
    }
    if (!reduce) setBurstId((n) => n + 1)
  }

  return (
    <motion.a
      href={GOOGLE_REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: reduce ? 0.01 : 0.5, ease: EASE }}
      className="group relative flex min-h-[56px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#006837] px-6 text-center text-[13.5px] font-bold uppercase tracking-[0.02em] text-white shadow-[0_14px_30px_-10px_rgba(0,104,55,0.6)] sm:px-8 sm:text-[15px] sm:tracking-[0.04em]"
    >
      <GoogleGlyph size={18} />
      <span className="whitespace-nowrap transition-transform duration-300 group-active:translate-x-0.5">Escribir mi reseña en Google</span>

      <AnimatePresence>
        {burstId > 0 && (
          <motion.span key={burstId} aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {BURST_SHAPES.map((s, i) => (
              <motion.span
                key={i}
                className={`absolute h-2 w-2 ${s.square ? 'rounded-[2px]' : 'rounded-full'}`}
                style={{ backgroundColor: i % 2 === 0 ? '#b5e533' : '#f4f4e8' }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.4, rotate: s.r }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  )
}

function StepProgress({
  show,
  activeIndex,
  reduce,
  onSelect,
}: {
  show: boolean
  activeIndex: number
  reduce: boolean
  onSelect: (i: number) => void
}) {
  return (
    <motion.nav
      aria-label="Progreso de los 4 pasos"
      initial={false}
      animate={{ y: show ? 0 : -90, opacity: show ? 1 : 0 }}
      transition={{ duration: reduce ? 0.01 : 0.4, ease: 'easeOut' }}
      style={{ pointerEvents: show ? 'auto' : 'none' }}
      className="fixed inset-x-0 top-0 z-30 flex justify-center px-4 pt-3"
    >
      <div className="flex w-full max-w-[300px] items-center gap-1 rounded-full border border-white/50 bg-[#f4f4e8]/75 px-3 py-2 shadow-[0_10px_28px_-12px_rgba(0,104,55,0.4)] backdrop-blur-xl">
        {steps.map((step, i) => (
          <div key={step.number} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Ir al paso ${i + 1}: ${step.title}`}
              aria-current={activeIndex === i ? 'step' : undefined}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            >
              <motion.span
                initial={false}
                animate={{
                  backgroundColor: activeIndex >= i ? '#006837' : 'rgba(0,104,55,0.08)',
                  color: activeIndex >= i ? '#f4f4e8' : 'rgba(0,104,55,0.5)',
                }}
                transition={{ duration: reduce ? 0.01 : 0.4, ease: 'easeOut' }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#006837]/20 text-[13px] font-bold"
              >
                {i + 1}
              </motion.span>
            </button>
            {i < steps.length - 1 && (
              <div className="relative mx-0.5 h-[2px] flex-1 overflow-hidden rounded-full bg-[#006837]/15">
                <motion.div
                  initial={false}
                  animate={{ scaleX: activeIndex > i ? 1 : 0 }}
                  transition={{ duration: reduce ? 0.01 : 0.4, ease: 'easeOut' }}
                  style={{ transformOrigin: 'left', width: '100%' }}
                  className="absolute inset-y-0 left-0 bg-[#006837]"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.nav>
  )
}

export default function PostcardShowcase({
  monumentClassName,
  funnelClassName,
}: {
  monumentClassName: string
  funnelClassName: string
}) {
  const reduce = useReducedMotion() ?? false

  const heroRef = useRef<HTMLDivElement>(null)
  const reviewRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const cardRef0 = useRef<HTMLElement>(null)
  const cardRef1 = useRef<HTMLElement>(null)
  const cardRef2 = useRef<HTMLElement>(null)
  const cardRef3 = useRef<HTMLElement>(null)
  const cardRefs = [cardRef0, cardRef1, cardRef2, cardRef3]

  const heroInView = useInView(heroRef)
  const reviewInView = useInView(reviewRef, { amount: 0.15 })
  const footerInView = useInView(footerRef, { amount: 0.15 })
  const c0 = useInView(cardRef0, { margin: CENTER_BAND })
  const c1 = useInView(cardRef1, { margin: CENTER_BAND })
  const c2 = useInView(cardRef2, { margin: CENTER_BAND })
  const c3 = useInView(cardRef3, { margin: CENTER_BAND })
  const activeIndex = [c0, c1, c2, c3].reduce((acc, inView, i) => (inView ? i : acc), -1)
  const showProgress = !heroInView && !reviewInView && !footerInView

  function scrollToStep(i: number) {
    cardRefs[i].current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  const heroContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.14, delayChildren: reduce ? 0 : 0.05 } },
  }
  const heroItem: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.55, ease: EASE } },
  }

  return (
    <>
      <PostcardBackdrop reduce={reduce} />
      <StepProgress show={showProgress} activeIndex={activeIndex} reduce={reduce} onSelect={scrollToStep} />

      <div className={`${funnelClassName} relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-5 pb-20 pt-16 sm:max-w-2xl sm:px-8 sm:pt-20`}>
        <motion.div
          ref={heroRef}
          variants={heroContainer}
          initial="hidden"
          animate="visible"
          className="relative flex w-full flex-col items-center text-center"
        >
          <div className="relative z-10 flex w-full flex-col items-center">
            <motion.div variants={heroItem} className="relative mb-10 w-[78%] max-w-[560px] sm:w-[62%]" style={{ aspectRatio: '1920 / 1080' }}>
              <Image
                src="/logo.png"
                alt="LATAM VISA"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 640px) 78vw, 560px"
              />
            </motion.div>

            <div className="relative w-full">
              <TextSafeScrim />
              <div className="relative z-10">
                <motion.h1
                  variants={heroItem}
                  className={`${monumentClassName} -mx-4 text-balance text-[clamp(2.75rem,17vw,5.75rem)] uppercase leading-[0.85] tracking-tight sm:-mx-7`}
                >
                  Guía para enviarle una postal a la persona que más amas, esté en el país que esté.
                </motion.h1>

                <motion.p
                  variants={heroItem}
                  className="-mx-4 mt-6 max-w-none text-[clamp(1.0625rem,3vw,1.25rem)] font-medium leading-[1.5] text-[#006837] sm:-mx-7"
                >
                  Cuatro pasos para que tu postal salga de Australia y llegue hasta su puerta.
                </motion.p>
              </div>
            </div>

            <motion.div variants={heroItem} className="mt-10 text-[#006837]">
              <motion.div
                animate={reduce ? {} : { y: [0, 6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown size={26} strokeWidth={1.75} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-14 flex w-full flex-col gap-8 sm:mt-16">
          {steps.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              reduce={reduce}
              monumentClassName={monumentClassName}
              cardRef={cardRefs[i]}
            />
          ))}
        </div>

        <div ref={reviewRef} className="relative mt-24 flex w-full flex-col items-center text-center sm:mt-28">
          <div className="relative w-full">
            <TextSafeScrim />
            <div className="relative z-10 flex flex-col items-center">
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.28em] text-[#006837]">
                Una última cosa
              </span>
              <h2
                className={`${monumentClassName} -mx-4 mt-4 text-balance text-[clamp(2.1rem,11vw,3.75rem)] uppercase leading-[0.9] tracking-tight sm:-mx-7`}
              >
                Tu postal ya va en camino. Ahora cuéntanos tu historia.
              </h2>
              <p className="mt-5 max-w-md text-[clamp(1.0625rem,2.8vw,1.125rem)] leading-[1.6] text-[#006837]">
                Hace un tiempo llegaste con una duda y hoy le estás escribiendo a tu gente desde Australia.
                Si ese camino te sirvió, cuéntalo. Hay alguien allá afuera con el mismo miedo que tú tenías,
                buscando exactamente eso: saber que sí se puede.
              </p>
              <div className="mt-7">
                <StarRating reduce={reduce} />
              </div>
            </div>
          </div>

          <div
            className="-mx-5 mt-10 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8"
            style={{ scrollbarWidth: 'none' }}
          >
            {reviewPrompts.map((question) => (
              <ReviewPromptCard key={question} question={question} reduce={reduce} />
            ))}
          </div>

          <div className="mt-10 w-full">
            <ReviewCTA reduce={reduce} />
          </div>

          <div className="relative mt-4">
            <TextSafeScrim />
            <p className="relative z-10 text-[13px] font-medium text-[#006837]">Te toma menos de un minuto.</p>
          </div>
        </div>

        <div ref={footerRef} className="relative mt-14 flex w-full flex-col items-center gap-8 sm:mt-16">
          <div className="relative">
            <TextSafeScrim />
            <p className="relative z-10 flex flex-col items-center gap-2 text-center text-[13px] leading-relaxed text-[#006837]">
              <span>© {new Date().getFullYear()} LATAM VISA® — Todos los derechos reservados.</span>
              <span className="inline-flex items-center gap-1.5">
                Con amor y orgullo por tus logros. El equipo de LATAM VISA.
                <Heart size={13} strokeWidth={2} className="shrink-0" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
