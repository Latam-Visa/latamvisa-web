'use client'

import { useMemo, useState, useTransition } from 'react'
import { AlertCircle, Loader2, Minus, Plus, RotateCcw } from 'lucide-react'
import {
  MAX_PERSONAS,
  calcularMontos,
  formatMoney,
  labelPaisOrigen,
  labelVisa,
  type ConvenioTarifa,
  type Montos,
} from '@/lib/cotizaciones'
import { AccionesCompartir, type EnviarEmail } from './AccionesCompartir'

export interface GenerarPayload {
  tipo_visa: string
  pais_destino: string
  pais_origen: string
  personas: number
  tiene_visa_usa: boolean
  cliente_nombre: string
  // Solo admin: el portal los ignora en el servidor.
  convenio_id?: string | null
  ajustes?: Partial<Montos> | null
}

export interface ResultadoGenerar {
  success: boolean
  error?: string
  cotizacion?: {
    id: string
    numero: string
    token: string
    cliente_nombre: string | null
    monto: number
    moneda: string
    comision_total: number | null
  }
}

export interface ConvenioOpcion {
  id: string
  nombre: string
  comision_por_persona: number
}

const DIRECTO = ''
const CAMPOS_MONTO: { key: keyof Montos; label: string }[] = [
  { key: 'asesoria_total', label: 'Asesoría (total)' },
  { key: 'traducciones_total', label: 'Traducciones (total)' },
  { key: 'gobierno_estimado', label: 'Gobierno (estimado, no se cobra)' },
  { key: 'comision_total', label: 'Comisión del convenio' },
]

const campo =
  'w-full bg-white border border-[#0d2b0d]/15 text-[#0d2b0d] rounded-xl px-4 min-h-[52px] text-base focus:outline-none focus:border-[#2F4A00] focus:ring-1 focus:ring-[#2F4A00] disabled:opacity-60'
const etiqueta = 'block text-sm font-semibold text-[#0d2b0d] mb-2'

const claveVisa = (t: Pick<ConvenioTarifa, 'tipo_visa' | 'pais_destino'>) => `${t.tipo_visa}|${t.pais_destino}`

/**
 * Generador de cotizaciones. Lo usan el admin (modo 'admin': elige convenio o
 * "Directo" y puede ajustar montos) y el portal de convenios (modo
 * 'convenio': solo las 4 entradas; el convenio lo pone el servidor).
 */
