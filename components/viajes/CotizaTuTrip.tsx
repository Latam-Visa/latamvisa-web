'use client'
import { useMemo, useRef, useState } from 'react'
import { useReveal } from './useReveal'
import { WHATSAPP_HREF } from './whatsapp'
import { cotizarViaje, type CotizarResultado } from '@/app/viajes/_actions/cotizar'
import {
  CIUDADES_SALIDA,
  DESTINOS,
  calcularEstimado,
  destinoPorSlug,
  formatAUD,
} from '@/lib/viajes/rangos'

/* 05 — Cotiza tu trip. Herramienta interactiva en vivo, en el lenguaje oscuro
   (blanco + azulito). Eliges destino y ciudad con chips, mueves "personas" con
   un stepper, y el precio de las dos rutas se calcula AL INSTANTE del lado del
   cliente. Para la cotización afinada dejas tu correo y ahí va al servidor. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CotizaTuTrip() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  const [destinoSlug, setDestinoSlug] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [personas, setPersonas] = useState(1)

  const [contactoAbierto, setContactoAbierto] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', whatsapp: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState<Extract<CotizarResultado, { ok: true }> | null>(null)

  const destino = destinoSlug ? destinoPorSlug(destinoSlug) : undefined
  const estimado = useMemo(
    () => (destino ? calcularEstimado(destino, personas) : null),
    [destino, personas],
  )
  const sufijo = personas > 1 ? `${personas} personas` : 'por persona'

  const enviarContacto = async () => {
    setError('')
    if (!destino) return setError('Elige tu destino.')
    if (!ciudad) return setError('Elige tu ciudad de salida.')
    if (form.nombre.trim().length < 2) return setError('Dinos tu nombre.')
    if (!EMAIL_RE.test(form.email.trim())) return setError('Revisa tu correo.')
    setEnviando(true)
    try {
      const r = await cotizarViaje({
        nombre: form.nombre,
        email: form.email,
        whatsapp: form.whatsapp,
        ciudadSalida: ciudad,
        destinoSlug,
        personas,
      })
      if (r.ok) setEnviado(r)
      else setError(r.error)
    } catch {
      setError('Algo falló al enviar. Intenta de nuevo o escríbenos por WhatsApp.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section id="cotiza" ref={ref} aria-labelledby="cotiza-title" className="vx-section">
      <div className="vx-inner">
        <p className="vx-eyebrow" data-reveal>
          <span className="vx-dot" aria-hidden />
          04 / Cotiza tu trip
        </p>
        <h2 id="cotiza-title" className="vx-title mt-7 max-w-[18ch]" data-reveal>
          Arma tu viaje y mira <span className="vx-az">el precio</span>
        </h2>

        {enviado ? (
          <Confirmacion nombre={form.nombre} destino={enviado.destinoNombre} />
        ) : (
          <div data-reveal className="mt-12 max-w-[860px]">
            {/* 1 · Destino */}
            <Paso n="1" titulo="¿A qué país de Sudamérica vas?">
              <div className="flex flex-wrap gap-2.5">
                {DESTINOS.map((d) => (
                  <Chip key={d.slug} activo={destinoSlug === d.slug} onClick={() => setDestinoSlug(d.slug)}>
                    <span aria-hidden className="text-[1.1em] leading-none">{d.flag}</span> {d.corto}
                  </Chip>
                ))}
              </div>
            </Paso>

            {/* 2 · Ciudad */}
            <Paso n="2" titulo="¿Desde qué ciudad sales?">
              <div className="flex flex-wrap gap-2.5">
                {CIUDADES_SALIDA.map((c) => (
                  <Chip key={c} activo={ciudad === c} onClick={() => setCiudad(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
            </Paso>

            {/* 3 · Personas */}
            <Paso n="3" titulo="¿Cuántas personas viajan?">
              <div className="vx-stepper">
                <button type="button" aria-label="Quitar una persona" onClick={() => setPersonas((p) => Math.max(1, p - 1))} disabled={personas <= 1}>−</button>
                <span className="vx-num">{personas}</span>
                <button type="button" aria-label="Agregar una persona" onClick={() => setPersonas((p) => Math.min(9, p + 1))} disabled={personas >= 9}>+</button>
              </div>
            </Paso>

            {/* Resultado en vivo */}
            {estimado && destino ? (
              <div className="mt-10" aria-live="polite">
                <p className="vx-muted text-[color:var(--vx-azul)]">
                  {destino.corto} · {sufijo}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Tarjeta titulo="Directo (Pacífico / vía USA)" rango={`${formatAUD(estimado.directo.min)} – ${formatAUD(estimado.directo.max)}`} />
                  <Tarjeta titulo="Con parada en Europa" rango={`${formatAUD(estimado.europa.min)} – ${formatAUD(estimado.europa.max)}`} destacado />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="vx-body">Conocer Europa en el mismo viaje</span>
                  <span className="vx-pill-neon">
                    <strong>+{formatAUD(estimado.diferenciaDesde)}</strong> por persona
                  </span>
                </div>

                {!contactoAbierto ? (
                  <button type="button" className="vx-cta vx-cta--neon mt-7" onClick={() => setContactoAbierto(true)}>
                    Quiero mi cotización afinada
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                ) : (
                  <div className="vx-card mt-7 p-6 md:p-7">
                    <p className="vx-body mb-4">
                      Déjanos tus datos y en <strong className="text-[#111111]">24h</strong> te mandamos la cotización afinada, con fechas y aerolíneas reales.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input className="vx-input" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoComplete="name" />
                      <input className="vx-input" type="email" placeholder="Tu correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" inputMode="email" />
                      <input className="vx-input md:col-span-2" type="tel" placeholder="WhatsApp (opcional)" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} autoComplete="tel" inputMode="tel" />
                    </div>
                    {error && <p role="alert" className="vx-muted mt-4 text-[color:#c0272d]">{error}</p>}
                    <button type="button" className={`vx-cta vx-cta--neon mt-5 ${enviando ? 'cursor-wait opacity-70' : ''}`} onClick={enviarContacto} disabled={enviando}>
                      {enviando ? 'Enviando…' : 'Enviar y recibir cotización'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="vx-muted mt-10">
                Elige tu destino para ver el precio al instante.
              </p>
            )}
          </div>
        )}

        <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block font-['PPMonumentExtended'] text-[12px] font-light uppercase tracking-[0.2em] text-black/55 underline decoration-black/25 underline-offset-4 transition-colors hover:text-[#111111]">
          ¿Prefieres hablar? Cotizar por WhatsApp
        </a>
      </div>
    </section>
  )
}

function Paso({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 first:mt-0">
      <p className="mb-4 flex items-center gap-3 font-['PPMonumentExtended'] text-[15px] font-light text-[#111111]">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--vx-azul)] text-[12px] font-medium text-white">{n}</span>
        {titulo}
      </p>
      {children}
    </div>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo} className={`vx-chip${activo ? ' vx-chip--on' : ''}`}>
      {children}
    </button>
  )
}

function Tarjeta({ titulo, rango, destacado }: { titulo: string; rango: string; destacado?: boolean }) {
  return (
    <div className={`vx-card p-5 ${destacado ? 'vx-card--on' : ''}`}>
      <p className="vx-muted text-[color:var(--vx-azul)]">{titulo}</p>
      <p className="mt-2 font-[family-name:var(--font-viajes-black)] text-[clamp(1.3rem,3.4vw,1.85rem)] tracking-[-0.02em] text-[#111111]">{rango}</p>
    </div>
  )
}

function Confirmacion({ nombre, destino }: { nombre: string; destino: string }) {
  const primer = nombre.trim().split(/\s+/)[0]
  return (
    <div data-reveal className="vx-card mt-12 max-w-[640px] p-7 md:p-9">
      <p className="flex items-center gap-3 font-[family-name:var(--font-viajes-black)] text-[clamp(1.6rem,4vw,2.2rem)] uppercase tracking-[-0.02em] text-[#111111]">
        ¡Listo{primer ? `, ${primer}` : ''}!
        <span className="vx-dot" aria-hidden />
      </p>
      <p className="vx-body mt-4">
        Recibimos tu solicitud para <strong className="text-[#111111]">{destino}</strong>. Te mandamos la cotización afinada a tu correo en las próximas <strong className="text-[#111111]">24 horas</strong>.
      </p>
      <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="vx-cta vx-cta--wa mt-6">
        Adelantar por WhatsApp
      </a>
    </div>
  )
}
