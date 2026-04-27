import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDestino } from '@/lib/destinos';

// CRÍTICO: estas dos líneas evitan que Stripe se ejecute en build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { destino: string } }
) {
  try {
    // Validar env vars ANTES de inicializar Stripe
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!secretKey) {
      console.error('Missing STRIPE_SECRET_KEY');
      return NextResponse.json(
        { error: 'Server configuration error: missing Stripe secret key' },
        { status: 500 }
      );
    }

    if (!siteUrl) {
      console.error('Missing NEXT_PUBLIC_SITE_URL');
      return NextResponse.json(
        { error: 'Server configuration error: missing site URL' },
        { status: 500 }
      );
    }

    const { destino } = params;
    const body = await request.json().catch(() => ({}));
    const conTraduccion = body?.conTraduccion === true;

    const destinoConfig = getDestino(destino);
    if (!destinoConfig) {
      return NextResponse.json(
        { error: `Destino "${destino}" no encontrado` },
        { status: 404 }
      );
    }

    // Determinar Price ID según traducción
    let priceId: string;
    if (conTraduccion && destinoConfig.tieneTraduccion && destinoConfig.precios.conTraduccion) {
      priceId = destinoConfig.precios.conTraduccion.priceId;
    } else {
      priceId = destinoConfig.precios.sinTraduccion.priceId;
    }

    // Inicializar Stripe DENTRO de la función (runtime, no build time)
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${siteUrl}/gracias-pago?session_id={CHECKOUT_SESSION_ID}&destino=${destino}`,
      metadata: {
        destino: destino,
        pais: destinoConfig.pais,
        codigo: destinoConfig.codigo,
        visa_type: destinoConfig.visaType,
        con_traduccion: String(conTraduccion),
      },
    } as unknown as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
