import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { construirCorreoPagoAdmin } from '@/lib/emails/pago-admin'
import { construirCorreoActivacion } from '@/lib/emails/portal'
import { crearSolicitud } from '@/lib/portal/solicitudes'
import { nombrePaisPortal } from '@/lib/portal/textos'
import { SITIO } from '@/lib/portal/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20' as any
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

// Productos de Payment Links (sin metadata.destino).
const PRODUCTO_DESTINO: Record<string, string> = {
  prod_UNzInIKcEPubsv: 'usa',
  prod_UPS4wTFA8YcTQB: 'canada',
  prod_UPSArEprnY5NMG: 'uk',
  prod_Uh5FvGa1iRJrpG: 'schengen',
}

/* Los correos de bienvenida al cliente los manda hoy n8n. Mientras siga así,
   estos (que nunca corrieron en producción) quedan apagados para no duplicar. */
const CORREOS_CLIENTE = process.env.STRIPE_WEBHOOK_CORREOS_CLIENTE === 'true'

async function detectarDestino(session: Stripe.Checkout.Session): Promise<{ destino: string | null; opcion: string | null }> {
  if (session.metadata?.tipo === 'cotizacion') return { destino: 'cotizacion', opcion: null }
  if (session.metadata?.destino) return { destino: session.metadata.destino, opcion: null }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  for (const item of lineItems.data) {
    const productId = typeof item.price?.product === 'string' ? item.price.product : item.price?.product?.id
    const destino = productId ? PRODUCTO_DESTINO[productId] : undefined
    if (!destino) continue
    const desc = item.description?.toLowerCase() || ''
    const conTraduccion = desc.includes('traducción') || desc.includes('traduccion') || session.amount_total === 29000
    const opcion = destino === 'usa' ? null : conTraduccion ? 'Con traducción' : 'Sin traducción'
    return { destino, opcion }
  }
  return { destino: null, opcion: null }
}

/* Correo "Nuevo pago" al admin. Idempotente por session.id: Resend descarta un
   segundo envío con la misma clave (24h), así un reintento de Stripe o el par
   completed + async_payment_succeeded no lo duplican. Lanza si Resend falla,
   para responder 500 y que Stripe reintente. */
async function notificarPagoAdmin(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return
  const { destino, opcion } = await detectarDestino(session)
  const { asunto, html } = construirCorreoPagoAdmin({
    sessionId: session.id,
    paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
    nombre: session.customer_details?.name,
    email: session.customer_details?.email || session.customer_email,
    telefono: session.customer_details?.phone,
    montoTotal: session.amount_total,
    moneda: session.currency,
    destino,
    metadata: session.metadata,
    opcion,
    creadoEl: new Date(session.created * 1000),
  })
  const { error } = await resend.emails.send(
    {
      from: 'LATAM VISA <noreply@latamvisatravel.com>',
      to: process.env.RESEND_ADMIN_EMAIL || 'future@latamvisas.com.au',
      subject: asunto,
      html,
    },
    { idempotencyKey: `pago-admin/${session.id}` },
  )
  if (error) throw new Error(`Resend: ${error.message}`)
  console.log(`[PAGO] Correo admin enviado: ${session.id}`)
}

/* País del pago, con la misma clave que usa el resto del código (usa, canada,
   japon...). Si no se reconoce el producto, el mismo respaldo que ya usa el
   flujo de /agendar más abajo: metadata.destino o 'canada'. */
async function paisDelPago(session: Stripe.Checkout.Session): Promise<string> {
  if (session.metadata?.tipo === 'cotizacion' && session.metadata?.pais) return session.metadata.pais
  const { destino } = await detectarDestino(session)
  if (destino && destino !== 'cotizacion') return destino
  console.warn(`[PORTAL] País no reconocido para ${session.id}; se usa el respaldo del webhook.`)
  return session.metadata?.destino || 'canada'
}

async function servicioDelPago(session: Stripe.Checkout.Session): Promise<string | null> {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  const nombres = lineItems.data.map((item) => item.description).filter(Boolean)
  return nombres.length ? nombres.join(' + ') : null
}

/* Portal del cliente: crea la fila en `solicitudes` y le manda el correo para
   crear su cuenta. Idempotente: la solicitud por stripe_session_id (UNIQUE) y
   el correo por clave en Resend, como el correo admin. Lanza si algo falla,
   para responder 500 y que Stripe reintente sin duplicar nada. */
