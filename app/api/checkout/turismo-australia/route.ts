import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Precios de Stripe
const PRICE_SIN = 'price_1TQd8QJ9ezpBcyYbWD74OnCT';
const PRICE_CON = 'price_1TQdAAJ9ezpBcyYbGWrzdGvP';

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY no configurado');
    const stripe = new Stripe(secretKey);

    const [sin, con] = await Promise.all([
      stripe.prices.retrieve(PRICE_SIN),
      stripe.prices.retrieve(PRICE_CON)
    ]);

    return NextResponse.json({
      sin: (sin.unit_amount || 25000) / 100,
      con: (con.unit_amount || 29000) / 100
    });
  } catch (err) {
    console.error('Error fetching prices:', err);
    return NextResponse.json({ sin: 250, con: 290 }); // Fallback
  }
}

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
    const { counts = { sin: 0, con: 0 }, email } = body;
    
    // Validar cantidades
    const sinCount = Math.max(0, Math.min(10, parseInt(counts.sin) || 0));
    const conCount = Math.max(0, Math.min(10, parseInt(counts.con) || 0));

    if (sinCount === 0 && conCount === 0) {
      return NextResponse.json({ error: 'Debes seleccionar al menos una visa' }, { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    if (sinCount > 0) {
      line_items.push({ price: PRICE_SIN, quantity: sinCount });
    }
    if (conCount > 0) {
      line_items.push({ price: PRICE_CON, quantity: conCount });
    }

    const stripe = new Stripe(secretKey);

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      ui_mode: 'embedded_page',
      line_items,
      mode: 'payment',
      return_url: `${siteUrl}/gracias-pago?session_id={CHECKOUT_SESSION_ID}&destino=turismo-australia`,
      metadata: { destino: 'australia' },
    };

    if (email && typeof email === 'string' && email.trim() !== '') {
      sessionData.customer_email = email.trim();
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
