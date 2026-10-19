'use client'

import { useEffect, useRef, useState } from 'react'
import { CAMPO_HONEYPOT, solicitudSchema } from '@/lib/viajes/schema'
import {
  CIUDADES_EUROPA,
  DIAS_EUROPA,
  ESTILOS_OPCIONES,
  MAX_ADULTOS,
  MAX_CIUDADES,
  MAX_NINOS,
  OTRO,
  PAISES_LATAM,
  PASAPORTES,
  SALIDAS,
} from '@/lib/viajes/opciones'
import type { CotizacionPublica } from '@/lib/viajes/cotizador'
import type { GuiaPublica } from '@/lib/viajes/solicitud'
import { WHATSAPP_HREF } from './whatsapp'

/* Formulario por pasos de "Dos Vacaciones". Una pregunta por pantalla, sin
   animaciones. Cada paso se valida con el mismo esquema zod que usa el
   servidor (POST /api/viajes/cotizar), que igual vuelve a validar todo. */

interface Estado {
  ciudad_salida: string
  pais_latam: string
  pais_otro: string
  fecha_ida: string
  fecha_vuelta: string
  europa_momento: '' | 'ida' | 'vuelta'
  adultos: number
  ninos: number
  pasaporte: string
  pasaporte_otro: string
  visa_usa: '' | 'si' | 'no'
  dias_europa: number
  ciudades_europa: string[]
  sorprendanme: boolean
  estilo: string[]
  nombre: string
  email: string
  celular: string
  [CAMPO_HONEYPOT]: string
}

const INICIAL: Estado = {
  ciudad_salida: '', pais_latam: '', pais_otro: '', fecha_ida: '', fecha_vuelta: '', europa_momento: '',
  adultos: 1, ninos: 0, pasaporte: '', pasaporte_otro: '', visa_usa: '', dias_europa: 0,
  ciudades_europa: [], sorprendanme: false, estilo: [], nombre: '', email: '', celular: '', [CAMPO_HONEYPOT]: '',
}

type Errores = Partial<Record<string, string>>

interface Resultado {
  publico: CotizacionPublica | null
  guias: GuiaPublica[]
  mensaje?: string
  personas: number
}

const shape = solicitudSchema.shape
const errorDe = (campo: keyof typeof shape, valor: unknown) => {
  const r = shape[campo].safeParse(valor)
  return r.success ? undefined : r.error.issues[0]?.message
}

const hoy = () => new Date().toISOString().slice(0, 10)
const paisFinal = (e: Estado) => (e.pais_latam === OTRO ? e.pais_otro.trim() : e.pais_latam)
const pasaporteFinal = (e: Estado) => (e.pasaporte === OTRO ? e.pasaporte_otro.trim() : e.pasaporte)

