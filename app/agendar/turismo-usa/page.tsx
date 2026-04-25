'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function StripeEmbeddedCheckout() {
  const fetchClientSecret = useCallback(() => {
    return fetch('/api/checkout/turismo-usa', { method: 'POST' })
      .then(res => res.json())
      .then(data => data.clientSecret)
  }, [])

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export default function TurismoUsaCheckoutPage() {
  return (
    <>
      <title>Asesoría Visado USA | Checkout Seguro</title>
      <meta name="description" content="Finaliza de forma segura el pago de tu asesoría de visa B1/B2." />

      {/* HEADER MOBILE LOGO: Visible solo en móviles, en lo más alto */}
      <header className="lg:hidden w-full bg-white pt-8 pb-6 px-6 flex justify-center sticky top-0 z-20 border-b border-gray-100 shadow-sm relative">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <div className="font-monument font-black text-2xl tracking-tighter uppercase text-[#111111]">
            LATAM VISA<span className="text-[#5B6A00]">®</span>
          </div>
        </Link>
      </header>

      {/* CONTENEDOR PRINCIPAL: flex-col-reverse en mobile (Info arriba, Form abajo), flex-row en Desktop */}
      <main className="min-h-screen bg-white text-[#111111] flex flex-col-reverse lg:flex-row w-full font-funnel selection:bg-[#111111] selection:text-[#C8FF00]">
        
        {/* ═══ COLUMNA IZQUIERDA: PAGO (55%) ═══ */}
        {/* Ocupa 55% en desktop, todo el ancho e info abajo en mobile */}
        <section className="w-full lg:w-[55%] flex flex-col relative px-4 sm:px-8 lg:px-12 xl:px-[10%]">
          
          {/* HEADER DESKTOP LOGO (Oculto en celular, scroll normal arriba) */}
          <header className="hidden lg:flex w-full py-12 items-center justify-start">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <div className="font-monument font-black text-2xl tracking-tighter uppercase text-[#111111]">
                LATAM VISA<span className="text-[#5B6A00]">®</span>
              </div>
            </Link>
          </header>

          {/* Wrapper del Embedded Checkout */}
          <div className="flex-1 flex flex-col w-full max-w-[550px] mx-auto lg:mx-0 pt-10 lg:pt-4 pb-20">
            {/* Fallback Loader oculto por detrás que sirve mientras carga Stripe */}
            <div className="relative w-full min-h-[500px]">
              <div className="absolute inset-0 flex flex-col items-center pt-24 z-0 pointer-events-none gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] border-[#C8FF00]/30 border-t-[#C8FF00] rounded-full animate-spin"></div>
                <span className="font-iceland text-xs md:text-sm text-[#777777] uppercase tracking-widest animate-pulse">
                  Conectando checkout seguro...
                </span>
              </div>

              {/* El componente puro de Stripe sin bordes visuales pesados */}
              <div className="relative z-10 w-full min-h-[500px]">
                <StripeEmbeddedCheckout />
              </div>
            </div>
          </div>
          
          {/* Footer Simple Minimalista */}
          <footer className="py-6 border-t border-gray-50 flex flex-wrap gap-4 text-[11px] uppercase font-iceland tracking-widest text-[#999999] mt-auto">
            <span>© {new Date().getFullYear()} LATAM VISA</span>
            <span className="hidden sm:inline">·</span>
            <span>PROCESADO SEGURO POR STRIPE</span>
          </footer>

        </section>

        {/* ═══ COLUMNA DERECHA: INFORMACIÓN (45% - STICKY) ═══ */}
        <section className="w-full lg:w-[45%] bg-[#0A0A0A] text-white border-b lg:border-b-0 lg:border-l border-[#1A1A1A] px-6 py-12 sm:px-10 lg:px-16 lg:py-16 relative">
          
          {/* Contenedor que hace "Sticky" en Desktop y se bloquea en top-16 */}
          <div className="lg:sticky lg:top-16 max-w-lg mx-auto lg:ml-0 lg:mr-auto">
            
            <div className="mb-8">
              <span className="inline-block font-iceland text-[#C8FF00] font-bold text-xs tracking-[0.25em] uppercase mb-4 opacity-90 border border-[#C8FF00]/20 px-3 py-1 rounded-sm">
                HONORARIOS DE AGENCIA
              </span>

              <h1 className="font-monument font-black text-3xl sm:text-4xl lg:text-[40px] uppercase tracking-tight text-white mb-2 leading-none">
                Asesoría Visado USA
              </h1>
            </div>

            <p className="font-funnel font-medium text-3xl sm:text-4xl text-white tracking-tight mb-10 flex items-center gap-3">
              USD $190
              <span className="font-iceland text-xs text-[#888888] tracking-widest uppercase border border-[#333333] rounded px-2 py-0.5 transform -translate-y-1">
                PAGO ÚNICO
              </span>
            </p>

            <div className="space-y-6 border-t border-[#1A1A1A] pt-10">
              <h2 className="font-iceland text-xs text-[#666666] tracking-[0.2em] uppercase font-bold">
                Resumen de Inclusión
              </h2>

              <ul className="space-y-4">
                {[
                  'Evaluación estratégica de perfil',
                  'Creación de perfil consular',
                  'Llenado completo del formulario DS-160',
                  'Guía de pago de aranceles (MRV)',
                  'Agendamiento de citas consulares',
                  'Sesión de preparación para entrevista'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 group">
                    <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-[#C8FF00]/60 group-hover:bg-[#C8FF00] transition-colors"></span>
                    <span className="font-funnel font-light text-[#CCCCCC] text-sm md:text-base leading-relaxed tracking-wide">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aviso de Confianza Elegante */}
            <div className="mt-16 p-4 rounded-xl bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1A1A1A] flex items-center gap-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="font-iceland text-[11px] text-[#777777] uppercase tracking-widest leading-relaxed">
                Encriptación de grado militar SSL <br/>
                Latam Visa no procesa números de tarjetas
              </p>
            </div>

          </div>
          
        </section>

      </main>
    </>
  )
}
