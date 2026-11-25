'use server'

/* Envío del formulario de UK en "modo cuenta". Verifica en el servidor que la
   solicitud es del usuario con sesión, es de UK y no se ha enviado ya; guarda
   la aplicación con solicitud_id y marca la solicitud como enviada. */

import { solicitudPropia, yaEnviada, marcarEnviada } from '@/lib/portal/solicitud-propia'
import { executeSubmit } from '@/app/aplicar/turismo-uk/_actions/submit-application'

export async function enviarUk(
  solicitudId: string,
  data: any
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  const sol = await solicitudPropia(solicitudId)
  if (!sol) return { success: false, error: 'No autorizado.' }
  if (sol.pais !== 'uk') return { success: false, error: 'El formulario no está disponible para este destino.' }
  if (yaEnviada(sol.estado)) return { success: false, error: 'Este formulario ya fue enviado.' }

  const res = await executeSubmit(data, { solicitudId })
  if (!res.success) return res as { success: boolean; error?: string }

  await marcarEnviada(sol)
  return res as { success: boolean; applicationId?: string }
}
