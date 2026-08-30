'use client'
import { Reveal } from '@/components/Reveal'
import { BTN_PRIMARY, BTN_SECONDARY, whatsappHref, WHATSAPP_MESSAGE } from './campaign'

/* Hero — full-screen sunset sky, built entirely from CSS gradients (no image
   asset yet, per the brief). The sky is one linear ramp; the clouds are soft
   radial gradients layered over it, so nothing extra has to download. */

const SKY_BACKGROUND = [
  // Clouds — tighter radials with a harder falloff so they read as distinct
  // banks rather than a wash. Stacked at a few sizes and heights to break up
  // the horizon, lit warm from below like late afternoon.
  'radial-gradient(26% 7% at 20% 46%, rgba(255,255,255,0.98) 0%, rgba(255,252,246,0.55) 38%, rgba(255,250,242,0) 66%)',
  'radial-gradient(20% 6% at 68% 40%, rgba(255,255,255,0.92) 0%, rgba(255,250,242,0.45) 40%, rgba(255,248,238,0) 68%)',
  'radial-gradient(32% 8% at 44% 58%, rgba(255,255,255,1) 0%, rgba(255,246,234,0.6) 38%, rgba(255,242,228,0) 66%)',
  'radial-gradient(23% 7% at 87% 54%, rgba(255,255,255,0.9) 0%, rgba(255,244,230,0.45) 40%, rgba(255,240,222,0) 68%)',
  'radial-gradient(30% 8% at 10% 68%, rgba(255,253,248,0.95) 0%, rgba(255,238,218,0.5) 38%, rgba(255,234,210,0) 66%)',
  'radial-gradient(24% 7% at 64% 74%, rgba(255,250,242,0.88) 0%, rgba(255,232,208,0.45) 40%, rgba(255,228,200,0) 68%)',
  // Sky — deep blue overhead easing into a peach horizon
  'linear-gradient(180deg, #12457F 0%, #2F6FB4 22%, #63A3D6 44%, #A9CFE8 62%, #EFC9A6 82%, #F9B489 100%)',
].join(', ')

export default function HeroViajes() {
  return (
    <section
      aria-label="Dos Vacaciones — una escala en Europa camino a Latinoamérica"
      className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden"
      style={{ background: SKY_BACKGROUND }}
    >
      {/* Readability scrim: the copy sits on the bright horizon band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(8,26,52,0.30) 0%, rgba(8,26,52,0.04) 26%, rgba(60,30,10,0) 55%, rgba(45,20,5,0.16) 78%, rgba(40,16,2,0.40) 100%)' }}
      />

      <div className="relative z-10 px-6 pb-16 pt-32 md:px-[100px] md:pb-24">
        <Reveal>
          <p className="font-funnel text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
            Dos Vacaciones · Diciembre a Febrero
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h1
            className="mt-4 max-w-[16ch] font-monument font-black text-white"
            style={{
              fontSize: 'clamp(28px, 7.4vw, 72px)',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              textShadow: '0 2px 26px rgba(0,0,0,0.35)',
            }}
          >
            Parce… ¿y si nos pegamos dos vacaciones?
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p
            className="mt-5 max-w-[26ch] font-funnel font-medium text-white/95"
            style={{ fontSize: 'clamp(17px, 4.6vw, 26px)', lineHeight: 1.35, textShadow: '0 1px 14px rgba(0,0,0,0.35)' }}
          >
            Una pa&apos; Europa. Otra pa&apos; Latam. Why not?
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#cotiza" className={BTN_PRIMARY}>
              Cotiza tu Euro Trip
            </a>
            <a
              href={whatsappHref(WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className={BTN_SECONDARY}
            >
              Hablar por WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mt-6 max-w-[34ch] font-funnel text-[13px] leading-relaxed text-white/80">
            Te ayudamos a planear la escala: rutas, fechas e itinerario. Sin promesas
            raras, solo el plan bien hecho.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
