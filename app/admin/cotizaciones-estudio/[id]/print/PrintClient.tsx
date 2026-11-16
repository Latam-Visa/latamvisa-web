"use client"

import { useEffect, useRef } from 'react'
import type { QuoteBody } from '@/lib/cotizaciones-estudio'

// Pide el HTML real a /api/quote-html (mismo diseño del PDF), reemplaza el
// documento con él y dispara la impresión. La plantilla ya trae
// `@page { size:A4 landscape }`, así que sale horizontal sin pdf.co.
export function PrintClient({ body }: { body: QuoteBody }) {
  const hecho = useRef(false)

  useEffect(() => {
    if (hecho.current) return
    hecho.current = true
    ;(async () => {
      try {
        const res = await fetch('/api/quote-html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const html = await res.text()
        document.open()
        document.write(html)
        document.close()
        // Espera breve a que carguen fuentes e imágenes embebidas.
        setTimeout(() => window.print(), 650)
      } catch {
        document.body.innerHTML = '<p style="font-family:sans-serif;padding:24px">No pudimos generar el PDF. Cierra esta pestaña e inténtalo de nuevo.</p>'
      }
    })()
  }, [body])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24, color: '#2F4A00' }}>
      Generando PDF…
    </div>
  )
}