// Cada paso: título, ayuda opcional, campos que valida y qué campos del servidor le pertenecen.
const PASOS: { titulo: string; ayuda?: string; campos: string[]; validar: (e: Estado) => Errores }[] = [
  { titulo: '¿Desde dónde sales?', campos: ['ciudad_salida'], validar: (e) => ({ ciudad_salida: e.ciudad_salida ? undefined : 'Escoge una ciudad.' }) },
  {
    titulo: '¿Pa’ qué país de Latam vas?',
    campos: ['pais_latam'],
    validar: (e) => ({
      pais_latam: !e.pais_latam ? 'Escoge un país.' : e.pais_latam === OTRO && e.pais_otro.trim().length < 2 ? 'Escribe a qué país vas.' : undefined,
    }),
  },
  {
    titulo: 'Fechas tentativas',
    ayuda: 'Ida a Latam y vuelta a Australia. No tienen que ser exactas.',
    campos: ['fecha_ida', 'fecha_vuelta'],
    validar: (e) => ({
      fecha_ida: !e.fecha_ida ? 'Escoge la fecha de ida.' : e.fecha_ida <= hoy() ? 'La ida tiene que ser una fecha futura.' : undefined,
      fecha_vuelta: !e.fecha_vuelta ? 'Escoge la fecha de vuelta.' : e.fecha_ida && e.fecha_vuelta <= e.fecha_ida ? 'La vuelta tiene que ser después de la ida.' : undefined,
    }),
  },
  {
    titulo: '¿Europa a la ida o a la vuelta?',
    ayuda: 'A la ida llegas a casa con el viaje hecho; a la vuelta cierras con broche de oro.',
    campos: ['europa_momento'],
    validar: (e) => ({ europa_momento: e.europa_momento ? undefined : 'Escoge una opción.' }),
  },
  {
    titulo: '¿Cuántos van?',
    campos: ['adultos', 'ninos'],
    validar: (e) => ({ adultos: errorDe('adultos', e.adultos), ninos: errorDe('ninos', e.ninos) }),
  },
  {
    titulo: '¿Qué pasaporte tienes?',
    campos: ['pasaporte'],
    validar: (e) => ({
      pasaporte: !e.pasaporte ? 'Escoge tu pasaporte.' : e.pasaporte === OTRO && e.pasaporte_otro.trim().length < 2 ? 'Escribe de qué país es tu pasaporte.' : undefined,
    }),
  },
  { titulo: '¿Tienes visa americana vigente?', campos: ['visa_usa'], validar: (e) => ({ visa_usa: e.visa_usa ? undefined : 'Escoge sí o no.' }) },
  { titulo: '¿Cuántos días le quieres meter a Europa?', campos: ['dias_europa'], validar: (e) => ({ dias_europa: e.dias_europa ? undefined : 'Escoge cuántos días.' }) },
  {
    titulo: '¿Pa’ dónde?',
    ayuda: `Escoge hasta ${MAX_CIUDADES} ciudades, o déjanos escoger a nosotros.`,
    campos: ['ciudades_europa'],
    validar: (e) => ({ ciudades_europa: e.sorprendanme || e.ciudades_europa.length > 0 ? undefined : 'Escoge al menos una ciudad o “Sorpréndanme”.' }),
  },
  {
    titulo: '¿Qué plan te late?',
    ayuda: 'Puedes escoger varios.',
    campos: ['estilo'],
    validar: (e) => ({ estilo: e.estilo.length > 0 ? undefined : 'Escoge al menos un plan.' }),
  },
  {
    titulo: 'Tus datos',
    ayuda: 'Solo esto y te mostramos tu rango al instante.',
    campos: ['nombre', 'email', 'celular'],
    validar: (e) => ({ nombre: errorDe('nombre', e.nombre), email: errorDe('email', e.email), celular: errorDe('celular', e.celular) }),
  },
]

const limpiar = (errores: Errores) => Object.fromEntries(Object.entries(errores).filter(([, v]) => v)) as Errores

// ── Piezas de UI ────────────────────────────────────────────────────────────

const tinta = 'var(--viajes-ink)'

function Opcion({ activa, onClick, children, disabled }: { activa: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={activa}
      className="viajes-body w-full text-left disabled:opacity-40"
      style={{
        minHeight: 52,
        padding: '12px 16px',
        borderRadius: 12,
        border: `1.5px solid ${activa ? tinta : 'rgba(11,42,74,0.18)'}`,
        backgroundColor: activa ? 'var(--viajes-neon)' : '#FFFFFF',
        color: tinta,
        fontWeight: activa ? 700 : 400,
        maxWidth: 'none',
      }}
    >
      {children}
    </button>
  )
}

const estiloCampo: React.CSSProperties = {
  width: '100%',
  height: 52,
  padding: '0 14px',
  borderRadius: 12,
  border: '1.5px solid rgba(11,42,74,0.18)',
  backgroundColor: '#FFFFFF',
  color: tinta,
  maxWidth: 'none',
}

function MensajeError({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null
  return (
    <p id={id} role="alert" className="mt-2" style={{ color: '#B42318', fontSize: 14 }}>
      {texto}
    </p>
  )
}

function Contador({ etiqueta, valor, min, max, onChange }: { etiqueta: string; valor: number; min: number; max: number; onChange: (v: number) => void }) {
  const boton = (texto: string, nuevo: number, deshabilitado: boolean, aria: string) => (
    <button
      type="button"
      onClick={() => onChange(nuevo)}
      disabled={deshabilitado}
      aria-label={aria}
      className="viajes-body disabled:opacity-30"
      style={{ width: 48, height: 48, borderRadius: 12, border: '1.5px solid rgba(11,42,74,0.18)', backgroundColor: '#FFFFFF', color: tinta, fontSize: 22, maxWidth: 'none' }}
    >
      {texto}
    </button>
  )
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="viajes-body" style={{ maxWidth: 'none' }}>{etiqueta}</span>
      <div className="flex items-center gap-3">
        {boton('−', valor - 1, valor <= min, `Menos ${etiqueta.toLowerCase()}`)}
        <span className="viajes-body w-8 text-center tabular-nums" aria-live="polite" style={{ fontWeight: 700 }}>{valor}</span>
        {boton('+', valor + 1, valor >= max, `Más ${etiqueta.toLowerCase()}`)}
      </div>
    </div>
  )
}

