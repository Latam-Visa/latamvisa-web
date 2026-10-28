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

/* 05 — Cotiza tu trip. Herramienta interactiva en vivo.
   Eliges destino y ciudad con botones, mueves "personas" con un stepper, y el
   precio de las dos rutas (directo vs. con parada en Europa) se calcula AL
   INSTANTE del lado del cliente desde lib/viajes/rangos.ts. Para la cotización
   afinada dejas tu correo y ahí sí va al servidor (estimado + correos). */

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
    <section
      id="cotiza"
      ref={ref}
      aria-labelledby="cotiza-title"
      className="viajes-section"
      style={{ backgroundColor: 'var(--viajes-sky)', color: 'var(--viajes-ink)' }}
    >
      <p className="viajes-label" data-reveal style={{ opacity: 0, color: 'rgba(11,42,74,0.6)' }}>
        04 / Cotiza tu trip
      </p>
      <h2 id="cotiza-title" className="viajes-display mt-6" data-reveal style={{ opacity: 0, maxWidth: '18ch' }}>
        Arma tu viaje y mira el precio
      </h2>

      {enviado ? (
        <Confirmacion nombre={form.nombre} destino={enviado.destinoNombre} />
      ) : (
        <div data-reveal style={{ opacity: 0 }} className="viajes-tool mt-10">
          {/* 1 · Destino */}
          <Paso n="1" titulo="¿A qué país de Sudamérica vas?">
            <div className="viajes-chips">
              {DESTINOS.map((d) => (
                <Chip key={d.slug} activo={destinoSlug === d.slug} onClick={() => setDestinoSlug(d.slug)}>
                  <span aria-hidden style={{ fontSize: '1.1em' }}>{d.flag}</span> {d.corto}
                </Chip>
              ))}
            </div>
          </Paso>

          {/* 2 · Ciudad */}
          <Paso n="2" titulo="¿Desde qué ciudad sales?">
            <div className="viajes-chips">
              {CIUDADES_SALIDA.map((c) => (
                <Chip key={c} activo={ciudad === c} onClick={() => setCiudad(c)}>
                  {c}
                </Chip>
              ))}
            </div>
          </Paso>

          {/* 3 · Personas */}
          <Paso n="3" titulo="¿Cuántas personas viajan?">
            <div className="viajes-stepper">
              <button type="button" aria-label="Quitar una persona" onClick={() => setPersonas((p) => Math.max(1, p - 1))} disabled={personas <= 1}>−</button>
              <span className="viajes-stepper-num">{personas}</span>
              <button type="button" aria-label="Agregar una persona" onClick={() => setPersonas((p) => Math.min(9, p + 1))} disabled={personas >= 9}>+</button>
            </div>
          </Paso>

          {/* Resultado en vivo */}
          {estimado && destino ? (
            <div className="viajes-estimado-live mt-8" aria-live="polite">
              <p className="viajes-label" style={{ color: 'rgba(11,42,74,0.6)' }}>
                {destino.corto} · {sufijo}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Tarjeta titulo="Directo (Pacífico / vía USA)" rango={`${formatAUD(estimado.directo.min)} – ${formatAUD(estimado.directo.max)}`} />
                <Tarjeta titulo="Con parada en Europa" rango={`${formatAUD(estimado.europa.min)} – ${formatAUD(estimado.europa.max)}`} destacado />
              </div>
              <p className="viajes-dif mt-4">
                <span>Conocer Europa en el mismo viaje</span>
                <strong>+{formatAUD(estimado.diferenciaDesde)} por persona</strong>
              </p>

              {!contactoAbierto ? (
                <button type="button" className="viajes-cta viajes-cta-sky mt-6" style={{ border: 'none' }} onClick={() => setContactoAbierto(true)}>
                  Quiero mi cotización afinada
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              ) : (
                <div className="viajes-contacto mt-6">
                  <p className="viajes-body" style={{ maxWidth: 'none', marginBottom: '14px' }}>
                    Déjanos tus datos y en <strong>24h</strong> te mandamos la cotización afinada, con fechas y aerolíneas reales.
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input className="viajes-input" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoComplete="name" />
                    <input className="viajes-input" type="email" placeholder="Tu correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" inputMode="email" />
                    <input className="viajes-input md:col-span-2" type="tel" placeholder="WhatsApp (opcional)" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} autoComplete="tel" inputMode="tel" />
                  </div>
                  {error && <p role="alert" className="viajes-label mt-4" style={{ color: '#b00020' }}>{error}</p>}
                  <button type="button" className="viajes-cta viajes-cta-sky mt-5" style={{ border: 'none', cursor: enviando ? 'wait' : 'pointer', opacity: enviando ? 0.7 : 1 }} onClick={enviarContacto} disabled={enviando}>
                    {enviando ? 'Enviando…' : 'Enviar y recibir cotización'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="viajes-label mt-8" style={{ color: 'rgba(11,42,74,0.5)' }}>
              Elige tu destino para ver el precio al instante.
            </p>
          )}
        </div>
      )}

      <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="viajes-cta mt-8" style={{ border: 'none', backgroundColor: 'transparent', textDecoration: 'underline' }}>
        ¿Prefieres hablar? Cotizar por WhatsApp
      </a>
    </section>
  )
}

function Paso({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <div className="viajes-paso">
      <p className="viajes-paso-titulo">
        <span className="viajes-paso-num">{n}</span> {titulo}
      </p>
      {children}
    </div>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo} className={`viajes-chip${activo ? ' viajes-chip--on' : ''}`}>
      {children}
    </button>
  )
}

function Tarjeta({ titulo, rango, destacado }: { titulo: string; rango: string; destacado?: boolean }) {
  return (
    <div className={`viajes-ruta${destacado ? ' viajes-ruta--on' : ''}`}>
      <p className="viajes-label" style={{ color: 'rgba(11,42,74,0.6)' }}>{titulo}</p>
      <p className="viajes-display mt-2" style={{ fontSize: 'clamp(1.4rem, 3.6vw, 1.9rem)' }}>{rango}</p>
    </div>
  )
}

function Confirmacion({ nombre, destino }: { nombre: string; destino: string }) {
  const primer = nombre.trim().split(/\s+/)[0]
  return (
    <div data-reveal className="viajes-confirma mt-10">
      <p className="viajes-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', maxWidth: '20ch' }}>
        ¡Listo{primer ? `, ${primer}` : ''}! 🎉
      </p>
      <p className="viajes-body mt-4" style={{ maxWidth: 'none' }}>
        Recibimos tu solicitud para <strong>{destino}</strong>. Te mandamos la cotización afinada a tu correo en las próximas <strong>24 horas</strong>.
      </p>
      <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="viajes-cta viajes-cta-sky mt-6" style={{ border: 'none' }}>
        Adelantar por WhatsApp
      </a>
    </div>
  )
}
