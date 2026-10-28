'use server'

/* Acciones del formulario de USA en "modo cuenta": el mismo formulario público
   (/aplicar/turismo-usa?solicitud=<id>) cuando el cliente llega desde /mi-cuenta.
   Espejo de acciones-australia.ts.

   Todo corre en el servidor con la service key, pero cada acción vuelve a
   verificar, contra la sesión, que el usuario es dueño de la solicitud: el
   navegador manda el solicitudId, nunca el user_id. RLS de `solicitudes` sigue
   sin INSERT/UPDATE para anon/authenticated; el borrador se escribe solo aquí. */

import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { usuarioActual } from '@/lib/portal/supabase'
import { executeSubmit } from '@/app/aplicar/turismo-usa/_actions/submit-application'

const PAIS = 'usa'

type SolicitudPropia = {
  id: string
  userId: string
  pais: string
  estado: string | null
  nombreCliente: string | null
  emailPago: string | null
}

// Devuelve la solicitud solo si pertenece al usuario con sesión; si no, null.
async function solicitudPropia(solicitudId: string): Promise<SolicitudPropia | null> {
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

const yaEnviada = (estado: string | null) => estado === 'enviada' || estado === 'completada'

// Estado inicial del formulario en modo cuenta. 'sin_acceso' = sin sesión o
// la solicitud no es de este usuario (el formulario manda a /entrar).
export async function cargarBorrador(solicitudId: string): Promise<
  | { estado: 'sin_acceso' }
  | { estado: 'enviada' }
  | { estado: 'otro_pais'; pais: string }
  | { estado: 'ok'; borrador: { data?: any; step?: number } | null; prefill: { fullName: string; email: string } }
> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol) return { estado: 'sin_acceso' }
  if (yaEnviada(sol.estado)) return { estado: 'enviada' }
  if (sol.pais !== PAIS) return { estado: 'otro_pais', pais: sol.pais }
  const { data } = await supabaseAdmin
    .from('solicitudes')
    .select('borrador_formulario')
    .eq('id', solicitudId)
    .eq('user_id', sol.userId)
    .maybeSingle()
  const b = data?.borrador_formulario as { data?: any; step?: number } | null
  // Nombre y correo del pago, para prellenar el paso 1 cuando aún no hay borrador.
  const prefill = { fullName: sol.nombreCliente ?? '', email: sol.emailPago ?? '' }
  return { estado: 'ok', borrador: b && b.data ? b : null, prefill }
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
  if (error) console.error('[PORTAL_FORM_USA] guardar borrador', { code: error.code })
  return { ok: !error }
}

// Firma una URL de subida en la carpeta de la solicitud. Mismo bucket que el
// formulario público de USA (SUPABASE_STORAGE_BUCKET); solo cambia el prefijo,
// para que el admin encuentre el pasaporte y las visas aunque el cliente no
// haya terminado, y queden amarrados a la solicitud.
export async function urlDeSubida(
  solicitudId: string,
  fileType: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol || yaEnviada(sol.estado)) return { success: false, error: 'No autorizado.' }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'visa-documents'

  let ext = 'jpg'
  if (fileType === 'image/png') ext = 'png'
  else if (fileType === 'image/webp') ext = 'webp'
  else if (fileType === 'application/pdf') ext = 'pdf'

  const path = `usa/sol-${solicitudId}/${uuidv4()}.${ext}`
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(path)
  if (error || !data) {
    console.error('[PORTAL_FORM_USA] url de subida', { code: (error as any)?.name })
    return { success: false, error: 'No se pudo generar la URL de subida.' }
  }
  return { success: true, url: data.signedUrl, path }
}

export async function enviarUsa(
  solicitudId: string,
  data: any
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol) return { success: false, error: 'No autorizado.' }
  if (sol.pais !== PAIS) return { success: false, error: 'El formulario no está disponible para este destino.' }
  if (yaEnviada(sol.estado)) return { success: false, error: 'Este formulario ya fue enviado.' }

  const res = await executeSubmit(data, { solicitudId })
  if (!res.success) return res

  const { error } = await supabaseAdmin
    .from('solicitudes')
    .update({ estado: 'enviada', updated_at: new Date().toISOString() })
    .eq('id', solicitudId)
    .eq('user_id', sol.userId)
  if (error) console.error('[PORTAL_FORM_USA] marcar enviada', { code: error.code })
  return res
}
