/* Verificación de propiedad de una solicitud para los formularios en "modo
   cuenta" (Canadá, Japón, UK, Schengen). Solo servidor: el navegador manda el
   solicitudId, nunca el user_id; aquí se compara contra la sesión. */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { usuarioActual } from '@/lib/portal/supabase'

export type SolicitudPropia = {
  id: string
  userId: string
  pais: string
  estado: string | null
  nombreCliente: string | null
  emailPago: string | null
}

export const yaEnviada = (estado: string | null) => estado === 'enviada' || estado === 'completada'

// Devuelve la solicitud solo si pertenece al usuario con sesión; si no, null.
export async function solicitudPropia(solicitudId: string): Promise<SolicitudPropia | null> {
  if (!/^[0-9a-f-]{36}$/i.test(solicitudId)) return null
  const { user } = await usuarioActual()
  if (!user) return null
  const { data } = await supabaseAdmin
    .from('solicitudes')
    .select('id, user_id, pais, estado, nombre_cliente, email_pago')
    .eq('id', solicitudId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id,
    userId: user.id,
    pais: data.pais,
    estado: data.estado,
    nombreCliente: data.nombre_cliente ?? null,
    emailPago: data.email_pago ?? (user.email ?? null),
  }
}

// Marca la solicitud como enviada (solo si es del usuario).
export async function marcarEnviada(sol: SolicitudPropia) {
  const { error } = await supabaseAdmin
    .from('solicitudes')
    .update({ estado: 'enviada', updated_at: new Date().toISOString() })
    .eq('id', sol.id)
    .eq('user_id', sol.userId)
  if (error) console.error('[PORTAL_FORM] marcar enviada', { code: error.code })
}
