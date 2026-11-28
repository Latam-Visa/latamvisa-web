import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Activity, Prospect } from './index'

// PostgREST corta en 1000 filas: se pagina para no perder datos en silencio.
async function todas<T>(tabla: string, orden: string): Promise<T[]> {
  const filas: T[] = []
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await supabaseAdmin.from(tabla).select('*').order(orden).order('id').range(desde, desde + 999)
    if (error) throw new Error(`${tabla}: ${error.message}`)
    filas.push(...((data || []) as T[]))
    if (!data || data.length < 1000) return filas
  }
}

export const cargarProspectos = () => todas<Prospect>('sales_prospects', 'full_name')
export const cargarActividades = () => todas<Activity>('sales_activities', 'happened_at')
