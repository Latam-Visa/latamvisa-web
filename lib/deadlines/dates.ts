// Fechas del planner. "Hoy" es siempre Australia/Brisbane (UTC+10, sin
// horario de verano), nunca la fecha UTC del servidor. Las fechas viajan y
// se comparan como texto 'YYYY-MM-DD'; la aritmética se hace en UTC para
// no depender de la zona del servidor. Las semanas empiezan el lunes.

export type Fecha = string // 'YYYY-MM-DD'

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const DIAS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

export function esFecha(v: unknown): v is Fecha {
  if (typeof v !== 'string' || !FECHA_RE.test(v)) return false
  return aFecha(v) === v
}

function aUTC(f: Fecha): Date {
  const [y, m, d] = f.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function aFecha(d: Date | string): Fecha {
  const date = typeof d === 'string' ? aUTC(d) : d
  return date.toISOString().slice(0, 10)
}

export function todayBrisbane(ahora = new Date()): Fecha {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Brisbane' }).format(ahora)
}

export function addDays(f: Fecha, n: number): Fecha {
  const d = aUTC(f)
  d.setUTCDate(d.getUTCDate() + n)
  return aFecha(d)
}

// 0 = lunes … 6 = domingo
export function indiceDia(f: Fecha): number {
  return (aUTC(f).getUTCDay() + 6) % 7
}

export function startOfWeek(f: Fecha): Fecha {
  return addDays(f, -indiceDia(f))
}

// "12 oct"
export function formatEs(f: Fecha): string {
  const d = aUTC(f)
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`
}

// "Lun" … "Dom"
export function dayNameEs(f: Fecha): (typeof DIAS_ES)[number] {
  return DIAS_ES[indiceDia(f)]
}

export function diasDeLaSemana(lunes: Fecha): Fecha[] {
  return Array.from({ length: 7 }, (_, i) => addDays(lunes, i))
}
