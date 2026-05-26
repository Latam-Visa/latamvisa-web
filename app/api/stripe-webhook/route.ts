import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20'
})

const resend = new Resend(process.env.RESEND_API_KEY)

const DESTINO_MAP: Record<string, { nombre: string; emoji: string; tipo: string; link: string }> = {
  usa: { nombre: 'Estados Unidos', emoji: '🇺🇸', tipo: 'Visa de Turismo/Negocios', link: 'https://latamvisatravel.com/aplicar/turismo-usa' },
  canada: { nombre: 'Canadá', emoji: '🇨🇦', tipo: 'Visa de Visitante', link: 'https://latamvisatravel.com/aplicar/turismo-canada' },
  australia: { nombre: 'Australia', emoji: '🇦🇺', tipo: 'Visa de Turismo', link: 'https://latamvisatravel.com/aplicar/turismo-australia' },
  uk: { nombre: 'Reino Unido', emoji: '🇬🇧', tipo: 'Visa de Turismo', link: 'https://latamvisatravel.com/aplicar/turismo-uk' },
  nz: { nombre: 'Nueva Zelanda', emoji: '🇳🇿', tipo: 'Visa de Turismo', link: 'https://latamvisatravel.com/aplicar/turismo-nz' },
  japon: { nombre: 'Japón', emoji: '🇯🇵', tipo: 'Visa de Turismo', link: 'https://latamvisatravel.com/aplicar/turismo-japon' }
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const destinoKey = session.metadata?.destino || 'canada'
      const destinoInfo = DESTINO_MAP[destinoKey] || DESTINO_MAP['canada']
      
      const email = session.customer_details?.email
      const fullName = session.customer_details?.name || 'Viajero'
      const firstName = fullName.split(' ')[0]

      if (email) {
        // Send email with Resend
        try {
          await resend.emails.send({
            from: 'LATAM VISA <noreply@latamvisatravel.com>',
            to: email,
            subject: `¡Pago recibido! ${destinoInfo.emoji} Siguiente paso de tu solicitud a ${destinoInfo.nombre}`,
            html: `
              <div style="background-color: #050505; color: #FAFAF7; font-family: sans-serif; padding: 40px 20px; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border-radius: 16px; padding: 40px; border: 1px solid #333;">
                  <h1 style="color: #FAFAF7; font-size: 24px; margin-bottom: 24px; font-weight: normal;">¡Hola ${firstName}!</h1>
                  
                  <p style="color: #A3A3A3; font-size: 16px; margin-bottom: 24px;">
                    Hemos recibido tu pago correctamente. Gracias por confiar en LATAM VISA para tu trámite de <strong>${destinoInfo.tipo}</strong> para <strong>${destinoInfo.nombre} ${destinoInfo.emoji}</strong>.
                  </p>

                  <p style="color: #A3A3A3; font-size: 16px; margin-bottom: 32px;">
                    El siguiente paso es completar nuestro formulario experto. Es muy importante que lo llenes con calma y la información más precisa posible.
                  </p>

                  <div style="text-align: center; margin-bottom: 40px;">
                    <a href="${destinoInfo.link}" style="display: inline-block; background-color: #C8FF00; color: #000000; text-decoration: none; font-weight: bold; padding: 16px 32px; border-radius: 50px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                      Completar mi formulario →
                    </a>
                  </div>

                  <div style="background-color: #1A1A1A; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                    <h3 style="color: #FAFAF7; font-size: 18px; margin-top: 0; margin-bottom: 16px; font-weight: normal;">3 tips para tu formulario:</h3>
                    <ul style="color: #A3A3A3; font-size: 15px; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 12px;"><strong>Guarda tu progreso:</strong> El formulario es extenso pero puedes guardar en cada paso y continuar después.</li>
                      <li style="margin-bottom: 12px;"><strong>Ten tus documentos a mano:</strong> Especialmente tu pasaporte y fechas de viajes anteriores si los tienes.</li>
                      <li style="margin-bottom: 0;"><strong>No te preocupes si algo no aplica:</strong> Si hay un campo que no aplica a tu caso, te guiamos en cómo responderlo.</li>
                    </ul>
                  </div>

                  <p style="color: #A3A3A3; font-size: 16px; margin-bottom: 16px;">
                    ¡Un abrazo!
                  </p>
                  <p style="color: #FAFAF7; font-size: 16px; font-weight: bold; margin-top: 0;">
                    Equipo LATAM VISA
                  </p>
                </div>
              </div>
            `
          })
          console.log(`Confirmation email sent to ${email} for destination ${destinoInfo.nombre}`)
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError)
        }

        // TODO: Insert a row into a Supabase table "payments" with:
        // email, nombre, destino, stripe_session_id, amount, created_at.
        // Skipping implementation to avoid schema mismatch/errors.
      } else {
        console.warn('No email found in session.customer_details')
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
