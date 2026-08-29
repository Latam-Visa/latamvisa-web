'use client'
import { motion } from 'framer-motion'
import { CONTACT } from '@/lib/constants'

// Everything below the hero for /viajes: how the stopover works, the first
// 4 countries in the program, and one honest way to reach us. No pricing or
// "book now" claims — the program is still pre-launch, so the only real CTA
// is "avísenme primero", not a fake checkout.

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

type Destino = {
  flag: string
  country: string
  line: string
}

const DESTINOS: Destino[] = [
  { flag: '🇫🇷', country: 'Francia', line: 'Historia, arquitectura y una parada que se siente como un viaje aparte.' },
  { flag: '🇪🇸', country: 'España', line: 'Ritmo, comida y calles que se recorren sin afán.' },
  { flag: '🇵🇹', country: 'Portugal', line: 'Costa, luz y ciudades hechas para caminar despacio.' },
  { flag: '🇮🇹', country: 'Italia', line: 'Pueblos costeros, historia viva y la calma del Mediterráneo.' },
]

const whatsappHref = (msg: string) =>
  `https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`

const kickerStyle: React.CSSProperties = {
  fontFamily: "'FunnelDisplay', sans-serif",
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#b5e533',
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'PPMonumentExtended', sans-serif",
  fontWeight: 900,
  lineHeight: 1.05,
  letterSpacing: '-0.02em',
  color: '#FFFFFF',
  margin: '10px 0 0',
}

export default function DestinosSection() {
  return (
    <div style={{ position: 'relative', backgroundColor: '#050505' }}>
      {/* ── PROCESO ── */}
      <section id="proceso" style={{ padding: '96px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span style={kickerStyle}>Cómo funciona</span>
          <h2 style={{ ...headingStyle, fontSize: 'clamp(26px, 4vw, 42px)', maxWidth: '640px' }}>
            Planear tu escala no debería ser un dolor de cabeza
          </h2>
        </motion.div>

        <div
          style={{
            marginTop: '48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '32px',
          }}
        >
          {[
            { n: '01', t: 'Cuéntanos tu viaje', d: 'Cuándo regresas, cuánto tiempo tienes disponible y qué te gustaría conocer en el camino.' },
            { n: '02', t: 'Armamos tu plan', d: 'Itinerario, vuelos y hospedaje en un solo lugar, pensado para tu tiempo real.' },
            { n: '03', t: 'Viajas con claridad', d: 'Sabes exactamente qué sigue en cada paso. Sin letra pequeña, sin sorpresas.' },
          ].map((step, i) => (
            <motion.div
              key={step.n}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
            >
              <span
                style={{
                  fontFamily: "'PPMonumentExtended', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {step.n}
              </span>
              <h3
                style={{
                  fontFamily: "'PPMonumentExtended', sans-serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: '10px 0 8px',
                }}
              >
                {step.t}
              </h3>
              <p
                style={{
                  fontFamily: "'FunnelDisplay', sans-serif",
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                }}
              >
                {step.d}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DESTINOS ── */}
      <section id="destinos" style={{ padding: '32px 24px 96px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span style={kickerStyle}>Próximamente</span>
          <h2 style={{ ...headingStyle, fontSize: 'clamp(26px, 4vw, 42px)', maxWidth: '640px' }}>
            Tu escala, en 4 países
          </h2>
          <p
            style={{
              fontFamily: "'FunnelDisplay', sans-serif",
              fontSize: '15px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '560px',
              margin: '16px 0 0',
            }}
          >
            Estamos armando el programa de escalas en Europa. Estos son los primeros
            4 países — cuéntanos cuál te interesa y te avisamos primero cuando abra.
          </p>
        </motion.div>

        <div
          style={{
            marginTop: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px',
          }}
        >
          {DESTINOS.map((d, i) => (
            <motion.div
              key={d.country}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              style={{
                backgroundColor: '#F4F4E8',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '28px', lineHeight: 1 }} aria-hidden>{d.flag}</span>
              <h3
                style={{
                  fontFamily: "'PPMonumentExtended', sans-serif",
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#0A0A0A',
                  margin: 0,
                }}
              >
                {d.country}
              </h3>
              <p
                style={{
                  fontFamily: "'FunnelDisplay', sans-serif",
                  fontSize: '13.5px',
                  lineHeight: 1.55,
                  color: 'rgba(10,10,10,0.65)',
                  margin: 0,
                  flex: 1,
                }}
              >
                {d.line}
              </p>
              <span
                style={{
                  fontFamily: "'FunnelDisplay', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#006837',
                  marginTop: '4px',
                }}
              >
                Próximamente
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: '36px' }}
        >
          <a
            href={whatsappHref('Hola, quiero que me avisen primero cuando abra el programa de escalas en Europa.')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#b5e533',
              color: '#006837',
              height: '48px',
              padding: '0 26px',
              borderRadius: '100px',
              fontFamily: "'FunnelDisplay', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Avísenme primero
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </section>

      {/* ── CONTACTO ── */}
      <section
        id="contacto"
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          <p
            style={{
              fontFamily: "'PPMonumentExtended', sans-serif",
              fontSize: 'clamp(18px, 2.4vw, 24px)',
              fontWeight: 700,
              lineHeight: 1.4,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            Tu pasaporte no te define; tu plan, tu claridad y tu historia sí.
          </p>
          <div style={{ marginTop: '28px' }}>
            <a
              href={whatsappHref('Hola, tengo una pregunta sobre el programa de escalas en Europa.')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(255,255,255,0.35)',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                height: '46px',
                padding: '0 26px',
                borderRadius: '100px',
                fontFamily: "'FunnelDisplay', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Hablar por WhatsApp
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <p
            style={{
              fontFamily: "'FunnelDisplay', sans-serif",
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '32px',
            }}
          >
            © 2026 LATAM VISA® — Consultoría de viajes. No prestamos servicios de índole migratoria oficial.
          </p>
        </motion.div>
      </section>
    </div>
  )
}
