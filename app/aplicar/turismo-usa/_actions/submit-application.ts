"use server"

import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { getClientConfirmationEmail } from '@/lib/emails/client-confirmation'
import { getAdminNotificationEmail } from '@/lib/emails/admin-notification'
import { generateApplicationPdf } from '@/lib/pdf/generate-pdf'

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

  // Extract photo paths from formData
  const passportPhotoPath = formData.step3Passport?.passportPhotoPath || null
  const visaPhotoPath = formData.step8Additional?.visaPhotoPath || null
  const previousVisaPhotoPath = formData.step5VisaHistory?.previousVisaPhotoPath || null

  // 1. Save to Database
  console.log('[SUBMIT] Step 1: DB insert', Date.now() - t0, 'ms')
  try {
    const { error: dbError } = await supabaseAdmin
      .from('visa_applications_usa')
      .insert({
        id: applicationId,
        data: formData,
        pdf_url: null,
        passport_photo_url: passportPhotoPath,
        visa_photo_url: visaPhotoPath,
        previous_visa_photo_url: previousVisaPhotoPath,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'pending',
        travels_with_others: formData.step4Travel?.travelsWithOthers === 'true',
        travel_companions: formData.step4Travel?.travelCompanions || [],
        tourist_places: formData.step4Travel?.touristPlaces || [],
        usa_contact_surnames: formData.step4Travel?.usaContactSurnames || null,
        usa_contact_given_names: formData.step4Travel?.usaContactGivenNames || null,
        usa_contact_organization: formData.step4Travel?.usaContactOrganization || null,
        usa_contact_relationship: formData.step4Travel?.usaContactRelationship || null,
        spouse_surnames: formData.step2Personal?.spouseSurnames || null,
        spouse_given_names: formData.step2Personal?.spouseGivenNames || null,
        spouse_date_of_birth: formData.step2Personal?.spouseDateOfBirth || null,
        spouse_nationality: formData.step2Personal?.spouseNationality || null,
        spouse_birth_city: formData.step2Personal?.spouseBirthCity || null,
        spouse_birth_country: formData.step2Personal?.spouseBirthCountry || null
      })

    if (dbError) throw new Error(dbError.message)
    console.log('[SUBMIT] DB insert OK', Date.now() - t0, 'ms')
  } catch (error: any) {
    console.error('[DB_INSERT] Error guardando en BD:', error)
    return { success: false, error: 'No pudimos guardar tu aplicación. Intentá en unos minutos.', errorCode: 'DB_INSERT' }
  }

  // 2. Send admin email
  try {
    const adminEmailHtml = getAdminNotificationEmail(formData, applicationId, submittedAt, ipAddress)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🚨 Nueva aplicación recibida — ${formData.step1Contact?.fullName || 'Aplicante'}`,
      html: adminEmailHtml,
    })
    console.log('[EMAIL_ADMIN] sent')
  } catch (error: any) {
    console.error('[EMAIL_ADMIN] failed:', error)
  }

  // 3. Generar PDF (sin fotos, solo texto/confirmación de adjuntos) para el cliente
  let pdfBuffer: Buffer | undefined
  try {
    pdfBuffer = await generateApplicationPdf(formData, {}, 'usa')
  } catch (pdfError) {
    console.error('[PDF_GEN_USA] Error al generar el PDF para el cliente:', pdfError)
  }

  // 4. Send client email
  try {
    const clientEmailHtml = getClientConfirmationEmail(formData, 'usa')
    await resend.emails.send({
      from: FROM_EMAIL,
      to: formData.step1Contact?.email,
      subject: '🇺🇸 Recibimos tu solicitud para USA — LATAM VISA',
      html: clientEmailHtml,
      attachments: pdfBuffer ? [
        {
          filename: 'resumen-solicitud-latam-visa.pdf',
          content: pdfBuffer,
        }
      ] : []
    })
    console.log('[EMAIL_CLIENT] sent')
  } catch (error: any) {
    console.error('[EMAIL_CLIENT] failed:', error)
  }

  console.log('[SUBMIT] Done', Date.now() - t0, 'ms')
  return { success: true, applicationId }
}
