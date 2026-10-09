'use client'
/// <reference types="react-dom/canary" />

import { useFormState, useFormStatus } from 'react-dom'
import { Lock } from 'lucide-react'
import { desbloquearDeadlines } from '../actions'
import { btnPrimario, campo, tarjeta } from './ui'

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${btnPrimario} w-full min-h-[48px]`}>
      {pending ? 'Verificando…' : 'Desbloquear'}
    </button>
  )
}

// Pantalla de candado: sin la cookie de desbloqueo nunca se muestran datos.
export function UnlockScreen() {
  const [estado, accion] = useFormState(desbloquearDeadlines, null)

  return (
    <div className="max-w-sm mx-auto w-full py-10">
      <form action={accion} className={`${tarjeta} p-6 space-y-4`}>
        <div className="w-11 h-11 rounded-xl bg-[#FAFAF7] border border-[#0d2b0d]/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-[#2F4A00]" />
        </div>
        <div>
          <h1 className="font-monument text-lg uppercase text-[#0d2b0d]">Deadlines</h1>
          <p className="text-sm text-[#0d2b0d]/70 mt-1">Planner privado. Escribe tu contraseña de dueño.</p>
        </div>
        <label className="block text-xs font-semibold text-[#0d2b0d]">
          Contraseña
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            autoFocus
            aria-invalid={Boolean(estado?.error)}
            aria-describedby={estado?.error ? 'error-desbloqueo' : undefined}
            className={`${campo} mt-1`}
          />
        </label>
        {estado?.error && (
          <p id="error-desbloqueo" role="alert" className="text-sm text-red-700">
            {estado.error}
          </p>
        )}
        <Boton />
      </form>
    </div>
  )
}
