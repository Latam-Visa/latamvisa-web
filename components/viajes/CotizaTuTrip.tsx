'use client'
import { useRef, useState } from 'react'
import { useReveal } from './useReveal'
import { WHATSAPP_HREF } from './whatsapp'
import { cotizarViaje, type CotizarResultado } from '@/app/viajes/_actions/cotizar'
import { CIUDADES_SALIDA, DESTINOS, formatAUD } from '@/lib/viajes/rangos'

/* 05 — Cotiza tu trip. Formulario real.
   El cliente llena lo básico y, al enviar, ve un estimado por rango en pantalla
   (directo por el Pacífico/USA vs. con parada en Europa + la diferencia) y le
   llega un correo; a nosotros nos llega el lead para afinar la cotización en
   24h. Los números son manuales (lib/viajes/rangos.ts). La ruta directa a
   WhatsApp sigue disponible debajo. */

const INPUT_STYLE: React.CSSProperties = {
  height: '52px',
  padding: '0 16px',
  borderRadius: '10px',
  border: '1px solid rgba(11,42,74,0.18)',
  backgroundColor: 'rgba(168,200,232,0.22)',
  color: 'var(--viajes-ink)',
  maxWidth: 'none',
  width: '100%',
}

export default function CotizaTuTrip() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    ciudadSalida: '',
    destinoSlug: '',
    personas: '1',
    fechas: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [res, setRes] = useState<Extract<CotizarResultado, { ok: true }> | null>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const r = await cotizarViaje({
        nombre: form.nombre,
        email: form.email,
        whatsapp: form.whatsapp,
        ciudadSalida: form.ciudadSalida,
        destinoSlug: form.destinoSlug,
        personas: Number(form.personas),
        fechas: form.fechas,
      })
      if (r.ok) setRes(r)
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

      <h2 id="cotiza-title" className="viajes-display mt-10" data-reveal style={{ opacity: 0, maxWidth: '16ch' }}>
        Cuéntanos y armamos el plan
      </h2>

      {res ? (
        <Resultado res={res} ciudad={form.ciudadSalida} onReset={() => setRes(null)} />
      ) : (
        <form
          data-reveal
          aria-label="Cotización de Euro Trip"
          onSubmit={onSubmit}
          className="mt-12"
          style={{ opacity: 0, maxWidth: '760px', backgroundColor: 'var(--viajes-paper)', borderRadius: '18px', padding: '28px' }}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Campo label="Tu nombre">
              <input type="text" required value={form.nombre} onChange={set('nombre')} className="viajes-body" style={INPUT_STYLE} autoComplete="name" />
            </Campo>
            <Campo label="Tu correo">
              <input type="email" required value={form.email} onChange={set('email')} className="viajes-body" style={INPUT_STYLE} autoComplete="email" inputMode="email" />
            </Campo>
            <Campo label="WhatsApp (opcional)">
              <input type="tel" value={form.whatsapp} onChange={set('whatsapp')} className="viajes-body" style={INPUT_STYLE} autoComplete="tel" inputMode="tel" />
            </Campo>
            <Campo label="¿Desde qué ciudad sales?">
              <select required value={form.ciudadSalida} onChange={set('ciudadSalida')} className="viajes-body" style={INPUT_STYLE}>
                <option value="" disabled>Elige tu ciudad</option>
                {CIUDADES_SALIDA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Campo>
            <Campo label="¿A qué país de Sudamérica vas?">
              <select required value={form.destinoSlug} onChange={set('destinoSlug')} className="viajes-body" style={INPUT_STYLE}>
                <option value="" disabled>Elige tu destino</option>
                {DESTINOS.map((d) => <option key={d.slug} value={d.slug}>{d.nombre}</option>)}
              </select>
            </Campo>
            <Campo label="¿Cuántas personas?">
              <input type="number" min={1} max={9} value={form.personas} onChange={set('personas')} className="viajes-body" style={INPUT_STYLE} inputMode="numeric" />
            </Campo>
            <div className="md:col-span-2">
              <Campo label="Fechas aproximadas (opcional)">
                <input type="text" value={form.fechas} onChange={set('fechas')} placeholder="Ej: marzo 2027, 3 semanas" className="viajes-body" style={INPUT_STYLE} />
              </Campo>
            </div>
          </div>

          {error && (
            <p role="alert" className="viajes-label mt-5" style={{ color: '#b00020' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="viajes-cta mt-6"
            style={{ cursor: enviando ? 'wait' : 'pointer', opacity: enviando ? 0.7 : 1, border: 'none' }}
          >
            {enviando ? 'Calculando…' : 'Ver mi estimado'}
          </button>

          <p className="viajes-label mt-5" style={{ color: 'rgba(11,42,74,0.5)' }}>
            Te mostramos un rango al instante y te afinamos la cotización en 24h.
          </p>
        </form>
      )}

      <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="viajes-cta mt-6" style={{ border: 'none', backgroundColor: 'transparent', textDecoration: 'underline' }}>
        ¿Prefieres hablar? Cotizar por WhatsApp
      </a>
    </section>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="viajes-label" style={{ color: 'rgba(11,42,74,0.65)' }}>{label}</span>
      {children}
    </label>
  )
}

function Resultado({
  res,
  ciudad,
  onReset,
}: {
  res: Extract<CotizarResultado, { ok: true }>
  ciudad: string
  onReset: () => void
}) {
  const { estimado, destinoNombre } = res
  const sufijo = estimado.personas > 1 ? `${estimado.personas} personas` : 'por persona'

  return (
    <div
      data-reveal
      className="mt-12"
      style={{ maxWidth: '760px', backgroundColor: 'var(--viajes-paper)', borderRadius: '18px', padding: '28px' }}
    >
      <p className="viajes-label" style={{ color: 'rgba(11,42,74,0.6)' }}>
        Estimado para {destinoNombre}{ciudad ? ` · desde ${ciudad}` : ''} · {sufijo}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Tarjeta titulo="Directo (Pacífico / vía USA)" rango={`${formatAUD(estimado.directo.min)} – ${formatAUD(estimado.directo.max)}`} />
        <Tarjeta titulo="Con parada en Europa" rango={`${formatAUD(estimado.europa.min)} – ${formatAUD(estimado.europa.max)}`} destacado />
      </div>

      <p className="viajes-body mt-6" style={{ maxWidth: 'none' }}>
        Conocer Europa en el mismo viaje cuesta <strong>~{formatAUD(estimado.diferenciaDesde)} más por persona</strong>:
        un país europeo a la ida y otro a la vuelta. 1 viaje, 2 vacaciones.
      </p>

      <p className="viajes-label mt-5" style={{ color: 'rgba(11,42,74,0.6)' }}>
        Es un estimado por rango. Te enviamos la cotización afinada a tu correo en las próximas 24 horas.
      </p>

      <button type="button" onClick={onReset} className="viajes-cta mt-6" style={{ border: 'none', backgroundColor: 'transparent', textDecoration: 'underline' }}>
        Hacer otra cotización
      </button>
    </div>
  )
}

function Tarjeta({ titulo, rango, destacado }: { titulo: string; rango: string; destacado?: boolean }) {
  return (
    <div
      style={{
        borderRadius: '14px',
        padding: '20px',
        backgroundColor: destacado ? 'rgba(168,200,232,0.3)' : 'rgba(168,200,232,0.14)',
        border: '1px solid rgba(11,42,74,0.12)',
      }}
    >
      <p className="viajes-label" style={{ color: 'rgba(11,42,74,0.6)' }}>{titulo}</p>
      <p className="viajes-display mt-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{rango}</p>
    </div>
  )
}