export function GeneradorCotizacion({
  modo,
  tarifas,
  convenios = [],
  generar,
  enviarEmail,
}: {
  modo: 'admin' | 'convenio'
  tarifas: ConvenioTarifa[]
  convenios?: ConvenioOpcion[]
  generar: (payload: GenerarPayload) => Promise<ResultadoGenerar>
  enviarEmail: EnviarEmail
}) {
  const esAdmin = modo === 'admin'
  const [convenioId, setConvenioId] = useState<string>(esAdmin ? convenios[0]?.id ?? DIRECTO : '')
  const esDirecto = esAdmin && convenioId === DIRECTO

  // Directo no tiene tarifas propias: ofrece las combinaciones que existen.
  const tarifasConvenio = useMemo(
    () => (esAdmin && !esDirecto ? tarifas.filter((t) => t.convenio_id === convenioId) : tarifas),
    [tarifas, convenioId, esAdmin, esDirecto],
  )
  const visas = useMemo(() => {
    const vistas = new Map<string, { value: string; label: string }>()
    for (const t of tarifasConvenio) vistas.set(claveVisa(t), { value: claveVisa(t), label: labelVisa(t.tipo_visa, t.pais_destino) })
    return Array.from(vistas.values())
  }, [tarifasConvenio])

  const [visa, setVisa] = useState(visas[0]?.value ?? '')
  const visaActual = visas.some((v) => v.value === visa) ? visa : visas[0]?.value ?? ''
  const origenes = useMemo(
    () => Array.from(new Set(tarifasConvenio.filter((t) => claveVisa(t) === visaActual).map((t) => t.pais_origen))),
    [tarifasConvenio, visaActual],
  )
  const [origen, setOrigen] = useState(origenes[0] ?? '')
  const origenActual = origenes.includes(origen) ? origen : origenes[0] ?? ''

  const [personas, setPersonas] = useState(1)
  const [visaUsa, setVisaUsa] = useState<boolean | null>(null)
  const [nombre, setNombre] = useState('')
  const [ajustar, setAjustar] = useState(false)
  const [montos, setMontos] = useState<Record<keyof Montos, string>>({
    asesoria_total: '',
    traducciones_total: '',
    gobierno_estimado: '',
    comision_total: '',
  })

  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<ResultadoGenerar['cotizacion'] | null>(null)
  const [pendiente, startTransition] = useTransition()

  const [tipo, destino] = visaActual.split('|')
  const tarifa = tarifasConvenio.find((t) => claveVisa(t) === visaActual && t.pais_origen === origenActual) ?? null
  const convenio = convenios.find((c) => c.id === convenioId) ?? null

  // Vista previa (admin). El servidor vuelve a calcular todo.
  const sugeridos = esAdmin && !esDirecto && tarifa && convenio ? calcularMontos(personas, tarifa, convenio.comision_por_persona) : null
  const verMontos = esAdmin && (ajustar || esDirecto)

  const abrirAjustes = (abrir: boolean) => {
    setAjustar(abrir)
    if (abrir && sugeridos) {
      setMontos({
        asesoria_total: String(sugeridos.asesoria_total),
        traducciones_total: String(sugeridos.traducciones_total),
        gobierno_estimado: String(sugeridos.gobierno_estimado),
        comision_total: String(sugeridos.comision_total),
      })
    }
  }

  const numero = (v: string) => (v.replace(/\D/g, '') ? Number(v.replace(/\D/g, '')) : null)

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!visaActual || !origenActual) return setError('No hay visas con tarifa disponibles.')
    if (visaUsa === null) return setError('Indica si tienen visa americana aprobada.')

    const payload: GenerarPayload = {
      tipo_visa: tipo,
      pais_destino: destino,
      pais_origen: origenActual,
      personas,
      tiene_visa_usa: visaUsa,
      cliente_nombre: nombre,
      ...(esAdmin && {
        convenio_id: esDirecto ? null : convenioId,
        ajustes: verMontos
          ? {
              asesoria_total: numero(montos.asesoria_total) ?? undefined,
              traducciones_total: numero(montos.traducciones_total) ?? undefined,
              gobierno_estimado: numero(montos.gobierno_estimado) ?? undefined,
              comision_total: esDirecto ? 0 : numero(montos.comision_total) ?? undefined,
            }
          : null,
      }),
    }

    startTransition(async () => {
      const res = await generar(payload)
      if (!res.success || !res.cotizacion) return setError(res.error || 'No pudimos generar la cotización.')
      setResultado(res.cotizacion)
    })
  }

  const nueva = () => {
    setResultado(null)
    setNombre('')
    setVisaUsa(null)
    setPersonas(1)
    setAjustar(false)
    setError('')
  }

  if (resultado) {
    return (
      <section className="bg-white rounded-2xl border border-[#0d2b0d]/10 p-5 sm:p-6 space-y-5">
        <div>
          <span className="inline-block bg-[#C8FF00] text-[#0d2b0d] font-bold text-xs tracking-[0.15em] uppercase px-3 py-1 rounded-md">Lista</span>
          <h2 className="mt-3 font-monument font-black text-xl sm:text-2xl uppercase text-[#0d2b0d]">
            Cotización {resultado.numero} lista
          </h2>
          {resultado.cliente_nombre && <p className="text-sm text-[#0d2b0d]/70 mt-1 break-words">{resultado.cliente_nombre}</p>}
          <p className="mt-3 text-base text-[#0d2b0d]">
            Para empezar: <span className="font-bold text-2xl tabular-nums">{formatMoney(resultado.monto, resultado.moneda)}</span>
          </p>
        </div>

        {resultado.comision_total != null && (
          <div className="rounded-xl bg-[#0d2b0d] text-[#FAFAF7] p-4 text-sm sm:text-base font-semibold">
            💰 Si esta venta se cierra, ganas {formatMoney(resultado.comision_total, resultado.moneda)} de comisión.
          </div>
        )}

        <AccionesCompartir cot={{ ...resultado }} enviarEmail={enviarEmail} />

        <button
          type="button"
          onClick={nueva}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] text-sm font-bold text-[#2F4A00] hover:bg-[#0d2b0d]/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Nueva cotización
        </button>
      </section>
    )
  }

  return (
    <form onSubmit={enviar} className="bg-white rounded-2xl border border-[#0d2b0d]/10 p-5 sm:p-6 space-y-6">
      {esAdmin && (
        <div>
          <label htmlFor="g-convenio" className={etiqueta}>Convenio</label>
          <select id="g-convenio" value={convenioId} onChange={(e) => setConvenioId(e.target.value)} disabled={pendiente} className={campo}>
            {convenios.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
            <option value={DIRECTO}>Directo (sin convenio)</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="g-visa" className={etiqueta}>1. Visa</label>
        <select id="g-visa" value={visaActual} onChange={(e) => setVisa(e.target.value)} disabled={pendiente || visas.length === 0} className={campo}>
          {visas.length === 0 && <option value="">Sin tarifas configuradas</option>}
          {visas.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="g-origen" className={etiqueta}>2. País desde donde aplica</label>
        <select id="g-origen" value={origenActual} onChange={(e) => setOrigen(e.target.value)} disabled={pendiente || origenes.length === 0} className={campo}>
          {origenes.map((o) => (
            <option key={o} value={o}>{labelPaisOrigen(o)}</option>
          ))}
        </select>
      </div>

      <div>
        <span id="g-personas-label" className={etiqueta}>3. Cantidad de personas</span>
        <div className="flex items-center gap-3" role="group" aria-labelledby="g-personas-label">
          <button
            type="button"
            onClick={() => setPersonas((p) => Math.max(1, p - 1))}
            disabled={pendiente || personas <= 1}
            aria-label="Una persona menos"
            className="w-14 h-14 shrink-0 rounded-xl border border-[#0d2b0d]/15 bg-white flex items-center justify-center text-[#0d2b0d] disabled:opacity-40"
          >
            <Minus className="w-5 h-5" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_PERSONAS}
            value={personas}
            onChange={(e) => setPersonas(Math.min(MAX_PERSONAS, Math.max(1, Math.trunc(Number(e.target.value) || 1))))}
            aria-label="Cantidad de personas"
            disabled={pendiente}
            className={`${campo} text-center text-xl font-bold tabular-nums`}
          />
          <button
            type="button"
            onClick={() => setPersonas((p) => Math.min(MAX_PERSONAS, p + 1))}
            disabled={pendiente || personas >= MAX_PERSONAS}
            aria-label="Una persona más"
            className="w-14 h-14 shrink-0 rounded-xl border border-[#0d2b0d]/15 bg-white flex items-center justify-center text-[#0d2b0d] disabled:opacity-40"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <fieldset>
        <legend className={etiqueta}>4. ¿Tienen visa americana aprobada?</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: true, label: 'Sí' },
            { v: false, label: 'No' },
          ].map((op) => (
            <button
              key={op.label}
              type="button"
              onClick={() => setVisaUsa(op.v)}
              aria-pressed={visaUsa === op.v}
              disabled={pendiente}
              className={`min-h-[52px] rounded-xl border text-base font-bold transition-colors ${
                visaUsa === op.v ? 'bg-[#C8FF00] border-[#0d2b0d] text-[#0d2b0d]' : 'bg-white border-[#0d2b0d]/15 text-[#0d2b0d]'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="g-nombre" className={etiqueta}>
          Nombre del cliente <span className="font-normal text-[#0d2b0d]/50">(opcional)</span>
        </label>
        <input
          id="g-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={pendiente}
          autoComplete="off"
          maxLength={120}
          placeholder="Ej. Familia Restrepo"
          className={campo}
        />
      </div>

      {esAdmin && (
        <div className="rounded-xl border border-dashed border-[#0d2b0d]/20 p-4 space-y-4">
          {esDirecto ? (
            <p className="text-sm font-semibold text-[#0d2b0d]">Montos de la cotización directa</p>
          ) : (
            <label className="flex items-center gap-3 text-sm font-semibold text-[#0d2b0d] cursor-pointer">
              <input type="checkbox" checked={ajustar} onChange={(e) => abrirAjustes(e.target.checked)} className="w-5 h-5 accent-[#2F4A00]" />
              Ajustar montos manualmente
            </label>
          )}
          {!verMontos && sugeridos && (
            <p className="text-sm text-[#0d2b0d]/70">
              Según la tarifa: {formatMoney(sugeridos.asesoria_total + sugeridos.traducciones_total, tarifa?.moneda)} a cobrar · comisión{' '}
              {formatMoney(sugeridos.comision_total, tarifa?.moneda)}
            </p>
          )}
          {verMontos && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CAMPOS_MONTO.filter((c) => !(esDirecto && c.key === 'comision_total')).map((c) => (
                <div key={c.key}>
                  <label htmlFor={`g-${c.key}`} className="block text-xs font-semibold text-[#0d2b0d] mb-1">{c.label}</label>
                  <input
                    id={`g-${c.key}`}
                    inputMode="numeric"
                    value={montos[c.key] ? Number(montos[c.key]).toLocaleString('es-CO') : ''}
                    onChange={(e) => setMontos((m) => ({ ...m, [c.key]: e.target.value.replace(/\D/g, '') }))}
                    disabled={pendiente}
                    placeholder="0"
                    className={`${campo} tabular-nums`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pendiente || visas.length === 0}
        className="w-full min-h-[56px] rounded-xl bg-[#C8FF00] text-[#0d2b0d] font-monument uppercase text-sm sm:text-base tracking-wide hover:bg-[#b8ef00] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {pendiente && <Loader2 className="w-5 h-5 animate-spin" />}
        {pendiente ? 'Generando…' : 'Generar cotización'}
      </button>
    </form>
  )
}
