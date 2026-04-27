import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Forzar runtime dinámico para evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    // Validar env vars antes de inicializar Stripe
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID_TURISMO_USA;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!secretKey) {
      console.error('Missing STRIPE_SECRET_KEY');
      return NextResponse.json(
        { error: 'Server configuration error: missing Stripe secret key' },
        { status: 500 }
      );
    }

    if (!priceId) {
      console.error('Missing STRIPE_PRICE_ID_TURISMO_USA');
      return NextResponse.json(
        { error: 'Server configuration error: missing price ID' },
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
      return_url: `${siteUrl}/gracias-usa?session_id={CHECKOUT_SESSION_ID}`,
    } as unknown as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
