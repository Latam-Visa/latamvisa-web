import { describe, expect, it } from 'vitest'
import { buildCashflowPlan, ocurrencias, type PlanInput } from './plan'

// Fixture SINTÉTICO (no son datos de nadie).
// Hoy: miércoles 14 oct 2026. Pago semanal de 1000 los jueves.
// Arriendo 400 quincenal (viernes 16, 30…). Dos BNPL, un préstamo personal,
// un pago trimestral de 1200 el lunes 19, comida 200/semana sin fecha,
// saldo inicial 600 y una cuenta del negocio intocable de 3000.
const HOY = '2026-10-14'

function fixture(): PlanInput {
  return {
    ingresos: [{ id: 'sueldo', nombre: 'Sueldo', tipo: 'empleo_tfn', monto: 1000, frecuencia: 'semanal', proxima: '2026-10-15' }],
    gastos: [
      { id: 'arriendo', nombre: 'Arriendo', categoria: 'arriendo', monto: 400, frecuencia: 'quincenal', proximo: '2026-10-16' },
      { id: 'trimestral', nombre: 'Matrícula', categoria: 'estudio', monto: 1200, frecuencia: 'trimestral', proximo: '2026-10-19' },
      { id: 'comida', nombre: 'Comida', categoria: 'comida', monto: 200, frecuencia: 'semanal', proximo: null },
    ],
    cuentas: [
      { id: 'cta', nombre: 'Everyday', tipo: 'personal', saldo: 600, disponible: 600, intocable: false },
      { id: 'neg', nombre: 'Negocio', tipo: 'negocio', saldo: 3000, disponible: 3000, intocable: true },
    ],
    deudas: [
      {
        id: 'afterpay', acreedor: 'Afterpay', tipo: 'bnpl', saldo: 200, tasa: 0, riesgoMora: true,
        cuotas: ['2026-10-14', '2026-10-28', '2026-11-11', '2026-11-25'].map((fecha) => ({ fecha, monto: 50, pagada: false })),
      },
      {
        id: 'steppay', acreedor: 'StepPay', tipo: 'bnpl', saldo: 300, tasa: 0, riesgoMora: true,
        cuotas: ['2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09'].map((fecha) => ({ fecha, monto: 75, pagada: false })),
      },
      {
        id: 'prestamo', acreedor: 'Préstamo de Juan', tipo: 'prestamo_personal', saldo: 1050, tasa: null, riesgoMora: false,
        cuotas: ['2026-10-30', '2026-11-30', '2026-12-30'].map((fecha) => ({ fecha, monto: 350, pagada: false })),
      },
      { id: 'tarjeta0', acreedor: 'Tarjeta 0%', tipo: 'tarjeta', saldo: 500, tasa: 0, riesgoMora: false, cuotas: [] },
      { id: 'tarjeta18', acreedor: 'Tarjeta 18%', tipo: 'tarjeta', saldo: 800, tasa: 18, riesgoMora: false, cuotas: [] },
    ],
  }
}

