'use client'

import { useState, useTransition } from 'react'
import { borrarTodo } from '../actions'
import { btnPeligro, btnSecundario, tarjeta } from './ui'

// Confirmación en la página (nunca window.confirm).
export function BorrarTodo() {
  const [paso, setPaso] = useState<'inicio' | 'confirmar'>('inicio')
  const [error, setError] = useState('')
  const [pendiente, start] = useTransition()
  return (
    <section aria-labelledby="borrar" className={`${tarjeta} p-5 space-y-3 border-red-200`}>
      <h2 id="borrar" className="font-semibold">Borrar todos mis datos</h2>
      <p className="text-sm text-[#0d2b0d]/80">Borra cada número que guardaste y cada archivo que subiste. No se puede deshacer.</p>
      {paso === 'inicio' ? (
        <button type="button" onClick={() => setPaso('confirmar')} className={btnPeligro}>Borrar todos mis datos</button>
      ) : (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Confirmar borrado">
          <span className="text-sm font-semibold">¿Seguro? Se borra todo.</span>
          <button
            type="button"
            disabled={pendiente}
            onClick={() => start(async () => {
              setError('')
              const r = await borrarTodo()
              if (r && !r.ok) setError(r.error)
            })}
            className={btnPeligro}
          >
            {pendiente ? 'Borrando…' : 'Sí, borrar todo'}
          </button>
          <button type="button" disabled={pendiente} onClick={() => setPaso('inicio')} className={btnSecundario}>Cancelar</button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  )
}
