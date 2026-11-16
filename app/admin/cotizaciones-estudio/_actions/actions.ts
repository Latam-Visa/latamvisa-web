"use server"

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  isUuid,
  normalizarEstudio,
  planCuadra,
  type EstadoEstudio,
  type CotizacionEstudio,
  type PlanPagoRow,
} from '@/lib/cotizaciones-estudio'

/* El middleware protege /admin, pero una server action se puede invocar con un
   POST a cualquier ruta. Misma verificación de cookie que en el resto del admin. */
function esAdmin(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  const cookie = cookies().get('admin_auth')?.value
  return Boolean(envPassword) && cookie === envPassword
}

const NO_AUTORIZADO = { success: false as const, error: 'Sesión de admin expirada. Vuelve a iniciar sesión.' }

function revalidar(id?: string) {
  revalidatePath('/admin/cotizaciones-estudio')
  revalidatePath('/admin')
  if (id) revalidatePath(`/admin/cotizaciones-estudio/${id}`)
}

// Campos que el cliente puede escribir. Todo lo demás (id, created_at,
// updated_at) lo maneja la base. Whitelist explícita = nada de columnas sueltas.
export type GuardarPayload = Omit<CotizacionEstudio, 'id' | 'created_at' | 'updated_at'>

function limpiarPayload(p: GuardarPayload) {
  const plan: PlanPagoRow[] = Array.isArray(p.plan_pagos) ? p.plan_pagos : []
  return {
    estado: p.estado,
    nombre: p.nombre ?? '',
    edad: p.edad,
    pais: p.pais,
    nivel_ingles: p.nivel_ingles,
    pasaporte: p.pasaporte,
    ciudad_llegada: p.ciudad_llegada,
    telefono: p.telefono,
    email: p.email,
    student_type: p.student_type,
    colegio: p.colegio,
    colegio_nombre_completo: p.colegio_nombre_completo,
    tipo: p.tipo,
    curso: p.curso,
    cricos: p.cricos,
    semanas_enrolment: p.semanas_enrolment,
    semanas_pagas: p.semanas_pagas,
    semanas_gratis: p.semanas_gratis,
    precio_semana_neto: p.precio_semana_neto,
    materiales_por_semana_paga: p.materiales_por_semana_paga,
    duracion_texto: p.duracion_texto,
    vacaciones_semanas: p.vacaciones_semanas,
    fecha_inicio: p.fecha_inicio || null,
    promo_banner: p.promo_banner,
    extras_gratis: Array.isArray(p.extras_gratis) ? p.extras_gratis : [],
    matricula_cliente: p.matricula_cliente ?? 0,
    materiales: p.materiales ?? 0,
    inscripcion: p.inscripcion ?? 0,
    oshc: p.oshc ?? 0,
    visa: p.visa ?? 0,
    total: p.total ?? 0,
    matricula_neta: p.matricula_neta,
    comision_pct: p.comision_pct,
    comision_aud: p.comision_aud,
    notas_internas: p.notas_internas,
    solvencia_aud: p.solvencia_aud,
    biometria_cop: p.biometria_cop,
    medico_cop: p.medico_cop,
    plan_pagos: plan,
  }
}

export async function crearBorradorEstudio(): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!esAdmin()) return NO_AUTORIZADO
  const { data, error } = await supabaseAdmin
    .from('cotizaciones_estudio')
    .insert({ estado: 'borrador', nombre: '', student_type: 'offshore' })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[COT-ESTUDIO] crear:', error)
    return { success: false, error: 'No pudimos crear la cotización.' }
  }
  revalidar()
  return { success: true, id: data.id }
}

export async function guardarEstudio(id: string, payload: GuardarPayload): Promise<{ success: boolean; error?: string }> {
  if (!esAdmin()) return NO_AUTORIZADO
  if (!isUuid(id)) return { success: false, error: 'No encontramos la cotización.' }

  // No se puede marcar "enviada" si el plan no cuadra con el total.
  if (payload.estado === 'enviada' && !planCuadra(payload)) {
    return { success: false, error: 'El plan de pagos no suma el total; no se puede marcar como enviada.' }
  }

  const { error } = await supabaseAdmin
    .from('cotizaciones_estudio')
    .update(limpiarPayload(payload))
    .eq('id', id)

  if (error) {
    console.error('[COT-ESTUDIO] guardar:', error)
    return { success: false, error: 'No pudimos guardar los cambios.' }
  }
  revalidar(id)
  return { success: true }
}

export async function cambiarEstadoEstudio(id: string, estado: EstadoEstudio): Promise<{ success: boolean; error?: string }> {
  if (!esAdmin()) return NO_AUTORIZADO
  if (!isUuid(id)) return { success: false, error: 'No encontramos la cotización.' }

  if (estado === 'enviada') {
    const { data } = await supabaseAdmin.from('cotizaciones_estudio').select('*').eq('id', id).maybeSingle()
    if (!data) return { success: false, error: 'No encontramos la cotización.' }
    if (!planCuadra(normalizarEstudio(data))) {
      return { success: false, error: 'El plan de pagos no suma el total; cuádralo antes de enviar.' }
    }
  }

  const { error } = await supabaseAdmin.from('cotizaciones_estudio').update({ estado }).eq('id', id)
  if (error) {
    console.error('[COT-ESTUDIO] estado:', error)
    return { success: false, error: 'No pudimos cambiar el estado.' }
  }
  revalidar(id)
  return { success: true }
}

// Tasa AUD → USD del día. Fuente principal open.er-api.com (actualiza a diario),
// respaldo frankfurter.dev (BCE). Devuelve la tasa y de dónde salió.
export async function obtenerTasaUsd(): Promise<{ success: boolean; rate?: number; fecha?: string; fuente?: string; error?: string }> {
  if (!esAdmin()) return { success: false, error: 'Sesión de admin expirada.' }

  try {
    const r = await fetch('https://open.er-api.com/v6/latest/AUD', { cache: 'no-store' })
    const j = await r.json()
    const rate = j?.rates?.USD
    if (typeof rate === 'number' && rate > 0) {
      return { success: true, rate, fecha: j.time_last_update_utc || '', fuente: 'exchangerate-api' }
    }
  } catch {
    /* intentamos el respaldo */
  }

  try {
    const r = await fetch('https://api.frankfurter.dev/v1/latest?base=AUD&symbols=USD', { cache: 'no-store' })
    const j = await r.json()
    const rate = j?.rates?.USD
    if (typeof rate === 'number' && rate > 0) {
      return { success: true, rate, fecha: j.date || '', fuente: 'frankfurter / BCE' }
    }
  } catch {
    /* sin suerte */
  }

  return { success: false, error: 'No pudimos obtener la tasa del día. Intenta de nuevo.' }
}

export async function eliminarEstudio(id: string): Promise<{ success: boolean; error?: string }> {
  if (!esAdmin()) return NO_AUTORIZADO
  if (!isUuid(id)) return { success: false, error: 'No encontramos la cotización.' }

  const { error } = await supabaseAdmin.from('cotizaciones_estudio').delete().eq('id', id)
  if (error) {
    console.error('[COT-ESTUDIO] eliminar:', error)
    return { success: false, error: 'No pudimos eliminar la cotización.' }
  }
  revalidar()
  return { success: true }
}
