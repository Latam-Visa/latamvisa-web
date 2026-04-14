'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Testimonial {
  quote: string
  name: string
  location: string
  avatar: string
  visaType: string
  dark: boolean
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Solo queríamos agradecerte por toda la ayuda con este proceso. ¡Ya nos dijeron aprobada! Mil gracias de verdad, todo fue súper rápido y fácil gracias a ustedes.",
    name: "Pau", location: "Perth, Australia", avatar: "P",
    visaType: "Visa Australia", dark: false,
  },
  {
    quote: "Quería agradecerte por tu asesoría, realmente me sirvió muchísimo. Afortunadamente me fue super bien, fue bastante fácil. Gracias a Dios tengo visa aprobada.",
    name: "Cliente verificado", location: "Perth, Australia", avatar: "🇦🇺",
    visaType: "Visa Australia", dark: true,
  },
  {
    quote: "Nos aprobaron la visa a los dos a pesar de que a mi novio se la negaron hace 1 año. Gracias de verdad por el buen trabajo que haces. Estamos muuyyy felices.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa Aprobada — Pareja", dark: false,
  },
  {
    quote: "Quería agradecerte por mi proceso de visa americana. Fue un éxito total y en tiempo récord, de verdad gracias por la asesoría.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa USA 🇺🇸", dark: true,
  },
  {
    quote: "Hoy tuve mi entrevista para la visa Americana y fue exitosa. Nos aprobaron la visa a mi esposa, a mi hija y a mí. Gracias por tu asesoría y acompañamiento, fue clave para el excelente resultado.",
    name: "Fredy", location: "Colombia", avatar: "F",
    visaType: "Visa USA 🇺🇸 — Familia", dark: false,
  },
  {
    quote: "Ya me renovaron la visaaaa, mil gracias enserio!!!! Todo fue demasiado rápido y exitosooo!!!! Súper recomendado.",
    name: "Cliente verificado", location: "Melbourne, Australia", avatar: "🇦🇺",
    visaType: "Renovación Visa Australia", dark: true,
  },
  {
    quote: "Después de muchos intentos, POR FIN tenemos visa aprobada!!! Gracias Cris por ser tan diligente y siempre estar dispuesto a solucionar dudas, sos un teso en lo que haces!!",
    name: "Camila", location: "Colombia", avatar: "C",
    visaType: "Visa USA 🇺🇸", dark: false,
  },
  {
    quote: "Nos aprobaron la visa a los dos, aún teniendo una visa rechazada antes. Mil gracias por la asesoría y el acompañamiento. Servicio 10 de 10.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa USA 🇺🇸", dark: true,
  },
  {
    quote: "Quiero darte las gracias por todo tu apoyo y orientación. Gracias a tu paciencia, me sentí preparado y confiado durante la entrevista. Tu conocimiento y consejos fueron clave para la aprobación. No podría haberlo logrado sin tu asistencia.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa USA 🇺🇸", dark: false,
  },
  {
    quote: "Esta vez sí me aprobaron la visa. Muchas gracias por la orientación, me ayudó mucho a organizar las respuestas que debía dar.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa Aprobada", dark: true,
  },
  {
    quote: "VISA APROBADAAAAA! Muchas gracias Cristian por la asesoría, excelente acompañamiento y tips. 100% recomendado.",
    name: "Cliente verificado", location: "LATAM", avatar: "⭐",
    visaType: "Visa Aprobada", dark: false,
  },
  {
    quote: "El proceso fue todo un éxito. Mi visa americana fue aprobada hace unos instantes, vengo saliendo del consulado. Gracias por tu ayuda, consejos y preparación.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa USA 🇺🇸", dark: true,
  },
  {
    quote: "Acabamos de salir de nuestra cita para la visa Americana. ¡APROBADA! Muchas gracias por la gestión, es un alivio para mí, mi esposa y mi hija. Ahora sí los puedo recomendar.",
    name: "Daniel", location: "Colombia", avatar: "D",
    visaType: "Visa USA 🇺🇸 — Familia", dark: false,
  },
  {
    quote: "Quería contarte que… ¡Habemus visa! Nos aprobaron la visa a los dos. Gracias por toda tu ayuda.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa Aprobada — Pareja", dark: true,
  },
  {
    quote: "Hola Christian muchas gracias por la asesoría, nos aceptaron la visa a mi pareja y a mi.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa Aprobada — Pareja", dark: false,
  },
  {
    quote: "Cristian muchas gracias por tu asesoría. Nos aprobaron la visa a los dos a pesar de que a mi novio se la negaron hace 1 año. Gracias de verdad por el buen trabajo que hacen. Estamos muuyyy felices.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa Aprobada — Pareja", dark: true,
  },
  {
    quote: "Le comento que hoy tuve la entrevista y me aprobaron la visa. Muchas gracias por la orientación que me dio, me ayudó mucho a organizar las respuestas que debía dar.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa USA 🇺🇸", dark: false,
  },
  {
    quote: "Paso por aquí para agradecerle por todo el apoyo y la dedicación en el proceso. Todo salió como lo esperábamos y nos aprobaron la visa. Los datos que habíamos estudiado fueron muy certeros. Gracias por su trabajo.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa Aprobada", dark: true,
  },
  {
    quote: "Hola, gracias por la asesoría, excelente trabajo. ¡Aprobada! ¡Que chimbaaaaa!",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa Aprobada", dark: false,
  },
  {
    quote: "¡Aprobada!! Muchas gracias por tu apoyo, te lo cuento de inmediato. Todo estuvo increíble.",
    name: "Cliente verificado", location: "Colombia", avatar: "🇨🇴",
    visaType: "Visa Aprobada", dark: false,
  },
]

