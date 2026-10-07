'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import Cal, { getCalApi } from '@calcom/embed-react'

// ── Data ───────────────────────────────────────────────────────────────────────
// calLink de @calcom/embed-react: solo la ruta, sin el dominio.
const CAL_LINK = 'cristian-montenegro-tzeuce/consulta-migratoria-personalizada'
const CAL_LINK_REFERIDO = 'cristian-montenegro-tzeuce/sesion-planeacion-referido'
// ⚠️ Debe coincidir con el nombre real de tu carpeta en app/api/
const VALIDATE_ENDPOINT = '/api/validate-referral'

const includes = [
  'Revisión completa de tu perfil',
  'Ruta de estudio y viaje personalizada',
  'Lista de preparación requerida',
  'Respuestas a todas tus preguntas — 45 min sin límite',
]

export default function AgendarClient() {
  const [referral, setReferral] = useState<{ code: string; influencer: string; discount_pct: number } | null>(null)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) return
    fetch(VALIDATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(json => { if (json.valid && json.discount_pct === 100) setReferral(json) })
      .catch(() => {})
  }, [])

  // Tema del embed oficial de Cal.com: claro, con el verde neón de marca.
  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi()
        cal('ui', {
          theme: 'light',
          styles: { branding: { brandColor: '#C8FF00' } },
          hideEventTypeDetails: false,
          layout: 'month_view',
        })
      } catch {
        // El SDK de Cal.com puede lanzar un error benigno de timing en dev
        // (React StrictMode monta los efectos dos veces); el embed igual
        // aplica el tema correctamente.
      }
    })()
  }, [])

  const calLink = referral ? CAL_LINK_REFERIDO : CAL_LINK

  return (
    <>
      <header className="lg:hidden w-full bg-white pt-8 pb-6 px-6 flex justify-center sticky top-0 z-20 border-b border-gray-100 shadow-sm relative">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <img src='/logo.png' alt='LATAM VISA' className='h-[105px] w-auto object-contain' />
        </Link>
      </header>

      <main className="min-h-screen lg:min-h-0 lg:h-screen lg:overflow-hidden bg-white text-[#111111] flex flex-col lg:flex-row w-full font-funnel selection:bg-[#111111] selection:text-[#C8FF00]">

        {/* ═══ COLUMNA IZQUIERDA: CALENDARIO (55%) — scrollable ═══ */}
        <section className="w-full lg:w-[55%] lg:h-screen lg:overflow-y-auto flex flex-col relative px-4 sm:px-8 lg:px-12 xl:px-[10%]">

          <div className="flex-1 flex flex-col w-full max-w-[620px] mx-auto pt-10 lg:pt-16 pb-20">

            <header className="hidden lg:flex w-full mb-10 items-center justify-center">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                <img src='/logo.png' alt='LATAM VISA' className='h-[105px] md:h-[110px] w-auto object-contain' />
              </Link>
            </header>

            {/* El embed oficial de Cal.com ajusta su propia altura al contenido
                (calendario, horarios y formulario de confirmación), sin espacio
                muerto arriba/abajo. La columna que lo envuelve hace scroll
                (lg:overflow-y-auto arriba), así que el usuario siempre puede
                llegar hasta el botón de confirmar. */}
            <div className="w-full rounded-2xl bg-white border border-[#111111]/10 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <Cal
                key={calLink}
                calLink={calLink}
                style={{ width: '100%', minHeight: '500px', overflow: 'scroll' }}
                config={{ layout: 'month_view', theme: 'light' }}
              />
            </div>
          </div>

          <footer className="py-6 border-t border-gray-50 flex flex-wrap gap-4 text-[11px] uppercase font-iceland tracking-widest text-[#999999] mt-auto">
            <span>© {new Date().getFullYear()} LATAM VISA</span>
            <span className="hidden sm:inline">·</span>
            <span>SESIÓN GESTIONADA POR CAL.COM</span>
          </footer>
        </section>

        {/* ═══ COLUMNA DERECHA: INFORMACIÓN (45%) — no scrollea con la izquierda ═══ */}
        <section className="w-full lg:w-[45%] lg:h-screen lg:overflow-y-auto text-[#111111] border-b lg:border-b-0 lg:border-l border-[#C8FF00]/40 px-6 py-12 sm:px-10 lg:px-16 lg:py-16 relative">

          {/* Foto de fondo + velo claro — el texto y el neón deben seguir leyéndose sin esfuerzo */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/sydney1.jpeg')" }}
          />
          <div aria-hidden className="absolute inset-0 bg-[#FAFAF2]/80" />

          <div className="relative z-10 lg:sticky lg:top-16 max-w-lg mx-auto lg:ml-0 lg:mr-auto">

            <div className="mb-6">
              <span className="inline-block font-iceland text-[#5B6A00] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 border border-[#5B6A00]/30 bg-[#C8FF00]/20 px-4 py-1.5 rounded-sm shadow-sm">
                SESIÓN DE PLANEACIÓN
              </span>
              <h1
                className="italic font-black text-2xl sm:text-3xl lg:text-[32px] tracking-tight mb-2 leading-none"
                style={{ fontFamily: "'PPMonumentExtended', sans-serif" }}
              >
                <span className="text-[#0d2b0d]">Agenda tu </span>
                <span className="text-[#C8FF00]">sueño</span>
              </h1>
            </div>

            {referral ? (
              <div className="mb-8 p-5 rounded-xl bg-[#C8FF00] border-2 border-[#1A2A00]/80 shadow-[0_12px_40px_rgba(26,42,0,0.15)] flex items-start gap-3">
                <CheckCircle size={20} className="text-[#1A2A00] flex-shrink-0 mt-0.5" />
                <p className="font-funnel font-bold text-[#1A2A00] text-sm md:text-base leading-snug">
                  Descuento de <b>{referral.influencer}</b> aplicado — tu sesión es <b>100% gratis</b>.
                  <span className="block font-iceland font-normal text-xs md:text-sm text-[#1A2A00]/70 mt-1">
                    Elige tu horario. No se te pedirá ningún pago.
                  </span>
                </p>
              </div>
            ) : (
              <p className="font-funnel font-bold text-2xl sm:text-3xl text-[#111111] mb-8 flex items-center justify-start gap-4">
                USD $59
                <span className="font-iceland text-[10px] sm:text-xs text-[#5B6A00] tracking-widest uppercase border border-[#5B6A00]/40 bg-white/40 rounded px-2 py-0.5 leading-[1.2] flex items-center h-fit">
                  Reembolsable
                </span>
              </p>
            )}

            <div className="space-y-6 border-t border-[#111111]/10 pt-8">
              <h2 className="font-iceland text-xs text-[#5B6A00] tracking-[0.2em] uppercase font-bold">
                RESUMEN DE INCLUSIÓN
              </h2>
              <ul className="space-y-3">
                {includes.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#1A2A00]" />
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
                Encriptación de grado militar SSL <br />
                No procesamos números de tarjetas
              </p>
            </div>

          </div>
        </section>

      </main>
    </>
  )
}
