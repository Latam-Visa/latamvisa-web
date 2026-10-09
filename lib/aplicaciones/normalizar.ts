// Conversión de valores del formulario a los tipos de Postgres. El formulario
// acepta cosas que la columna rechaza (decimales en un integer, fechas
// "15/10/1990"), y un solo valor así hacía fallar TODO el insert.
// Cada ajuste se anota para dejarlo en admin_notes: nunca se pierde el dato.

export type Ajustes = string[]

const INT_MAX = 2_147_483_647

export function vacioANull(v: unknown): unknown {
  if (v === '') return null
  if (Array.isArray(v)) return v.map(vacioANull)
  if (v !== null && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, vacioANull(x)]))
  }
  return v
}

export const aBool = (v: unknown) => v === 'true' || v === true

// Columna integer: redondea decimales; fuera de rango o no numérico -> null.
export function aEntero(v: unknown, campo: string, ajustes: Ajustes): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(String(v).trim())
  if (!Number.isFinite(n)) {
    ajustes.push(`${campo}: "${v}" no es un número; se guardó vacío`)
    return null
  }
  const entero = Math.round(n)
  if (Math.abs(entero) > INT_MAX) {
    ajustes.push(`${campo}: "${v}" es demasiado grande para la columna; se guardó vacío`)
    return null
  }
  if (entero !== n) ajustes.push(`${campo}: "${v}" se redondeó a ${entero}`)
  return entero
}

function fechaValida(y: number, m: number, d: number) {
  const f = new Date(Date.UTC(y, m - 1, d))
  return f.getUTCFullYear() === y && f.getUTCMonth() === m - 1 && f.getUTCDate() === d
}

// Columna date: acepta AAAA-MM-DD, AAAA/MM/DD y DD/MM/AAAA (o con guiones).
export function aFechaISO(v: unknown, campo: string, ajustes: Ajustes): string | null {
  if (v === null || v === undefined || v === '') return null
  const s = String(v).trim()
  let y: number, m: number, d: number
  let mt = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (mt) [y, m, d] = [Number(mt[1]), Number(mt[2]), Number(mt[3])]
  else if ((mt = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) [d, m, y] = [Number(mt[1]), Number(mt[2]), Number(mt[3])]
  else {
    ajustes.push(`${campo}: "${s}" no es una fecha reconocible; se guardó vacía`)
    return null
  }
  if (!fechaValida(y, m, d)) {
    ajustes.push(`${campo}: "${s}" no es una fecha válida; se guardó vacía`)
    return null
  }
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  if (iso !== s) ajustes.push(`${campo}: "${s}" se convirtió a ${iso}`)
  return iso
}
