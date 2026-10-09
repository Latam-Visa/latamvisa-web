// Búsqueda de tarifas de convenio (servidor).

import { supabaseAdmin } from '@/lib/supabase/admin'
import { toNumber, type Cotizacion, type ConvenioTarifa } from '.'

export async function cargarTarifa(
  convenioId: string,
  tipoVisa: string,
  paisDestino: string,
  paisOrigen: string,
): Promise<ConvenioTarifa | null> {
  const { data } = await supabaseAdmin
    .from('convenio_tarifas')
    .select('*')
    .eq('convenio_id', convenioId)
    .eq('tipo_visa', tipoVisa)
    .eq('pais_destino', paisDestino)
    .eq('pais_origen', paisOrigen)
    .maybeSingle()
  return (data as ConvenioTarifa | null) ?? null
}

// Precio de lista de traducción por persona para el "antes $X, ¡ahorran $Y!".
// Sale de la tarifa del convenio; las cotizaciones directas no lo muestran.
export async function traduccionPorPersonaDe(
  c: Pick<Cotizacion, 'convenio_id' | 'tipo_visa' | 'pais_destino' | 'pais_origen'>,
): Promise<number | null> {
  if (!c.convenio_id) return null
  const tarifa = await cargarTarifa(c.convenio_id, c.tipo_visa, c.pais_destino, c.pais_origen)
  return tarifa ? toNumber(tarifa.traduccion_por_persona) : null
}
