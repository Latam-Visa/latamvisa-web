import { describe, expect, it } from 'vitest'
import {
  ADVERTENCIA_FIN_DE_ANIO,
  ADVERTENCIA_PASAPORTE,
  ADVERTENCIA_REINO_UNIDO,
  calcularCotizacion,
  ciudadesParaCotizar,
  repartirNoches,
  tramoEuropa,
  type CotizacionDatos,
  type CotizacionInput,
} from './cotizador'
import type { ConfigCotizador, HotelConTarifas, HotelTarifa, RutaVuelo } from './types'

// ── Fixtures (copiadas de la base real, oct 2026) ───────────────────────────

const config: ConfigCotizador = { id: 1, eur_aud: 1.7, margen_pct: 15, traslados_aud_por_persona_ciudad: 40, colchon_rango_pct: 10, actualizado_en: null }

let seq = 0
const tarifa = (p: Partial<HotelTarifa>): HotelTarifa => ({
  id: `t${++seq}`, property_id: '', temporada: 'dic-feb', fecha_inicio: '2026-12-01', fecha_fin: '2027-02-28',
  tarifa_neta: 100, moneda: 'EUR', noches_min: 1, noches_max: null, ocupacion: 2, desayuno_incluido: true,
  impuesto_ciudad_incluido: false, tipo_tarifa: 'neta', notas: null, created_at: '', ...p,
})
const hotel = (id: string, name: string, city: string, cadena: string, tarifas: Partial<HotelTarifa>[], cerradas: [string, string, string][] = []): HotelConTarifas => ({
  id, chain_id: null, name, city, country: '', neighborhood: null, tagline: null, description: null, perk: null, hero_image: null,
  gallery: null, booking_url: null, price_from: null, currency: null, sort_order: null, is_active: true, created_at: '',
  chain: { id: 'c', name: cadena, slug: '' },
  tarifas: tarifas.map((t) => tarifa({ property_id: id, ...t })),
  fechas_cerradas: cerradas.map(([d, h, m], i) => ({ id: `${id}-c${i}`, property_id: id, fecha_desde: d, fecha_hasta: h, motivo: m })),
})

const cerradasBcn: [string, string, string][] = [
  ['2026-12-26', '2027-01-01', 'Fin de año'], ['2027-01-17', '2027-01-20', 'ICE'], ['2027-02-01', '2027-02-05', 'ISE'],
]
const voraport = hotel('vora', 'Acta Voraport', 'Barcelona', 'Acta Hotels', [
  { tarifa_neta: 97, ocupacion: 2 }, { tarifa_neta: 88, ocupacion: 1 },
], cerradasBcn)
const santJust = hotel('sant', 'Acta Sant Just', 'Barcelona', 'Acta Hotels', [
  { tarifa_neta: 115, ocupacion: 3 }, { tarifa_neta: 87, ocupacion: 2 }, { tarifa_neta: 78, ocupacion: 1 },
], cerradasBcn)

const adagio = (id: string, name: string, largo: number, corto: number) =>
  hotel(id, name, 'París', 'Adagio', [
    { temporada: 'baja', fecha_inicio: '2026-11-01', fecha_fin: '2027-04-01', tarifa_neta: largo, noches_min: 3, noches_max: 7 },
    { temporada: 'baja', fecha_inicio: '2026-11-01', fecha_fin: '2027-04-01', tarifa_neta: corto, noches_min: 1, noches_max: 2 },
  ])
const paris = [adagio('bercy', 'Adagio Paris Bercy Village', 125, 135), adagio('mont', 'Adagio Paris Montmartre', 130, 140), adagio('eiffel', 'Adagio Paris Centre Tour Eiffel', 170, 196)]

const ruta = (p: Partial<RutaVuelo>): RutaVuelo => ({
  id: 'r', origen: 'BNE', ciudad_europa: 'París', destino_latam: 'Colombia', temporada: 'alta',
  fecha_desde: '2026-12-01', fecha_hasta: '2026-12-31', precio_min_aud: 1500, precio_max_aud: 1900,
  conecta_por_usa: false, aerolineas: null, actualizado_en: null, ...p,
})

