// Motor del plan de flujo de caja. Determinístico, TypeScript puro, sin I/O:
// el modelo nunca calcula números; solo los narra (ver narrativa.ts).
//
// Reglas del día a día (en hora de Brisbane, semanas lunes–domingo):
//   1. Al empezar el día se descuenta la parte diaria del costo base de vida.
//   2. Los pagos con fecha de ese día se cobran ANTES de que llegue el ingreso
//      del mismo día (supuesto conservador: el débito puede salir temprano).
//   3. Si los pagos del día superan el saldo disponible -> "día corto".
// Todo se calcula en centavos enteros para no acumular errores de redondeo.

import { addDays, startOfWeek, type Fecha } from '@/lib/deadlines/dates'

export const MOTOR_VERSION = 1

export const FRECUENCIAS = ['semanal', 'quincenal', 'mensual', 'trimestral', 'anual', 'unico'] as const
export type Frecuencia = (typeof FRECUENCIAS)[number]

export interface IngresoIn {
  id: string
  nombre: string
  tipo: 'empleo_tfn' | 'contrato_abn' | 'negocio'
  monto: number
  frecuencia: Frecuencia
  proxima: Fecha | null
}

export interface GastoIn {
  id: string
  nombre: string
  categoria: string
  monto: number
  frecuencia: Frecuencia
  proximo: Fecha | null
}

export interface CuentaIn {
  id: string
  nombre: string
  tipo: 'personal' | 'negocio' | 'tarjeta' | 'bnpl'
  saldo: number
  disponible: number | null
  intocable: boolean
}

export interface CuotaIn {
  fecha: Fecha
  monto: number
  pagada: boolean
}

export interface DeudaIn {
  id: string
  acreedor: string
  tipo: 'bnpl' | 'tarjeta' | 'prestamo_personal' | 'otro'
  saldo: number
  tasa: number | null // % anual
  riesgoMora: boolean
  cuotas: CuotaIn[]
}

export interface MetaIn {
  nombre: string
  monto: number
  fecha: Fecha | null
}

export interface PlanInput {
  ingresos: IngresoIn[]
  gastos: GastoIn[]
  cuentas: CuentaIn[]
  deudas: DeudaIn[]
  meta?: MetaIn | null
}

export interface Movimiento {
  fecha: Fecha
  concepto: string
  monto: number
  tipo: 'ingreso' | 'gasto' | 'cuota'
  ref: string // id de la fuente (ingreso, gasto o deuda)
  grande: boolean
}

export interface Semana {
  lunes: Fecha
  domingo: Fecha
  apertura: number
  ingresos: number
  pagos: number
  costoBase: number
  cierre: number
  movimientos: Movimiento[]
}

export type Flag =
  | {
      tipo: 'dia_corto'
      fecha: Fecha
      faltante: number
      saldoDisponible: number
      pagos: Movimiento[]
      // Cuentas "intocables" que alcanzarían a cubrir el faltante (último recurso).
      respaldo: { cuenta: string; saldo: number } | null
    }
  | { tipo: 'semana_cargada'; lunes: Fecha; pagos: Movimiento[]; total: number }
  | { tipo: 'saldo_negativo'; lunes: Fecha; cierre: number }
  | { tipo: 'cuota_vencida'; fecha: Fecha; concepto: string; monto: number }

export interface DeudaOrdenada {
  id: string
  acreedor: string
  saldo: number
  orden: number
  razon: 'cuotas_con_multa' | 'compromiso_personal' | 'tarjeta_con_interes' | 'tarjeta_0'
  proximaCuota: { fecha: Fecha; monto: number } | null
}

export interface Reserva {
  concepto: string
  monto: number
  fecha: Fecha
  semanas: number
  porSemana: number
}

export interface Sugerencia {
  tipo: 'alternar_pagos' | 'adelantar_deuda'
  lunes?: Fecha
  texto: string
  mover?: { concepto: string; de: Fecha; aSemana: Fecha }
  deuda?: { acreedor: string; monto: number }
}