const PER_PAGE = 5
const FILLER = { __filler: true } as const
type FillerCard = typeof FILLER

function CardContent({ t, large = false }: { t: Testimonial; large?: boolean }) {
  const isDark = t.dark
  return (
    <>
      <span aria-hidden style={{
        display: 'block', fontFamily: 'Georgia, serif',
        fontSize: large ? 52 : 30, lineHeight: 0,
        marginBottom: large ? 20 : 13,
        color: '#C8FF00', userSelect: 'none',
      }}>
        &ldquo;
      </span>

      <p style={{
        fontStyle: 'italic',
        fontSize: large ? 15 : 12,
        lineHeight: 1.7,
        color: isDark ? 'rgba(255,255,255,0.85)' : '#1A1A1A',
        margin: 0,
        fontFamily: 'var(--font-monument, Georgia, serif)',
        fontWeight: 300,
      }}>
        {t.quote}
      </p>

      <div style={{
        width: large ? 40 : 28, height: 2,
        background: '#C8FF00',
        margin: large ? '22px 0' : '12px 0',
        borderRadius: 2,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: large ? 12 : 8 }}>
        <div style={{
          width: large ? 38 : 26, height: large ? 38 : 26,
          borderRadius: '50%', background: '#C8FF00',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: large ? 16 : 12, fontWeight: 700,
          flexShrink: 0, color: '#0D0D0D',
        }}>
          {t.avatar}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: large ? 14 : 11,
            color: isDark ? '#FFF' : '#0D0D0D',
            marginBottom: large ? 6 : 4,
            fontFamily: 'var(--font-monument, sans-serif)',
          }}>
            {t.name}
            <span style={{
              fontWeight: 400, fontSize: large ? 12 : 10,
              color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)',
              marginLeft: 5,
            }}>
              — {t.location}
            </span>
          </div>
          <span style={{
            display: 'inline-block',
            background: isDark ? 'rgba(200,255,0,0.1)' : 'rgba(200,255,0,0.18)',
            color: isDark ? '#C8FF00' : '#4A6B00',
            fontSize: large ? 12 : 10, fontWeight: 600,
            borderRadius: 100, padding: large ? '3px 10px' : '2px 8px',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-funnel, monospace)',
            textTransform: 'uppercase',
          }}>
            {t.visaType} ✅
          </span>
        </div>
      </div>
    </>
  )
}

