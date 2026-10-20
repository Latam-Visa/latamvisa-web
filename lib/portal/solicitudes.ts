/* Tabla `solicitudes`: la puerta de entrada del cliente al portal.
   Todo aquí corre en el servidor con la service key: el navegador nunca
   escribe user_id ni activada_at (RLS no tiene política de INSERT). */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { esTokenValido } from './textos'

const TABLA = 'solicitudes'

export interface NuevaSolicitud {
  email_pago: string
  nombre_cliente: string | null
  pais: string
  servicio: string | null
  stripe_session_id: string
}

export interface SolicitudPorToken {
  id: string
  user_id: string | null
  activada_at: string | null
  email_pago: string
  nombre_cliente: string | null
  pais: string
  servicio: string | null
}

/**
 * Crea la solicitud de un pago. Idempotente por stripe_session_id (UNIQUE):
 * si Stripe reenvía el evento, el insert choca y se devuelve la fila que ya
 * existía, como éxito. Lanza en cualquier otro error para que Stripe reintente.
 */
export async function crearSolicitud(datos: NuevaSolicitud) {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .insert({ ...datos, estado: 'pendiente_activacion' })
    .select('id, token, activada_at')
    .single()
  if (!error) return { ...data, nueva: true }
  if (error.code !== '23505') throw new Error(`solicitudes insert: ${error.code} ${error.message}`)

  const { data: existente, error: error2 } = await supabaseAdmin
    .from(TABLA)
    .select('id, token, activada_at')
    .eq('stripe_session_id', datos.stripe_session_id)
    .single()
  if (error2 || !existente) throw new Error(`solicitudes duplicada sin fila: ${error2?.message}`)
  return { ...existente, nueva: false }
}

export async function solicitudPorToken(token: string): Promise<SolicitudPorToken | null> {
  if (!esTokenValido(token)) return null
  const { data } = await supabaseAdmin
    .from(TABLA)
    .select('id, user_id, activada_at, email_pago, nombre_cliente, pais, servicio')
    .eq('token', token)
    .maybeSingle()
  return data
}

export type ResultadoActivacion = 'activada' | 'ya_tuya' | 'ajena' | 'invalida'

/**
 * Amarra la solicitud al usuario. El update solo toca filas sin activar, así
 * dos activaciones simultáneas no se pisan: la segunda no actualiza nada y
 * cae en 'ajena' (o 'ya_tuya' si era el mismo usuario).
 */
export async function activarSolicitud(token: string, userId: string): Promise<ResultadoActivacion> {
  if (!esTokenValido(token)) return 'invalida'
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .update({ user_id: userId, activada_at: new Date().toISOString(), estado: 'activa', updated_at: new Date().toISOString() })
    .eq('token', token)
    .is('activada_at', null)
    .is('user_id', null)
    .select('id')
  if (error) throw new Error(`solicitudes activar: ${error.code} ${error.message}`)
  if (data?.length) return 'activada'

  const fila = await solicitudPorToken(token)
  if (!fila) return 'invalida'
  return fila.user_id === userId ? 'ya_tuya' : 'ajena'
}
