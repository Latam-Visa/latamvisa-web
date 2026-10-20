'use client'
/// <reference types="react-dom/canary" />

import { useState } from 'react'
import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'
import { Eye, EyeOff } from 'lucide-react'
import { crearCuenta, entrar, entrarConGoogle, entrarYActivar, nuevaClave, recuperar, type Estado } from '../acciones'
import { avisoError, avisoOk, btnPrimario, btnSecundario, campo, enlace, etiqueta, foco } from './ui'

function Enviar({ texto, cargando }: { texto: string; cargando: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={btnPrimario}>
      {pending ? cargando : texto}
    </button>
  )
}

function Mensaje({ estado }: { estado: Estado }) {
  if (!estado?.mensaje) return null
  return (
    <p role={estado.ok ? 'status' : 'alert'} className={estado.ok ? avisoOk : avisoError}>
      {estado.mensaje}
    </p>
  )
}

function CampoCorreo({ valor }: { valor?: string }) {
  return (
    <div>
      <label className={etiqueta} htmlFor="email">Correo</label>
      <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={valor} className={campo} placeholder="tu@correo.com" />
    </div>
  )
}

function CampoClave({ nueva, etiquetaTexto = 'Contraseña' }: { nueva?: boolean; etiquetaTexto?: string }) {
  const [ver, setVer] = useState(false)
  return (
    <div>
      <label className={etiqueta} htmlFor="password">{etiquetaTexto}</label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={ver ? 'text' : 'password'}
          autoComplete={nueva ? 'new-password' : 'current-password'}
          minLength={nueva ? 8 : undefined}
          required
          className={`${campo} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVer(!ver)}
          aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className={`absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-lg text-[#0d2b0d]/60 hover:text-[#0d2b0d] ${foco}`}
        >
          {ver ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {nueva && <p className="mt-1.5 text-xs text-[#0d2b0d]/60">Mínimo 8 caracteres.</p>}
    </div>
  )
}

function Separador() {
  return (
    <div className="flex items-center gap-3 text-xs text-[#0d2b0d]/60">
      <span className="h-px flex-1 bg-[#0d2b0d]/10" /> o con tu correo <span className="h-px flex-1 bg-[#0d2b0d]/10" />
    </div>
  )
}

function BotonGoogleInterno() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={btnSecundario}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1c.9-2.8 3.5-4.9 6.6-4.9z" />
      </svg>
      {pending ? 'Abriendo Google…' : 'Continuar con Google'}
    </button>
  )
}

export function BotonGoogle({ siguiente }: { siguiente: string }) {
  return (
    <form action={entrarConGoogle.bind(null, siguiente)}>
      <BotonGoogleInterno />
    </form>
  )
}

/* /activar/[token]: crear cuenta o entrar con una que ya existe. El correo del
   pago viene prellenado pero se puede cambiar: la llave es el token. */
export function FormularioActivar({ token, emailPago, google }: { token: string; emailPago: string; google: boolean }) {
  const [modo, setModo] = useState<'crear' | 'entrar'>('crear')
  const [estadoCrear, accionCrear] = useFormState(crearCuenta.bind(null, token), null)
  const [estadoEntrar, accionEntrar] = useFormState(entrarYActivar.bind(null, token), null)

  if (estadoCrear?.ok) return <Mensaje estado={estadoCrear} />

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Cómo quieres entrar" className="grid grid-cols-2 gap-1 rounded-xl bg-[#0d2b0d]/5 p-1">
        {(['crear', 'entrar'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={modo === m}
            onClick={() => setModo(m)}
            className={`rounded-lg min-h-[44px] text-sm font-semibold ${foco} ${modo === m ? 'bg-white shadow-sm text-[#0d2b0d]' : 'text-[#0d2b0d]/60'}`}
          >
            {m === 'crear' ? 'Crear mi cuenta' : 'Ya tengo cuenta'}
          </button>
        ))}
      </div>

      {google && (
        <>
          <BotonGoogle siguiente={`/activar/${token}/completar`} />
          <Separador />
        </>
      )}

      {modo === 'crear' ? (
        <form key="crear" action={accionCrear} className="space-y-4">
          <div>
            <CampoCorreo valor={emailPago} />
            <p className="mt-1.5 text-xs text-[#0d2b0d]/60">Es el correo con el que pagaste. Puedes cambiarlo si prefieres usar otro.</p>
          </div>
          <CampoClave nueva etiquetaTexto="Crea una contraseña" />
          <Mensaje estado={estadoCrear} />
          <Enviar texto="Crear mi cuenta" cargando="Creando tu cuenta…" />
        </form>
      ) : (
        <form key="entrar" action={accionEntrar} className="space-y-4">
          <CampoCorreo valor={emailPago} />
          <CampoClave />
          <Mensaje estado={estadoEntrar} />
          <Enviar texto="Entrar y continuar" cargando="Entrando…" />
          <p className="text-center text-sm">
            <Link href="/entrar/recuperar" className={enlace}>Olvidé mi contraseña</Link>
          </p>
        </form>
      )}
    </div>
  )
}

export function FormularioEntrar({ google }: { google: boolean }) {
  const [estado, accion] = useFormState(entrar, null)
  return (
    <div className="space-y-5">
      {google && (
        <>
          <BotonGoogle siguiente="/mi-cuenta" />
          <Separador />
        </>
      )}
      <form action={accion} className="space-y-4">
        <CampoCorreo />
        <CampoClave />
        <Mensaje estado={estado} />
        <Enviar texto="Entrar" cargando="Entrando…" />
      </form>
      <p className="text-center text-sm">
        <Link href="/entrar/recuperar" className={enlace}>Olvidé mi contraseña</Link>
      </p>
    </div>
  )
}

export function FormularioRecuperar() {
  const [estado, accion] = useFormState(recuperar, null)
  if (estado?.ok) return <Mensaje estado={estado} />
  return (
    <form action={accion} className="space-y-4">
      <CampoCorreo />
      <Mensaje estado={estado} />
      <Enviar texto="Enviarme el enlace" cargando="Enviando…" />
    </form>
  )
}

export function FormularioNuevaClave() {
  const [estado, accion] = useFormState(nuevaClave, null)
  return (
    <form action={accion} className="space-y-4">
      <CampoClave nueva etiquetaTexto="Nueva contraseña" />
      <Mensaje estado={estado} />
      <Enviar texto="Guardar contraseña" cargando="Guardando…" />
    </form>
  )
}
