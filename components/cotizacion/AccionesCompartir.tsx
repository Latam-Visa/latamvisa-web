'use client'

import { useState, useTransition } from 'react'
import { Check, Copy, Download, Loader2, Mail, MessageCircle, Send } from 'lucide-react'
import { EMAIL_RE, linkPago, linkPdf, urlWhatsAppCotizacion, type Cotizacion } from '@/lib/cotizaciones'

export type CotizacionCompartible = Pick<Cotizacion, 'id' | 'numero' | 'token' | 'cliente_nombre' | 'monto' | 'moneda'>
export type EnviarEmail = (cotizacionId: string, email: string) => Promise<{ success: boolean; error?: string; enviadoA?: string }>

const boton =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm px-4 min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const secundario = `${boton} bg-white border border-[#0d2b0d]/15 text-[#0d2b0d] hover:border-[#0d2b0d]`
const primario = `${boton} bg-[#C8FF00] text-[#0d2b0d] hover:bg-[#b8ef00]`

/**
 * Descargar PDF · WhatsApp · Email · Copiar link. `compacto` los muestra en
 * una fila (listas); si no, apilados y a todo el ancho (pantalla de resultado).
 */
export function AccionesCompartir({
  cot,
  enviarEmail,
  emailInicial = '',
  compacto = false,
}: {
  cot: CotizacionCompartible
  enviarEmail: EnviarEmail
  emailInicial?: string
  compacto?: boolean
}) {
  const [copiado, setCopiado] = useState(false)
  const [mostrarEmail, setMostrarEmail] = useState(false)
  const [email, setEmail] = useState(emailInicial)
  const [estadoEmail, setEstadoEmail] = useState<{ ok: boolean; texto: string } | null>(null)
  const [enviando, startTransition] = useTransition()

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(linkPago(cot.token))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      window.prompt('Copia el link:', linkPago(cot.token))
    }
  }

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    setEstadoEmail(null)
    if (!EMAIL_RE.test(email.trim())) return setEstadoEmail({ ok: false, texto: 'Escribe un correo válido.' })
    startTransition(async () => {
      const res = await enviarEmail(cot.id, email.trim())
      setEstadoEmail(res.success ? { ok: true, texto: `Enviado a ${res.enviadoA ?? email.trim()}` } : { ok: false, texto: res.error || 'No se pudo enviar.' })
    })
  }

  const ancho = compacto ? '' : 'w-full'

  return (
    <div className="space-y-3">
      <div className={compacto ? 'flex flex-wrap gap-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-2'}>
        <a href={linkPdf(cot.token)} download className={`${compacto ? secundario : primario} ${ancho}`}>
          <Download className="w-4 h-4" />
          {compacto ? 'PDF' : 'Descargar PDF'}
        </a>
        <a href={urlWhatsAppCotizacion(cot)} target="_blank" rel="noopener noreferrer" className={`${secundario} ${ancho}`}>
          <MessageCircle className="w-4 h-4" />
          {compacto ? 'WhatsApp' : 'Enviar por WhatsApp'}
        </a>
        <button type="button" onClick={() => setMostrarEmail((v) => !v)} aria-expanded={mostrarEmail} className={`${secundario} ${ancho}`}>
          <Mail className="w-4 h-4" />
          {compacto ? 'Email' : 'Enviar por email'}
        </button>
        <button type="button" onClick={copiar} className={`${secundario} ${ancho}`}>
          {copiado ? <Check className="w-4 h-4 text-[#2F4A00]" /> : <Copy className="w-4 h-4" />}
          {copiado ? 'Copiado' : compacto ? 'Copiar link' : 'Copiar link de pago'}
        </button>
      </div>

      {mostrarEmail && (
        <form onSubmit={enviar} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@cliente.com"
            aria-label="Correo del cliente"
            disabled={enviando}
            className="flex-1 min-w-0 bg-white border border-[#0d2b0d]/15 rounded-xl px-4 min-h-[48px] text-base sm:text-sm text-[#0d2b0d] focus:outline-none focus:border-[#2F4A00] focus:ring-1 focus:ring-[#2F4A00]"
          />
          <button type="submit" disabled={enviando} className={primario}>
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      )}
      {estadoEmail && (
        <p role="status" className={`text-sm ${estadoEmail.ok ? 'text-[#2F4A00] font-semibold' : 'text-red-700'}`}>
          {estadoEmail.texto}
        </p>
      )}
    </div>
  )
}
