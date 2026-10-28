/* Rangos de precio para el cotizador de /viajes.

   MANUAL por ahora: estos números se editan a mano aquí y se suben con un
   deploy. Son estimados (no tarifas en firme); el cuadro los muestra como
   "rango" y le promete al cliente una cotización afinada en 24h.

   Todos los valores son en DÓLARES AUSTRALIANOS (AUD), POR PERSONA e
   IDA Y VUELTA. Para actualizarlos, cambia min/max de cada fila.

   Modelo:
   - `directo`  = viaje por el Pacífico / vía USA (la ruta corta).
   - `europa`   = con parada en Europa: conoce un país europeo a la ida y otro
                  a la vuelta (la "2ª vacación").
   La diferencia entre ambos la calcula el cuadro sola; no se escribe acá. */

export type Rango = { min: number; max: number }

export interface DestinoSudamerica {
  /** slug estable para selects y correos */
  slug: string
  /** lo que ve el cliente, p.ej. "Chile (Santiago)" */
  nombre: string
  /** nombre corto para los botones, p.ej. "Chile" */
  corto: string
  /** bandera emoji para los botones */
  flag: string
  directo: Rango
  europa: Rango
}

/* Ciudades de salida en Australia. Hoy el estimado NO cambia según la ciudad
   (los precios son parecidos entre SYD/BNE/MEL); se captura para que la
   cotización real de 24h salga desde la ciudad correcta. Si en el futuro
   quieres precios por ciudad, se parte este modelo por salida. */
export const CIUDADES_SALIDA = ['Sydney', 'Brisbane', 'Melbourne'] as const
export type CiudadSalida = (typeof CIUDADES_SALIDA)[number]

export const DESTINOS: DestinoSudamerica[] = [
  { slug: 'chile',     nombre: 'Chile (Santiago)',          corto: 'Chile',     flag: '🇨🇱', directo: { min: 1700, max: 3400 }, europa: { min: 3000, max: 5200 } },
  { slug: 'argentina', nombre: 'Argentina (Buenos Aires)',  corto: 'Argentina', flag: '🇦🇷', directo: { min: 1900, max: 3500 }, europa: { min: 3100, max: 5400 } },
  { slug: 'peru',      nombre: 'Perú (Lima)',               corto: 'Perú',      flag: '🇵🇪', directo: { min: 1900, max: 3700 }, europa: { min: 3200, max: 5500 } },
  { slug: 'brasil',    nombre: 'Brasil (São Paulo)',        corto: 'Brasil',    flag: '🇧🇷', directo: { min: 2000, max: 3800 }, europa: { min: 3300, max: 5600 } },
  { slug: 'colombia',  nombre: 'Colombia (Bogotá)',         corto: 'Colombia',  flag: '🇨🇴', directo: { min: 2000, max: 3900 }, europa: { min: 3100, max: 5400 } },
]

export function destinoPorSlug(slug: string): DestinoSudamerica | undefined {
  return DESTINOS.find((d) => d.slug === slug)
}

/** Formatea un entero AUD como "AUD 1.700" (separador de miles con punto). */
export function formatAUD(n: number): string {
  return `AUD ${Math.round(n).toLocaleString('es-CO')}`
}

/** Multiplica un rango por la cantidad de personas. */
export function porPersonas(r: Rango, personas: number): Rango {
  const p = Math.max(1, Math.floor(personas) || 1)
  return { min: r.min * p, max: r.max * p }
}

export interface Estimado {
  directo: Rango
  europa: Rango
  /** cuánto más cuesta, aprox., la opción con parada en Europa (por persona) */
  diferenciaDesde: number
  personas: number
}

/** Calcula el estimado a partir de un destino y la cantidad de personas. */
export function calcularEstimado(destino: DestinoSudamerica, personas: number): Estimado {
  const p = Math.max(1, Math.floor(personas) || 1)
  return {
    directo: porPersonas(destino.directo, p),
    europa: porPersonas(destino.europa, p),
    // La diferencia "desde" se lee por persona: el salto mínimo entre rutas.
    diferenciaDesde: destino.europa.min - destino.directo.min,
    personas: p,
  }
}
