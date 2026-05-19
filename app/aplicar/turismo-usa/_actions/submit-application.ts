"use server"

import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { getClientConfirmationEmail } from '@/lib/emails/client-confirmation'
import { getAdminNotificationEmail } from '@/lib/emails/admin-notification'

export async function submitUsaApplication(
  formDataInput: FormData
): Promise<{ success: boolean; applicationId?: string; error?: string; errorCode?: string; digest?: string }> {

  let ipAddress = 'unknown'
  let userAgent = 'unknown'

  try {
    const headersList = headers()
    ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    userAgent = headersList.get('user-agent') || 'unknown'
  } catch (e) {
    // Ignore
  }

  try {
    const formData = JSON.parse(formDataInput.get('data') as string)
    return await executeSubmit(formData, ipAddress, userAgent)
  } catch (error: any) {
    console.error('[GLOBAL_CATCH] Error:', error.message, error.stack)
    return {
      success: false,
      error: 'Hubo un error inesperado al procesar tu solicitud. Por favor intenta de nuevo o contáctanos.',
      errorCode: 'UNEXPECTED_ERROR',
      digest: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
}

async function executeSubmit(formData: any, ipAddress: string, userAgent: string) {
  const t0 = Date.now()
  console.log('[SUBMIT] Start', new Date().toISOString())

  if (
    !process.env.RESEND_API_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.RESEND_FROM_EMAIL ||
    !process.env.RESEND_ADMIN_EMAIL ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    console.error('[ENV_CHECK] Faltan variables de entorno requeridas.')
    return { success: false, error: 'Error de configuración del servidor. Contactanos por WhatsApp.', errorCode: 'ENV_CHECK' }
  }

  const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL

  const applicationId = uuidv4()
  const submittedAt = new Date().toISOString()

  // 1. Save to Database
  console.log('[SUBMIT] Step 1: DB insert', Date.now() - t0, 'ms')
  try {
    const { error: dbError } = await supabaseAdmin
      .from('visa_applications_usa')
      .insert({
        id: applicationId,
        data: formData,
        pdf_url: null,
        passport_photo_url: null,
        visa_photo_url: null,
        previous_visa_photo_url: null,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'pending'
      })

    if (dbError) throw new Error(dbError.message)
    console.log('[SUBMIT] DB insert OK', Date.now() - t0, 'ms')
  } catch (error: any) {
    console.error('[DB_INSERT] Error guardando en BD:', error)
    return { success: false, error: 'No pudimos guardar tu aplicación. Intentá en unos minutos.', errorCode: 'DB_INSERT' }
  }

  // 2. Send Emails (fire-and-forget)
  console.log('[SUBMIT] Step 2: Sending emails', Date.now() - t0, 'ms')
  try {
    const clientEmailHtml = getClientConfirmationEmail(formData)
    const adminEmailHtml = getAdminNotificationEmail(formData, applicationId, {}, submittedAt, ipAddress)

    resend.emails.send({
      from: FROM_EMAIL,
      to: formData.step1Contact.email,
      subject: '✅ Recibimos tu aplicación de visa USA — LATAM VISA',
      html: clientEmailHtml,
    }).catch(err => console.error('[EMAIL_CLIENT] Error:', err))

    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🚨 Nueva solicitud Visa USA: ${formData.step1Contact.fullName}`,
      html: adminEmailHtml,
    }).catch(err => console.error('[EMAIL_ADMIN] Error:', err))

    console.log('[SUBMIT] Emails fired', Date.now() - t0, 'ms')
  } catch (error: any) {
    console.error('[EMAIL_GENERAL] Error:', error)
    // Non-blocking
  }

  console.log('[SUBMIT] Done', Date.now() - t0, 'ms')
  return { success: true, applicationId }
}