async function abrirPortal(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return
  const email = session.customer_details?.email || session.customer_email
  if (!email) {
    console.warn(`[PORTAL] Pago ${session.id} sin correo: no se crea solicitud.`)
    return
  }

  const pais = await paisDelPago(session)
  const solicitud = await crearSolicitud({
    email_pago: email,
    nombre_cliente: session.customer_details?.name || null,
    pais,
    servicio: await servicioDelPago(session),
    stripe_session_id: session.id,
  })
  // Reenvío de un evento viejo: la cuenta ya existe, no se manda otro link.
  if (solicitud.activada_at) return

  const { asunto, html } = construirCorreoActivacion({
    nombre: session.customer_details?.name,
    pais: nombrePaisPortal(pais),
    link: `${SITIO}/activar/${solicitud.token}`,
  })
  const { error } = await resend.emails.send(
    { from: 'LATAM VISA <noreply@latamvisatravel.com>', to: email, subject: asunto, html },
    { idempotencyKey: `activacion/${session.id}` },
  )
  if (error) throw new Error(`Resend: ${error.message}`)
  console.log(`[PORTAL] Solicitud ${solicitud.nueva ? 'creada' : 'ya existía'} y correo de activación enviado: ${session.id}`)
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

    // Cotizaciones de /pagar/[token]. Van antes del flujo de /agendar y salen
    // aquí mismo: ese flujo le enviaría un correo de "Canadá" a cualquier
    // sesión sin producto reconocido.
    if (
      (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') &&
      (event.data.object as Stripe.Checkout.Session).metadata?.tipo === 'cotizacion'
    ) {
      const session = event.data.object as Stripe.Checkout.Session
      const cotizacionId = session.metadata?.cotizacion_id

      if (session.payment_status === 'paid' && cotizacionId) {
        // Idempotente: el filtro por estado hace que un evento repetido no
        // actualice nada (ni pise pagada_el).
        const { data: actualizadas, error } = await supabaseAdmin
          .from('cotizaciones')
          .update({ estado: 'pagada', pagada_el: new Date().toISOString() })
          .eq('id', cotizacionId)
          .eq('estado', 'pendiente')
          .select('id')

        if (error) {
          console.error('[COTIZACION] Error marcando como pagada:', error)
          // 500 para que Stripe reintente el evento.
          return NextResponse.json({ error: 'No se pudo actualizar la cotización' }, { status: 500 })
        }
        if (!actualizadas?.length) {
          console.warn(`[COTIZACION] Pago ${session.id} sin cotización pendiente que actualizar (${cotizacionId}); ya pagada o anulada.`)
        }
      }

      try {
        await notificarPagoAdmin(session)
      } catch (e) {
        console.error('[PAGO] Error enviando correo admin (cotización):', e)
        return NextResponse.json({ error: 'No se pudo enviar el correo' }, { status: 500 })
      }
      try {
        await abrirPortal(session)
      } catch (e) {
        console.error('[PORTAL] Error creando la solicitud (cotización):', e)
        return NextResponse.json({ error: 'No se pudo crear la solicitud' }, { status: 500 })
      }
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Correo al admin para cualquier otro pago (turismo, Payment Links).
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      try {
        await notificarPagoAdmin(event.data.object as Stripe.Checkout.Session)
      } catch (e) {
        console.error('[PAGO] Error enviando correo admin:', e)
        return NextResponse.json({ error: 'No se pudo enviar el correo' }, { status: 500 })
      }
      try {
        await abrirPortal(event.data.object as Stripe.Checkout.Session)
      } catch (e) {
        console.error('[PORTAL] Error creando la solicitud:', e)
        return NextResponse.json({ error: 'No se pudo crear la solicitud' }, { status: 500 })
      }
      // Con los correos al cliente apagados no queda nada más que hacer. Salir
      // acá evita que un fallo posterior (p. ej. listLineItems) devuelva 500 y
      // Stripe reintente un evento cuyo correo ya salió.
      if (!CORREOS_CLIENTE) return NextResponse.json({ received: true }, { status: 200 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Check product ID for USA, Canada, UK
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      let destinationId = '';
      
      const matchedItem = lineItems.data.find(item => {
        const productId = typeof item.price?.product === 'string' ? item.price.product : item.price?.product?.id;
        if (productId === 'prod_UNzInIKcEPubsv') { destinationId = 'usa'; return true; }
        if (productId === 'prod_UPS4wTFA8YcTQB') { destinationId = 'canada'; return true; }
        if (productId === 'prod_UPSArEprnY5NMG') { destinationId = 'uk'; return true; }
        if (productId === 'prod_Uh5FvGa1iRJrpG') { destinationId = 'schengen'; return true; }
        return false;
      });

      if (matchedItem) {
        const email = session.customer_details?.email;
        const fullName = session.customer_details?.name || 'Viajero';
        
        const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://latamvisatravel.com';

        let adminDestName = '';
        let clientSubject = '';
        let formLink = '';
        
        if (destinationId === 'usa') {
          adminDestName = 'USA';
          clientSubject = '¡Bienvenido a LATAM VISA! 🌎 Tu solicitud de visa USA empieza aquí';
          formLink = `${NEXT_PUBLIC_SITE_URL}/aplicar/turismo-usa`;
        } else if (destinationId === 'canada') {
          adminDestName = 'Canadá';
          clientSubject = '¡Bienvenido a LATAM VISA! 🌎 Tu solicitud de visa Canadá empieza aquí';
          formLink = `${NEXT_PUBLIC_SITE_URL}/aplicar/turismo-canada`;
        } else if (destinationId === 'uk') {
          adminDestName = 'UK';
          clientSubject = '¡Bienvenido a LATAM VISA! 🌎 Tu solicitud de visa UK empieza aquí';
          formLink = `${NEXT_PUBLIC_SITE_URL}/aplicar/turismo-uk`;
        } else if (destinationId === 'schengen') {
          adminDestName = 'Schengen';
          clientSubject = '¡Bienvenido a LATAM VISA! 🌎 Tu solicitud de visa Schengen empieza aquí';
          formLink = `${NEXT_PUBLIC_SITE_URL}/aplicar/turismo-schengen`;
        }

        if (email && CORREOS_CLIENTE) {
          try {
            // Email B - to the CLIENT
            await resend.emails.send({
              from: 'LATAM VISA <noreply@latamvisatravel.com>',
              to: email,
              subject: clientSubject,
              html: `
                <div style="background-color: #FAFAF7; color: #0A0A0A; font-family: sans-serif; padding: 40px 20px; line-height: 1.6;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; padding: 40px; border: 1px solid #E5E5E5;">
                    <h1 style="color: #2F4A00; font-size: 24px; margin-bottom: 24px; font-weight: normal;">Hola ${fullName},</h1>
                    
                    <p style="color: #0A0A0A; font-size: 16px; margin-bottom: 24px;">
                      Gracias por confiar en LATAM VISA. Acabas de dar un paso que muchos posponen durante años por miedo a ese "seguro me la niegan" — y ese solo gesto ya te pone por delante.
                    </p>
  
                    <p style="color: #0A0A0A; font-size: 16px; margin-bottom: 24px;">
                      Queremos que sepas algo desde el primer día: para nosotros esto no es llenar un formulario ni tramitar un papel. Una visa es apenas el puente. Lo que de verdad construimos juntos es el momento que está del otro lado: el abrazo en el aeropuerto, la cena con los que extrañas, la foto frente a ese lugar con el que soñaste, el reencuentro que llevas tiempo aplazando.
                    </p>
  
                    <p style="color: #0A0A0A; font-size: 16px; margin-bottom: 24px;">
                      Creemos que estar lejos de tu país no te resta: te da poder. Tu historia, tu camino y tu plan valen — y nuestro trabajo es ayudarte a contarlos con claridad y confianza. Tú pones el sueño; nosotros ponemos la estrategia y el acompañamiento para que llegues bien preparado.
                    </p>
  
                    <p style="color: #0A0A0A; font-size: 16px; margin-bottom: 32px;">
                      El siguiente paso es sencillo: completa tu formulario de solicitud para que nuestro equipo comience a preparar tu expediente.
                    </p>
  
                    <div style="text-align: center; margin-bottom: 40px;">
                      <a href="${formLink}" style="display: inline-block; background-color: #C8FF00; color: #000000; text-decoration: none; font-weight: bold; padding: 16px 32px; border-radius: 50px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                        Completar mi solicitud →
                      </a>
                    </div>
  
                    <p style="color: #0A0A0A; font-size: 16px; margin-bottom: 32px;">
                      ¿Tienes dudas? Escríbenos cuando quieras. Estamos contigo en todo el proceso.
                    </p>
  
                    <p style="color: #0A0A0A; font-size: 16px; margin-bottom: 4px;">
                      Con cariño,
                    </p>
                    <p style="color: #2F4A00; font-size: 16px; font-weight: bold; margin-top: 0; margin-bottom: 4px;">
                      El equipo de LATAM VISA
                    </p>
                    <p style="color: #0A0A0A; font-size: 14px; margin-top: 0;">
                      Conectamos culturas. Reunimos familias.
                    </p>
                  </div>
                </div>
              `
            });
            console.log(`Client email sent for ${adminDestName} payment: ${email}`);
          } catch (e) {
            console.error(`Error sending ${adminDestName} client email:`, e);
          }
        }
        
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Existing logic for other destinations
      const destinoKey = session.metadata?.destino || 'canada'
      const destinoInfo = DESTINO_MAP[destinoKey] || DESTINO_MAP['canada']
      
      const email = session.customer_details?.email
      const fullName = session.customer_details?.name || 'Viajero'
      const firstName = fullName.split(' ')[0]

      if (email && CORREOS_CLIENTE) {
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
      } else if (!email) {
        console.warn('No email found in session.customer_details')
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
