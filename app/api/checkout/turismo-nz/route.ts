import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!secretKey || !siteUrl) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const conTraduccion = body?.conTraduccion === true;

    const priceId = conTraduccion
      ? 'price_1TQdEwJ9ezpBcyYbQOhNVHDN'
      : 'price_1TQdEBJ9ezpBcyYbE6CymGNz';

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      return_url: `${siteUrl}/gracias-pago?session_id={CHECKOUT_SESSION_ID}&destino=turismo-nz`,
    } as unknown as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
