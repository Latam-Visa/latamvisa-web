"use server"

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/cotizaciones'
import { crearCotizacion, enviarCotizacionPorEmail } from '@/lib/cotizaciones/servidor'
import type { GenerarPayload, ResultadoGenerar } from '@/components/cotizacion/GeneradorCotizacion'

/* El middleware protege /admin, pero una server action se puede invocar con
   un POST a cualquier ruta. Misma verificación de cookie que middleware.ts. */
function esAdmin(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  const cookie = cookies().get('admin_auth')?.value
  return Boolean(envPassword) && cookie === envPassword
}

const NO_AUTORIZADO = { success: false as const, error: 'Sesión de admin expirada. Vuelve a iniciar sesión.' }

function revalidar(id?: string) {
  revalidatePath('/admin/cotizaciones')
  revalidatePath('/admin')
  if (id) revalidatePath(`/admin/cotizaciones/${id}`)
}

// Mismo generador que el portal, pero el admin elige convenio (o Directo) y
// puede ajustar montos. El servidor recalcula y valida todo.
export async function generarCotizacionAdmin(payload: GenerarPayload): Promise<ResultadoGenerar> {
  if (!esAdmin()) return NO_AUTORIZADO
  const convenioId = payload.convenio_id && isUuid(payload.convenio_id) ? payload.convenio_id : null

  const res = await crearCotizacion({
    convenioId,
    creadaPor: 'admin',
    input: {
      tipo_visa: payload.tipo_visa,
      pais_destino: payload.pais_destino,
      pais_origen: payload.pais_origen,
      personas: payload.personas,
      tiene_visa_usa: payload.tiene_visa_usa,
      cliente_nombre: payload.cliente_nombre,
    },
    ajustes: payload.ajustes ?? null,
  })
  if (!res.success) return res

  revalidar()
  return { success: true, cotizacion: res.cotizacion }
}

// El admin no tiene límite diario (ese aplica al portal de convenios).
export async function enviarEmailAdmin(cotizacionId: string, email: string) {
  if (!esAdmin()) return NO_AUTORIZADO
  if (!isUuid(cotizacionId)) return { success: false as const, error: 'No encontramos la cotización.' }
  const res = await enviarCotizacionPorEmail({ cotizacionId, email, convenioId: null })
  if (res.success) revalidar(cotizacionId)
  return res
}

export async function anularCotizacion(id: string): Promise<{ success: boolean; error?: string }> {
  if (!esAdmin()) return NO_AUTORIZADO

  // Una cotización pagada no se anula desde aquí (habría que reembolsar).
  const { data, error } = await supabaseAdmin
    .from('cotizaciones')
    .update({ estado: 'anulada' })
    .eq('id', id)
    .in('estado', ['pendiente', 'vencida'])
    .select('id')

  if (error) return { success: false, error: 'No pudimos anular la cotización.' }
  if (!data?.length) return { success: false, error: 'Solo se pueden anular cotizaciones pendientes o vencidas.' }

  revalidar(id)
  return { success: true }
}

export async function extenderCotizacion(id: string): Promise<{ success: boolean; error?: string }> {
  if (!esAdmin()) return NO_AUTORIZADO

  const { data: cot } = await supabaseAdmin.from('cotizaciones').select('estado, vence_el').eq('id', id).maybeSingle()
  if (!cot || cot.estado !== 'pendiente') return { success: false, error: 'Solo se pueden extender cotizaciones pendientes.' }

  // Si ya venció, los 7 días cuentan desde hoy; si no, desde su vencimiento.
  const base = new Date(Math.max(Date.now(), new Date(cot.vence_el).getTime()))
  const nuevoVence = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000)

  const { error } = await supabaseAdmin
    .from('cotizaciones')
    .update({ vence_el: nuevoVence.toISOString() })
    .eq('id', id)
    .eq('estado', 'pendiente')

  if (error) return { success: false, error: 'No pudimos extender la cotización.' }

  revalidar(id)
  return { success: true }
}

export async function marcarComisionPagada(id: string): Promise<{ success: boolean; error?: string }> {
  if (!esAdmin()) return NO_AUTORIZADO

  const { data, error } = await supabaseAdmin
    .from('cotizaciones')
    .update({ comision_pagada_el: new Date().toISOString() })
    .eq('id', id)
    .eq('estado', 'pagada')
    .is('comision_pagada_el', null)
    .select('id')

  if (error) return { success: false, error: 'No pudimos marcar la comisión.' }
  if (!data?.length) return { success: false, error: 'La cotización no está pagada o la comisión ya estaba marcada.' }

  revalidar(id)
  return { success: true }
}
