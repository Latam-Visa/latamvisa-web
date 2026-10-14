'use client'
/// <reference types="react-dom/canary" />

import { useFormState, useFormStatus } from 'react-dom'
import { Mail } from 'lucide-react'
import { entrarConEmail, entrarConGoogle } from '../actions'
import { btnPrimario, btnSecundario, campo, etiqueta, tarjeta } from './ui'

function Enviar({ texto, cargando }: { texto: string; cargando: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${btnSecundario} w-full`}>
      <Mail className="w-4 h-4" />
      {pending ? cargando : texto}
    </button>
  )
}

// Sin Google, el enlace mágico es el botón principal.
function EnviarPrincipal() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${btnPrimario} w-full`}>
      <Mail className="w-4 h-4" />
      {pending ? 'Enviando…' : 'Enviarme un enlace para entrar'}
    </button>
  )
}

function Google() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${btnPrimario} w-full`}>
      {pending ? 'Abriendo Google…' : 'Entrar con Google'}
    </button>
  )
}

// Apagado por defecto: el piloto entra solo con enlace mágico.
const GOOGLE = process.env.NEXT_PUBLIC_FINANZAS_GOOGLE === 'on'

export function Entrar() {
  const [estado, enviarEnlace] = useFormState(entrarConEmail, null)
  return (
    <div className={`${tarjeta} p-5 space-y-4`}>
      {GOOGLE && (
        <>
          <form action={entrarConGoogle}>
            <Google />
          </form>
          <div className="flex items-center gap-3 text-xs text-[#0d2b0d]/60">
            <span className="h-px flex-1 bg-[#0d2b0d]/10" /> o con tu correo <span className="h-px flex-1 bg-[#0d2b0d]/10" />
          </div>
        </>
      )}
      <form action={enviarEnlace} className="space-y-3">
        <label className={etiqueta} htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required className={campo} placeholder="tu@correo.com" />
        {GOOGLE ? (
          <Enviar texto="Enviarme un enlace para entrar" cargando="Enviando…" />
        ) : (
          <EnviarPrincipal />
        )}
        {estado?.mensaje && (
          <p role="status" className={`text-sm ${estado.ok ? 'text-[#2F4A00] font-semibold' : 'text-red-700'}`}>
            {estado.mensaje}
          </p>
        )}
      </form>
    </div>
  )
}
