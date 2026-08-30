'use client'
import { Reveal } from '@/components/Reveal'
import { KICKER, CAMPAIGN } from './campaign'

/* Destinos — París, Madrid, Italia y Lisboa. Cards are placeholders: the
   image slot is a soft sky-toned block rather than a photo, so the layout is
   final and only the asset has to change later. */

type Destino = {
  slug: string
  nombre: string
  gancho: string
  tono: string // placeholder image block, one per card so they read apart
}

const DESTINOS: Destino[] = [
  { slug: 'paris',  nombre: 'París',  gancho: 'La escala clásica. Nadie se arrepiente.', tono: 'linear-gradient(160deg, #CFE2F3 0%, #9EC5E4 100%)' },
  { slug: 'madrid', nombre: 'Madrid', gancho: 'Sin cambio de idioma y con tapas.',        tono: 'linear-gradient(160deg, #FBD9B8 0%, #F1B183 100%)' },
  { slug: 'italia', nombre: 'Italia', gancho: 'Roma, Milán o la costa. Tú eliges.',       tono: 'linear-gradient(160deg, #DCE9CF 0%, #AECB9B 100%)' },
  { slug: 'lisboa', nombre: 'Lisboa', gancho: 'Barata, cerca del mar y sabrosa.',         tono: 'linear-gradient(160deg, #F5D2D6 0%, #E4A2AC 100%)' },
]

export default function DestinosEuropa() {
  return (
    <section
      id="destinos"
      aria-labelledby="destinos-title"
      className="scroll-mt-24 px-6 py-20 md:px-[100px] md:py-28"
      style={{ backgroundColor: CAMPAIGN.card }}
    >
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <p className={KICKER}>Destinos</p>
        </Reveal>

        <Reveal delay={0.06}>
          <h2
            id="destinos-title"
            className="mt-3 max-w-[18ch] font-monument font-black text-[#111111]"
            style={{ fontSize: 'clamp(26px, 6.4vw, 46px)', lineHeight: 1.04, letterSpacing: '-0.025em' }}
          >
            ¿Dónde te bajas en el camino?
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 max-w-[46ch] font-funnel text-[15px] leading-relaxed text-[#111111]/65 md:text-[17px]">
            {/* Placeholder — fotos y contenido real pendientes */}
            Cuatro escalas para empezar. Nos cuentas cuál te suena y armamos el plan.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-14 md:gap-8">
          {DESTINOS.map((destino, i) => (
            <Reveal key={destino.slug} delay={0.07 * i}>
              <article
                className="h-full overflow-hidden rounded-2xl"
                style={{ backgroundColor: CAMPAIGN.card, border: `1px solid ${CAMPAIGN.border}` }}
              >
                {/* Image placeholder */}
                <div
                  className="relative flex aspect-[4/3] items-end p-5"
                  style={{ background: destino.tono }}
                >
                  <span className="font-funnel text-[10px] font-bold uppercase tracking-[0.16em] text-[#111111]/45">
                    Foto pendiente
                  </span>
                </div>

                <div className="p-5 md:p-6">
                  <h3 className="font-monument text-[20px] font-black leading-none text-[#111111] md:text-[24px]">
                    {destino.nombre}
                  </h3>
                  <p className="mt-2.5 font-funnel text-[14px] leading-relaxed text-[#111111]/65">
                    {destino.gancho}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
