/* Tipos de las tablas del cotizador "Dos Vacaciones" (Supabase).
   Fechas `date` llegan como 'YYYY-MM-DD'; `timestamptz` como ISO; `numeric`
   puede llegar como string desde PostgREST, por eso se tipa number | string
   donde aplica y se normaliza en lib/viajes/data.ts. */

export interface ConfigCotizador {
  id: number
  eur_aud: number
  margen_pct: number
  traslados_aud_por_persona_ciudad: number
  colchon_rango_pct: number
  actualizado_en: string | null
}

export interface HotelChain {
  id: string
  name: string
  slug: string
  logo_image: string | null
  description: string | null
  sort_order: number | null
  is_active: boolean
  created_at: string
}

export interface HotelProperty {
  id: string
  chain_id: string | null
  name: string
  city: string
  country: string
  neighborhood: string | null
  tagline: string | null
  description: string | null
  perk: string | null
  hero_image: string | null
  gallery: string[] | null
  booking_url: string | null
  price_from: number | null
  currency: string | null
  sort_order: number | null
  is_active: boolean
  created_at: string
}

export type TipoTarifa = 'neta' | 'referencia_web'

// CONFIDENCIAL: tarifa_neta nunca debe llegar al navegador.
export interface HotelTarifa {
  id: string
  property_id: string
  temporada: string
  fecha_inicio: string // 'YYYY-MM-DD'
  fecha_fin: string // 'YYYY-MM-DD'
  tarifa_neta: number
  moneda: string
  noches_min: number | null
  noches_max: number | null
  ocupacion: number | null
  desayuno_incluido: boolean | null
  impuesto_ciudad_incluido: boolean | null
  tipo_tarifa: TipoTarifa
  notas: string | null
  created_at: string
}

export interface HotelFechaCerrada {
  id: string
  property_id: string
  fecha_desde: string // 'YYYY-MM-DD'
  fecha_hasta: string // 'YYYY-MM-DD'
  motivo: string | null
}

export interface HotelConTarifas extends HotelProperty {
  chain: Pick<HotelChain, 'id' | 'name' | 'slug'> | null
  tarifas: HotelTarifa[]
  fechas_cerradas: HotelFechaCerrada[]
}

export interface RutaVuelo {
  id: string
  origen: string
  ciudad_europa: string
  destino_latam: string
  temporada: string | null
  fecha_desde: string // 'YYYY-MM-DD'
  fecha_hasta: string // 'YYYY-MM-DD'
  precio_min_aud: number
  precio_max_aud: number
  conecta_por_usa: boolean | null
  aerolineas: string | null
  actualizado_en: string | null
}

export interface GuiaCiudad {
  id: string
  ciudad: string
  pais: string
  desde_aeropuerto: string | null
  como_moverse: string | null
  donde_quedarse: string | null
  imperdibles: string[] | null
  tip_parcero: string | null
  comunidad_latina: string | null
  is_active: boolean
}

export interface SolicitudDosVacaciones {
  id: string
  creado_en: string
  nombre: string
  email: string
  celular: string | null
  ciudad_salida: string | null
  fecha_ida: string | null
  fecha_vuelta: string | null
  pais_latam: string | null
  europa_momento: string | null
  adultos: number
  ninos: number
  pasaporte: string | null
  visa_usa: boolean | null
  ciudades_europa: string[] | null
  sorprendanme: boolean | null
  dias_europa: number | null
  estilo: string[] | null
  rango_min_aud: number | null
  rango_max_aud: number | null
  estado: string | null
  notas_internas: string | null
  desglose_interno: unknown // CONFIDENCIAL
  advertencias: string[] | null
}
