'use client'
import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'

const steps = [
  { num: '01', title: 'Evaluación de Perfil',    body: 'Analizamos a fondo tu background académico, edad y objetivos en Australia para trazar un camino migratorio seguro, realista y viable.' },
  { num: '02', title: 'Estrategia Personalizada', body: 'Diseñamos una hoja de ruta única, seleccionando estratégicamente el tipo de visa e institución educativa para maximizar tus probabilidades de éxito.' },
  { num: '03', title: 'Documentos y Checklist',   body: 'Te entregamos un checklist exacto y acompañamos la recolección, traducción y validación minuciosa de cada requisito exigido por inmigración.' },
  { num: '04', title: 'Aplicación y Envío',        body: 'Auditamos tu expediente al detalle y ejecutamos la aplicación oficial ante el Departamento de Asuntos Internos de Australia.' },
  { num: '05', title: 'Seguimiento y Respuesta',  body: 'Monitoreamos el estatus de tu caso día a día, gestionando cualquier requerimiento adicional hasta celebrar la aprobación final.' },
]

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let ctx: any = null

    const init = async () => {
      const { gsap }          = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const section = sectionRef.current
      if (!section) return

      ctx = gsap.context(() => {
        const label   = section.querySelector('.process-label')
        const title   = section.querySelector('.process-title')
        const stepsContainer = section.querySelector('.grid')
        const discText = section.querySelector('.disclaimer-text')

        const labelWs   = section.querySelectorAll('.process-label .word')
        const titleWs   = section.querySelectorAll('.process-title .word')
        const numDigits = section.querySelectorAll('.step-num-digit')
        const titleSt   = section.querySelectorAll('.step-title .word')
        const bodiesWs  = section.querySelectorAll('.step-body .word')
        const discWs    = section.querySelectorAll('.disclaimer-text .word')

        // ── Set initial hidden states ──
        gsap.set(labelWs,   { opacity: 0, y: '115%', rotation: 2 })
        gsap.set(titleWs,   { opacity: 0, y: '115%', rotation: 3 })
        gsap.set(numDigits, { opacity: 0, y: '115%', rotation: 8 }) 
        gsap.set(titleSt,   { opacity: 0, y: '115%', rotation: 2 })
        gsap.set(bodiesWs,  { opacity: 0, y: '115%', rotation: 1 })
        gsap.set(discWs,    { opacity: 0, y: '115%' })

        // ── Animate to visible (Bi-directional visibility tied to actual elements) ──
        gsap.to(labelWs, {
          scrollTrigger: { trigger: label, start: 'top 95%', end: 'bottom 5%', toggleActions: 'play reverse play reverse' },
          opacity: 1, y: '0%', rotation: 0, duration: 1.2, ease: 'power3.out', stagger: 0.05,
        })
        gsap.to(titleWs, {
          scrollTrigger: { trigger: title, start: 'top 90%', end: 'bottom 5%', toggleActions: 'play reverse play reverse' },
          opacity: 1, y: '0%', rotation: 0, duration: 1.6, ease: 'power4.out', stagger: 0.1,
        })
        gsap.to(numDigits, {
          scrollTrigger: { trigger: stepsContainer, start: 'top 85%', end: 'bottom 10%', toggleActions: 'play reverse play reverse' },
          opacity: 1, y: '0%', rotation: 0, duration: 1.2, ease: 'power3.out', stagger: 0.04,
        })
        gsap.to(titleSt, {
          scrollTrigger: { trigger: stepsContainer, start: 'top 80%', end: 'bottom 10%', toggleActions: 'play reverse play reverse' },
          opacity: 1, y: '0%', rotation: 0, duration: 0.9, ease: 'power3.out', stagger: 0.04,
        })
        gsap.to(bodiesWs, {
          scrollTrigger: { trigger: stepsContainer, start: 'top 75%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' },
          opacity: 1, y: '0%', rotation: 0, duration: 0.7, ease: 'power2.out', stagger: 0.015,
        })
        gsap.to(discWs, {
          scrollTrigger: { trigger: discText, start: 'top 95%', end: 'bottom 5%', toggleActions: 'play reverse play reverse' },
          opacity: 1, y: '0%', duration: 1.2, ease: 'power2.out', stagger: 0.02,
        })

        ScrollTrigger.refresh()
      }, section)
    }

    init()
    return () => { ctx?.revert() }
  }, [])

  return (
    <section
      id="proceso"
      ref={sectionRef}
      className="process-section py-20 px-6 relative z-10 overflow-hidden -mt-[1px]"
      style={{ background: 'linear-gradient(to bottom, rgba(253,252,250,0.92) 0%, rgba(255,255,255,0.98) 100%)' }}
    >




      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 3, position: 'relative' }}>

        {/* Header */}
        <div className="mb-10">
          <span className="process-label font-funnel text-[#5B6A00] text-xs md:text-sm tracking-[0.3em] uppercase block mb-4 text-center md:text-left">
            {'Cómo trabajamos'.split(' ').map((w, i) => (
              <span key={`l-${i}`} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.4em' }}>
                <span className="word" style={{ display: 'inline-block', paddingBottom: '0.1em' }}>{w}</span>
              </span>
            ))}
          </span>
          <h2 className="process-title font-monument font-black text-2xl md:text-4xl tracking-tight text-[#111111] leading-tight">
            {'Así funciona'.split(' ').map((w, i) => (
              <span key={`w1-${i}`} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.28em' }}>
                <span className="word" style={{ display: 'inline-block', paddingBottom: '0.1em' }}>{w}</span>
              </span>
            ))}
            <br />
            {'nuestro proceso'.split(' ').map((w, i) => (
              <span key={`w2-${i}`} className="text-[#5B6A00] italic" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.28em' }}>
                <span className="word" style={{ display: 'inline-block', paddingBottom: '0.1em', paddingRight: '0.2em' }}>{w}</span>
              </span>
            ))}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0">
          {steps.map((step, i) => (
            <div key={step.num} className="relative flex flex-col border-t-2 border-[#111111]/25 pt-8 pr-8 pb-12">

              <span
                className="step-number block w-full leading-none mb-6 select-none flex justify-center"
                style={{
                  fontSize: 'clamp(4.5rem, 8vw, 7.5rem)',
                  color: 'rgba(91, 106, 0, 0.05)',
                  WebkitTextStroke: '2px #5B6A00',
                  letterSpacing: '-0.04em',
                  textShadow: '0px 15px 30px rgba(200, 255, 0, 0.35)'
                }}
              >
                {step.num.split('').map((char, c) => (
                  <span key={c} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
                    <span 
                      className="step-num-digit font-monument font-black" 
                      style={{ display: 'inline-block', paddingBottom: '0.05em' }}
                    >
                      {char}
                    </span>
                  </span>
                ))}
              </span>

              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 w-px h-10 bg-[#111111]/20" />
              )}

              <h3
                className="step-title font-monument font-black text-[#111111] mb-1 leading-tight"
                style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.05rem)', letterSpacing: '0.01em' }}
              >
                {step.title.split(' ').map((w, j) => (
                  <span key={j} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.22em' }}>
                    <span className="word" style={{ display: 'inline-block', paddingBottom: '0.1em' }}>{w}</span>
                  </span>
                ))}
              </h3>

              <p className="step-body font-iceland leading-[1.15] text-[#333333]"
                style={{ fontSize: 'clamp(0.85rem, 1.2vw, 1rem)', letterSpacing: '0.02em' }}>
                {step.body.split(' ').map((w, j) => (
                  <span key={`b-${j}`} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.3em' }}>
                    <span className="word" style={{ display: 'inline-block', paddingBottom: '0.1em' }}>{w}</span>
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-xs text-[#444444] font-iceland border-t border-[#111111]/15 pt-6 disclaimer-text">
          {'* LATAM VISA no garantiza la aprobación de visas. Brindamos asesoría y acompañamiento profesional.'.split(' ').map((w, i) => (
             <span key={`d-${i}`} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.3em' }}>
               <span className="word" style={{ display: 'inline-block', paddingBottom: '0.1em' }}>{w}</span>
             </span>
          ))}
        </p>
      </div>
    </section>
  )
}