export interface Plan {
  version: number
  desde: Fecha
  hasta: Fecha
  resumen: {
    saldoInicial: number
    intocable: number
    ingresoTotal: number
    pagosTotal: number
    costoBaseSemanal: number
    saldoFinal: number
    saldoMinimo: { monto: number; fecha: Fecha }
    diaCritico: { fecha: Fecha; faltante: number } | null
  }
  semanas: Semana[]
  flags: Flag[]
  deudas: DeudaOrdenada[]
  reservas: Reserva[]
  sugerencias: Sugerencia[]
  meta: { nombre: string; monto: number; fecha: Fecha | null; porSemana: number | null; alcanza: boolean | null } | null
  avisos: string[]
}

// ── utilidades ────────────────────────────────────────────────────────────
const c = (pesos: number) => Math.round(pesos * 100) // a centavos
const p = (centavos: number) => Math.round(centavos) / 100 // a pesos

function sumarMeses(f: Fecha, meses: number, diaAncla: number): Fecha {
  const [y, m] = f.split('-').map(Number)
  const total = y * 12 + (m - 1) + meses
  const ny = Math.floor(total / 12)
  const nm = (total % 12) + 1
  const ultimo = new Date(Date.UTC(ny, nm, 0)).getUTCDate()
  const d = Math.min(diaAncla, ultimo)
  return `${ny}-${String(nm).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function siguiente(f: Fecha, frecuencia: Frecuencia, diaAncla: number): Fecha | null {
  switch (frecuencia) {
    case 'semanal':
      return addDays(f, 7)
    case 'quincenal':
      return addDays(f, 14)
    case 'mensual':
      return sumarMeses(f, 1, diaAncla)
    case 'trimestral':
      return sumarMeses(f, 3, diaAncla)
    case 'anual':
      return sumarMeses(f, 12, diaAncla)
    case 'unico':
      return null
  }
}

// Fechas de una recurrencia dentro de [desde, hasta].
export function ocurrencias(ancla: Fecha, frecuencia: Frecuencia, desde: Fecha, hasta: Fecha): Fecha[] {
  const diaAncla = Number(ancla.slice(8, 10))
  const fechas: Fecha[] = []
  let f: Fecha | null = ancla
  let guardia = 0
  while (f && f <= hasta && guardia++ < 1000) {
    if (f >= desde) fechas.push(f)
    f = siguiente(f, frecuencia, diaAncla)
  }
  return fechas
}

const SEMANAS_POR_FRECUENCIA: Record<Frecuencia, number> = {
  semanal: 1,
  quincenal: 2,
  mensual: 52 / 12,
  trimestral: 13,
  anual: 52,
  unico: Infinity,
}

// ── motor ─────────────────────────────────────────────────────────────────
export function buildCashflowPlan(input: PlanInput, startDate: Fecha, weeks = 20): Plan {
  const avisos: string[] = []
  const primerLunes = startOfWeek(startDate)
  const hasta = addDays(primerLunes, weeks * 7 - 1)

  // Caja disponible: cuentas personales/negocio no intocables. Tarjetas y
  // BNPL no cuentan como plata disponible (son deuda).
  const disponibles = input.cuentas.filter((a) => !a.intocable && (a.tipo === 'personal' || a.tipo === 'negocio'))
  const intocables = input.cuentas.filter((a) => a.intocable)
  const saldoInicial = disponibles.reduce((s, a) => s + c(a.disponible ?? a.saldo), 0)
  const intocableTotal = intocables.reduce((s, a) => s + c(a.saldo), 0)

  // Movimientos con fecha.
  const movs: Movimiento[] = []
  let costoBaseSemanal = 0 // centavos

  for (const i of input.ingresos) {
    if (i.monto <= 0) continue
    let ancla = i.proxima
    if (!ancla) {
      if (i.frecuencia === 'unico') {
        avisos.push(`"${i.nombre}" no tiene fecha: no se incluyó.`)
        continue
      }
      ancla = startDate
      avisos.push(`"${i.nombre}" no tiene fecha de pago: se asumió que llega hoy.`)
    }
    for (const f of ocurrencias(ancla, i.frecuencia, startDate, hasta)) {
      movs.push({ fecha: f, concepto: i.nombre, monto: i.monto, tipo: 'ingreso', ref: i.id, grande: false })
    }
  }

  for (const g of input.gastos) {
    if (g.monto <= 0) continue
    if (!g.proximo) {
      if (g.frecuencia === 'unico') {
        avisos.push(`"${g.nombre}" no tiene fecha: no se incluyó.`)
        continue
      }
      // Gasto recurrente sin fecha (comida, transporte…): parte del costo base.
      costoBaseSemanal += c(g.monto) / SEMANAS_POR_FRECUENCIA[g.frecuencia]
      continue
    }
    for (const f of ocurrencias(g.proximo, g.frecuencia, startDate, hasta)) {
      movs.push({ fecha: f, concepto: g.nombre, monto: g.monto, tipo: 'gasto', ref: g.id, grande: false })
    }
  }

  const flags: Flag[] = []
  for (const d of input.deudas) {
    for (const q of d.cuotas) {
      if (q.pagada || q.monto <= 0) continue
      if (q.fecha < startDate) {
        // Cuota vencida y sin pagar: se cobra hoy y se avisa.
        flags.push({ tipo: 'cuota_vencida', fecha: q.fecha, concepto: d.acreedor, monto: q.monto })
        movs.push({ fecha: startDate, concepto: `${d.acreedor} (vencida)`, monto: q.monto, tipo: 'cuota', ref: d.id, grande: false })
      } else if (q.fecha <= hasta) {
        movs.push({ fecha: q.fecha, concepto: d.acreedor, monto: q.monto, tipo: 'cuota', ref: d.id, grande: false })
      }
    }
  }

  // "Pago grande": al menos $200 o el 30% del ingreso semanal promedio.
  const ingresoTotal = movs.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + c(m.monto), 0)
  const ingresoSemanal = ingresoTotal / weeks
  const umbralGrande = Math.max(c(200), 0.3 * ingresoSemanal)
  for (const m of movs) if (m.tipo !== 'ingreso' && c(m.monto) >= umbralGrande) m.grande = true

  const porDia = new Map<Fecha, Movimiento[]>()
  for (const m of movs) porDia.set(m.fecha, [...(porDia.get(m.fecha) || []), m])

  // Simulación día a día.
  const baseDia = Math.round(costoBaseSemanal / 7)
  let saldo = saldoInicial
  let minimo = { monto: saldoInicial, fecha: startDate }
  const semanas: Semana[] = []

  for (let w = 0; w < weeks; w++) {
    const lunes = addDays(primerLunes, w * 7)
    const semana: Semana = {
      lunes,
      domingo: addDays(lunes, 6),
      apertura: 0,
      ingresos: 0,
      pagos: 0,
      costoBase: 0,
      cierre: 0,
      movimientos: [],
    }
    let aperturaFijada = false
    for (let i = 0; i < 7; i++) {
      const dia = addDays(lunes, i)
      if (dia < startDate) continue
      if (!aperturaFijada) {
        semana.apertura = saldo
        aperturaFijada = true
      }
      saldo -= baseDia
      semana.costoBase += baseDia

      const delDia = (porDia.get(dia) || []).sort((a, b) => (a.tipo === 'ingreso' ? 1 : 0) - (b.tipo === 'ingreso' ? 1 : 0))
      const pagos = delDia.filter((m) => m.tipo !== 'ingreso')
      const totalPagos = pagos.reduce((s, m) => s + c(m.monto), 0)
      if (totalPagos > 0 && totalPagos > saldo) {
        const faltante = totalPagos - Math.max(saldo, 0)
        const respaldo = intocables.find((a) => c(a.saldo) >= faltante)
        flags.push({
          tipo: 'dia_corto',
          fecha: dia,
          faltante: p(faltante),
          saldoDisponible: p(saldo),
          pagos,
          respaldo: respaldo ? { cuenta: respaldo.nombre, saldo: respaldo.saldo } : null,
        })
      }
      saldo -= totalPagos
      semana.pagos += totalPagos
      if (saldo < minimo.monto) minimo = { monto: saldo, fecha: dia }

      const ingresos = delDia.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + c(m.monto), 0)
      saldo += ingresos
      semana.ingresos += ingresos
      semana.movimientos.push(...delDia)
    }
    semana.cierre = saldo
    semanas.push(semana)
  }

  // Flags semanales.
  for (const s of semanas) {
    const grandes = s.movimientos.filter((m) => m.grande)
    if (grandes.length >= 2) {
      flags.push({ tipo: 'semana_cargada', lunes: s.lunes, pagos: grandes, total: grandes.reduce((t, m) => t + m.monto, 0) })
    }
    if (s.cierre < 0) flags.push({ tipo: 'saldo_negativo', lunes: s.lunes, cierre: p(s.cierre) })
  }

  // Sugerencia: alternar los pagos grandes que chocan en la misma semana.
  const sugerencias: Sugerencia[] = []
  const deudaPorId = new Map(input.deudas.map((d) => [d.id, d]))
  const semanasConGrandes = new Set(semanas.filter((s) => s.movimientos.some((m) => m.grande)).map((s) => s.lunes))
  for (const f of flags) {
    if (f.tipo !== 'semana_cargada') continue
    // Lo que se puede mover: primero una cuota sin multa (compromiso
    // personal), si no, un gasto que no sea el arriendo.
    const movible =
      f.pagos.find((m) => m.tipo === 'cuota' && !deudaPorId.get(m.ref)?.riesgoMora) ??
      f.pagos.find((m) => m.tipo === 'gasto' && !/arriendo|renta|rent/i.test(m.concepto))
    const destino = [addDays(f.lunes, 7), addDays(f.lunes, -7)].find((l) => l >= primerLunes && l <= hasta && !semanasConGrandes.has(l))
    if (movible && destino) {
      const fijo = f.pagos.find((m) => m !== movible)!
      sugerencias.push({
        tipo: 'alternar_pagos',
        lunes: f.lunes,
        texto: `Alterna: ${fijo.concepto} esta semana y ${movible.concepto} la semana del ${destino}.`,
        mover: { concepto: movible.concepto, de: movible.fecha, aSemana: destino },
      })
    }
  }

  // Orden para pagar deudas.
  const rango = (d: DeudaIn): DeudaOrdenada['razon'] => {
    if (d.riesgoMora && d.cuotas.some((q) => !q.pagada)) return 'cuotas_con_multa'
    if (d.tipo === 'tarjeta') return (d.tasa ?? 0) > 0 ? 'tarjeta_con_interes' : 'tarjeta_0'
    if (d.riesgoMora) return 'cuotas_con_multa'
    return 'compromiso_personal'
  }
  const PESO: Record<DeudaOrdenada['razon'], number> = { cuotas_con_multa: 0, compromiso_personal: 1, tarjeta_con_interes: 2, tarjeta_0: 3 }
  const proxima = (d: DeudaIn) => d.cuotas.filter((q) => !q.pagada).sort((a, b) => a.fecha.localeCompare(b.fecha))[0] ?? null
  const deudas: DeudaOrdenada[] = input.deudas
    .filter((d) => d.saldo > 0)
    .map((d) => ({ d, razon: rango(d), prox: proxima(d) }))
    .sort((a, b) =>
      PESO[a.razon] - PESO[b.razon] ||
      (a.razon === 'tarjeta_con_interes' ? (b.d.tasa ?? 0) - (a.d.tasa ?? 0) : 0) ||
      (a.prox?.fecha ?? '9999').localeCompare(b.prox?.fecha ?? '9999') ||
      a.d.saldo - b.d.saldo,
    )
    .map(({ d, razon, prox }, i) => ({
      id: d.id,
      acreedor: d.acreedor,
      saldo: d.saldo,
      orden: i + 1,
      razon,
      proximaCuota: prox ? { fecha: prox.fecha, monto: prox.monto } : null,
    }))

  // Plata extra: lo que sobra sobre el saldo mínimo proyectado, dejando una
  // semana de costo base de colchón. Sacarla hoy no crea ningún día corto.
  const colchon = Math.max(c(100), costoBaseSemanal)
  const sobra = Math.floor(Math.max(0, minimo.monto - colchon) / 1000) * 1000 // múltiplos de $10
  // Nunca más de lo que se debe.
  const extra = deudas[0] ? Math.min(sobra, c(deudas[0].saldo)) : 0
  if (extra > 0 && deudas[0]) {
    sugerencias.push({
      tipo: 'adelantar_deuda',
      texto: `Puedes adelantar ${p(extra)} a ${deudas[0].acreedor} sin quedarte corto ningún día del plan.`,
      deuda: { acreedor: deudas[0].acreedor, monto: p(extra) },
    })
  }

  // Reservas para pagos grandes poco frecuentes (trimestral, anual, único).
  const reservas: Reserva[] = []
  for (const m of movs) {
    if (m.tipo !== 'gasto' || !m.grande) continue
    const g = input.gastos.find((x) => x.id === m.ref)
    if (!g || !['trimestral', 'anual', 'unico'].includes(g.frecuencia)) continue
    const nSemanas = Math.max(1, Math.round((Date.parse(startOfWeek(m.fecha)) - Date.parse(primerLunes)) / (7 * 86400000)) + 1)
    reservas.push({ concepto: m.concepto, monto: m.monto, fecha: m.fecha, semanas: nSemanas, porSemana: Math.ceil(m.monto / nSemanas) })
  }
  reservas.sort((a, b) => a.fecha.localeCompare(b.fecha))

  // Meta: cuánto separar por semana y si alcanza con lo que sobra.
  let meta: Plan['meta'] = null
  if (input.meta && input.meta.monto > 0) {
    const fin = input.meta.fecha
    const nSemanas = fin ? Math.max(1, Math.round((Date.parse(startOfWeek(fin)) - Date.parse(primerLunes)) / (7 * 86400000)) + 1) : null
    const porSemana = nSemanas ? Math.ceil(input.meta.monto / nSemanas) : null
    const sobranteSemanal = weeks ? (saldo - saldoInicial) / weeks : 0
    meta = {
      nombre: input.meta.nombre,
      monto: input.meta.monto,
      fecha: fin,
      porSemana,
      alcanza: porSemana != null ? sobranteSemanal >= c(porSemana) : null,
    }
  }

  flags.sort((a, b) => ('fecha' in a ? a.fecha : a.lunes).localeCompare('fecha' in b ? b.fecha : b.lunes))
  const corto = flags.find((f) => f.tipo === 'dia_corto') as Extract<Flag, { tipo: 'dia_corto' }> | undefined
  const negativo = flags.find((f) => f.tipo === 'saldo_negativo') as Extract<Flag, { tipo: 'saldo_negativo' }> | undefined

  return {
    version: MOTOR_VERSION,
    desde: startDate,
    hasta,
    resumen: {
      saldoInicial: p(saldoInicial),
      intocable: p(intocableTotal),
      ingresoTotal: p(ingresoTotal),
      pagosTotal: p(semanas.reduce((s, x) => s + x.pagos, 0)),
      costoBaseSemanal: p(costoBaseSemanal),
      saldoFinal: p(saldo),
      saldoMinimo: { monto: p(minimo.monto), fecha: minimo.fecha },
      diaCritico: corto
        ? { fecha: corto.fecha, faltante: corto.faltante }
        : negativo
          ? { fecha: negativo.lunes, faltante: -negativo.cierre }
          : null,
    },
    semanas: semanas.map((s) => ({
      ...s,
      apertura: p(s.apertura),
      ingresos: p(s.ingresos),
      pagos: p(s.pagos),
      costoBase: p(s.costoBase),
      cierre: p(s.cierre),
    })),
    flags,
    deudas,
    reservas,
    sugerencias,
    meta,
    avisos,
  }
}
