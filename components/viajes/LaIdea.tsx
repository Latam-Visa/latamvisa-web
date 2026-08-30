'use client'
import { Reveal } from '@/components/Reveal'
import { KICKER, CAMPAIGN } from './campaign'

/* La idea — the storytelling beat: you're already flying to Latam, the
   stopover is the part nobody told you about. Placeholder copy for now. */

const BEATS = [
  {
    step: '01',
    title: 'Ya tienes el vuelo largo',
    body: 'De Australia a Latinoamérica son más de 30 horas en el aire, casi siempre con conexión. Esa conexión ya la estás pagando.',
  },
  {
    step: '02',
    title: 'La escala puede durar días',
    body: 'En vez de esperar seis horas en un aeropuerto, te quedas unos días. Mismo tiquete, otra ciudad.',
  },
  {
    step: '03',
    title: 'Llegas a Latam igual',
    body: 'Sigues llegando a diciembre en casa, con la familia. Solo que con un pedazo de Europa de por medio.',
  },
]

export default function LaIdea() {
  return (
    <section
      id="la-idea"
      aria-labelledby="la-idea-title"
      className="scroll-mt-24 px-6 py-20 md:px-[100px] md:py-28"
      style={{ backgroundColor: CAMPAIGN.card }}
    >
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <p className={KICKER}>La idea</p>
        </Reveal>

        <Reveal delay={0.06}>
          <h2
            id="la-idea-title"
            className="mt-3 max-w-[20ch] font-monument font-black text-[#111111]"
            style={{ fontSize: 'clamp(26px, 6.4vw, 46px)', lineHeight: 1.04, letterSpacing: '-0.025em' }}
          >
            Vas pa&apos; Latam… pero puedes hacer una parada en Europa
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 max-w-[46ch] font-funnel text-[15px] leading-relaxed text-[#111111]/65 md:text-[17px]">
            {/* Placeholder — copy definitiva pendiente */}
            Muchos latinos en Australia viajan a casa en diciembre sin saber que la
            ruta puede pasar por Europa. Aquí te contamos cómo funciona, sin letra
            pequeña.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          {BEATS.map((beat, i) => (
            <Reveal key={beat.step} delay={0.08 * i}>
              <article
                className="h-full rounded-2xl p-6 md:p-7"
                style={{ backgroundColor: CAMPAIGN.subtle, border: `1px solid ${CAMPAIGN.border}` }}
              >
                <span className="font-monument text-[13px] font-bold text-[#111111]/35">{beat.step}</span>
                <h3 className="mt-3 font-monument text-[17px] font-bold leading-tight text-[#111111] md:text-[19px]">
                  {beat.title}
                </h3>
                <p className="mt-2.5 font-funnel text-[14px] leading-relaxed text-[#111111]/65">
                  {beat.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
