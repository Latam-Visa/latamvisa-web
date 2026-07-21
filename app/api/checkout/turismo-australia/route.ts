import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRECIO_SIN = 250 // AUD por persona (sin traducción)
const PRECIO_CON = 290 // AUD por persona (con traducción)

// Función centralizada de cálculo
function calcularPrecio(counts: { sin: number, con: number }) {
  const totalPersonas = counts.sin + counts.con
  const subtotal = (counts.sin * PRECIO_SIN) + (counts.con * PRECIO_CON)
  let porcentajeDescuento = 0

  if (totalPersonas === 2) porcentajeDescuento = 0.10
  else if (totalPersonas >= 3) porcentajeDescuento = 0.15

  const descuento = Math.round(subtotal * porcentajeDescuento)
  const total = subtotal - descuento

  return { subtotal, descuento, total, porcentajeDescuento, totalPersonas }
}

// GET → devuelve los precios base (para la UI)
export async function GET() {
  return NextResponse.json({ sin: PRECIO_SIN, con: PRECIO_CON })
}

// POST → crea la sesión de Stripe con precio calculado en el servidor
export async function POST(req: Request) {
  try {
    const { counts = { sin: 0, con: 0 }, email } = await req.json()

    // Validaciones
    const sinCount = Math.max(0, Math.min(10, parseInt(counts.sin) || 0))
    const conCount = Math.max(0, Math.min(10, parseInt(counts.con) || 0))
    const totalPersonas = sinCount + conCount

    if (totalPersonas < 1 || totalPersonas > 10) {
      return NextResponse.json({ error: 'Número de aplicantes inválido' }, { status: 400 })
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Cálculo de precios
    const { subtotal, descuento, total, porcentajeDescuento } = calcularPrecio({ sin: sinCount, con: conCount })

    // Crear sesión de Stripe
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    if (sinCount > 0) {
      const unitAmountSin = Math.round((PRECIO_SIN * (1 - porcentajeDescuento)) * 100)
      line_items.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: 'Visitor Visa Australia (Sin Traducción)',
            description: totalPersonas >= 2
              ? `Asesoría completa (descuento ${Math.round(porcentajeDescuento * 100)}% aplicado)`
              : 'Asesoría completa Subclass 600',
          },
          unit_amount: unitAmountSin,
        },
        quantity: sinCount,
      })
    }

    if (conCount > 0) {
      const unitAmountCon = Math.round((PRECIO_CON * (1 - porcentajeDescuento)) * 100)
      line_items.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: 'Visitor Visa Australia (Con Traducción)',
            description: totalPersonas >= 2
              ? `Asesoría completa + Traducciones (descuento ${Math.round(porcentajeDescuento * 100)}% aplicado)`
              : 'Asesoría completa Subclass 600 + Traducciones de documentos',
          },
          unit_amount: unitAmountCon,
        },
        quantity: conCount,
      })
    }

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      ui_mode: 'embedded_page',
      mode: 'payment',
      customer_email: email,
      line_items,
      metadata: {
        destino: 'australia',
        aplicantes_sin: String(sinCount),
        aplicantes_con: String(conCount),
        total_personas: String(totalPersonas),
        precio_original: String(subtotal),
        descuento_aplicado: String(descuento),
        porcentaje_descuento: String(Math.round(porcentajeDescuento * 100)),
        total_pagado: String(total),
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    }

    const session = await stripe.checkout.sessions.create(sessionData)

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message || 'Error creando sesión' }, { status: 500 })
  }
}
