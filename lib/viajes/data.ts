import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type {
  ConfigCotizador,
  GuiaCiudad,
  HotelConTarifas,
  HotelFechaCerrada,
  HotelTarifa,
  RutaVuelo,
} from './types'

/* Acceso a datos del cotizador "Dos Vacaciones". Solo servidor: usa la
   service role key y devuelve tarifas netas, que son confidenciales. El
   import de 'server-only' hace fallar el build si algo de cliente lo importa.
   Las tablas tienen RLS sin lectura pública: con la clave anon no se ve nada.

   Las ciudades se comparan tal como están en la base (en español y con
   tilde: 'París', 'Barcelona'). */

// PostgREST puede devolver numeric como string; acá todo sale como number.
const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v))
const numONull = (v: unknown): number | null => (v === null || v === undefined ? null : num(v))

function falla(contexto: string, error: { message: string }): never {
  console.error(`[VIAJES] ${contexto}:`, error)
  throw new Error(`No pudimos leer ${contexto}.`)
}

export async function getConfig(): Promise<ConfigCotizador> {
  const { data, error } = await supabaseAdmin.from('config_cotizador').select('*').limit(2)
  if (error) falla('la configuración del cotizador', error)
  if (!data || data.length !== 1) throw new Error(`config_cotizador debe tener exactamente 1 fila (tiene ${data?.length ?? 0}).`)
  const c = data[0]
  return {
    ...c,
    eur_aud: num(c.eur_aud),
    margen_pct: num(c.margen_pct),
    traslados_aud_por_persona_ciudad: num(c.traslados_aud_por_persona_ciudad),
    colchon_rango_pct: num(c.colchon_rango_pct),
  }
}

/* Hoteles activos de esas ciudades, con su cadena, tarifas y fechas cerradas.
   Las tarifas vienen ordenadas por fecha de inicio. */
export async function getHotelesConTarifas(ciudades: string[]): Promise<HotelConTarifas[]> {
  if (ciudades.length === 0) return []

  const { data, error } = await supabaseAdmin
    .from('hotel_properties')
    .select('*, chain:hotel_chains(id, name, slug), tarifas:hotel_tarifas(*), fechas_cerradas:hotel_fechas_cerradas(*)')
    .eq('is_active', true)
    .in('city', ciudades)
    .order('city')
    .order('sort_order', { ascending: true, nullsFirst: false })
  if (error) falla('los hoteles', error)

  return (data || []).map((h: any) => ({
    ...h,
    price_from: numONull(h.price_from),
    chain: h.chain ?? null,
    tarifas: ((h.tarifas || []) as HotelTarifa[])
      .map((t) => ({ ...t, tarifa_neta: num(t.tarifa_neta) }))
      .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio)),
    fechas_cerradas: ((h.fechas_cerradas || []) as HotelFechaCerrada[]).sort((a, b) => a.fecha_desde.localeCompare(b.fecha_desde)),
  }))
}

/* Rutas cuyo rango [fecha_desde, fecha_hasta] contiene `fecha` ('YYYY-MM-DD'). */
export async function getRutasVuelo(
  origen: string,
  ciudadEuropa: string,
  destinoLatam: string,
  fecha: string,
): Promise<RutaVuelo[]> {
  const { data, error } = await supabaseAdmin
    .from('rutas_vuelo')
    .select('*')
    .eq('origen', origen)
    .eq('ciudad_europa', ciudadEuropa)
    .eq('destino_latam', destinoLatam)
    .lte('fecha_desde', fecha)
    .gte('fecha_hasta', fecha)
    .order('precio_min_aud')
  if (error) falla('las rutas de vuelo', error)

  return (data || []).map((r: any) => ({ ...r, precio_min_aud: num(r.precio_min_aud), precio_max_aud: num(r.precio_max_aud) }))
}

export async function getGuias(ciudades: string[]): Promise<GuiaCiudad[]> {
  if (ciudades.length === 0) return []
  const { data, error } = await supabaseAdmin
    .from('guias_ciudad')
    .select('*')
    .eq('is_active', true)
    .in('ciudad', ciudades)
  if (error) falla('las guías de ciudad', error)
  return (data || []) as GuiaCiudad[]
}