const base: CotizacionInput = {
  ciudad_salida: 'BNE', pais_latam: 'Colombia', fecha_ida: '2026-12-01', fecha_vuelta: '2026-12-05', europa_momento: 'vuelta',
  adultos: 2, ninos: 0, pasaporte: 'Colombia', visa_usa: true, ciudades_europa: ['Barcelona'], sorprendanme: false, dias_europa: 4, estilo: [],
}
const datos = (p: Partial<CotizacionDatos> = {}): CotizacionDatos => ({ config, hoteles: [voraport, santJust, ...paris], rutas: [], ...p })

// ── Casos pedidos ───────────────────────────────────────────────────────────

describe('a) Barcelona 4 noches, 2 adultos, dic 2026, fuera de fechas cerradas', () => {
  const r = calcularCotizacion(base, datos())
  const bcn = r.interno.ciudades[0]

  it('tramo: del 5 al 9 de dic (noches 5-8)', () => {
    expect(r.interno.tramo_europa).toEqual({ check_in: '2026-12-05', check_out: '2026-12-09', noches: 4 })
  })

  it('mínimo con Sant Just (87 €, doble) y máximo con Voraport (97 €)', () => {
    expect(bcn.hotel_min).toMatchObject({ hotel: 'Acta Sant Just', tarifa_por_noche: 87, ocupacion: 2, habitaciones: 1, total_moneda: 348, total_aud: 591.6 })
    expect(bcn.hotel_max).toMatchObject({ hotel: 'Acta Voraport', tarifa_por_noche: 97, total_moneda: 388, total_aud: 659.6 })
    expect(bcn.descartados).toEqual([])
  })

  it('traslados, margen, colchón y redondeo', () => {
    // (591.6 + 80) × 1.15 = 772.34  → × 0.9 = 695.1 → 690
    // (659.6 + 80) × 1.15 = 850.54  → × 1.1 = 935.6 → 940
    expect(r.interno.traslados_aud).toBe(80)
    expect(r.interno.con_margen).toEqual({ min_aud: 772.34, max_aud: 850.54 })
    expect(r.publico).toMatchObject({ rango_min_aud: 690, rango_max_aud: 940, ciudades: [{ ciudad: 'Barcelona', noches: 4 }] })
  })

  it('lo público no lleva tarifas netas ni nombres de hotel', () => {
    const json = JSON.stringify(r.publico)
    expect(json).not.toMatch(/Acta|Adagio|tarifa|neta|87|97|348|388/)
    expect(Object.keys(r.publico).sort()).toEqual(['advertencias', 'ciudades', 'rango_max_aud', 'rango_min_aud', 'vuelos_estado'])
  })
})

describe('b) Barcelona que cae el 28 dic', () => {
  const r = calcularCotizacion({ ...base, europa_momento: 'ida', fecha_ida: '2026-12-30', dias_europa: 4 }, datos())
  const bcn = r.interno.ciudades[0]

  it('las noches 26-29 dic chocan con el cierre de fin de año: los dos Acta descartados', () => {
    expect(r.interno.tramo_europa).toEqual({ check_in: '2026-12-26', check_out: '2026-12-30', noches: 4 })
    expect(bcn.hotel_min).toBeNull()
    expect(bcn.descartados.map((d) => d.hotel)).toEqual(['Acta Voraport', 'Acta Sant Just'])
    expect(bcn.descartados[0].motivo).toContain('cerrado 2026-12-26 a 2027-01-01 (Fin de año)')
  })

  it('advertencias internas y públicas', () => {
    expect(r.interno.advertencias_internas.some((a) => a.includes('Acta Voraport descartado'))).toBe(true)
    expect(r.publico.advertencias).toContain(ADVERTENCIA_FIN_DE_ANIO)
    expect(r.publico.advertencias).toContain('Para Barcelona en esas fechas no tenemos tarifa confirmada; te la cotizamos aparte.')
  })
})

