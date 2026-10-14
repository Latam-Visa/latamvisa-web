'use client'
/// <reference types="react-dom/canary" />

import { useFormState, useFormStatus } from 'react-dom'
import { crearPerfil } from '../actions'
import { btnPrimario, campo, etiqueta, foco, tarjeta, titulo } from './ui'

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${btnPrimario} w-full`}>
      {pending ? 'Creando…' : 'Acepto, empecemos'}
    </button>
  )
}

export function Consentimiento({ nombreSugerido }: { nombreSugerido: string }) {
  const [estado, accion] = useFormState(crearPerfil, null)
  return (
    <form action={accion} className="space-y-6">
      <h1 className={`${titulo} text-xl sm:text-2xl`}>Antes de empezar</h1>
      <div className={`${tarjeta} p-5 space-y-4 text-[15px] leading-relaxed`}>
        <section>
          <h2 className="font-semibold">Qué guardamos</h2>
          <p>Lo que tú nos cuentes: ingresos, gastos, deudas, saldos y tu meta. Con eso armamos tu plan.</p>
        </section>
        <section>
          <h2 className="font-semibold">Tus archivos</h2>
          <p>Si subes pantallazos o extractos, los leemos para sacar los números. El archivo se borra apenas confirmas lo que encontramos, y en todo caso a los 7 días.</p>
        </section>
        <section>
          <h2 className="font-semibold">Quién lo ve</h2>
          <p>Solo tú. Nadie más del equipo puede ver tus datos, ni siquiera quien administra la página.</p>
        </section>
        <section>
          <h2 className="font-semibold">Cómo borrar todo</h2>
          <p>En Ajustes tienes el botón “Borrar todos mis datos”: borra cada número y cada archivo, sin dejar copia.</p>
        </section>
      </div>
      <label className="block">
        <span className={etiqueta}>¿Cómo te llamamos?</span>
        <input name="display_name" defaultValue={nombreSugerido} maxLength={80} className={campo} />
      </label>
      <label className="flex items-start gap-3 min-h-[44px] cursor-pointer">
        <input type="checkbox" name="acepto" value="si" required className={`mt-1 w-5 h-5 accent-[#2F4A00] ${foco}`} />
        <span className="text-sm">Entiendo qué se guarda, que los archivos se borran después del análisis y que puedo borrar todo cuando quiera.</span>
      </label>
      {estado?.error && <p role="alert" className="text-sm text-red-700">{estado.error}</p>}
      <Boton />
    </form>
  )
}
