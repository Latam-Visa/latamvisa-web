import type Stripe from 'stripe'
import type { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/* Guarda la venta de una bandana y avisa al admin. Idempotente: la orden por
   stripe_session_id (único) y el correo por clave en Resend. Lanza si algo
   falla, para que el webhook responda 500 y Stripe reintente. */
export async function registrarOrdenBandana(session: Stripe.Checkout.Session, resend: Resend) {
  if (session.payment_status !== 'paid') return
  const meta = session.metadata || {}
  // Según la versión de la API, la dirección llega en un campo u otro.
  const s = session as any
  const envio = s.collected_information?.shipping_details ?? s.shipping_details ?? null
  const orden = {
    stripe_session_id: session.id,
    stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
    product_id: meta.product_id,
    quantity: Number(meta.quantity),
    amount_aud: (session.amount_total || 0) / 100, // incluye envío
    customer_name: session.customer_details?.name ?? envio?.name ?? null,
    customer_email: session.customer_details?.email ?? null,
    shipping_address: envio ? { ...envio, phone: session.customer_details?.phone ?? null } : null,
  }
  // ignoreDuplicates: un reintento no pisa el estado (p. ej. ya marcada como enviada).
  const { error } = await supabaseAdmin.from('bandana_orders').upsert(orden, { onConflict: 'stripe_session_id', ignoreDuplicates: true })
  if (error) throw new Error(`bandana_orders: ${error.message}`)

  const { data: p } = await supabaseAdmin.from('bandana_products').select('name').eq('id', meta.product_id).maybeSingle()
  const a = envio?.address || {}
  const direccion = [a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')
  const { error: mailError } = await resend.emails.send(
    {
      from: 'LATAM VISA <noreply@latamvisatravel.com>',
      to: process.env.RESEND_ADMIN_EMAIL || 'future@latamvisas.com.au',
      subject: `Nueva preorden de bandana: ${orden.quantity} × ${p?.name || 'diseño'}`,
      html: [
        ['Diseño', p?.name], ['Cantidad', orden.quantity], ['Total (con envío)', `$${orden.amount_aud.toFixed(2)} AUD`],
        ['Nombre', orden.customer_name], ['Correo', orden.customer_email], ['Teléfono', session.customer_details?.phone],
        ['Dirección', direccion], ['Pago en Stripe', orden.stripe_payment_intent],
      ].map(([k, v]) => `<p><strong>${k}:</strong> ${esc(v) || '—'}</p>`).join(''),
    },
    { idempotencyKey: `bandana/${session.id}` },
  )
  if (mailError) throw new Error(`Resend: ${mailError.message}`)
}