export default function TestimonialsSection() {
  const [page, setPage]       = useState(0)
  const [active, setActive]   = useState<Testimonial | null>(null)
  const [paused, setPaused]   = useState(false)
  const sectionRef            = useRef<HTMLElement>(null)
  const touchStartX           = useRef<number>(0)
  const totalPages            = Math.ceil(TESTIMONIALS.length / PER_PAGE)

  // Pad last page to always have PER_PAGE items
  const pages = Array.from({ length: totalPages }, (_, i) => {
    const slice = TESTIMONIALS.slice(i * PER_PAGE, (i + 1) * PER_PAGE) as (Testimonial | FillerCard)[]
    while (slice.length < PER_PAGE) slice.push(FILLER)
    return slice
  })

  // Auto-advance every 5s, pauses on hover
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setPage(p => (p + 1) % totalPages), 5000)
    return () => clearInterval(id)
  }, [paused, totalPages])

  // GSAP scroll-in
  useEffect(() => {
    const init = async () => {
      const { gsap }          = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const section = sectionRef.current
      if (!section) return
      gsap.fromTo('.testimonials-slider',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', once: true },
          clearProps: 'opacity,transform',
        }
      )
    }
    init()
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) setPage(p => Math.min(totalPages - 1, p + 1))
      else          setPage(p => Math.max(0, p - 1))
    }
  }

  return (
    <>
      <style>{`
        .testimonial-slot {
          padding: 6px;
          border: 1.5px dashed rgba(100,110,0,0.25);
          border-radius: 18px;
          transition: border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .testimonial-slot:hover { border-color: rgba(100,110,0,0.55); }
        .testimonial-card {
          border-radius: 14px;
          padding: 16px 18px;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08) !important;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
        }
        .testimonial-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 36px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.1) !important;
        }
        .testimonial-filler {
          border-radius: 14px;
          padding: 16px 18px;
          box-sizing: border-box;
          background: transparent;
          border: 1.5px dashed rgba(100,110,0,0.18);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
          flex: 1;
        }
        .testimonials-page-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .testimonials-page-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 560px) {
          .testimonials-page-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .nav-dot {
          height: 7px; border-radius: 100px;
          border: none; cursor: pointer; padding: 0;
          transition: width 0.35s ease, background 0.35s ease;
        }
        .nav-arrow {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          border: 1.5px solid rgba(0,0,0,0.15);
          cursor: pointer; font-size: 15px; color: #111;
          transition: all 0.25s ease;
        }
        .nav-arrow:hover:not(:disabled) {
          border-color: #8aaa00;
          background: rgba(200,255,0,0.1);
          color: #4a6000;
        }
        .nav-arrow:disabled { opacity: 0.28; cursor: default; }
        .progress-bar-inner {
          height: 100%;
          border-radius: 100px;
          background: #8aaa00;
          transition: width 0.3s ease;
        }
        @keyframes progress-fill {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>

      <section
        id="testimonios"
        ref={sectionRef}
        className="relative overflow-hidden -mt-[1px] py-14 px-6"
        style={{
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #fafff0 30%, #f0ff99 58%, #d4ff00 80%, #C8FF00 100%)',
        }}
      >
        <div className="max-w-[1300px] mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <span style={{
              display: 'block', color: '#5B6A00', fontSize: 10,
              fontWeight: 600, letterSpacing: '0.35em',
              textTransform: 'uppercase', marginBottom: 10,
              fontFamily: 'var(--font-funnel, monospace)',
            }}>
              Testimonios Reales
            </span>
            <h2 className="font-monument font-black" style={{
              fontSize: 'clamp(1.4rem, 2.2vw, 2rem)',
              lineHeight: 1.1, color: '#0D0D0D',
            }}>
              Historial de{' '}
              <span style={{ color: '#6b8800', textDecoration: 'underline', textDecorationColor: '#C8FF00', textUnderlineOffset: 4 }}>Aprobaciones</span>
            </h2>
            <p style={{
              fontSize: 13, color: 'rgba(0,0,0,0.42)',
              fontWeight: 300, letterSpacing: '0.04em',
              marginTop: 8,
              fontFamily: 'var(--font-funnel, monospace)',
            }}>
              Clientes reales. Visas reales. Resultados reales.
            </p>
          </div>

          {/* ── Horizontal slider ── */}
          <div
            className="testimonials-slider"
            style={{ overflow: 'hidden', borderRadius: 8, opacity: 1 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div style={{
              display: 'flex',
              transform: `translateX(-${page * 100}%)`,
              transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
            }}>
              {pages.map((pageCards, pIdx) => (
                <div key={pIdx} className="testimonials-page-grid" style={{ minWidth: '100%' }}>
                  {pageCards.map((t, cIdx) => {
                    if ((t as FillerCard).__filler) {
                      return (
                        <div key={`filler-${cIdx}`} className="testimonial-slot">
                          <div className="testimonial-filler">
                            <span style={{ fontSize: 28, opacity: 0.35 }}>✅</span>
                            <p style={{
                              fontSize: 11, color: 'rgba(0,0,0,0.35)',
                              fontFamily: 'var(--font-funnel, monospace)',
                              lineHeight: 1.5, margin: 0,
                            }}>
                              Más clientes<br />felices cada día
                            </p>
                          </div>
                        </div>
                      )
                    }
                    const testimonial = t as Testimonial
                    const isDark = testimonial.dark
                    return (
                      <div key={cIdx} className="testimonial-slot">
                        <div
                          className="testimonial-card"
                          onClick={() => setActive(testimonial)}
                          style={{
                            background: isDark ? '#0D0D0D' : '#FFFFFF',
                            border: isDark
                              ? '1px solid rgba(200,255,0,0.2)'
                              : '1px solid rgba(0,0,0,0.1)',
                          }}
                        >
                          <CardContent t={testimonial} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: 14, marginTop: 16,
          }}>
            <button
              className="nav-arrow"
              onClick={() => { setPage(p => Math.max(0, p - 1)); setPaused(true) }}
              disabled={page === 0}
              aria-label="Anterior"
            >
              ←
            </button>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className="nav-dot"
                  onClick={() => { setPage(i); setPaused(true) }}
                  aria-label={`Página ${i + 1}`}
                  style={{
                    width: page === i ? 22 : 7,
                    background: page === i ? '#8aaa00' : 'rgba(0,0,0,0.15)',
                  }}
                />
              ))}
            </div>

            <button
              className="nav-arrow"
              onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); setPaused(true) }}
              disabled={page === totalPages - 1}
              aria-label="Siguiente"
            >
              →
            </button>
          </div>

          {/* Auto-advance progress bar */}
          <div style={{
            width: 120, height: 3, borderRadius: 100,
            background: 'rgba(0,0,0,0.08)',
            margin: '10px auto 0', overflow: 'hidden',
          }}>
            <div
              className="progress-bar-inner"
              key={`${page}-${paused}`}
              style={{
                width: paused ? `${((page + 1) / totalPages) * 100}%` : '100%',
                animation: paused ? 'none' : 'progress-fill 5s linear',
              }}
            />
          </div>

        </div>
      </section>

      {/* ── Expanded modal ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setActive(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.58)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20, cursor: 'zoom-out',
            }}
          >
            <motion.div
              key="card"
              initial={{ scale: 0.88, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 14 }}
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                background: active.dark ? '#0D0D0D' : '#FFFFFF',
                borderRadius: 20,
                padding: '36px 40px',
                maxWidth: 460, width: '100%',
                border: active.dark
                  ? '1px solid rgba(200,255,0,0.2)'
                  : '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
                cursor: 'default', position: 'relative',
              }}
            >
              <CardContent t={active} large />

              <button
                onClick={() => setActive(null)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(128,128,128,0.15)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: active.dark ? '#fff' : '#333',
                  transition: 'background 0.2s ease',
                }}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
