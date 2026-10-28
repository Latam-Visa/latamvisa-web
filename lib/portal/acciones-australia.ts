'use server'

/* Acciones del formulario de Australia en "modo cuenta": el mismo formulario
   público (/aplicar/turismo-australia?solicitud=<id>) cuando el cliente llega
   desde /mi-cuenta.

   Todo corre en el servidor con la service key, pero cada acción vuelve a
   verificar, contra la sesión, que el usuario es dueño de la solicitud: el
   navegador manda el solicitudId, nunca el user_id. RLS de `solicitudes` sigue
   sin INSERT/UPDATE para anon/authenticated; el borrador se escribe solo aquí. */

import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { usuarioActual } from '@/lib/portal/supabase'
import { executeSubmit } from '@/app/aplicar/turismo-australia/_actions/submit-application'

type SolicitudPropia = {
  id: string
  userId: string
  pais: string
  estado: string | null
}

// Devuelve la solicitud solo si pertenece al usuario con sesión; si no, null.
async function solicitudPropia(solicitudId: string): Promise<SolicitudPropia | null> {
  if (!/^[0-9a-f-]{36}$/i.test(solicitudId)) return null
  const { user } = await usuarioActual()
  if (!user) return null
  const { data } = await supabaseAdmin
    .from('solicitudes')
    .select('id, user_id, pais, estado')
    .eq('id', solicitudId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!data) return null
  return { id: data.id, userId: user.id, pais: data.pais, estado: data.estado }
}

const yaEnviada = (estado: string | null) => estado === 'enviada' || estado === 'completada'

// Estado inicial del formulario en modo cuenta. 'sin_acceso' = sin sesión o
// la solicitud no es de este usuario (el formulario manda a /entrar).
export async function cargarBorrador(solicitudId: string): Promise<
  | { estado: 'sin_acceso' }
  | { estado: 'enviada' }
  | { estado: 'otro_pais'; pais: string }
  | { estado: 'ok'; borrador: { data?: any; step?: number } | null }
> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol) return { estado: 'sin_acceso' }
  if (yaEnviada(sol.estado)) return { estado: 'enviada' }
  if (sol.pais !== 'australia') return { estado: 'otro_pais', pais: sol.pais }
  const { data } = await supabaseAdmin
    .from('solicitudes')
    .select('borrador_formulario')
    .eq('id', solicitudId)
    .eq('user_id', sol.userId)
    .maybeSingle()
  const b = data?.borrador_formulario as { data?: any; step?: number } | null
  return { estado: 'ok', borrador: b && b.data ? b : null }
}

export async function guardarBorrador(
  solicitudId: string,
  data: unknown,
  step: number
): Promise<{ ok: boolean }> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol || yaEnviada(sol.estado)) return { ok: false }

  const { error } = await supabaseAdmin
    .from('solicitudes')
    .update({
      borrador_formulario: { data, step },
      borrador_actualizado_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', solicitudId)
    .eq('user_id', sol.userId)
  if (error) console.error('[PORTAL_FORM] guardar borrador', { code: error.code })
  return { ok: !error }
}

// Firma una URL de subida en la carpeta de la solicitud. Mismo mapeo de
// extensiones que el formulario público; solo cambia el prefijo de la ruta.
export async function urlDeSubida(
  solicitudId: string,
  fileType: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol || yaEnviada(sol.estado)) return { success: false, error: 'No autorizado.' }

  let ext = 'pdf'
  if (fileType === 'image/jpeg') ext = 'jpg'
  else if (fileType === 'image/png') ext = 'png'
  else if (fileType === 'image/webp') ext = 'webp'
  else if (fileType === 'image/heic') ext = 'heic'
  else if (fileType === 'application/msword') ext = 'doc'
  else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ext = 'docx'

  const path = `australia/sol-${solicitudId}/${uuidv4()}.${ext}`
  const { data, error } = await supabaseAdmin.storage
    .from('visa-applications')
    .createSignedUploadUrl(path)
  if (error || !data) {
    console.error('[PORTAL_FORM] url de subida', { code: (error as any)?.name })
    return { success: false, error: 'No se pudo generar la URL de subida.' }
  }
  return { success: true, url: data.signedUrl, path }
}

export async function enviarAustralia(
  solicitudId: string,
  data: any
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol) return { success: false, error: 'No autorizado.' }
  if (sol.pais !== 'australia') return { success: false, error: 'El formulario no está disponible para este destino.' }
  if (yaEnviada(sol.estado)) return { success: false, error: 'Este formulario ya fue enviado.' }

  const res = await executeSubmit(data, { solicitudId })
  if (!res.success) return res

  const { error } = await supabaseAdmin
    .from('solicitudes')
    .update({ estado: 'enviada', updated_at: new Date().toISOString() })
    .eq('id', solicitudId)
    .eq('user_id', sol.userId)
  if (error) console.error('[PORTAL_FORM] marcar enviada', { code: error.code })
  return res
}
