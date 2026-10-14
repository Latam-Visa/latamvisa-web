// Formato de dinero y fechas para Finanzas (pantalla y texto para el análisis).
// Montos: "$1.200" o "$1.200,50" (agrupación es-CO, moneda del perfil).

import type { Fecha } from '@/lib/deadlines/dates'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function dinero(n: number): string {
  const decimales = Math.round(Math.abs(n) * 100) % 100 !== 0
  const texto = Math.abs(n).toLocaleString('es-CO', {
    minimumFractionDigits: decimales ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return `${n < 0 ? '-' : ''}$${texto}`
}

// "19 oct"
export function fechaCorta(f: Fecha): string {
  const [, m, d] = f.split('-').map(Number)
  return `${d} ${MESES[m - 1]}`
}

// "lunes 19 oct"
export function fechaLarga(f: Fecha): string {
  const dia = new Date(`${f}T00:00:00Z`).getUTCDay()
  return `${DIAS[dia]} ${fechaCorta(f)}`
}
