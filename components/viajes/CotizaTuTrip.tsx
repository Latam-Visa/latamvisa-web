'use client'
import { Reveal } from '@/components/Reveal'
import { KICKER, CAMPAIGN, BTN_PRIMARY, whatsappHref, WHATSAPP_MESSAGE } from './campaign'

/* Cotiza tu trip — PLACEHOLDER.
   Field shells only: no state, no submit handler, no endpoint yet. Inputs are
   disabled on purpose so nobody types into a form that goes nowhere; the
   WhatsApp link below is the working path in the meantime. */

const CAMPOS = [
  { label: 'Tu nombre', placeholder: 'Ej: Camila' },
  { label: 'Desde qué ciudad sales', placeholder: 'Ej: Brisbane' },
  { label: 'A qué país de Latam vas', placeholder: 'Ej: Colombia' },
  { label: 'Fechas aproximadas', placeholder: 'Ej: diciembre — enero' },
]

export default function CotizaTuTrip() {
  return (
    <section
      id="cotiza"
      aria-labelledby="cotiza-title"
      className="scroll-mt-24 px-6 py-20 md:px-[100px] md:py-28"
      style={{ backgroundColor: CAMPAIGN.subtle }}
    >
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <p className={KICKER}>Cotiza tu trip</p>
        </Reveal>

        <Reveal delay={0.06}>
          <h2
            id="cotiza-title"
            className="mt-3 max-w-[18ch] font-monument font-black text-[#111111]"
            style={{ fontSize: 'clamp(26px, 6.4vw, 46px)', lineHeight: 1.04, letterSpacing: '-0.025em' }}
          >
            Cuéntanos tu viaje y te armamos el plan
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 max-w-[46ch] font-funnel text-[15px] leading-relaxed text-[#111111]/65 md:text-[17px]">
            {/* Placeholder — el formulario real se conecta más adelante */}
            El formulario todavía no está conectado. Por ahora escríbenos por
            WhatsApp y lo hacemos ahí mismo.
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <form
            aria-label="Cotización de Euro Trip (próximamente)"
            className="mt-10 rounded-2xl p-6 md:mt-12 md:p-8"
            style={{ backgroundColor: CAMPAIGN.card, border: `1px solid ${CAMPAIGN.border}` }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {CAMPOS.map((campo) => (
                <label key={campo.label} className="flex flex-col gap-2">
                  <span className="font-funnel text-[13px] font-semibold text-[#111111]/75">
                    {campo.label}
                  </span>
                  <input
                    type="text"
                    disabled
                    placeholder={campo.placeholder}
                    className="h-12 w-full rounded-lg px-4 font-funnel text-[15px] text-[#111111] placeholder:text-[#111111]/35 disabled:cursor-not-allowed"
                    style={{ backgroundColor: CAMPAIGN.subtle, border: `1px solid ${CAMPAIGN.border}` }}
                  />
                </label>
              ))}
            </div>

            <p className="mt-6 font-funnel text-[12px] uppercase tracking-[0.1em] text-[#111111]/40">
              Formulario en construcción
            </p>

            <a
              href={whatsappHref(WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BTN_PRIMARY} mt-5 w-full sm:w-auto`}
            >
              Cotizar por WhatsApp
            </a>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
