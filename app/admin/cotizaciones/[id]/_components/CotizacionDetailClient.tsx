"use client"

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { Copy, Check, Download, MessageCircle, Ban, CalendarPlus, BadgeCheck, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import {
  PUBLIC_SITE_URL,
  estadoEfectivo,
  formatFecha,
  formatFechaHora,
  formatMoney,
  labelPaisCotizacion,
  type Cotizacion,
} from '@/lib/cotizaciones'
import { anularCotizacion, extenderCotizacion, marcarComisionPagada } from '../../_actions/cotizaciones-actions'
import { EstadoBadge } from '../../_components/EstadoBadge'

const botonSecundario =
  'inline-flex items-center justify-center gap-2 bg-white border border-[#E5E5E5] text-[#0A0A0A] font-medium text-sm px-4 py-2.5 rounded-lg hover:border-[#0A0A0A] transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed'

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[#6B6B6B]">{label}</dt>
      <dd className="text-sm font-semibold text-[#0A0A0A] break-words">{children}</dd>
    </div>
  )
}

export function CotizacionDetailClient({ cot, convenioNombre }: { cot: Cotizacion; convenioNombre: string | null }) {
  const router = useRouter()
  const [pendiente, startTransition] = useTransition()
  const [accion, setAccion] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [qr, setQr] = useState<string | null>(null)

  const link = `${PUBLIC_SITE_URL}/pagar/${cot.token}`
  const estado = estadoEfectivo(cot)
  const fmt = (n: number) => formatMoney(n, cot.moneda)

  useEffect(() => {
    QRCode.toDataURL(link, { width: 640, margin: 2, color: { dark: '#0d2b0d', light: '#FFFFFF' } })
      .then(setQr)
      .catch(() => setQr(null))
  }, [link])

  const mensajeWhatsApp = [
    `Hola ${cot.cliente_nombre}, te compartimos tu cotización ${cot.numero} de LATAM VISA.`,
    `Valor para empezar: ${fmt(cot.monto)}.`,
    `Puedes revisarla y pagar aquí: ${link}`,
  ].join('\n')
  // Sin número: WhatsApp deja elegir el chat (cliente, grupo o el convenio).
  const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensajeWhatsApp)}`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setError('No se pudo copiar. Selecciona el link y cópialo a mano.')
    }
  }

  const ejecutar = (nombre: string, fn: () => Promise<{ success: boolean; error?: string }>) => {
    setError('')
    setAccion(nombre)
    startTransition(async () => {
      const res = await fn()
      if (!res.success) setError(res.error || 'No se pudo completar la acción.')
      setAccion(null)
      router.refresh()
    })
  }

  const anular = () => {
    if (!window.confirm(`¿Anular la cotización ${cot.numero}? El cliente ya no podrá pagarla.`)) return
    ejecutar('anular', () => anularCotizacion(cot.id))
  }

  const icono = (nombre: string, Icon: typeof Ban) =>
    pendiente && accion === nombre ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />

  return (
    <div className="space-y-5">
      {error && (
        <div role="alert" className="bg-[#FEF2F2] border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 break-words">{error}</p>
        </div>
      )}

      {/* Link público */}
      <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#0A0A0A]">Link de pago</h3>
          <EstadoBadge estado={estado} />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Link público de la cotización"
            className="flex-1 min-w-0 bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm font-mono text-[#0A0A0A] min-h-[44px]"
          />
          <button type="button" onClick={copiar} className={botonSecundario}>
            {copiado ? <Check className="w-4 h-4 text-[#2F4A00]" /> : <Copy className="w-4 h-4" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#b8ef00] transition-colors min-h-[48px]"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar por WhatsApp
          </a>
          <a href={link} target="_blank" rel="noopener noreferrer" className={botonSecundario}>
            <ExternalLink className="w-4 h-4" />
            Ver como cliente
          </a>
        </div>

        {qr && (
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <img src={qr} alt={`Código QR de la cotización ${cot.numero}`} className="w-44 h-44 rounded-xl border border-[#E5E5E5]" />
            <a href={qr} download={`cotizacion-${cot.numero.replace('#', '')}.png`} className={botonSecundario}>
              <Download className="w-4 h-4" />
              Descargar QR (PNG)
            </a>
          </div>
        )}
      </section>

      {/* Montos */}
      <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#0A0A0A] mb-4">Montos</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Dato label="Asesoría">{fmt(cot.asesoria_total)}</Dato>
          <Dato label="Traducciones">{fmt(cot.traducciones_total)}</Dato>
          <Dato label="Monto a cobrar">{fmt(cot.monto)}</Dato>
          <Dato label="Gobierno (estimado)">{fmt(cot.gobierno_estimado)}</Dato>
          <Dato label="Total con gobierno">{fmt(cot.monto + cot.gobierno_estimado)}</Dato>
          <Dato label="Moneda">{cot.moneda}</Dato>
        </dl>
      </section>

      {/* Datos y convenio */}
      <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#0A0A0A] mb-4">Detalles</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Dato label="Cliente">{cot.cliente_nombre}</Dato>
          <Dato label="Correo">{cot.cliente_email || '—'}</Dato>
          <Dato label="WhatsApp">{cot.cliente_whatsapp || '—'}</Dato>
          <Dato label="País">{labelPaisCotizacion(cot.pais_destino)}</Dato>
          <Dato label="Personas">{cot.personas}</Dato>
          <Dato label="Convenio">{convenioNombre || 'Directo'}</Dato>
          <Dato label="Comisión">{cot.convenio_id ? fmt(cot.comision_total) : '—'}</Dato>
          <Dato label="Comisión pagada">
            {cot.comision_pagada_el ? formatFechaHora(cot.comision_pagada_el) : cot.convenio_id && cot.estado === 'pagada' ? (
              <span className="text-[#B45309]">Pendiente</span>
            ) : (
              '—'
            )}
          </Dato>
          <Dato label="Creada">{formatFechaHora(cot.created_at)}</Dato>
          <Dato label="Vence">{formatFecha(cot.vence_el)}</Dato>
          <Dato label="Pagada">{cot.pagada_el ? formatFechaHora(cot.pagada_el) : '—'}</Dato>
          {cot.stripe_session_id && <Dato label="Sesión Stripe"><span className="font-mono text-xs">{cot.stripe_session_id}</span></Dato>}
        </dl>
        {cot.notas && (
          <div className="mt-4 rounded-xl bg-[#FAFAF7] border border-[#E5E5E5] p-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">
            {cot.notas}
          </div>
        )}
      </section>

      {/* Acciones */}
      <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#0A0A0A] mb-4">Acciones</h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {cot.estado === 'pendiente' && (
            <button type="button" disabled={pendiente} onClick={() => ejecutar('extender', () => extenderCotizacion(cot.id))} className={botonSecundario}>
              {icono('extender', CalendarPlus)}
              Extender 7 días
            </button>
          )}
          {cot.estado === 'pagada' && cot.convenio_id && !cot.comision_pagada_el && (
            <button type="button" disabled={pendiente} onClick={() => ejecutar('comision', () => marcarComisionPagada(cot.id))} className={botonSecundario}>
              {icono('comision', BadgeCheck)}
              Marcar comisión pagada
            </button>
          )}
          {(cot.estado === 'pendiente' || cot.estado === 'vencida') && (
            <button
              type="button"
              disabled={pendiente}
              onClick={anular}
              className="inline-flex items-center justify-center gap-2 bg-white border border-red-200 text-[#B91C1C] font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-[#FEF2F2] transition-colors min-h-[44px] disabled:opacity-50"
            >
              {icono('anular', Ban)}
              Anular
            </button>
          )}
          {cot.estado === 'anulada' && <p className="text-sm text-[#6B6B6B]">Esta cotización está anulada.</p>}
        </div>
      </section>
    </div>
  )
}
