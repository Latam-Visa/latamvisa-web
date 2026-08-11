'use client'

import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const PLAN_DATA = {
  essentials: {
    name: 'Essentials',
    price: 'USD $120',
    description: 'Guía independiente y curaduría base.',
    includes: [
      '1 destino a elegir',
      'Guía completa en PDF',
      'Gestión de e-visa',
      'Recomendación de seguro',
      'Lista de 3-5 proyectos pre-validados',
      '1 sesión de 30 minutos'
    ]
  },
  plus: {
    name: 'Plus',
    price: 'USD $249',
    description: 'Curaduría personalizada y soporte.',
    includes: [
      'Curaduría personalizada (2-3 proyectos)',
      'Gestión de e-visa y antecedentes',
      'Plantilla CV y carta motivación',
      'Soporte por WhatsApp en destino',
      '2 sesiones de 45 minutos'
    ]
  },
  premium: {
    name: 'Premium',
    price: 'USD $490',
    description: 'Experiencia multi-país completa.',
    includes: [
      'Itinerario multi-país',
      'Gestión de visas múltiples',
      'Conexión con red ex-voluntarios',
      'Soporte continuo extendido',
      'Sesiones de planeación ilimitadas'
    ]
  }
}

function CalInlineEmbed({ plan }: { plan: string | null }) {
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
      config: { 
        layout: "month_view", 
        useSlotsViewOnSmallScreen: "true",
        theme: "dark"
      },
      calLink: "cristian-montenegro-tzeuce/consulta-migratoria-personalizada",
    });

    // @ts-ignore
    window.Cal.ns["consulta-migratoria-personalizada"]("ui", {
      theme: "dark",
      styles: { branding: { brandColor: "#C8FF00" } },
      hideEventTypeDetails: false,
      layout: "month_view"
    });
  }, [plan]);

  return (
    <div
      id="my-cal-inline-consulta-migratoria-personalizada"
      style={{ width: '100%', minHeight: '600px', overflow: 'auto' }}
    />
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')?.toLowerCase() || 'essentials'
  
  // @ts-ignore
  const activePlan = PLAN_DATA[planParam] || PLAN_DATA.essentials

  return (
    <main className="min-h-screen lg:min-h-0 lg:h-screen lg:overflow-hidden bg-[#050505] text-[#FFFFFF] flex flex-col-reverse lg:flex-row w-full selection:bg-[#C8FF00] selection:text-[#050505]">

      {/* ═══ LEFT COLUMN: CAL.COM EMBED (60%) ═══ */}
      <section className="w-full lg:w-[60%] lg:h-screen lg:overflow-y-auto flex flex-col relative px-4 sm:px-8 lg:px-12 xl:px-[8%]">
        
        <div className="flex-1 flex flex-col w-full max-w-[700px] mx-auto pt-10 lg:pt-16 pb-20">
          <header className="hidden lg:flex w-full mb-10 items-center justify-center">
            <Link href="/visados" className="inline-block hover:opacity-80 transition-opacity">
              <img src='/logo.png' alt='LATAM VISA' className='h-[105px] md:h-[110px] w-auto object-contain' />
            </Link>
          </header>

          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden p-2">
            <CalInlineEmbed plan={planParam} />
          </div>
        </div>

        <footer className="py-6 border-t border-[#1A1A1A] flex flex-wrap justify-center gap-4 text-[11px] uppercase tracking-widest text-[#8A8A8A] mt-auto font-geist">
          <span>© {new Date().getFullYear()} LATAM VISA</span>
          <span className="hidden sm:inline">·</span>
          <span>RESERVA SEGURA · POWERED BY CAL.COM</span>
        </footer>
      </section>

      {/* ═══ RIGHT COLUMN: INFORMATION (40%) ═══ */}
      <section className="w-full lg:w-[40%] lg:h-screen lg:overflow-y-auto text-[#FFFFFF] border-b lg:border-b-0 lg:border-l border-[#1A1A1A] px-6 py-12 sm:px-10 lg:px-16 lg:py-16 relative bg-[#0D0D0D]">
        
        {/* Subtle Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C8FF00]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="lg:sticky lg:top-16 max-w-lg mx-auto lg:ml-0 lg:mr-auto relative z-10">
          
          <div className="mb-6">
            <span className="inline-block font-geist text-[#C8FF00] font-medium text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 border border-[#C8FF00]/20 bg-[#C8FF00]/5 px-4 py-1.5 rounded-sm shadow-sm">
              VOLUNTARIADOS ASIA
            </span>
            <h1 className="font-geist font-light text-2xl sm:text-3xl lg:text-[32px] uppercase tracking-widest text-[#FFFFFF] mb-2 leading-none">
              PLAN {activePlan.name}
            </h1>
            <p className="font-sans text-[#8A8A8A] font-light text-base mt-2">
              {activePlan.description}
            </p>
          </div>

          <p className="font-geist font-normal text-3xl sm:text-4xl text-[#FFFFFF] mb-10 flex items-center justify-start gap-4">
            {activePlan.price}
            <span className="font-geist text-[10px] sm:text-xs text-[#C8FF00] tracking-widest uppercase border border-[#C8FF00]/30 bg-[#C8FF00]/10 rounded-sm px-2 py-0.5 leading-[1.2] flex items-center h-fit">
              PAGO ÚNICO
            </span>
          </p>

          <div className="space-y-6 border-t border-[#1A1A1A] pt-8">
            <h2 className="font-geist text-xs text-[#8A8A8A] tracking-[0.2em] uppercase font-medium">
              RESUMEN DE INCLUSIÓN
            </h2>
            <ul className="space-y-4">
              {activePlan.includes.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4 group">
                  <span className="shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-[#C8FF00] shadow-[0_0_8px_rgba(200,255,0,0.5)]"></span>
                  <span className="font-sans font-light text-[#CCCCCC] text-sm leading-relaxed tracking-wide">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 p-5 rounded-xl bg-[#1A1A1A]/50 border border-[#333333] flex items-center gap-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <p className="font-geist text-[10px] sm:text-[11px] text-[#8A8A8A] font-medium uppercase tracking-widest leading-relaxed">
              Reserva segura · Powered by Cal.com<br />
              <span className="text-[#C8FF00]">Selecciona tu fecha y hora en el calendario</span>
            </p>
          </div>

        </div>
      </section>

    </main>
  )
}

export default function VoluntariadoCheckoutPage() {
  return (
    <>
      <title>Reserva · Voluntariados Asia | LATAM VISA</title>
      <meta name="description" content="Reserva tu consulta para el programa de Voluntariados Asia con LATAM VISA." />

      <header className="lg:hidden w-full bg-[#050505] pt-8 pb-6 px-6 flex justify-center sticky top-0 z-20 border-b border-[#1A1A1A]">
        <Link href="/visados" className="inline-block hover:opacity-80 transition-opacity">
          <img src='/logo.png' alt='LATAM VISA' className='h-[105px] w-auto object-contain' />
        </Link>
      </header>

      <Suspense fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#C8FF00] font-geist text-sm tracking-widest uppercase">
          Cargando...
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </>
  )
}
