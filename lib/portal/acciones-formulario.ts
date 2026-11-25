'use server'

/* Acciones del formulario en "modo cuenta" para Canadá, Japón, UK y Schengen:
   el mismo formulario público (/aplicar/turismo-<pais>?solicitud=<id>) cuando
   el cliente llega desde /mi-cuenta. Espejo de acciones-usa/australia, con el
   país como parámetro. El país que manda el navegador se compara con el de la
   solicitud: no se puede usar una solicitud en el formulario de otro destino. */

import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { solicitudPropia, yaEnviada } from '@/lib/portal/solicitud-propia'

const PAISES = ['canada', 'japon', 'uk', 'schengen']

// Estado inicial del formulario en modo cuenta. 'sin_acceso' = sin sesión o
// la solicitud no es de este usuario (el formulario manda a /entrar).
export async function cargarBorrador(solicitudId: string, pais: string): Promise<
  | { estado: 'sin_acceso' }
  | { estado: 'enviada' }
  | { estado: 'otro_pais'; pais: string }
  | { estado: 'ok'; borrador: { data?: any; step?: number } | null; prefill: { fullName: string; email: string } }
> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol || !PAISES.includes(pais)) return { estado: 'sin_acceso' }
  if (yaEnviada(sol.estado)) return { estado: 'enviada' }
  if (sol.pais !== pais) return { estado: 'otro_pais', pais: sol.pais }
  const { data } = await supabaseAdmin
    .from('solicitudes')
    .select('borrador_formulario')
    .eq('id', solicitudId)
    .eq('user_id', sol.userId)
    .maybeSingle()
  const b = data?.borrador_formulario as { data?: any; step?: number } | null
  const prefill = { fullName: sol.nombreCliente ?? '', email: sol.emailPago ?? '' }
  return { estado: 'ok', borrador: b && b.data ? b : null, prefill }
}

export async function guardarBorrador(
  solicitudId: string,
  pais: string,
  data: unknown,
  step: number
): Promise<{ ok: boolean }> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol || sol.pais !== pais || !PAISES.includes(pais) || yaEnviada(sol.estado)) return { ok: false }

  const { error } = await supabaseAdmin
    .from('solicitudes')
    .update({
      borrador_formulario: { data, step },
      borrador_actualizado_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', solicitudId)
    .eq('user_id', sol.userId)
  if (error) console.error('[PORTAL_FORM] guardar borrador', { pais, code: error.code })
  return { ok: !error }
}

// Firma una URL de subida en la carpeta de la solicitud (`<pais>/sol-<id>/`),
// mismas extensiones y bucket que el formulario público.
export async function urlDeSubida(
  solicitudId: string,
  pais: string,
  fileType: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol || sol.pais !== pais || !PAISES.includes(pais) || yaEnviada(sol.estado)) {
    return { success: false, error: 'No autorizado.' }
  }

  let ext = 'pdf'
  if (fileType === 'image/jpeg') ext = 'jpg'
  else if (fileType === 'image/png') ext = 'png'
  else if (fileType === 'image/webp') ext = 'webp'
  else if (fileType === 'image/heic') ext = 'heic'
  else if (fileType === 'application/msword') ext = 'doc'
  else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ext = 'docx'

  const path = `${pais}/sol-${solicitudId}/${uuidv4()}.${ext}`
  const { data, error } = await supabaseAdmin.storage.from('visa-applications').createSignedUploadUrl(path)
  if (error || !data) {
    console.error('[PORTAL_FORM] url de subida', { pais, code: (error as any)?.name })
    return { success: false, error: 'No se pudo generar la URL de subida.' }
  }
  return { success: true, url: data.signedUrl, path }
}
