import { describe, expect, it } from 'vitest'
import { buildCashflowPlan } from './plan'
import { datosNarrativa, mencionaIA, numerosEn, numerosInventados, type Narrativa } from './narrativa'

const plan = buildCashflowPlan(
  {
    ingresos: [{ id: 's', nombre: 'Sueldo', tipo: 'empleo_tfn', monto: 1000, frecuencia: 'semanal', proxima: '2026-10-15' }],
    gastos: [{ id: 'm', nombre: 'Matrícula', categoria: 'estudio', monto: 1200, frecuencia: 'trimestral', proximo: '2026-10-19' }],
    cuentas: [{ id: 'c', nombre: 'Everyday', tipo: 'personal', saldo: 100, disponible: 100, intocable: false }],
    deudas: [],
  },
  '2026-10-14',
  8,
)
const datos = datosNarrativa(plan)

const base: Narrativa = {
  esta_semana: 'El lunes 19 oct te faltan $100 para la Matrícula de $1.200.',
  riesgos: ['La Matrícula de $1.200 sale antes del sueldo.'],
  mensajes: [],
  recomendacion: 'Separa lo del lunes 19 oct desde el jueves.',
}

describe('números de la narrativa', () => {
  it('lee montos con formato es-CO', () => {
    expect(numerosEn('$1.200 y $1.200,50 el 19 oct, 7 días')).toEqual([1200, 1200.5, 19, 7])
  })

  it('acepta solo números que están en los datos del plan', () => {
    expect(datos.dia_critico?.faltante).toBe('$100')
    const faltante = datos.dia_critico!.faltante
    const ok = { ...base, esta_semana: `El lunes 19 oct te faltan ${faltante} para la Matrícula de $1.200.` }
    expect(numerosInventados(ok, datos)).toEqual([])
  })

  it('rechaza un número recalculado o inventado', () => {
    const malo = { ...base, recomendacion: 'Ahorra $137 por semana.' }
    expect(numerosInventados(malo, datos)).toContain(137)
  })

  it('detecta si menciona IA', () => {
    expect(mencionaIA({ ...base, esta_semana: 'Según la IA, paga el lunes.' })).toBe(true)
    expect(mencionaIA(base)).toBe(false)
  })
})