describe('c) París 5 noches', () => {
  const r = calcularCotizacion({ ...base, ciudades_europa: ['París'], dias_europa: 5 }, datos())
  const par = r.interno.ciudades[0]

  it('usa el nivel 3–7 de Adagio (no el de 1–2)', () => {
    expect(par.hotel_min).toMatchObject({ hotel: 'Adagio Paris Bercy Village', tarifa_por_noche: 125, total_moneda: 625 })
    expect(par.hotel_max).toMatchObject({ hotel: 'Adagio Paris Centre Tour Eiffel', tarifa_por_noche: 170, total_moneda: 850 })
    expect(par.validos).toBe(3)
  })

  it('con 2 noches usa el nivel 1–2', () => {
    const r2 = calcularCotizacion({ ...base, ciudades_europa: ['París'], dias_europa: 2 }, datos())
    expect(r2.interno.ciudades[0].hotel_min?.tarifa_por_noche).toBe(135)
  })

  it('9 noches superan los dos niveles: descartados con advertencia interna', () => {
    const r9 = calcularCotizacion({ ...base, ciudades_europa: ['París'], dias_europa: 9 }, datos())
    expect(r9.interno.ciudades[0].validos).toBe(0)
    expect(r9.interno.ciudades[0].descartados[0].motivo).toBe('9 noches superan sus niveles de noches (3–7, 1–2)')
  })

  it('un hotel con un único nivel que la estadía pasa: descartado y advertencia interna', () => {
    const unico = hotel('u', 'Hotel Un Nivel', 'París', 'X', [{ fecha_inicio: '2026-11-01', fecha_fin: '2027-04-01', tarifa_neta: 90, noches_min: 3, noches_max: 7 }])
    const r8 = calcularCotizacion({ ...base, ciudades_europa: ['París'], dias_europa: 8 }, datos({ hoteles: [unico] }))
    expect(r8.interno.advertencias_internas).toContain('París: Hotel Un Nivel descartado, 8 noches superan su único nivel de noches (3–7).')
  })
})

describe('d) Sin visa USA', () => {
  const rutas = [
    ruta({ id: 'via-usa', conecta_por_usa: true, precio_min_aud: 1200, precio_max_aud: 1600 }),
    ruta({ id: 'directa', conecta_por_usa: false, precio_min_aud: 1500, precio_max_aud: 1900 }),
  ]
  const input = { ...base, ciudades_europa: ['París'], dias_europa: 5, europa_momento: 'ida' as const, fecha_ida: '2026-12-15' }

  it('excluye las rutas que conectan por USA', () => {
    const r = calcularCotizacion({ ...input, visa_usa: false }, datos({ rutas }))
    expect(r.interno.vuelos).toMatchObject({ estado: 'incluidos', rutas_usadas: ['directa'], excluidas_por_usa: 1, por_persona_min_aud: 1500, total_min_aud: 3000, total_max_aud: 3800 })
    expect(r.publico.vuelos_estado).toBe('incluidos')
  })

  it('con visa USA sí las usa', () => {
    const r = calcularCotizacion({ ...input, visa_usa: true }, datos({ rutas }))
    expect(r.interno.vuelos.rutas_usadas).toEqual(['via-usa', 'directa'])
    expect(r.interno.vuelos.por_persona_min_aud).toBe(1200)
  })

  it('si todas conectan por USA, vuelos por confirmar', () => {
    const r = calcularCotizacion({ ...input, visa_usa: false }, datos({ rutas: [rutas[0]] }))
    expect(r.publico.vuelos_estado).toBe('por_confirmar')
    expect(r.interno.advertencias_internas.some((a) => a.includes('conectan por USA'))).toBe(true)
  })

  it('busca por la fecha de salida desde Australia (inicio del tramo en modo ida)', () => {
    const r = calcularCotizacion({ ...input, visa_usa: true }, datos({ rutas }))
    expect(r.interno.vuelos.fecha_busqueda).toBe('2026-12-10')
  })
})

describe('e) Sin rutas', () => {
  it('vuelos por confirmar y el rango solo cubre hoteles', () => {
    const r = calcularCotizacion(base, datos({ rutas: [] }))
    expect(r.publico.vuelos_estado).toBe('por_confirmar')
    expect(r.interno.vuelos.total_min_aud).toBe(0)
    expect(r.publico.rango_min_aud).toBe(690)
  })
})