const redondear10 = (v: number) => Math.round(v / 10) * 10
const aud = (v: number) => `AUD ${v.toLocaleString('en-US')}`

// ── Componente ──────────────────────────────────────────────────────────────

export default function CotizadorDosVacaciones() {
  const [paso, setPaso] = useState(0)
  const [estado, setEstado] = useState<Estado>(INICIAL)
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const primerRender = useRef(true)

  // Al cambiar de paso, el foco va a la pregunta (lectores de pantalla y teclado).
  useEffect(() => {
    if (primerRender.current) { primerRender.current = false; return }
    tituloRef.current?.focus()
  }, [paso, resultado])

  const set = <K extends keyof Estado>(campo: K, valor: Estado[K]) => {
    setEstado((e) => ({ ...e, [campo]: valor }))
    setErrores((er) => ({ ...er, [campo]: undefined }))
  }

  const total = PASOS.length
  const actual = PASOS[paso]

  const enviar = async () => {
    setEnviando(true)
    setErrorEnvio('')
    const cuerpo = {
      nombre: estado.nombre.trim(),
      email: estado.email.trim(),
      celular: estado.celular.trim(),
      ciudad_salida: estado.ciudad_salida,
      pais_latam: paisFinal(estado),
      fecha_ida: estado.fecha_ida,
      fecha_vuelta: estado.fecha_vuelta,
      europa_momento: estado.europa_momento,
      adultos: estado.adultos,
      ninos: estado.ninos,
      pasaporte: pasaporteFinal(estado),
      visa_usa: estado.visa_usa === 'si',
      ciudades_europa: estado.sorprendanme ? [] : estado.ciudades_europa,
      sorprendanme: estado.sorprendanme,
      dias_europa: estado.dias_europa,
      estilo: estado.estilo,
      [CAMPO_HONEYPOT]: estado[CAMPO_HONEYPOT],
    }
    try {
      const res = await fetch('/api/viajes/cotizar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
      const json = await res.json().catch(() => null)
      if (res.status === 400 && json?.campos) {
        // Lleva al primer paso que tiene un campo rechazado por el servidor.
        const campos = Object.keys(json.campos)
        const destino = PASOS.findIndex((p) => p.campos.some((c) => campos.includes(c)))
        setErrores(json.campos)
        if (destino >= 0) setPaso(destino)
        return
      }
      if (!res.ok || !json?.ok) throw new Error()
      setResultado({ publico: json.publico, guias: json.guias || [], mensaje: json.mensaje, personas: estado.adultos + estado.ninos })
    } catch {
      setErrorEnvio('No pudimos enviar tu solicitud. Revisa tu conexión e intenta de nuevo, o escríbenos por WhatsApp.')
    } finally {
      setEnviando(false)
    }
  }

  const siguiente = (ev: React.FormEvent) => {
    ev.preventDefault()
    const encontrados = limpiar(actual.validar(estado))
    if (Object.keys(encontrados).length > 0) return setErrores(encontrados)
    setErrores({})
    if (paso < total - 1) setPaso(paso + 1)
    else void enviar()
  }

  const reiniciar = () => {
    setEstado(INICIAL)
    setErrores({})
    setResultado(null)
    setPaso(0)
  }

  const tarjeta: React.CSSProperties = { maxWidth: 760, backgroundColor: 'var(--viajes-paper)', borderRadius: 18, padding: 'clamp(20px, 5vw, 32px)', color: tinta }

  // ── Resultado ──────────────────────────────────────────────────────────────
  if (resultado) {
    const p = resultado.publico
    const porPersona = p && resultado.personas > 1
      ? { min: redondear10(p.rango_min_aud / resultado.personas), max: redondear10(p.rango_max_aud / resultado.personas) }
      : null
    return (
      <div className="mt-12" style={tarjeta} aria-live="polite">
        {p ? (
          <>
            <h3 ref={tituloRef} tabIndex={-1} className="viajes-body" style={{ fontSize: 22, fontWeight: 700, maxWidth: 'none', outline: 'none' }}>
              Tu Euro Trip te sale aprox. entre {aud(p.rango_min_aud)} y {aud(p.rango_max_aud)}
            </h3>
            <p className="viajes-body mt-2" style={{ color: 'rgba(11,42,74,0.75)' }}>
              {resultado.personas > 1
                ? `Es el total para los ${resultado.personas} viajeros: unos ${aud(porPersona!.min)} a ${aud(porPersona!.max)} por persona.`
                : 'Es el total para ti.'}{' '}
              {p.vuelos_estado === 'incluidos' ? 'Incluye vuelos aproximados, hoteles y traslados.' : 'Incluye hoteles y traslados; los vuelos van en tu cotización exacta.'}
            </p>

            <p className="viajes-label mt-7" style={{ color: 'rgba(11,42,74,0.6)' }}>Tu ruta en Europa</p>
            <ul className="mt-2">
              {p.ciudades.map((c) => (
                <li key={c.ciudad} className="viajes-body flex justify-between py-2" style={{ borderBottom: '1px solid rgba(11,42,74,0.12)', maxWidth: 'none' }}>
                  <span>{c.ciudad}</span>
                  <span>{c.noches} {c.noches === 1 ? 'noche' : 'noches'}</span>
                </li>
              ))}
            </ul>

            {p.advertencias.length > 0 && (
              <ul className="mt-6 space-y-2">
                {p.advertencias.map((a) => (
                  <li key={a} className="viajes-body" style={{ padding: '10px 14px', borderRadius: 10, backgroundColor: '#FFF4D6', color: '#7A4A00', maxWidth: 'none' }}>{a}</li>
                ))}
              </ul>
            )}

            <p className="viajes-body mt-6" style={{ fontSize: 15, color: 'rgba(11,42,74,0.75)' }}>
              Es un valor aproximado, sujeto a revisión y disponibilidad. En las próximas 24 horas te llega la cotización exacta a tu correo.
            </p>
          </>
        ) : (
          <h3 ref={tituloRef} tabIndex={-1} className="viajes-body" style={{ fontSize: 20, fontWeight: 700, maxWidth: 'none', outline: 'none' }}>
            {resultado.mensaje || 'Recibimos tus datos. Te escribimos en las próximas 24 horas con tu cotización.'}
          </h3>
        )}

        {resultado.guias.length > 0 && (
          <div className="mt-8">
            <p className="viajes-label" style={{ color: 'rgba(11,42,74,0.6)' }}>Guías de tus ciudades</p>
            <ul className="mt-3 space-y-5">
              {resultado.guias.map((g) => (
                <li key={g.ciudad}>
                  <p className="viajes-body" style={{ fontWeight: 700 }}>{g.ciudad}, {g.pais}</p>
                  {g.desde_aeropuerto && <p className="viajes-body mt-1"><strong>Desde el aeropuerto:</strong> {g.desde_aeropuerto}</p>}
                  {g.como_moverse && <p className="viajes-body mt-1"><strong>Cómo moverte:</strong> {g.como_moverse}</p>}
                  {g.donde_quedarse && <p className="viajes-body mt-1"><strong>Dónde quedarte:</strong> {g.donde_quedarse}</p>}
                  {g.imperdibles && g.imperdibles.length > 0 && <p className="viajes-body mt-1"><strong>Imperdibles:</strong> {g.imperdibles.join(', ')}</p>}
                  {g.tip_parcero && <p className="viajes-body mt-1"><strong>Tip parcero:</strong> {g.tip_parcero}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="viajes-cta">Escríbenos por WhatsApp</a>
          <button type="button" onClick={reiniciar} className="viajes-label underline" style={{ color: tinta, padding: '12px 4px' }}>
            Cotizar otro viaje
          </button>
        </div>
      </div>
    )
  }

  // ── Pasos ──────────────────────────────────────────────────────────────────
  const multi = (lista: string[], valor: string, max?: number) =>
    lista.includes(valor) ? lista.filter((v) => v !== valor) : max && lista.length >= max ? lista : [...lista, valor]

  return (
    <form onSubmit={siguiente} noValidate className="mt-12" style={tarjeta} aria-label="Cotiza tu Euro Trip">
      <div className="flex items-center justify-between gap-3">
        <p className="viajes-label" style={{ color: 'rgba(11,42,74,0.6)' }}>Paso {paso + 1} de {total}</p>
        {paso > 0 && (
          <button type="button" onClick={() => { setErrores({}); setPaso(paso - 1) }} className="viajes-label underline" style={{ color: tinta, padding: '8px 0' }}>
            ← Atrás
          </button>
        )}
      </div>
      <div className="mt-3" style={{ height: 6, borderRadius: 6, backgroundColor: 'rgba(11,42,74,0.12)' }} role="progressbar" aria-label="Progreso" aria-valuemin={1} aria-valuemax={total} aria-valuenow={paso + 1}>
        <div style={{ height: '100%', width: `${((paso + 1) / total) * 100}%`, borderRadius: 6, backgroundColor: tinta }} />
      </div>

      <h3 ref={tituloRef} tabIndex={-1} className="viajes-body mt-7" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, maxWidth: 'none', outline: 'none' }}>
        {actual.titulo}
      </h3>
      {actual.ayuda && <p className="viajes-body mt-2" style={{ color: 'rgba(11,42,74,0.75)' }}>{actual.ayuda}</p>}

      <div className="mt-6">
        {paso === 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SALIDAS.map((o) => <Opcion key={o.value} activa={estado.ciudad_salida === o.value} onClick={() => set('ciudad_salida', o.value)}>{o.label}</Opcion>)}
          </div>
        )}

        {paso === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PAISES_LATAM.map((o) => <Opcion key={o.value} activa={estado.pais_latam === o.value} onClick={() => set('pais_latam', o.value)}>{o.label}</Opcion>)}
            </div>
            {estado.pais_latam === OTRO && (
              <label className="mt-4 block">
                <span className="viajes-label" style={{ color: 'rgba(11,42,74,0.65)' }}>¿Cuál país?</span>
                <input type="text" value={estado.pais_otro} onChange={(e) => set('pais_otro', e.target.value)} className="viajes-body mt-2" style={estiloCampo} autoComplete="country-name" />
              </label>
            )}
          </>
        )}

        {paso === 2 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="viajes-label" style={{ color: 'rgba(11,42,74,0.65)' }}>Ida a Latam</span>
              <input type="date" value={estado.fecha_ida} min={hoy()} onChange={(e) => set('fecha_ida', e.target.value)} className="viajes-body mt-2" style={estiloCampo} aria-invalid={!!errores.fecha_ida} aria-describedby="err-fecha_ida" />
              <MensajeError id="err-fecha_ida" texto={errores.fecha_ida} />
            </label>
            <label className="block">
              <span className="viajes-label" style={{ color: 'rgba(11,42,74,0.65)' }}>Vuelta a Australia</span>
              <input type="date" value={estado.fecha_vuelta} min={estado.fecha_ida || hoy()} onChange={(e) => set('fecha_vuelta', e.target.value)} className="viajes-body mt-2" style={estiloCampo} aria-invalid={!!errores.fecha_vuelta} aria-describedby="err-fecha_vuelta" />
              <MensajeError id="err-fecha_vuelta" texto={errores.fecha_vuelta} />
            </label>
          </div>
        )}

        {paso === 3 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Opcion activa={estado.europa_momento === 'ida'} onClick={() => set('europa_momento', 'ida')}>A la ida, camino a Latam</Opcion>
            <Opcion activa={estado.europa_momento === 'vuelta'} onClick={() => set('europa_momento', 'vuelta')}>A la vuelta, camino a Australia</Opcion>
          </div>
        )}

        {paso === 4 && (
          <div style={{ maxWidth: 420 }}>
            <Contador etiqueta="Adultos" valor={estado.adultos} min={1} max={MAX_ADULTOS} onChange={(v) => set('adultos', v)} />
            <Contador etiqueta="Niños" valor={estado.ninos} min={0} max={MAX_NINOS} onChange={(v) => set('ninos', v)} />
            <MensajeError id="err-adultos" texto={errores.adultos || errores.ninos} />
          </div>
        )}

        {paso === 5 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PASAPORTES.map((o) => <Opcion key={o.value} activa={estado.pasaporte === o.value} onClick={() => set('pasaporte', o.value)}>{o.label}</Opcion>)}
            </div>
            {estado.pasaporte === OTRO && (
              <label className="mt-4 block">
                <span className="viajes-label" style={{ color: 'rgba(11,42,74,0.65)' }}>¿De qué país es tu pasaporte?</span>
                <input type="text" value={estado.pasaporte_otro} onChange={(e) => set('pasaporte_otro', e.target.value)} className="viajes-body mt-2" style={estiloCampo} />
              </label>
            )}
          </>
        )}

        {paso === 6 && (
          <div className="grid grid-cols-2 gap-3" style={{ maxWidth: 420 }}>
            <Opcion activa={estado.visa_usa === 'si'} onClick={() => set('visa_usa', 'si')}>Sí</Opcion>
            <Opcion activa={estado.visa_usa === 'no'} onClick={() => set('visa_usa', 'no')}>No</Opcion>
          </div>
        )}

        {paso === 7 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DIAS_EUROPA.map((d) => <Opcion key={d} activa={estado.dias_europa === d} onClick={() => set('dias_europa', d)}>{d} días</Opcion>)}
          </div>
        )}

        {paso === 8 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CIUDADES_EUROPA.map((o) => {
                const activa = estado.ciudades_europa.includes(o.value)
                const lleno = !activa && estado.ciudades_europa.length >= MAX_CIUDADES
                return (
                  <Opcion
                    key={o.value}
                    activa={activa && !estado.sorprendanme}
                    disabled={estado.sorprendanme || lleno}
                    onClick={() => set('ciudades_europa', multi(estado.ciudades_europa, o.value, MAX_CIUDADES))}
                  >
                    {o.label}
                  </Opcion>
                )
              })}
            </div>
            <div className="mt-3">
              <Opcion activa={estado.sorprendanme} onClick={() => set('sorprendanme', !estado.sorprendanme)}>Sorpréndanme, ustedes saben</Opcion>
            </div>
            <p className="viajes-body mt-3" style={{ fontSize: 14, color: 'rgba(11,42,74,0.65)' }}>
              {estado.sorprendanme ? 'Te armamos la ruta según el plan que escojas.' : `${estado.ciudades_europa.length} de ${MAX_CIUDADES} ciudades`}
            </p>
          </>
        )}

        {paso === 9 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ESTILOS_OPCIONES.map((o) => (
              <Opcion key={o.value} activa={estado.estilo.includes(o.value)} onClick={() => set('estilo', multi(estado.estilo, o.value))}>{o.label}</Opcion>
            ))}
          </div>
        )}

        {paso === 10 && (
          <div className="grid grid-cols-1 gap-4">
            {([
              ['nombre', 'Nombre', 'text', 'name'],
              ['email', 'Correo', 'email', 'email'],
              ['celular', 'Celular (con código de país)', 'tel', 'tel'],
            ] as const).map(([campo, etiqueta, tipo, auto]) => (
              <label key={campo} className="block">
                <span className="viajes-label" style={{ color: 'rgba(11,42,74,0.65)' }}>{etiqueta}</span>
                <input
                  type={tipo}
                  value={estado[campo]}
                  onChange={(e) => set(campo, e.target.value)}
                  autoComplete={auto}
                  inputMode={tipo === 'tel' ? 'tel' : tipo === 'email' ? 'email' : undefined}
                  placeholder={campo === 'celular' ? '+61 4xx xxx xxx' : undefined}
                  className="viajes-body mt-2"
                  style={estiloCampo}
                  aria-invalid={!!errores[campo]}
                  aria-describedby={`err-${campo}`}
                />
                <MensajeError id={`err-${campo}`} texto={errores[campo]} />
              </label>
            ))}
            {/* Honeypot: invisible para personas, fuera del orden de tabulación. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
              <label>
                No llenes este campo
                <input type="text" name={CAMPO_HONEYPOT} tabIndex={-1} autoComplete="off" value={estado[CAMPO_HONEYPOT]} onChange={(e) => set(CAMPO_HONEYPOT, e.target.value)} />
              </label>
            </div>
          </div>
        )}

        {/* Errores de los pasos de selección (los de campos van junto al campo). */}
        {![2, 4, 10].includes(paso) && <MensajeError id="err-paso" texto={actual.campos.map((c) => errores[c]).find(Boolean)} />}
      </div>

      {errorEnvio && (
        <p role="alert" className="viajes-body mt-6" style={{ color: '#B42318', maxWidth: 'none' }}>
          {errorEnvio}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={enviando} className="viajes-cta disabled:opacity-60" style={{ width: '100%', maxWidth: 360 }}>
          {paso < total - 1 ? 'Siguiente' : enviando ? 'Calculando…' : 'Ver mi rango'}
        </button>
        {errorEnvio && (
          <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="viajes-label underline" style={{ color: tinta, padding: '12px 4px' }}>
            Escribir por WhatsApp
          </a>
        )}
      </div>
    </form>
  )
}
