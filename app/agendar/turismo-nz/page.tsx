'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function StripeEmbeddedCheckout({ conTraduccion }: { conTraduccion: boolean }) {
  const fetchClientSecret = useCallback(() => {
    return fetch('/api/checkout/turismo-nz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conTraduccion }),
    })
      .then(res => res.json())
      .then(data => data.clientSecret)
  }, [conTraduccion])

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        key={String(conTraduccion)}
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export default function TurismoNzCheckoutPage() {
  const [conTraduccion, setConTraduccion] = useState(false)

  return (
    <>
      <title>Visitor Visa New Zealand | Checkout Seguro</title>
      <meta name="description" content="Finaliza el pago de tu asesoría de visa de turismo a Nueva Zelanda." />

      <header className="lg:hidden w-full bg-white pt-8 pb-6 px-6 flex justify-center sticky top-0 z-20 border-b border-gray-100 shadow-sm relative">
        <Link href="/visados" className="inline-block hover:opacity-80 transition-opacity">
          <img src='/logo.png' alt='LATAM VISA' className='h-[105px] w-auto object-contain' />
        </Link>
      </header>

      <main className="min-h-screen lg:min-h-0 lg:h-screen lg:overflow-hidden bg-white text-[#111111] flex flex-col-reverse lg:flex-row w-full font-funnel selection:bg-[#111111] selection:text-[#C8FF00]">

        {/* ═══ COLUMNA IZQUIERDA: PAGO (55%) ═══ */}
        <section className="w-full lg:w-[55%] lg:h-screen lg:overflow-y-auto flex flex-col relative px-4 sm:px-8 lg:px-12 xl:px-[10%]">

          <div className="flex-1 flex flex-col w-full max-w-[550px] mx-auto pt-10 lg:pt-16 pb-20">

            <header className="hidden lg:flex w-full mb-10 items-center justify-center">
              <Link href="/visados" className="inline-block hover:opacity-80 transition-opacity">
                <img src='/logo.png' alt='LATAM VISA' className='h-[105px] md:h-[110px] w-auto object-contain' />
              </Link>
            </header>

            {/* Toggle de Traducción */}
            <div className="mb-8 p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100">
              <h3 className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold mb-4">
                ¿NECESITAS TRADUCCIÓN DE DOCUMENTOS?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConTraduccion(false)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${!conTraduccion ? 'bg-[#C8FF00] border-[#5B6A00]' : 'bg-white border-gray-200'}`}
                >
                  <div className="font-iceland text-[10px] uppercase tracking-widest text-[#5B6A00] font-bold mb-1">No necesito</div>
                  <div className="font-monument text-sm uppercase text-[#111111] mb-2">Sin traducción</div>
                  <div className="font-funnel text-base font-bold text-[#111111]">A$250</div>
                </button>
                <button
                  onClick={() => setConTraduccion(true)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${conTraduccion ? 'bg-[#C8FF00] border-[#5B6A00]' : 'bg-white border-gray-200'}`}
                >
                  <div className="font-iceland text-[10px] uppercase tracking-widest text-[#5B6A00] font-bold mb-1">Sí necesito</div>
                  <div className="font-monument text-sm uppercase text-[#111111] mb-2">Con traducción</div>
                  <div className="font-funnel text-base font-bold text-[#111111]">A$290 <span className="text-xs text-[#5B6A00]">(+A$40)</span></div>
                </button>
              </div>
              <p className="font-funnel text-xs text-[#666666] mt-3">
                💡 Si tus documentos ya están en inglés, no necesitas traducción.
              </p>
            </div>

            <div className="relative w-full min-h-[500px]">
              <div className="absolute inset-0 flex flex-col items-center pt-24 z-0 pointer-events-none gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] border-[#C8FF00]/30 border-t-[#C8FF00] rounded-full animate-spin"></div>
                <span className="font-iceland text-xs md:text-sm text-[#777777] uppercase tracking-widest animate-pulse">
                  Conectando checkout seguro...
                </span>
              </div>
              <div className="relative z-10 w-full min-h-[500px]">
                <StripeEmbeddedCheckout conTraduccion={conTraduccion} />
              </div>
            </div>
          </div>

          <footer className="py-6 border-t border-gray-50 flex flex-wrap gap-4 text-[11px] uppercase font-iceland tracking-widest text-[#999999] mt-auto">
            <span>© {new Date().getFullYear()} LATAM VISA</span>
            <span className="hidden sm:inline">·</span>
            <span>PROCESADO SEGURO POR STRIPE</span>
          </footer>
        </section>

        {/* ═══ COLUMNA DERECHA: INFORMACIÓN (45%) ═══ */}
        <section className="w-full lg:w-[45%] lg:h-screen lg:overflow-y-auto text-[#111111] border-b lg:border-b-0 lg:border-l border-[#C8FF00]/40 px-6 py-12 sm:px-10 lg:px-16 lg:py-16 relative bg-white/40 bg-gradient-to-br from-[#00247D]/20 to-[#CC142B]/20 backdrop-blur-2xl">

          <div className="lg:sticky lg:top-16 max-w-lg mx-auto lg:ml-0 lg:mr-auto">

            <div className="mb-6">
              <span className="inline-block font-iceland text-[#5B6A00] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 border border-[#5B6A00]/30 bg-[#C8FF00]/20 px-4 py-1.5 rounded-sm shadow-sm">
                HONORARIOS DE AGENCIA
              </span>
              <h1 className="font-monument font-black text-2xl sm:text-3xl lg:text-[32px] uppercase tracking-tight text-[#111111] mb-2 leading-none">
                Visitor Visa New Zealand
              </h1>
            </div>

            <p className="font-funnel font-bold text-2xl sm:text-3xl text-[#111111] mb-8 flex items-center justify-start gap-4">
              AUD ${conTraduccion ? 290 : 250}
              <span className="font-iceland text-[10px] sm:text-xs text-[#5B6A00] tracking-widest uppercase border border-[#5B6A00]/40 bg-white/40 rounded px-2 py-0.5 leading-[1.2] flex items-center h-fit">
                PAGO ÚNICO
              </span>
            </p>

            <div className="space-y-6 border-t border-[#111111]/10 pt-8">
              <h2 className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold">
                RESUMEN DE INCLUSIÓN
              </h2>
              <ul className="space-y-3">
                {[
                  'Aplicación completa Visitor Visa',
                  'NZeTA si aplica',
                  'Itinerario detallado',
                  'Soportes financieros revisados',
                  'Soporte durante todo el proceso',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#CC142B', boxShadow: '0 0 4px rgba(204,20,43,0.3)' }}></span>
                    <span className="font-funnel font-medium text-[#111111] text-sm leading-relaxed tracking-wide">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

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
