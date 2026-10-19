import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { calcularCotizacion, ciudadesParaCotizar, tramoEuropa, type CotizacionInput, type CotizacionPublica } from './cotizador'
import { getConfig, getGuias, getHotelesConTarifas, getRutasVuelo } from './data'
import type { GuiaCiudad } from './types'
import type { SolicitudInput } from './schema'

/* Procesa una solicitud ya validada: cotiza, guarda el lead y arma lo que
   puede ver el cliente. Regla: NUNCA perder un lead. Si el cálculo falla se
   guarda igual (sin rango); si el insert falla, se avisa por correo al admin
   con todos los datos. */

export const MENSAJE_SIN_RANGO = 'Recibimos tus datos. Te escribimos en las próximas 24 horas con tu cotización.'

export type GuiaPublica = Omit<GuiaCiudad, 'id' | 'is_active'>

export interface RespuestaCotizar {
  ok: true
  solicitud_id: string | null
  publico: CotizacionPublica | null
  guias: GuiaPublica[]
  mensaje?: string
}

async function cotizar(input: CotizacionInput) {
  const ciudades = ciudadesParaCotizar(input)
  const fechaVuelos = input.europa_momento === 'ida' ? tramoEuropa(input).check_in : input.fecha_ida
  const [config, hoteles, rutas] = await Promise.all([
    getConfig(),
    getHotelesConTarifas(ciudades),
    ciudades[0] ? getRutasVuelo(input.ciudad_salida, ciudades[0], input.pais_latam, fechaVuelos) : Promise.resolve([]),
  ])
  return calcularCotizacion(input, { config, hoteles, rutas })
}

async function avisarLeadPerdido(datos: Record<string, unknown>, motivo: string) {
  try {
    await resend.emails.send({
      from: 'LATAM VISA <noreply@latamvisatravel.com>',
      to: process.env.RESEND_ADMIN_EMAIL || 'future@latamvisas.com.au',
      subject: `⚠️ Lead Dos Vacaciones SIN GUARDAR — ${String(datos.nombre ?? '')}`,
      text: `No se pudo guardar en solicitudes_dos_vacaciones (${motivo}).\n\n${JSON.stringify(datos, null, 2)}`,
    })
  } catch (e) {
    console.error('[VIAJES] Tampoco se pudo enviar el aviso del lead perdido:', e)
  }
}

export async function procesarSolicitud(input: SolicitudInput): Promise<RespuestaCotizar> {
  const { nombre, email, celular, ...viaje } = input
  const cotizacionInput: CotizacionInput = {
    ciudad_salida: viaje.ciudad_salida,
    pais_latam: viaje.pais_latam,
    fecha_ida: viaje.fecha_ida,
    fecha_vuelta: viaje.fecha_vuelta,
    europa_momento: viaje.europa_momento,
    adultos: viaje.adultos,
    ninos: viaje.ninos,
    pasaporte: viaje.pasaporte,
    visa_usa: viaje.visa_usa,
    ciudades_europa: viaje.ciudades_europa,
    sorprendanme: viaje.sorprendanme,
    dias_europa: viaje.dias_europa,
    estilo: viaje.estilo,
  }

  let cotizacion: Awaited<ReturnType<typeof cotizar>> | null = null
  let errorCalculo: string | null = null
  try {
    cotizacion = await cotizar(cotizacionInput)
  } catch (e: any) {
    errorCalculo = e?.message || String(e)
    console.error('[VIAJES] Falló el cálculo; se guarda el lead sin rango:', e)
  }

  const fila = {
    nombre,
    email,
    celular,
    ...cotizacionInput,
    rango_min_aud: cotizacion?.publico.rango_min_aud ?? null,
    rango_max_aud: cotizacion?.publico.rango_max_aud ?? null,
    advertencias: cotizacion?.publico.advertencias ?? [],
    desglose_interno: cotizacion ? cotizacion.interno : { error_calculo: errorCalculo },
    estado: 'nueva',
  }

  let solicitudId: string | null = null
  try {
    const { data, error } = await supabaseAdmin.from('solicitudes_dos_vacaciones').insert(fila).select('id').single()
    if (error || !data) throw error || new Error('insert sin fila')
    solicitudId = data.id
  } catch (e: any) {
    console.error('[VIAJES] No se pudo guardar la solicitud. Datos:', JSON.stringify(fila), e)
    await avisarLeadPerdido(fila, e?.message || String(e))
  }

  if (!cotizacion) return { ok: true, solicitud_id: solicitudId, publico: null, guias: [], mensaje: MENSAJE_SIN_RANGO }

  // Las guías son contenido público; un fallo acá no afecta la cotización.
  let guias: GuiaPublica[] = []
  try {
    guias = (await getGuias(cotizacion.publico.ciudades.map((c) => c.ciudad))).map(({ id: _id, is_active: _a, ...g }) => g)
  } catch (e) {
    console.error('[VIAJES] No se pudieron leer las guías:', e)
  }

  return { ok: true, solicitud_id: solicitudId, publico: cotizacion.publico, guias }
}
