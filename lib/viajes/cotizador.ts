import 'server-only'

import type { ConfigCotizador, HotelConTarifas, HotelTarifa, RutaVuelo } from './types'

/* Cotizador "Dos Vacaciones": función PURA. No consulta la base; recibe los
   datos ya cargados (lib/viajes/data.ts) para poder testearla.

   Devuelve dos cosas:
   - publico: lo único que puede llegar al navegador. Rango en AUD, noches por
     ciudad, estado de vuelos y advertencias. Sin tarifas ni nombres de hotel.
   - interno: el desglose completo (netas, hotel por ciudad, conversiones,
     advertencias internas). Se guarda en solicitudes_dos_vacaciones; nunca
     se manda al cliente.

   Fechas: 'YYYY-MM-DD', aritmética en UTC. Una "noche" es la fecha en que se
   duerme: una estadía del 5 al 9 son las noches 5, 6, 7 y 8. */

// ── Constantes editables ────────────────────────────────────────────────────

// "Sorpréndanme": ciudades por estilo, en orden de preferencia.
export const CIUDADES_POR_ESTILO: Record<string, string[]> = {
  rumba: ['Barcelona', 'Madrid'],
  cultura: ['París', 'Roma'],
  playa: ['Niza', 'Lisboa'],
  comida: ['Roma', 'Oporto'],
  descanso: ['Oporto', 'Niza'],
}
const ESTILO_POR_DEFECTO = 'cultura'
export const CIUDADES_SORPRESA = 2
export const NOCHES_MIN_POR_CIUDAD = 2
// Si la tarifa no dice ocupación, se asume habitación doble.
const OCUPACION_POR_DEFECTO = 2

const CIUDADES_REINO_UNIDO = ['londres', 'edimburgo', 'manchester', 'liverpool', 'reino unido']

export const ADVERTENCIA_FIN_DE_ANIO = 'Las fechas de fin de año en Europa tienen poca disponibilidad; te proponemos alternativas.'
export const ADVERTENCIA_REINO_UNIDO = 'Para Reino Unido necesitas visa con pasaporte colombiano. Te ayudamos con ella.'
export const ADVERTENCIA_PASAPORTE = 'Revisamos los requisitos de entrada de tu pasaporte en tu cotización.'

// ── Tipos ───────────────────────────────────────────────────────────────────

export type CiudadSalida = 'BNE' | 'SYD' | 'MEL'

export interface CotizacionInput {
  ciudad_salida: CiudadSalida
  pais_latam: string
  fecha_ida: string
  fecha_vuelta: string
  europa_momento: 'ida' | 'vuelta'
  adultos: number
  ninos: number
  pasaporte: string
  visa_usa: boolean
  ciudades_europa: string[]
  sorprendanme: boolean
  dias_europa: number
  estilo: string[]
}

export interface CotizacionDatos {
  config: ConfigCotizador
  hoteles: HotelConTarifas[] // de todas las ciudades candidatas
  rutas: RutaVuelo[] // se filtran acá por origen, ciudad, destino, fecha y USA
}

export interface CotizacionPublica {
  rango_min_aud: number
  rango_max_aud: number
  ciudades: { ciudad: string; noches: number }[]
  vuelos_estado: 'incluidos' | 'por_confirmar'
  advertencias: string[]
}

export interface HotelCotizado {
  hotel_id: string
  hotel: string
  cadena: string | null
  tarifa_id: string
  temporada: string
  tipo_tarifa: HotelTarifa['tipo_tarifa']
  tarifa_por_noche: number
  moneda: string
  ocupacion: number
  habitaciones: number
  noches: number
  total_moneda: number
  total_aud: number
}

export interface CiudadInterna {
  ciudad: string
  noches: number
  check_in: string
  check_out: string
  hotel_min: HotelCotizado | null
  hotel_max: HotelCotizado | null
  validos: number
  descartados: { hotel: string; motivo: string }[]
}

