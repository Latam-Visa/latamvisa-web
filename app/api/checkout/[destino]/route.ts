// app/api/checkout/[destino]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDestino } from '@/lib/destinos';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { destino: string } }
) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const { destino } = params;
    const body = await request.json();
    const { conTraduccion = false } = body;

    const destinoConfig = getDestino(destino);

    if (!destinoConfig) {
      return NextResponse.json(
        { error: `Destino "${destino}" no encontrado` },
        { status: 404 }
      );
    }

    let priceId: string;

    if (conTraduccion && destinoConfig.tieneTraduccion && destinoConfig.precios.conTraduccion) {
      priceId = destinoConfig.precios.conTraduccion.priceId;
    } else {
      priceId = destinoConfig.precios.sinTraduccion.priceId;
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/gracias-pago?session_id={CHECKOUT_SESSION_ID}&destino=${destino}`,
      metadata: {
        destino: destino,
        pais: destinoConfig.pais,
        codigo: destinoConfig.codigo,
        visa_type: destinoConfig.visaType,
        con_traduccion: String(conTraduccion),
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    } as unknown as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json({ clientSecret: session.client_secret });

  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    const message = error instanceof Error ? error.message : 'Error creating checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
