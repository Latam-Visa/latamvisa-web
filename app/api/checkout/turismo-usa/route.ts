import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRECIO_BASE = 190  // AUD por persona

// Función centralizada de cálculo (misma lógica que el frontend)
function calcularPrecio(aplicantes: number) {
  const subtotal = PRECIO_BASE * aplicantes
  let porcentajeDescuento = 0

  if (aplicantes === 2) porcentajeDescuento = 0.10
  else if (aplicantes >= 3) porcentajeDescuento = 0.15

  const descuento = Math.round(subtotal * porcentajeDescuento)
  const total = subtotal - descuento

  return { subtotal, descuento, total, porcentajeDescuento }
}

// GET → devuelve el precio base (para la UI)
export async function GET() {
  return NextResponse.json({ precio: PRECIO_BASE })
}

// POST → crea la sesión de Stripe con precio calculado en el servidor
export async function POST(req: Request) {
  try {
    const { aplicantes, email } = await req.json()

    // Validaciones
    if (!aplicantes || aplicantes < 1 || aplicantes > 10) {
      return NextResponse.json({ error: 'Número de aplicantes inválido' }, { status: 400 })
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Cálculo de precios (en el servidor — nunca confiar en el cliente)
    const { subtotal, descuento, total, porcentajeDescuento } = calcularPrecio(aplicantes)

    // Precio unitario final (con descuento distribuido)
    const precioUnitarioFinal = Math.round((total / aplicantes) * 100) // en centavos

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: aplicantes === 1
                ? 'Expediente Turismo USA'
                : `Expediente Turismo USA — ${aplicantes} aplicantes`,
              description: aplicantes >= 2
                ? `Asesoría completa DS-160 y agendamiento consular para ${aplicantes} personas (descuento ${Math.round(porcentajeDescuento * 100)}% aplicado)`
                : 'Asesoría completa para preparación de formulario DS-160 y agendamiento de cita consular',
            },
            unit_amount: precioUnitarioFinal,
          },
          quantity: aplicantes,
        },
      ],
      metadata: {
        destino: 'usa',
        aplicantes: String(aplicantes),
        precio_original: String(subtotal),
        descuento_aplicado: String(descuento),
        porcentaje_descuento: String(Math.round(porcentajeDescuento * 100)),
        total_pagado: String(total),
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message || 'Error creando sesión' }, { status: 500 })
  }
}