export interface CotizacionInterna {
  input: CotizacionInput
  personas: number
  tramo_europa: { check_in: string; check_out: string; noches: number }
  ciudades_pedidas: string[]
  ciudades: CiudadInterna[]
  conversion: { eur_aud: number }
  hoteles: { neta_min_aud: number; neta_max_aud: number; referencia_min_aud: number; referencia_max_aud: number }
  traslados_aud: number
  margen_pct: number
  con_margen: { min_aud: number; max_aud: number }
  vuelos: {
    estado: 'incluidos' | 'por_confirmar'
    fecha_busqueda: string
    destino_buscado: string
    rutas_usadas: string[]
    excluidas_por_usa: number
    por_persona_min_aud: number | null
    por_persona_max_aud: number | null
    total_min_aud: number
    total_max_aud: number
  }
  antes_colchon: { min_aud: number; max_aud: number }
  colchon_pct: number
  advertencias_internas: string[]
}

export interface Cotizacion {
  publico: CotizacionPublica
  interno: CotizacionInterna
}

// ── Fechas (UTC, 'YYYY-MM-DD') ──────────────────────────────────────────────

const aFecha = (s: string) => new Date(`${s}T00:00:00Z`)
const aTexto = (d: Date) => d.toISOString().slice(0, 10)
export function sumarDias(fecha: string, dias: number): string {
  const d = aFecha(fecha)
  d.setUTCDate(d.getUTCDate() + dias)
  return aTexto(d)
}
/* Noches de una estadía: desde check_in hasta el día anterior a check_out. */
export function nochesEntre(checkIn: string, checkOut: string): string[] {
  const noches: string[] = []
  for (let f = checkIn; f < checkOut; f = sumarDias(f, 1)) noches.push(f)
  return noches
}

// ── Normalización ───────────────────────────────────────────────────────────

