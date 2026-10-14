// Entrada a /finanzas: qué decirle al usuario cuando falla y a dónde mandarlo
// cuando entra. Compartido por /finanzas/auth/confirm (enlace mágico) y
// /finanzas/auth/callback (Google).

import type { SupabaseClient } from '@supabase/supabase-js'

// Códigos de Supabase que significan "este enlace ya no sirve, pide otro".
const VENCIDO = new Set(['otp_expired', 'flow_state_expired', 'flow_state_not_found'])

export type MotivoError = 'vencido' | 'entrar'

export function motivoError(code: string | null | undefined): MotivoError {
  return code && VENCIDO.has(code) ? 'vencido' : 'entrar'
}

// Solo al log del servidor: código, estado y mensaje de Supabase (no traen
// correo ni datos personales). Nunca el token ni la URL.
export function registrarErrorAuth(etapa: string, err: { code?: string | null; status?: number | null; name?: string; message?: string }) {
  console.error(`[FINANZAS] ${etapa} falló`, {
    code: err.code ?? null,
    status: err.status ?? null,
    tipo: err.name ?? null,
    mensaje: err.message ?? null,
  })
}

export async function destinoTrasEntrar(supabase: SupabaseClient): Promise<string> {
  const { data: perfil } = await supabase.from('fin_profiles').select('onboarding_done').maybeSingle()
  return perfil?.onboarding_done ? '/finanzas/plan' : '/finanzas/empezar'
}
