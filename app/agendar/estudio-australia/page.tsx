'use client'

import { useEffect } from 'react'
import Link from 'next/link'

function CalInlineEmbed() {
  useEffect(() => {
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function (this: any) {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    // @ts-ignore
    window.Cal("init", "consulta-migratoria-personalizada", { origin: "https://app.cal.com" });

    // @ts-ignore
    window.Cal.ns["consulta-migratoria-personalizada"]("inline", {
      elementOrSelector: "#my-cal-inline-consulta-migratoria-personalizada",
      config: { layout: "month_view", useSlotsViewOnSmallScreen: "true" },
      calLink: "cristian-montenegro-tzeuce/consulta-migratoria-personalizada",
    });

    // @ts-ignore
    window.Cal.ns["consulta-migratoria-personalizada"]("ui", {
      cssVarsPerTheme: {
        light: { "cal-brand": "#000000" },
        dark: { "cal-brand": "#C8FF00" }
      },
      hideEventTypeDetails: false,
      layout: "month_view"
    });
  }, []);

  return (
    <div
      id="my-cal-inline-consulta-migratoria-personalizada"
      style={{ width: '100%', minHeight: '600px', overflow: 'auto' }}
    />
  );
}

export default function EstudioAustraliaPage() {
  return (
    <>
      <title>Sesión de Planeación · Estudio Australia | LATAM VISA</title>
      <meta name="description" content="Agenda tu sesión de planeación personalizada para estudiar en Australia con LATAM VISA." />

      <header className="lg:hidden w-full bg-white pt-8 pb-6 px-6 flex justify-center sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <img src='/logo.png' alt='LATAM VISA' className='h-[105px] w-auto object-contain' />
        </Link>
      </header>

      <main className="min-h-screen lg:min-h-0 lg:h-screen lg:overflow-hidden bg-white text-[#111111] flex flex-col-reverse lg:flex-row w-full font-funnel selection:bg-[#111111] selection:text-[#C8FF00]">

        {/* ═══ COLUMNA IZQUIERDA: CAL.COM EMBED (60%) ═══ */}
        <section className="w-full lg:w-[60%] lg:h-screen lg:overflow-y-auto flex flex-col relative px-4 sm:px-8 lg:px-12 xl:px-[8%]">

          <div className="flex-1 flex flex-col w-full max-w-[700px] mx-auto pt-10 lg:pt-16 pb-20">

            <header className="hidden lg:flex w-full mb-10 items-center justify-center">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                <img src='/logo.png' alt='LATAM VISA' className='h-[105px] md:h-[110px] w-auto object-contain' />
              </Link>
            </header>

            <CalInlineEmbed />

          </div>

          <footer className="py-6 border-t border-gray-50 flex flex-wrap gap-4 text-[11px] uppercase font-iceland tracking-widest text-[#999999] mt-auto">
            <span>© {new Date().getFullYear()} LATAM VISA</span>
            <span className="hidden sm:inline">·</span>
            <span>RESERVA SEGURA · POWERED BY CAL.COM · PAGO PROCESADO POR STRIPE</span>
          </footer>
        </section>

        {/* ═══ COLUMNA DERECHA: INFORMACIÓN (40%) ═══ */}
        <section className="w-full lg:w-[40%] lg:h-screen lg:overflow-y-auto text-[#111111] border-b lg:border-b-0 lg:border-l border-[#C8FF00]/40 px-6 py-12 sm:px-10 lg:px-16 lg:py-16 relative bg-white/40 bg-gradient-to-br from-[#012169]/20 to-[#E4002B]/15 backdrop-blur-2xl">

          <div className="lg:sticky lg:top-16 max-w-lg mx-auto lg:ml-0 lg:mr-auto">

            <div className="mb-6">
              <span className="inline-block font-iceland text-[#5B6A00] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 border border-[#5B6A00]/30 bg-[#C8FF00]/20 px-4 py-1.5 rounded-sm shadow-sm">
                PLANEACIÓN PERSONALIZADA
              </span>
              <h1 className="font-monument font-black text-2xl sm:text-3xl lg:text-[32px] uppercase tracking-tight text-[#111111] mb-2 leading-none">
                SESIÓN DE PLANEACIÓN
              </h1>
              <p className="font-funnel text-[#555555] text-base mt-1">Estudio Australia</p>
            </div>

            <p className="font-funnel font-bold text-2xl sm:text-3xl text-[#111111] mb-8 flex items-center justify-start gap-4">
              USD $59
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
                  'Análisis completo de tu perfil migratorio',
                  'Recomendación de institución educativa',
                  'Estructura de costos y financiación',
                  'Hoja de ruta personalizada (cursos + tiempos)',
                  'Resolución de todas tus dudas en vivo',
                  'Grabación de la sesión incluida',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#012169', boxShadow: '0 0 4px rgba(1,33,105,0.3)' }}></span>
                    <span className="font-funnel font-medium text-[#111111] text-sm leading-relaxed tracking-wide">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="font-funnel text-sm text-[#555555] pt-2">
                Duración: 45 minutos · Vía Google Meet
              </p>
            </div>

            <div className="mt-12 p-5 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 shadow-sm flex items-center gap-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B6A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="font-iceland text-[10px] sm:text-[11px] text-[#111111] font-bold uppercase tracking-widest leading-relaxed">
                Reserva segura · Powered by Cal.com<br />
                Pago procesado por Stripe
              </p>
            </div>

          </div>
        </section>

      </main>
    </>
  )
}