export const normalizar = (t: string | null | undefined) =>
  (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

function tipoPasaporte(pasaporte: string): 'colombia' | 'australia' | 'otro' {
  const p = normalizar(pasaporte)
  if (['co', 'col', 'colombia', 'colombiano', 'colombiana'].includes(p)) return 'colombia'
  if (['au', 'aus', 'australia', 'australiano', 'australiana'].includes(p)) return 'australia'
  return 'otro'
}

// ── Reglas ──────────────────────────────────────────────────────────────────

/* Regla 1: tramo en Europa. 'ida' termina el día de fecha_ida; 'vuelta'
   empieza en fecha_vuelta. dias_europa = noches. */
export function tramoEuropa(input: Pick<CotizacionInput, 'europa_momento' | 'fecha_ida' | 'fecha_vuelta' | 'dias_europa'>) {
  const noches = Math.max(1, Math.floor(input.dias_europa))
  if (input.europa_momento === 'ida') {
    return { check_in: sumarDias(input.fecha_ida, -noches), check_out: input.fecha_ida, noches }
  }
  return { check_in: input.fecha_vuelta, check_out: sumarDias(input.fecha_vuelta, noches), noches }
}

/* Regla 2: ciudades pedidas (o escogidas por estilo si "sorpréndanme"). */
export function ciudadesParaCotizar(input: Pick<CotizacionInput, 'sorprendanme' | 'estilo' | 'ciudades_europa'>): string[] {
  if (!input.sorprendanme) return Array.from(new Set(input.ciudades_europa.map((c) => c.trim()).filter(Boolean)))
  const estilos = input.estilo.length > 0 ? input.estilo : [ESTILO_POR_DEFECTO]
  const elegidas: string[] = []
  for (const e of estilos) {
    for (const c of CIUDADES_POR_ESTILO[normalizar(e)] || []) {
      if (!elegidas.includes(c)) elegidas.push(c)
      if (elegidas.length === CIUDADES_SORPRESA) return elegidas
    }
  }
  // Un solo estilo desconocido o con una ciudad: se completa con el de defecto.
  for (const c of CIUDADES_POR_ESTILO[ESTILO_POR_DEFECTO]) {
    if (elegidas.length === CIUDADES_SORPRESA) break
    if (!elegidas.includes(c)) elegidas.push(c)
  }
  return elegidas
}

/* Regla 3: mínimo 2 noches por ciudad; si no alcanza, menos ciudades. El
   resto se reparte desde la primera ciudad. */
export function repartirNoches(ciudades: string[], noches: number): { ciudad: string; noches: number }[] {
  if (ciudades.length === 0 || noches <= 0) return []
  const cuantas = Math.max(1, Math.min(ciudades.length, Math.floor(noches / NOCHES_MIN_POR_CIUDAD)))
  const base = Math.floor(noches / cuantas)
  const resto = noches % cuantas
  return ciudades.slice(0, cuantas).map((ciudad, i) => ({ ciudad, noches: base + (i < resto ? 1 : 0) }))
}

const cubreNoches = (t: HotelTarifa, noches: string[]) => t.fecha_inicio <= noches[0] && noches[noches.length - 1] <= t.fecha_fin
const encajaNoches = (t: HotelTarifa, n: number) => n >= (t.noches_min ?? 1) && (t.noches_max === null || n <= t.noches_max)

/* Reglas 4 y 5 para un hotel: devuelve la mejor opción o el motivo del descarte. */
export function cotizarHotel(
  hotel: HotelConTarifas,
  noches: string[],
  personas: number,
  eurAud: number,
): { ok: true; cotizado: HotelCotizado } | { ok: false; motivo: string } {
  const n = noches.length

  const cerrada = hotel.fechas_cerradas.find((f) => noches.some((d) => d >= f.fecha_desde && d <= f.fecha_hasta))
  if (cerrada) {
    return { ok: false, motivo: `cerrado ${cerrada.fecha_desde} a ${cerrada.fecha_hasta}${cerrada.motivo ? ` (${cerrada.motivo})` : ''}` }
  }

  const enFechas = hotel.tarifas.filter((t) => cubreNoches(t, noches))
  if (enFechas.length === 0) return { ok: false, motivo: `ninguna tarifa cubre todas las noches (${noches[0]} a ${noches[n - 1]})` }

  const enNoches = enFechas.filter((t) => encajaNoches(t, n))
  if (enNoches.length === 0) {
    const niveles = Array.from(new Set(enFechas.map((t) => `${t.noches_min ?? 1}–${t.noches_max ?? '∞'}`)))
    const pasa = enFechas.every((t) => t.noches_max !== null && n > t.noches_max)
    const nivelUnico = niveles.length === 1
    return {
      ok: false,
      motivo: `${n} noches ${pasa ? 'superan' : 'no encajan en'} ${nivelUnico ? 'su único nivel' : 'sus niveles'} de noches (${niveles.join(', ')})`,
    }
  }

  // Regla 5: la tarifa cuya ocupación cubra a todos; si varias, la más barata.
  // Si ninguna alcanza, varias habitaciones de la de mayor ocupación.
  const opciones = enNoches.map((t) => {
    const ocupacion = t.ocupacion ?? OCUPACION_POR_DEFECTO
    const habitaciones = ocupacion >= personas ? 1 : Math.ceil(personas / ocupacion)
    const total = t.tarifa_neta * n * habitaciones
    return { t, ocupacion, habitaciones, total }
  })
  const cubren = opciones.filter((o) => o.habitaciones === 1)
  const mejor = cubren.length > 0
    ? cubren.reduce((a, b) => (b.total < a.total ? b : a))
    : opciones.reduce((a, b) => (b.ocupacion > a.ocupacion || (b.ocupacion === a.ocupacion && b.total < a.total) ? b : a))

  const tasa = mejor.t.moneda.toUpperCase() === 'AUD' ? 1 : eurAud
  return {
    ok: true,
    cotizado: {
      hotel_id: hotel.id,
      hotel: hotel.name,
      cadena: hotel.chain?.name ?? null,
      tarifa_id: mejor.t.id,
      temporada: mejor.t.temporada,
      tipo_tarifa: mejor.t.tipo_tarifa,
      tarifa_por_noche: mejor.t.tarifa_neta,
      moneda: mejor.t.moneda,
      ocupacion: mejor.ocupacion,
      habitaciones: mejor.habitaciones,
      noches: n,
      total_moneda: round2(mejor.total),
      total_aud: round2(mejor.total * tasa),
    },
  }
}

const round2 = (v: number) => Math.round(v * 100) / 100
const bajarDecena = (v: number) => Math.floor(v / 10) * 10
const subirDecena = (v: number) => Math.ceil(v / 10) * 10

/* Regla 10 (fin de año): ¿algún día en Europa cae entre el 24 dic y el 1 ene? */
function tocaFinDeAnio(checkIn: string, checkOut: string): boolean {
  for (let f = checkIn; f <= checkOut; f = sumarDias(f, 1)) {
    const md = f.slice(5)
    if (md >= '12-24' || md <= '01-01') return true
  }
  return false
}

// ── Cálculo ─────────────────────────────────────────────────────────────────

export function calcularCotizacion(input: CotizacionInput, datos: CotizacionDatos): Cotizacion {
  const { config } = datos
  const personas = Math.max(1, input.adultos + input.ninos)
  const tramo = tramoEuropa(input)
  const pedidas = ciudadesParaCotizar(input)
  const reparto = repartirNoches(pedidas, tramo.noches)
  const advertenciasInternas: string[] = []
  const advertencias: string[] = []

  if (reparto.length < pedidas.length) {
    advertenciasInternas.push(
      `${tramo.noches} noches no alcanzan para ${pedidas.length} ciudades con mínimo ${NOCHES_MIN_POR_CIUDAD}: se cotizan ${reparto.map((r) => r.ciudad).join(', ')}.`,
    )
  }

  // Reglas 3, 4, 5 y 6: por ciudad, en orden, cada una a continuación de la anterior.
  let checkIn = tramo.check_in
  const ciudades: CiudadInterna[] = reparto.map(({ ciudad, noches: n }) => {
    const checkOut = sumarDias(checkIn, n)
    const noches = nochesEntre(checkIn, checkOut)
    const candidatos = datos.hoteles.filter((h) => h.is_active && normalizar(h.city) === normalizar(ciudad))
    const validos: HotelCotizado[] = []
    const descartados: { hotel: string; motivo: string }[] = []
    for (const h of candidatos) {
      const r = cotizarHotel(h, noches, personas, config.eur_aud)
      if (r.ok) validos.push(r.cotizado)
      else {
        descartados.push({ hotel: h.name, motivo: r.motivo })
        advertenciasInternas.push(`${ciudad}: ${h.name} descartado, ${r.motivo}.`)
      }
    }
    if (validos.length === 0) {
      advertenciasInternas.push(`${ciudad}: ningún hotel válido para ${noches[0]} a ${noches[noches.length - 1]}; queda fuera del rango.`)
      advertencias.push(`Para ${ciudad} en esas fechas no tenemos tarifa confirmada; te la cotizamos aparte.`)
    }
    const ordenados = [...validos].sort((a, b) => a.total_aud - b.total_aud)
    const ciudadInterna: CiudadInterna = {
      ciudad,
      noches: n,
      check_in: checkIn,
      check_out: checkOut,
      hotel_min: ordenados[0] ?? null,
      hotel_max: ordenados[ordenados.length - 1] ?? null,
      validos: validos.length,
      descartados,
    }
    checkIn = checkOut
    return ciudadInterna
  })

  // Regla 7: EUR→AUD ya aplicado por hotel. Margen solo sobre lo neto (+ traslados).
  const suma = (lado: 'hotel_min' | 'hotel_max', tipo: HotelTarifa['tipo_tarifa']) =>
    round2(ciudades.reduce((acc, c) => acc + (c[lado]?.tipo_tarifa === tipo ? c[lado]!.total_aud : 0), 0))
  const hoteles = {
    neta_min_aud: suma('hotel_min', 'neta'),
    neta_max_aud: suma('hotel_max', 'neta'),
    referencia_min_aud: suma('hotel_min', 'referencia_web'),
    referencia_max_aud: suma('hotel_max', 'referencia_web'),
  }
  const ciudadesConHotel = ciudades.filter((c) => c.hotel_min).length
  const trasladosAud = round2(config.traslados_aud_por_persona_ciudad * personas * ciudadesConHotel)
  const factor = 1 + config.margen_pct / 100
  const conMargen = {
    min_aud: round2((hoteles.neta_min_aud + trasladosAud) * factor + hoteles.referencia_min_aud),
    max_aud: round2((hoteles.neta_max_aud + trasladosAud) * factor + hoteles.referencia_max_aud),
  }

  // Regla 8: vuelos. Se busca por la fecha de salida desde Australia.
  const primeraCiudad = ciudades[0]?.ciudad ?? pedidas[0] ?? ''
  const fechaBusqueda = input.europa_momento === 'ida' ? tramo.check_in : input.fecha_ida
  const candidatas = datos.rutas.filter(
    (r) =>
      normalizar(r.origen) === normalizar(input.ciudad_salida) &&
      normalizar(r.ciudad_europa) === normalizar(primeraCiudad) &&
      normalizar(r.destino_latam) === normalizar(input.pais_latam) &&
      r.fecha_desde <= fechaBusqueda &&
      fechaBusqueda <= r.fecha_hasta,
  )
  const rutas = input.visa_usa ? candidatas : candidatas.filter((r) => !r.conecta_por_usa)
  const hayVuelos = rutas.length > 0
  const porPersonaMin = hayVuelos ? Math.min(...rutas.map((r) => r.precio_min_aud)) : null
  const porPersonaMax = hayVuelos ? Math.max(...rutas.map((r) => r.precio_max_aud)) : null
  const vuelos: CotizacionInterna['vuelos'] = {
    estado: hayVuelos ? 'incluidos' : 'por_confirmar',
    fecha_busqueda: fechaBusqueda,
    destino_buscado: input.pais_latam,
    rutas_usadas: rutas.map((r) => r.id),
    excluidas_por_usa: candidatas.length - rutas.length,
    por_persona_min_aud: porPersonaMin,
    por_persona_max_aud: porPersonaMax,
    // Precio de referencia en AUD por persona, sin margen.
    total_min_aud: hayVuelos ? round2(porPersonaMin! * personas) : 0,
    total_max_aud: hayVuelos ? round2(porPersonaMax! * personas) : 0,
  }
  if (!hayVuelos) {
    advertenciasInternas.push(
      candidatas.length > 0
        ? `Vuelos por confirmar: las ${candidatas.length} rutas conectan por USA y el cliente no tiene visa.`
        : `Vuelos por confirmar: no hay ruta ${input.ciudad_salida}→${primeraCiudad}→${input.pais_latam} para ${fechaBusqueda}.`,
    )
  }

  // Regla 9: colchón y redondeo a la decena (el mínimo baja, el máximo sube).
  const antesColchon = {
    min_aud: round2(conMargen.min_aud + vuelos.total_min_aud),
    max_aud: round2(conMargen.max_aud + vuelos.total_max_aud),
  }
  const colchon = config.colchon_rango_pct / 100
  const rangoMin = bajarDecena(antesColchon.min_aud * (1 - colchon))
  const rangoMax = subirDecena(antesColchon.max_aud * (1 + colchon))

  // Regla 10: advertencias públicas.
  if (tocaFinDeAnio(tramo.check_in, tramo.check_out)) advertencias.push(ADVERTENCIA_FIN_DE_ANIO)
  const pasaporte = tipoPasaporte(input.pasaporte)
  const vaAReinoUnido = pedidas.some((c) => CIUDADES_REINO_UNIDO.includes(normalizar(c)))
  if (vaAReinoUnido && pasaporte === 'colombia') advertencias.push(ADVERTENCIA_REINO_UNIDO)
  if (pasaporte === 'otro') advertencias.push(ADVERTENCIA_PASAPORTE)

  return {
    publico: {
      rango_min_aud: rangoMin,
      rango_max_aud: rangoMax,
      ciudades: ciudades.map((c) => ({ ciudad: c.ciudad, noches: c.noches })),
      vuelos_estado: vuelos.estado,
      advertencias,
    },
    interno: {
      input,
      personas,
      tramo_europa: tramo,
      ciudades_pedidas: pedidas,
      ciudades,
      conversion: { eur_aud: config.eur_aud },
      hoteles,
      traslados_aud: trasladosAud,
      margen_pct: config.margen_pct,
      con_margen: conMargen,
      vuelos,
      antes_colchon: antesColchon,
      colchon_pct: config.colchon_rango_pct,
      advertencias_internas: advertenciasInternas,
    },
  }
}
