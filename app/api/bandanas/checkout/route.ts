import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/staffing'
import { BANNER_PREVENTA, ENVIO_AUD, MAX_CANTIDAD } from '@/lib/bandanas/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (ENVIO_AUD === null) return NextResponse.json({ error: 'La preventa todavía no está abierta.' }, { status: 403 })
  try {
    const { productId, quantity } = await req.json()
    if (!isUuid(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CANTIDAD) {
      return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 })
    }
    // El precio sale siempre de la base de datos, nunca del navegador.
    const { data: p, error } = await supabaseAdmin
      .from('bandana_products')
      .select('id, slug, name, price_aud, images')
      .eq('id', productId)
      .eq('active', true)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!p) return NextResponse.json({ error: 'Este diseño ya no está disponible.' }, { status: 404 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    const sitio = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.latamvisatravel.com'
    // `tipo: bandana` separa estas ventas de las de visas (webhook y n8n).
    const metadata = { tipo: 'bandana', product_id: p.id, quantity: String(quantity) }
    const foto = (p.images as string[] | null)?.[0]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity,
        price_data: {
          currency: 'aud',
          unit_amount: Math.round(Number(p.price_aud) * 100),
          product_data: { name: `Bandana ${p.name} (preventa)`, ...(foto?.startsWith('https://') ? { images: [foto] } : {}) },
        },
      }],
      shipping_address_collection: { allowed_countries: ['AU'] },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'Envío dentro de Australia',
          fixed_amount: { amount: Math.round(ENVIO_AUD * 100), currency: 'aud' },
        },
      }],
      phone_number_collection: { enabled: true },
      custom_text: { submit: { message: BANNER_PREVENTA } },
      metadata,
      payment_intent_data: { metadata },
      success_url: `${sitio}/bandanas/gracias`,
      cancel_url: `${sitio}/bandanas/cancelado?d=${p.slug}`,
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[BANDANAS] checkout:', e)
    return NextResponse.json({ error: 'No pudimos abrir el pago. Intenta de nuevo.' }, { status: 500 })
  }
}
