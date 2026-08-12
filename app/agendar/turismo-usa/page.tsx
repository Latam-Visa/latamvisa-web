'use client'

import { useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function StripeEmbeddedCheckout({ aplicantes, email }: { aplicantes: number, email: string }) {
  const fetchClientSecret = useCallback(() => {
    return fetch('/api/checkout/turismo-usa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aplicantes, email }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        return data.clientSecret
      })
  }, [aplicantes, email])

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        key={`${aplicantes}-${email}`}
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

// Función centralizada para calcular el descuento (fuente única de verdad)
function calcularPrecio(precioBase: number, aplicantes: number) {
  const subtotal = precioBase * aplicantes
  let porcentajeDescuento = 0

  if (aplicantes === 2) porcentajeDescuento = 0.10
  else if (aplicantes >= 3) porcentajeDescuento = 0.15

  const descuento = Math.round(subtotal * porcentajeDescuento)
  const total = subtotal - descuento

  return { subtotal, descuento, total, porcentajeDescuento }
}

export default function TurismoUsaCheckoutPage() {
  const [aplicantes, setAplicantes] = useState(1)
  const [email, setEmail] = useState('')
  const [precioBase, setPrecioBase] = useState(190)
  const [showCheckout, setShowCheckout] = useState(false)
  const [loadingPrices, setLoadingPrices] = useState(true)

  useEffect(() => {
    fetch('/api/checkout/turismo-usa')
      .then(res => res.json())
      .then(data => {
        if (data.precio) setPrecioBase(data.precio)
        setLoadingPrices(false)
      })
      .catch(() => setLoadingPrices(false))
  }, [])

  const { subtotal, descuento, total, porcentajeDescuento } = calcularPrecio(precioBase, aplicantes)

  const updateAplicantes = (delta: number) => {
    setAplicantes(prev => Math.max(1, Math.min(10, prev + delta)))
    setShowCheckout(false)
  }

  const handlePay = () => {
    if (total > 0 && email.trim()) {
      setShowCheckout(true)
    }
  }

  return (
    <>
      <title>Visa Turismo USA | Checkout Seguro</title>
      <meta name="description" content="Finaliza el pago de tu asesoría de visa B1/B2 para Estados Unidos." />

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

            {/* Selector de Aplicantes */}
            <div className="mb-8 p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100">
              <h3 className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold mb-4">
                ¿CUÁNTOS APLICANTES?
              </h3>

              <div className="space-y-4">
                {/* Selector de aplicantes */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
                  <div>
                    <div className="font-monument text-sm uppercase text-[#111111] mb-1">Asesoría Visa USA</div>
                    <div className="font-funnel text-base font-bold text-[#5B6A00]">
                      {loadingPrices ? '...' : `A$${precioBase}`} c/u
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button onClick={() => updateAplicantes(-1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" disabled={aplicantes === 1}>
                      -
                    </button>
                    <span className="font-monument text-sm w-4 text-center">{aplicantes}</span>
                    <button onClick={() => updateAplicantes(1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" disabled={aplicantes >= 10}>
                      +
                    </button>
                  </div>
                </div>

                {/* Desglose de precios (solo si hay descuento) */}
                {aplicantes >= 2 && (
                  <div className="p-4 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-funnel text-sm text-[#555555]">Subtotal ({aplicantes} × A${precioBase})</span>
                      <span className="font-funnel text-sm text-[#555555] line-through">A${subtotal}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-iceland text-xs text-[#5B6A00] uppercase tracking-widest font-bold">
                        Descuento LATAM VISA ({Math.round(porcentajeDescuento * 100)}%)
                      </span>
                      <span className="font-funnel text-sm font-bold text-[#5B6A00]">-A${descuento}</span>
                    </div>
                    <div className="border-t border-[#C8FF00]/40 mt-2 pt-2 flex justify-between items-center">
                      <span className="font-monument text-sm uppercase text-[#111111]">Total</span>
                      <span className="font-funnel text-lg font-bold text-[#111111]">A${total}</span>
                    </div>
                  </div>
                )}

                {/* Hint para incentivar más aplicantes */}
                {aplicantes === 1 && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="font-funnel text-xs text-[#555555] text-center">
                      💡 <strong>Aplicas con familia o amigos?</strong> Ahorra <strong>10%</strong> desde 2 aplicantes · <strong>15%</strong> desde 3
                    </p>
                  </div>
                )}
                {aplicantes === 2 && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="font-funnel text-xs text-[#555555] text-center">
                      💡 Sube a <strong>3 aplicantes</strong> y ahorra <strong>15%</strong> en total
                    </p>
                  </div>
                )}
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
                  <StripeEmbeddedCheckout aplicantes={aplicantes} email={email} />
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
        <section className="w-full lg:w-[45%] lg:h-screen lg:overflow-y-auto text-[#111111] border-b lg:border-b-0 lg:border-l border-[#C8FF00]/40 px-6 py-12 sm:px-10 lg:px-16 lg:py-16 relative bg-white/40 bg-gradient-to-br from-[#B22234]/20 to-[#3C3B6E]/15 backdrop-blur-2xl">

          <div className="lg:sticky lg:top-16 max-w-lg mx-auto lg:ml-0 lg:mr-auto">

            <div className="mb-6">
              <span className="inline-block font-iceland text-[#5B6A00] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 border border-[#5B6A00]/30 bg-[#C8FF00]/20 px-4 py-1.5 rounded-sm shadow-sm">
                HONORARIOS DE AGENCIA
              </span>
              <h1 className="font-monument font-black text-2xl sm:text-3xl lg:text-[32px] uppercase tracking-tight text-[#111111] mb-2 leading-none">
                Asesoría Visado USA
              </h1>
            </div>

            <p className="font-funnel font-bold text-2xl sm:text-3xl text-[#111111] mb-8 flex items-center justify-start gap-4">
              AUD ${total > 0 ? total : precioBase}
              <span className="font-iceland text-[10px] sm:text-xs text-[#5B6A00] tracking-widest uppercase border border-[#5B6A00]/40 bg-white/40 rounded px-2 py-0.5 leading-[1.2] flex items-center h-fit">
                {aplicantes > 1 ? 'TOTAL' : 'PAGO ÚNICO'}
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
                  'Sesión de preparación para entrevista',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#B22234', boxShadow: '0 0 4px rgba(178,34,52,0.3)' }}></span>
                    <span className="font-funnel font-medium text-[#111111] text-sm leading-relaxed tracking-wide">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {aplicantes >= 2 && (
              <div className="mt-8 p-5 rounded-xl bg-[#C8FF00]/20 border border-[#C8FF00]/60">
                <p className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold mb-2">
                  🎉 DESCUENTO APLICADO
                </p>
                <p className="font-funnel text-sm text-[#111111]">
                  Ahorras <strong>A${descuento}</strong> ({Math.round(porcentajeDescuento * 100)}%) por aplicar con {aplicantes} personas
                </p>
              </div>
            )}

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