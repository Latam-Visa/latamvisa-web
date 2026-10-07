"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import {
  PAISES_COTIZACION,
  calcularMontos,
  formatMoney,
  type ConvenioTarifa,
} from '@/lib/cotizaciones'
import { crearCotizacion } from '../../_actions/cotizaciones-actions'

interface ConvenioOpcion {
  id: string
  nombre: string
  comision_por_persona: number
}

type CampoMonto = 'asesoria_total' | 'traducciones_total' | 'gobierno_estimado' | 'comision_total'

const MONTOS_VACIOS: Record<CampoMonto, string> = {
  asesoria_total: '',
  traducciones_total: '',
  gobierno_estimado: '',
  comision_total: '',
}

const inputClase =
  'w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2.5 text-base sm:text-sm min-h-[48px] sm:min-h-[44px] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] disabled:opacity-60'

// Acepta "1.850.000", "1850000" o "$ 1 850 000".
function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function aNumero(valor: string): number | null {
  const d = soloDigitos(valor)
  return d ? Number(d) : null
}

export function NuevaCotizacionClient({
  convenios,
  tarifas,
}: {
  convenios: ConvenioOpcion[]
  tarifas: ConvenioTarifa[]
}) {
  const router = useRouter()

  const [convenioId, setConvenioId] = useState(convenios[0]?.id ?? '')
  const [pais, setPais] = useState<string>('canada')
  const [personas, setPersonas] = useState('')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [vigencia, setVigencia] = useState('7')
  const [notas, setNotas] = useState('')
  const [montos, setMontos] = useState(MONTOS_VACIOS)

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const convenio = convenios.find((c) => c.id === convenioId) ?? null
  const tarifa = useMemo(
    () => tarifas.find((t) => t.convenio_id === convenioId && t.pais_destino === pais) ?? null,
    [tarifas, convenioId, pais],
  )
  const nPersonas = Number(personas) || 0
  const sinTarifa = Boolean(convenio && nPersonas > 0 && !tarifa)

  // Precarga: cada vez que cambian convenio, país o personas se recalculan los
  // montos desde la tarifa. Siguen siendo editables.
  useEffect(() => {
    if (!convenio || !tarifa || nPersonas < 1) return
    const m = calcularMontos(nPersonas, tarifa, convenio.comision_por_persona)
    setMontos({
      asesoria_total: String(m.asesoria_total),
      traducciones_total: String(m.traducciones_total),
      gobierno_estimado: String(m.gobierno_estimado),
      comision_total: String(m.comision_total),
    })
  }, [convenio, tarifa, nPersonas])

  const moneda = tarifa?.moneda || 'COP'
  const totalCobro = (aNumero(montos.asesoria_total) ?? 0) + (aNumero(montos.traducciones_total) ?? 0)

  const setMonto = (campo: CampoMonto, valor: string) => setMontos((prev) => ({ ...prev, [campo]: soloDigitos(valor) }))

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) return setError('Escribe el nombre del cliente.')
    if (nPersonas < 1) return setError('Indica el número de personas.')
    if (totalCobro <= 0) return setError('Ingresa el valor de la asesoría.')

    setGuardando(true)
    const res = await crearCotizacion({
      convenio_id: convenioId || null,
      pais_destino: pais,
      personas: nPersonas,
      cliente_nombre: nombre,
      cliente_email: email,
      cliente_whatsapp: whatsapp,
      vigencia_dias: Number(vigencia) || 7,
      notas,
      asesoria_total: aNumero(montos.asesoria_total),
      traducciones_total: aNumero(montos.traducciones_total),
      gobierno_estimado: aNumero(montos.gobierno_estimado),
      comision_total: convenioId ? aNumero(montos.comision_total) : 0,
    })

    if (!res.success || !res.id) {
      setGuardando(false)
      return setError(res.error || 'No pudimos crear la cotización.')
    }

    router.push(`/admin/cotizaciones/${res.id}`)
  }

  const campoMonto = (campo: CampoMonto, label: string, ayuda?: string) => (
    <div>
      <label htmlFor={campo} className="block text-sm font-medium text-[#0A0A0A] mb-1.5">{label}</label>
      <input
        id={campo}
        inputMode="numeric"
        value={montos[campo] ? Number(montos[campo]).toLocaleString('es-CO') : ''}
        onChange={(e) => setMonto(campo, e.target.value)}
        disabled={guardando}
        placeholder="0"
        className={`${inputClase} tabular-nums`}
      />
      {ayuda && <p className="text-xs text-[#6B6B6B] mt-1">{ayuda}</p>}
    </div>
  )

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="convenio" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Convenio</label>
            <select id="convenio" value={convenioId} onChange={(e) => setConvenioId(e.target.value)} disabled={guardando} className={inputClase}>
              {convenios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
              <option value="">Directo</option>
            </select>
          </div>
          <div>
            <label htmlFor="pais" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">País de destino</label>
            <select id="pais" value={pais} onChange={(e) => setPais(e.target.value)} disabled={guardando} className={inputClase}>
              {PAISES_COTIZACION.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 items-end">
          <div>
            <label htmlFor="personas" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
              Personas <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="personas"
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              value={personas}
              onChange={(e) => setPersonas(e.target.value)}
              disabled={guardando}
              required
              placeholder="4"
              className={inputClase}
            />
          </div>
          <div>
            <label htmlFor="vigencia" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Vigencia (días)</label>
            <input
              id="vigencia"
              type="number"
              inputMode="numeric"
              min={1}
              max={90}
              value={vigencia}
              onChange={(e) => setVigencia(e.target.value)}
              disabled={guardando}
              className={inputClase}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 space-y-5">
        <h3 className="text-sm font-bold text-[#0A0A0A]">Cliente</h3>
        <div>
          <label htmlFor="cliente_nombre" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Nombre <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="cliente_nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={guardando}
            required
            autoComplete="off"
            placeholder="Ej. Familia Restrepo"
            className={inputClase}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="cliente_email" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
              Correo <span className="text-[#A3A3A3] font-normal">(opcional)</span>
            </label>
            <input
              id="cliente_email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={guardando}
              autoComplete="off"
              placeholder="cliente@email.com"
              className={inputClase}
            />
          </div>
          <div>
            <label htmlFor="cliente_whatsapp" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
              WhatsApp <span className="text-[#A3A3A3] font-normal">(opcional)</span>
            </label>
            <input
              id="cliente_whatsapp"
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={guardando}
              autoComplete="off"
              placeholder="+57 300 000 0000"
              className={inputClase}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 space-y-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-bold text-[#0A0A0A]">Montos ({moneda})</h3>
          {tarifa && nPersonas > 0 && <span className="text-xs text-[#2F4A00] font-medium">Precargados de la tarifa</span>}
        </div>

        {sinTarifa && (
          <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-3 flex gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {convenio?.nombre} no tiene tarifa para este país. Ingresa los valores a mano.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {campoMonto('asesoria_total', 'Asesoría (total)')}
          {campoMonto('traducciones_total', 'Traducciones (total)')}
          {campoMonto('gobierno_estimado', 'Gobierno (estimado)', 'Informativo: no se cobra en el link.')}
          {convenioId && campoMonto('comision_total', 'Comisión del convenio', 'Interna: el cliente no la ve.')}
        </div>

        <div className="rounded-xl bg-[#0d2b0d] text-[#FAFAF7] p-4 flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wider text-[#FAFAF7]/70">Total a cobrar</span>
          <span className="text-xl font-bold tabular-nums">{formatMoney(totalCobro, moneda)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
        <label htmlFor="notas" className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
          Notas internas <span className="text-[#A3A3A3] font-normal">(opcional)</span>
        </label>
        <textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          disabled={guardando}
          rows={3}
          placeholder="Solo para el equipo. El cliente no las ve."
          className={`${inputClase} resize-none min-h-0`}
        />
      </div>

      {error && (
        <div role="alert" className="bg-[#FEF2F2] border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 break-words">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-5 py-3 rounded-lg hover:bg-[#b8ef00] transition-colors min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {guardando ? 'Creando cotización…' : 'Crear cotización'}
      </button>
    </form>
  )
}
