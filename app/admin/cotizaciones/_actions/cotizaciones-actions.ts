"use server"

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  PAISES_COTIZACION,
  calcularMontos,
  finDelDiaBogota,
  toNumber,
  type ConvenioTarifa,
} from '@/lib/cotizaciones'

/* El middleware protege /admin, pero una server action se puede invocar con
   un POST a cualquier ruta. Misma verificación de cookie que middleware.ts. */
function esAdmin(): boolean {
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  const cookie = cookies().get('admin_auth')?.value
  return Boolean(envPassword) && cookie === envPassword
}

const NO_AUTORIZADO = { success: false as const, error: 'Sesión de admin expirada. Vuelve a iniciar sesión.' }

const PAISES_VALIDOS = new Set<string>(PAISES_COTIZACION.map((p) => p.value))
const MAX_MONTO = 99_999_999 // Límite de Stripe para COP: 10 dígitos en centavos.

function revalidar(id?: string) {
  revalidatePath('/admin/cotizaciones')
  revalidatePath('/admin')
  if (id) revalidatePath(`/admin/cotizaciones/${id}`)
}

async function cargarTarifa(convenioId: string, pais: string) {
  const [{ data: convenio }, { data: tarifa }] = await Promise.all([
    supabaseAdmin.from('convenios').select('id, comision_por_persona, activo').eq('id', convenioId).maybeSingle(),
    supabaseAdmin
      .from('convenio_tarifas')
      .select('*')
      .eq('convenio_id', convenioId)
      .eq('pais_destino', pais)
      .maybeSingle(),
  ])
  return { convenio, tarifa: tarifa as ConvenioTarifa | null }
}

export interface NuevaCotizacionInput {
  convenio_id: string | null
  pais_destino: string
  personas: number
  cliente_nombre: string
  cliente_email: string
  cliente_whatsapp: string
  vigencia_dias: number
  notas: string
  // Montos editados en el formulario. El servidor los valida y, si alguno no
  // llega o no es válido, usa el que calcula a partir de la tarifa.
  asesoria_total: number | null
  traducciones_total: number | null
  gobierno_estimado: number | null
  comision_total: number | null
}

function montoValido(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const n = toNumber(valor)
  if (!Number.isInteger(n) || n < 0 || n > MAX_MONTO) return null
  return n
}

export async function crearCotizacion(
  input: NuevaCotizacionInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!esAdmin()) return NO_AUTORIZADO

  const nombre = input.cliente_nombre?.trim()
  if (!nombre) return { success: false, error: 'El nombre del cliente es obligatorio.' }

  const pais = input.pais_destino
  if (!PAISES_VALIDOS.has(pais)) return { success: false, error: 'País de destino inválido.' }

  const personas = Math.trunc(toNumber(input.personas))
  if (personas < 1 || personas > 50) return { success: false, error: 'El número de personas debe estar entre 1 y 50.' }

  const vigencia = Math.trunc(toNumber(input.vigencia_dias))
  if (vigencia < 1 || vigencia > 90) return { success: false, error: 'La vigencia debe estar entre 1 y 90 días.' }

  const email = input.cliente_email?.trim() || null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'El correo del cliente no es válido.' }
  }

  // Recalcular en el servidor con las tarifas de la base de datos.
  let sugeridos = { asesoria_total: 0, traducciones_total: 0, gobierno_estimado: 0, comision_total: 0, moneda: 'COP' }
  const convenioId = input.convenio_id || null

  if (convenioId) {
    const { convenio, tarifa } = await cargarTarifa(convenioId, pais)
    if (!convenio || !convenio.activo) return { success: false, error: 'El convenio no existe o no está activo.' }
    if (tarifa) {
      sugeridos = calcularMontos(personas, tarifa, toNumber(convenio.comision_por_persona))
    } else {
      sugeridos.comision_total = personas * toNumber(convenio.comision_por_persona)
    }
  }

  const asesoria = montoValido(input.asesoria_total) ?? sugeridos.asesoria_total
  const traducciones = montoValido(input.traducciones_total) ?? sugeridos.traducciones_total
  const gobierno = montoValido(input.gobierno_estimado) ?? sugeridos.gobierno_estimado
  // Una cotización directa no genera comisión, diga lo que diga el cliente.
  const comision = convenioId ? montoValido(input.comision_total) ?? sugeridos.comision_total : 0

  if (asesoria <= 0) return { success: false, error: 'El valor de la asesoría debe ser mayor a cero.' }
  if (asesoria + traducciones > MAX_MONTO) return { success: false, error: 'El monto a cobrar es demasiado alto.' }

  // numero, token y monto (columna generada) los pone la base de datos.
  const { data, error } = await supabaseAdmin
    .from('cotizaciones')
    .insert({
      convenio_id: convenioId,
      pais_destino: pais,
      personas,
      moneda: sugeridos.moneda,
      cliente_nombre: nombre,
      cliente_email: email,
      cliente_whatsapp: input.cliente_whatsapp?.trim() || null,
      asesoria_total: asesoria,
      traducciones_total: traducciones,
      gobierno_estimado: gobierno,
      comision_total: comision,
      vence_el: finDelDiaBogota(vigencia).toISOString(),
      notas: input.notas?.trim() || null,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[COTIZACIONES] Error creando cotización:', error)
    return { success: false, error: 'No pudimos crear la cotización. Intenta de nuevo.' }
  }

  revalidar()
  return { success: true, id: data.id }
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
