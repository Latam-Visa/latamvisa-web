"use client"

import { useEffect, useState } from 'react'
import { ENVIO_AUD, MAX_CANTIDAD, VENTA_ABIERTA, precio } from '@/lib/bandanas/config'

export function Comprar({ productId, price }: { productId: string; price: number }) {
  const [cantidad, setCantidad] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Al volver con "atrás" desde Stripe el navegador restaura la página tal cual.
  useEffect(() => {
    const volver = () => setCargando(false)
    window.addEventListener('pageshow', volver)
    return () => window.removeEventListener('pageshow', volver)
  }, [])

  const preordenar = async () => {
    setCargando(true)
    setError('')
    try {
      const r = await fetch('/api/bandanas/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: cantidad }),
      })
      const data = await r.json()
      if (!r.ok || !data.url) throw new Error(data.error)
      window.location.href = data.url
    } catch (e) {
      setError((e as Error).message || 'No pudimos abrir el pago. Intenta de nuevo.')
      setCargando(false)
    }
  }

  const paso = 'h-12 w-12 text-xl disabled:opacity-30'
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase tracking-[0.15em]">Cantidad</span>
        <div className="flex items-center border border-black">
          <button className={paso} disabled={cantidad <= 1} onClick={() => setCantidad(cantidad - 1)} aria-label="Quitar una">−</button>
          <span aria-live="polite" className="w-10 text-center font-bold">{cantidad}</span>
          <button className={paso} disabled={cantidad >= MAX_CANTIDAD} onClick={() => setCantidad(cantidad + 1)} aria-label="Agregar una">+</button>
        </div>
      </div>
      <button onClick={preordenar} disabled={!VENTA_ABIERTA || cargando}
        className="mt-5 flex w-full items-center justify-between bg-black px-6 py-4 text-[15px] font-bold uppercase tracking-[0.1em] text-white disabled:bg-black/40">
        <span>{!VENTA_ABIERTA ? 'Preventa abre pronto' : cargando ? 'Abriendo pago…' : 'Preordenar'}</span>
        <span>{precio(price * cantidad)}</span>
      </button>
      <p className="mt-3 text-[12px] text-black/60">
        {ENVIO_AUD === null ? 'Envío aparte, solo dentro de Australia.' : `Envío ${ENVIO_AUD === 0 ? 'gratis' : precio(ENVIO_AUD)} (aparte), solo dentro de Australia.`} Pago seguro con Stripe.
      </p>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{error}</p>}
    </div>
  )
}
