'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/cotizaciones'
import { crearCotizacion, enviarCotizacionPorEmail } from '@/lib/cotizaciones/servidor'
import type { GenerarPayload, ResultadoGenerar } from '@/components/cotizacion/GeneradorCotizacion'

// El convenio sale SIEMPRE del token del portal, nunca del formulario.
async function convenioDelPortal(portalToken: string): Promise<string | null> {
  if (!isUuid(portalToken)) return null
  const { data } = await supabaseAdmin
    .from('convenios')
    .select('id')
    .eq('portal_token', portalToken)
    .eq('activo', true)
    .maybeSingle()
  return data?.id ?? null
}

const SIN_ACCESO = { success: false as const, error: 'Este portal no está activo. Escríbenos por WhatsApp.' }

export async function generarCotizacionConvenio(portalToken: string, payload: GenerarPayload): Promise<ResultadoGenerar> {
  const convenioId = await convenioDelPortal(portalToken)
  if (!convenioId) return SIN_ACCESO

  // Del payload solo se usan las 4 entradas y el nombre: convenio_id y
  // ajustes de montos se ignoran a propósito.
  const res = await crearCotizacion({
    convenioId,
    creadaPor: 'convenio',
    input: {
      tipo_visa: payload.tipo_visa,
      pais_destino: payload.pais_destino,
      pais_origen: payload.pais_origen,
      personas: payload.personas,
      tiene_visa_usa: payload.tiene_visa_usa,
      cliente_nombre: payload.cliente_nombre,
    },
  })
  if (!res.success) return res

  revalidatePath(`/convenio/${portalToken}`)
  revalidatePath('/admin/cotizaciones')
  return { success: true, cotizacion: res.cotizacion }
}

export async function enviarEmailConvenio(portalToken: string, cotizacionId: string, email: string) {
  const convenioId = await convenioDelPortal(portalToken)
  if (!convenioId) return SIN_ACCESO
  if (!isUuid(cotizacionId)) return { success: false as const, error: 'No encontramos la cotización.' }

  const res = await enviarCotizacionPorEmail({ cotizacionId, email, convenioId })
  if (res.success) revalidatePath(`/convenio/${portalToken}`)
  return res
}
