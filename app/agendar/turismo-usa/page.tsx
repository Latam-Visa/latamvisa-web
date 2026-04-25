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
          <img src='/logo.png' alt='LATAM VISA' className='h-[105px] w-auto object-contain' />
        </Link>
      </header>

      {/* CONTENEDOR PRINCIPAL: flex-col-reverse en mobile (Info arriba, Form abajo), flex-row en Desktop */}
      <main className="min-h-screen bg-white text-[#111111] flex flex-col-reverse lg:flex-row w-full font-funnel selection:bg-[#111111] selection:text-[#C8FF00]">
        
        {/* ═══ COLUMNA IZQUIERDA: PAGO (55%) ═══ */}
        {/* Ocupa 55% en desktop, todo el ancho e info abajo en mobile */}
        <section className="w-full lg:w-[55%] flex flex-col relative px-4 sm:px-8 lg:px-12 xl:px-[10%]">
          
          {/* Wrapper del Embedded Checkout */}
          <div className="flex-1 flex flex-col w-full max-w-[550px] mx-auto pt-10 lg:pt-16 pb-20">
            
            {/* HEADER DESKTOP LOGO (Dentro del grid, centrado a la caja de pago y alineado top con panel derecho) */}
            <header className="hidden lg:flex w-full mb-10 items-center justify-center">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                <img src='/logo.png' alt='LATAM VISA' className='h-[105px] md:h-[110px] w-auto object-contain' />
              </Link>
            </header>
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
        <section className="w-full lg:w-[45%] text-[#111111] border-b lg:border-b-0 lg:border-l border-[#C8FF00]/40 px-6 py-12 sm:px-10 lg:px-16 lg:py-16 relative bg-gradient-to-br from-[#FAFFEB] to-[#E8FF7A]/80 backdrop-blur-2xl">
          
          {/* Contenedor que hace "Sticky" en Desktop y se bloquea en top-16 */}
          <div className="lg:sticky lg:top-16 max-w-lg mx-auto lg:ml-0 lg:mr-auto">
            
            <div className="mb-6">
              <span className="inline-block font-iceland text-[#5B6A00] font-bold text-[10px] tracking-[0.25em] uppercase mb-3 border border-[#5B6A00]/30 bg-white/40 px-3 py-1 rounded-sm shadow-sm">
                HONORARIOS DE AGENCIA
              </span>

              <h1 className="font-monument font-black text-2xl sm:text-3xl lg:text-[32px] uppercase tracking-tight text-[#111111] mb-2 leading-none">
                Asesoría Visado USA
              </h1>
            </div>

            <p className="font-funnel font-bold text-2xl sm:text-3xl text-[#111111] tracking-tight mb-8 flex items-center gap-3">
              USD $190
              <span className="font-iceland text-[10px] sm:text-xs text-[#5B6A00] tracking-widest uppercase border border-[#5B6A00]/40 bg-white/30 rounded px-2 py-0.5 transform -translate-y-1">
                PAGO ÚNICO
              </span>
            </p>

            <div className="space-y-6 border-t border-[#111111]/10 pt-8">
              <h2 className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold">
                RESUMEN DE INCLUSIÓN
              </h2>

              <ul className="space-y-3">
                {[
                  'Evaluación estratégica de perfil',
                  'Creación de perfil consular',
                  'Llenado completo del formulario DS-160',
                  'Guía de pago de aranceles (MRV)',
                  'Agendamiento de citas consulares',
                  'Sesión de preparación para entrevista'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 group">
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5B6A00] shadow-[0_0_4px_rgba(91,106,0,0.4)]"></span>
                    <span className="font-funnel font-medium text-[#111111] text-sm md:text-sm leading-relaxed tracking-wide">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aviso de Confianza Elegante */}
            <div className="mt-12 p-5 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 shadow-sm flex items-center gap-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B6A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="font-iceland text-[10px] sm:text-[11px] text-[#111111] font-bold uppercase tracking-widest leading-relaxed">
                Encriptación de grado militar SSL <br/>
                No procesamos números de tarjetas
              </p>
            </div>

          </div>
          
        </section>

      </main>
    </>
  )
}
