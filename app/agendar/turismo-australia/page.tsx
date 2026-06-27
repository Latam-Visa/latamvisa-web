'use client'

import { useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function StripeEmbeddedCheckout({ counts, email }: { counts: { sin: number, con: number }, email: string }) {
  const fetchClientSecret = useCallback(() => {
    return fetch('/api/checkout/turismo-australia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counts, email }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        return data.clientSecret
      })
  }, [counts, email])

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        key={`${counts.sin}-${counts.con}-${email}`}
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export default function TurismoAustraliaCheckoutPage() {
  const [counts, setCounts] = useState({ sin: 0, con: 0 })
  const [email, setEmail] = useState('')
  const [prices, setPrices] = useState({ sin: 250, con: 290 })
  const [showCheckout, setShowCheckout] = useState(false)
  const [loadingPrices, setLoadingPrices] = useState(true)

  useEffect(() => {
    fetch('/api/checkout/turismo-australia')
      .then(res => res.json())
      .then(data => {
        if (data.sin && data.con) setPrices(data)
        setLoadingPrices(false)
      })
      .catch(() => setLoadingPrices(false))
  }, [])

  const total = counts.sin * prices.sin + counts.con * prices.con

  const updateCount = (type: 'sin' | 'con', delta: number) => {
    setCounts(prev => {
      const newVal = Math.max(0, Math.min(10, prev[type] + delta))
      return { ...prev, [type]: newVal }
    })
    setShowCheckout(false)
  }

  const handlePay = () => {
    if (total > 0 && email.trim()) {
      setShowCheckout(true)
    }
  }

  return (
    <>
      <title>Visitor Visa Australia | Checkout Seguro</title>
      <meta name="description" content="Finaliza el pago de tu asesoría de visa Subclass 600 para Australia." />

      <header className="lg:hidden w-full bg-white pt-8 pb-6 px-6 flex justify-center sticky top-0 z-20 border-b border-gray-100 shadow-sm relative">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <img src='/logo.png' alt='LATAM VISA' className='h-[105px] w-auto object-contain' />
        </Link>
      </header>

      <main className="min-h-screen lg:min-h-0 lg:h-screen lg:overflow-hidden bg-white text-[#111111] flex flex-col-reverse lg:flex-row w-full font-funnel selection:bg-[#111111] selection:text-[#C8FF00]">

        {/* ═══ COLUMNA IZQUIERDA: PAGO (55%) ═══ */}
        <section className="w-full lg:w-[55%] lg:h-screen lg:overflow-y-auto flex flex-col relative px-4 sm:px-8 lg:px-12 xl:px-[10%]">

          <div className="flex-1 flex flex-col w-full max-w-[550px] mx-auto pt-10 lg:pt-16 pb-20">

            <header className="hidden lg:flex w-full mb-10 items-center justify-center">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                <img src='/logo.png' alt='LATAM VISA' className='h-[105px] md:h-[110px] w-auto object-contain' />
              </Link>
            </header>

            {/* Selector de Visas */}
            <div className="mb-8 p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100">
              <h3 className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold mb-4">
                SELECCIONA LAS VISAS QUE NECESITAS
              </h3>
              
              <div className="space-y-4">
                {/* Sin traducción */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
                  <div>
                    <div className="font-monument text-sm uppercase text-[#111111] mb-1">Sin traducción</div>
                    <div className="font-funnel text-base font-bold text-[#5B6A00]">
                      {loadingPrices ? '...' : `A$${prices.sin}`} c/u
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button onClick={() => updateCount('sin', -1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" disabled={counts.sin === 0}>
                      -
                    </button>
                    <span className="font-monument text-sm w-4 text-center">{counts.sin}</span>
                    <button onClick={() => updateCount('sin', 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" disabled={counts.sin >= 10}>
                      +
                    </button>
                  </div>
                </div>

                {/* Con traducción */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
                  <div>
                    <div className="font-monument text-sm uppercase text-[#111111] mb-1">Con traducción</div>
                    <div className="font-funnel text-base font-bold text-[#5B6A00]">
                      {loadingPrices ? '...' : `A$${prices.con}`} c/u
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button onClick={() => updateCount('con', -1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" disabled={counts.con === 0}>
                      -
                    </button>
                    <span className="font-monument text-sm w-4 text-center">{counts.con}</span>
                    <button onClick={() => updateCount('con', 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" disabled={counts.con >= 10}>
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold mb-2">Correo electrónico del pagador</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setShowCheckout(false); }}
                    placeholder="tu@email.com"
                    className="w-full p-4 rounded-xl border border-gray-200 bg-white font-funnel text-sm outline-none focus:border-[#C8FF00]"
                  />
                </div>
                
                <button 
                  onClick={handlePay}
                  disabled={total === 0 || !email.trim() || showCheckout}
                  className="w-full p-4 rounded-xl font-monument uppercase tracking-wide text-sm transition-all disabled:opacity-50 bg-[#C8FF00] text-[#111111] hover:bg-[#b3e600]"
                >
                  Pagar A${total}
                </button>
              </div>
            </div>

            {showCheckout && (
              <div className="relative w-full min-h-[500px]">
                <div className="absolute inset-0 flex flex-col items-center pt-24 z-0 pointer-events-none gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] border-[#C8FF00]/30 border-t-[#C8FF00] rounded-full animate-spin"></div>
                  <span className="font-iceland text-xs md:text-sm text-[#777777] uppercase tracking-widest animate-pulse">
                    Conectando checkout seguro...
                  </span>
                </div>
                <div className="relative z-10 w-full min-h-[500px]">
                  <StripeEmbeddedCheckout counts={counts} email={email} />
                </div>
              </div>
            )}
          </div>

          <footer className="py-6 border-t border-gray-50 flex flex-wrap gap-4 text-[11px] uppercase font-iceland tracking-widest text-[#999999] mt-auto">
            <span>© {new Date().getFullYear()} LATAM VISA</span>
            <span className="hidden sm:inline">·</span>
            <span>PROCESADO SEGURO POR STRIPE</span>
          </footer>
        </section>

        {/* ═══ COLUMNA DERECHA: INFORMACIÓN (45%) ═══ */}
        <section className="w-full lg:w-[45%] lg:h-screen lg:overflow-y-auto text-[#111111] border-b lg:border-b-0 lg:border-l border-[#C8FF00]/40 px-6 py-12 sm:px-10 lg:px-16 lg:py-16 relative bg-white/40 bg-gradient-to-br from-[#012169]/20 to-[#E4002B]/15 backdrop-blur-2xl">

          <div className="lg:sticky lg:top-16 max-w-lg mx-auto lg:ml-0 lg:mr-auto">

            <div className="mb-6">
              <span className="inline-block font-iceland text-[#5B6A00] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 border border-[#5B6A00]/30 bg-[#C8FF00]/20 px-4 py-1.5 rounded-sm shadow-sm">
                HONORARIOS DE AGENCIA
              </span>
              <h1 className="font-monument font-black text-2xl sm:text-3xl lg:text-[32px] uppercase tracking-tight text-[#111111] mb-2 leading-none">
                Visitor Visa Australia
              </h1>
            </div>

            <p className="font-funnel font-bold text-2xl sm:text-3xl text-[#111111] mb-8 flex items-center justify-start gap-4">
              AUD ${total > 0 ? total : prices.sin}
              <span className="font-iceland text-[10px] sm:text-xs text-[#5B6A00] tracking-widest uppercase border border-[#5B6A00]/40 bg-white/40 rounded px-2 py-0.5 leading-[1.2] flex items-center h-fit">
                {total > 0 ? 'TOTAL' : 'DESDE'}
              </span>
            </p>

            <div className="space-y-6 border-t border-[#111111]/10 pt-8">
              <h2 className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold">
                RESUMEN DE INCLUSIÓN
              </h2>
              <ul className="space-y-3">
                {[
                  'Aplicación completa Subclass 600',
                  'Carta de invitación y soporte familiar',
                  'Revisión de soportes financieros',
                  'Preparación de documentos requeridos',
                  'Soporte durante todo el proceso',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#012169', boxShadow: '0 0 4px rgba(1,33,105,0.3)' }}></span>
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
