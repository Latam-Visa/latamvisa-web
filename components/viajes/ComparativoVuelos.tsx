'use client'
import { Reveal } from '@/components/Reveal'
import { KICKER, CAMPAIGN } from './campaign'

/* Comparativo de rutas — PLACEHOLDER (paso 3).
   Structure only: two route rows, so the real data can drop straight in.
   Deliberately no prices or durations yet — inventing numbers here would be a
   promise we can't keep. On mobile this stays as stacked cards rather than a
   table, which never reads well on a 390px screen. */

type Ruta = {
  etiqueta: string
  titulo: string
  escalas: string[]
  nota: string
  destacada?: boolean
}

const RUTAS: Ruta[] = [
  {
    etiqueta: 'La de siempre',
    titulo: 'Australia → Latam directo',
    escalas: ['Sídney / Brisbane', 'Conexión de unas horas', 'Bogotá / Lima / Santiago'],
    nota: 'Datos por confirmar',
  },
  {
    etiqueta: 'La de dos vacaciones',
    titulo: 'Australia → Europa → Latam',
    escalas: ['Sídney / Brisbane', 'Unos días en Europa', 'Bogotá / Lima / Santiago'],
    nota: 'Datos por confirmar',
    destacada: true,
  },
]

export default function ComparativoVuelos() {
  return (
    <section
      id="vuelos"
      aria-labelledby="vuelos-title"
      className="scroll-mt-24 px-6 py-20 md:px-[100px] md:py-28"
      style={{ backgroundColor: CAMPAIGN.subtle }}
    >
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <p className={KICKER}>Las rutas</p>
        </Reveal>

        <Reveal delay={0.06}>
          <h2
            id="vuelos-title"
            className="mt-3 max-w-[18ch] font-monument font-black text-[#111111]"
            style={{ fontSize: 'clamp(26px, 6.4vw, 46px)', lineHeight: 1.04, letterSpacing: '-0.025em' }}
          >
            Compara cómo se ve tu vuelo
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 max-w-[46ch] font-funnel text-[15px] leading-relaxed text-[#111111]/65 md:text-[17px]">
            {/* Placeholder — el cuadro comparativo real va en el paso 3 */}
            Acá va el comparativo de rutas, con tiempos y escalas reales.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 md:gap-7">
          {RUTAS.map((ruta, i) => (
            <Reveal key={ruta.titulo} delay={0.08 * i}>
              <article
                className="h-full rounded-2xl p-6 md:p-8"
                style={{
                  backgroundColor: CAMPAIGN.card,
                  border: ruta.destacada ? `2px solid ${CAMPAIGN.lime}` : `1px solid ${CAMPAIGN.border}`,
                }}
              >
                <span
                  className="inline-flex rounded-full px-3 py-1 font-funnel text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={
                    ruta.destacada
                      ? { backgroundColor: CAMPAIGN.lime, color: CAMPAIGN.forest }
                      : { backgroundColor: CAMPAIGN.subtle, color: '#111111' }
                  }
                >
                  {ruta.etiqueta}
                </span>

                <h3 className="mt-4 font-monument text-[18px] font-bold leading-tight text-[#111111] md:text-[22px]">
                  {ruta.titulo}
                </h3>

                <ol className="mt-5 flex flex-col gap-3">
                  {ruta.escalas.map((escala) => (
                    <li key={escala} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ruta.destacada ? CAMPAIGN.forest : '#C4C4C4' }}
                      />
                      <span className="font-funnel text-[14px] leading-relaxed text-[#111111]/75">{escala}</span>
                    </li>
                  ))}
                </ol>

                <p className="mt-6 font-funnel text-[12px] uppercase tracking-[0.1em] text-[#111111]/40">
                  {ruta.nota}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