describe('buildCashflowPlan', () => {
  const plan = buildCashflowPlan(fixture(), HOY, 20)

  it('arma 20 semanas de lunes a domingo, en Brisbane', () => {
    expect(plan.semanas).toHaveLength(20)
    expect(plan.semanas[0].lunes).toBe('2026-10-12')
    expect(plan.semanas[0].domingo).toBe('2026-10-18')
    expect(plan.semanas.every((s) => new Date(`${s.lunes}T00:00:00Z`).getUTCDay() === 1)).toBe(true)
  })

  it('el saldo inicial excluye la cuenta intocable', () => {
    expect(plan.resumen.saldoInicial).toBe(600)
    expect(plan.resumen.intocable).toBe(3000)
  })

  it('marca el lunes corto: el día antes no alcanza para el pago trimestral', () => {
    // Domingo 18: 600 − base − 50 + 1000 − 400 − base… = 1007.14; el lunes
    // descuenta la base (28.57) y debe pagar 1200 + 75 antes del sueldo.
    const domingo = plan.semanas[0].cierre
    expect(domingo).toBeLessThan(1275)
    const corto = plan.flags.find((f) => f.tipo === 'dia_corto' && f.fecha === '2026-10-19')
    expect(corto).toBeDefined()
    if (corto?.tipo !== 'dia_corto') throw new Error('tipo')
    expect(corto.faltante).toBeCloseTo(296.43, 1)
    expect(corto.pagos.map((m) => m.concepto).sort()).toEqual(['Matrícula', 'StepPay'])
    // La cuenta intocable se muestra solo como último recurso.
    expect(corto.respaldo).toEqual({ cuenta: 'Negocio', saldo: 3000 })
    // Es lo primero que se muestra en pantalla.
    expect(plan.resumen.diaCritico?.fecha).toBe('2026-10-19')
  })

  it('no marca días cortos cuando el saldo alcanza', () => {
    const conPlata = fixture()
    conPlata.cuentas[0].saldo = conPlata.cuentas[0].disponible = 2000
    const p2 = buildCashflowPlan(conPlata, HOY, 20)
    expect(p2.flags.some((f) => f.tipo === 'dia_corto' && f.fecha === '2026-10-19')).toBe(false)
  })

  it('el pago del día sale antes que el ingreso del mismo día', () => {
    const mismoDia = fixture()
    mismoDia.cuentas[0].saldo = mismoDia.cuentas[0].disponible = 0
    mismoDia.ingresos[0].proxima = '2026-10-19' // el sueldo llega el mismo lunes
    const p3 = buildCashflowPlan(mismoDia, HOY, 4)
    expect(p3.flags.some((f) => f.tipo === 'dia_corto' && f.fecha === '2026-10-19')).toBe(true)
  })

  it('arriendo por su frecuencia real (quincenal), no semanal', () => {
    const arriendos = plan.semanas.flatMap((s) => s.movimientos).filter((m) => m.ref === 'arriendo').map((m) => m.fecha)
    expect(arriendos.slice(0, 3)).toEqual(['2026-10-16', '2026-10-30', '2026-11-13'])
  })

  it('cuotas BNPL en sus fechas exactas', () => {
    const steppay = plan.semanas.flatMap((s) => s.movimientos).filter((m) => m.ref === 'steppay').map((m) => m.fecha)
    expect(steppay).toEqual(['2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09'])
  })

  it('semana cargada: arriendo y préstamo chocan, y sugiere alternarlos', () => {
    const cargada = plan.flags.find((f) => f.tipo === 'semana_cargada' && f.lunes === '2026-10-26')
    expect(cargada).toBeDefined()
    const alt = plan.sugerencias.find((s) => s.tipo === 'alternar_pagos' && s.lunes === '2026-10-26')
    expect(alt?.mover?.concepto).toBe('Préstamo de Juan') // compromiso personal, sin multa
    expect(alt?.mover?.aSemana).toBe('2026-11-02')
  })

  it('orden de deudas: con multa primero, compromisos personales, tarjeta con interés y la 0% al final', () => {
    expect(plan.deudas.map((d) => d.acreedor)).toEqual(['Afterpay', 'StepPay', 'Préstamo de Juan', 'Tarjeta 18%', 'Tarjeta 0%'])
    expect(plan.deudas.at(-1)?.razon).toBe('tarjeta_0')
  })

  it('reserva semanal para el próximo pago trimestral', () => {
    const siguiente = plan.reservas.find((r) => r.fecha === '2027-01-19')
    expect(siguiente).toBeDefined()
    expect(siguiente!.semanas).toBe(15) // semanas del 12 oct al 18 ene, ambas incluidas
    expect(siguiente!.porSemana).toBe(Math.ceil(1200 / 15))
  })

  it('el costo base sin fecha se reparte por semana', () => {
    expect(plan.resumen.costoBaseSemanal).toBe(200)
    expect(plan.semanas[1].costoBase).toBeCloseTo(200, 0)
  })

  it('cuotas vencidas sin pagar se cobran hoy y se avisan', () => {
    const vencida = fixture()
    vencida.deudas[0].cuotas.unshift({ fecha: '2026-09-30', monto: 50, pagada: false })
    const p4 = buildCashflowPlan(vencida, HOY, 4)
    expect(p4.flags.some((f) => f.tipo === 'cuota_vencida' && f.fecha === '2026-09-30')).toBe(true)
  })

  it('la plata extra nunca crea un día corto', () => {
    const holgado = fixture()
    holgado.cuentas[0].saldo = holgado.cuentas[0].disponible = 5000
    const p5 = buildCashflowPlan(holgado, HOY, 20)
    const adelanto = p5.sugerencias.find((s) => s.tipo === 'adelantar_deuda')
    expect(adelanto?.deuda?.acreedor).toBe('Afterpay')
    expect(adelanto!.deuda!.monto).toBeLessThanOrEqual(holgado.deudas[0].saldo) // nunca más de lo que se debe
    const conAdelanto = fixture()
    conAdelanto.cuentas[0].saldo = conAdelanto.cuentas[0].disponible = 5000 - adelanto!.deuda!.monto
    expect(buildCashflowPlan(conAdelanto, HOY, 20).flags.some((f) => f.tipo === 'dia_corto')).toBe(false)
  })
})

describe('ocurrencias', () => {
  it('mensual el 31 se ajusta al último día del mes', () => {
    expect(ocurrencias('2026-01-31', 'mensual', '2026-01-01', '2026-04-30')).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30'])
  })
  it('una fecha pasada avanza hasta el rango', () => {
    expect(ocurrencias('2026-09-01', 'quincenal', '2026-10-01', '2026-10-31')).toEqual(['2026-10-13', '2026-10-27'])
  })
})