// ── Reglas sueltas ──────────────────────────────────────────────────────────

describe('reglas', () => {
  it('tramo en modo ida: termina el día de fecha_ida', () => {
    expect(tramoEuropa({ europa_momento: 'ida', fecha_ida: '2027-01-10', fecha_vuelta: '2027-02-01', dias_europa: 6 }))
      .toEqual({ check_in: '2027-01-04', check_out: '2027-01-10', noches: 6 })
  })

  it('sorpréndanme escoge 2 ciudades por estilo', () => {
    expect(ciudadesParaCotizar({ sorprendanme: true, estilo: ['rumba'], ciudades_europa: ['Lisboa'] })).toEqual(['Barcelona', 'Madrid'])
    expect(ciudadesParaCotizar({ sorprendanme: true, estilo: ['comida', 'cultura'], ciudades_europa: [] })).toEqual(['Roma', 'Oporto'])
    expect(ciudadesParaCotizar({ sorprendanme: true, estilo: [], ciudades_europa: [] })).toEqual(['París', 'Roma'])
  })

  it('reparte noches con mínimo 2 por ciudad y usa menos ciudades si no alcanza', () => {
    expect(repartirNoches(['París', 'Roma'], 7)).toEqual([{ ciudad: 'París', noches: 4 }, { ciudad: 'Roma', noches: 3 }])
    expect(repartirNoches(['París', 'Roma', 'Niza'], 5)).toEqual([{ ciudad: 'París', noches: 3 }, { ciudad: 'Roma', noches: 2 }])
    expect(repartirNoches(['París', 'Roma'], 1)).toEqual([{ ciudad: 'París', noches: 1 }])
  })

  it('dos ciudades seguidas: la segunda empieza cuando termina la primera', () => {
    const r = calcularCotizacion({ ...base, ciudades_europa: ['París', 'Barcelona'], dias_europa: 6 }, datos())
    expect(r.interno.ciudades.map((c) => [c.ciudad, c.check_in, c.check_out])).toEqual([
      ['París', '2026-12-05', '2026-12-08'],
      ['Barcelona', '2026-12-08', '2026-12-11'],
    ])
    expect(r.interno.traslados_aud).toBe(160) // 40 × 2 personas × 2 ciudades
  })

  it('3 personas: usa la triple si existe; si no, 2 habitaciones', () => {
    const r = calcularCotizacion({ ...base, adultos: 2, ninos: 1 }, datos())
    expect(r.interno.ciudades[0].hotel_max).toMatchObject({ hotel: 'Acta Voraport', habitaciones: 2, tarifa_por_noche: 97 })
    expect(r.interno.ciudades[0].hotel_min).toMatchObject({ hotel: 'Acta Sant Just', habitaciones: 1, ocupacion: 3, tarifa_por_noche: 115 })
  })

  it('referencia_web no lleva margen', () => {
    const web = hotel('w', 'Hotel Web', 'Madrid', 'X', [{ tipo_tarifa: 'referencia_web', fecha_inicio: '2026-11-01', fecha_fin: '2027-03-31', tarifa_neta: 100 }])
    const r = calcularCotizacion({ ...base, ciudades_europa: ['Madrid'], dias_europa: 2 }, datos({ hoteles: [web] }))
    // 100 × 2 × 1.7 = 340 sin margen; traslados 80 × 1.15 = 92 → 432
    expect(r.interno.con_margen.min_aud).toBe(432)
  })

  it('advertencias de pasaporte y Reino Unido', () => {
    expect(calcularCotizacion({ ...base, ciudades_europa: ['Londres'] }, datos()).publico.advertencias).toContain(ADVERTENCIA_REINO_UNIDO)
    expect(calcularCotizacion({ ...base, pasaporte: 'Australia' }, datos()).publico.advertencias).not.toContain(ADVERTENCIA_PASAPORTE)
    expect(calcularCotizacion({ ...base, pasaporte: 'Venezuela' }, datos()).publico.advertencias).toContain(ADVERTENCIA_PASAPORTE)
    expect(calcularCotizacion(base, datos()).publico.advertencias).toEqual([])
  })
})
