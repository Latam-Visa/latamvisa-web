'use server'

import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  esPagable,
  isUuid,
  labelPaisCotizacion,
  normalizarCotizacion,
  toStripeAmount,
} from '@/lib/cotizaciones'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.latamvisatravel.com'

// Stripe exige que una sesión de Checkout dure entre 30 min y 24 h.
const MIN_SESION_MS = 31 * 60 * 1000
const MAX_SESION_MS = 23 * 60 * 60 * 1000

// Solo recibe el token: monto, moneda y descripción salen siempre de la base
// de datos, nunca del cliente.
export async function createCotizacionCheckout(token: string) {
  if (!isUuid(token)) redirect('/')

  const { data, error } = await supabaseAdmin
    .from('cotizaciones')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (error || !data) redirect('/')

  const row = normalizarCotizacion(data)
  const paginaCotizacion = `/pagar/${token}`

  // Si dejó de ser pagable (vencida, anulada o ya pagada), la página muestra
  // el estado correcto al recargar.
  if (!esPagable(row)) redirect(paginaCotizacion)

  let checkoutUrl: string | null = null

  try {
    // Un doble clic o volver atrás desde Stripe no debe abrir un segundo
    // cobro: si la sesión anterior sigue abierta, se reutiliza.
    if (row.stripe_session_id) {
      const previa = await stripe.checkout.sessions.retrieve(row.stripe_session_id).catch(() => null)
      if (previa?.status === 'open' && previa.url) checkoutUrl = previa.url
    }

    if (!checkoutUrl) {
      const pais = labelPaisCotizacion(row.pais_destino)
      const restanteMs = new Date(row.vence_el).getTime() - Date.now()

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: row.moneda.toLowerCase(),
              unit_amount: toStripeAmount(row.monto, row.moneda),
              product_data: {
                name: `Cotización ${row.numero} - Visa turismo ${pais} - ${row.personas} personas`,
              },
            },
          },
        ],
        customer_email: row.cliente_email ?? undefined,
        phone_number_collection: { enabled: true },
        metadata: {
          tipo: 'cotizacion',
          cotizacion_id: row.id,
          numero: row.numero,
          convenio_id: row.convenio_id ?? '',
          pais: row.pais_destino,
        },
        // La sesión no sobrevive a la cotización (cuando hay margen para el
        // mínimo de 30 min que exige Stripe).
        ...(restanteMs > MIN_SESION_MS && {
          expires_at: Math.floor((Date.now() + Math.min(restanteMs, MAX_SESION_MS)) / 1000),
        }),
        success_url: `${SITE_URL}/pagar/${token}?estado=exito`,
        cancel_url: `${SITE_URL}/pagar/${token}`,
      })

      const { error: updateError } = await supabaseAdmin
        .from('cotizaciones')
        .update({ stripe_session_id: session.id })
        .eq('id', row.id)

      if (updateError) console.error('[COTIZACION] No se guardó stripe_session_id:', updateError)

      checkoutUrl = session.url
    }
  } catch (err) {
    console.error('[COTIZACION] Error creando sesión de Stripe:', err)
  }

  // redirect() lanza una excepción interna de Next, así que va fuera del try.
  redirect(checkoutUrl ?? `${paginaCotizacion}?estado=error`)
}
