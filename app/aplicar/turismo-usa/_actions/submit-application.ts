"use server"

import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { uploadVisaPhoto, getSignedUrl } from '@/lib/supabase/storage'
import { UsaApplicationFormData } from '@/lib/types/application'
import { generateApplicationPdf } from '@/lib/pdf/generate-pdf'
import { resend } from '@/lib/resend'
import { getClientConfirmationEmail } from '@/lib/emails/client-confirmation'
import { getAdminNotificationEmail } from '@/lib/emails/admin-notification'

const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || 'admin@latamvisatravel.com'
const FROM_EMAIL = 'LATAM VISA <no-reply@latamvisatravel.com>' // Make sure this domain is verified in Resend

function decodeBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error('Formato base64 inválido')
  }
  const ext = matches[1].split('/')[1] || 'jpg'
  return { buffer: Buffer.from(matches[2], 'base64'), ext }
}

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
    const photos = {
      passport: formDataInput.get('passport') as string | undefined,
      previousVisa: formDataInput.get('previousVisa') as string | undefined,
      visaPhoto: formDataInput.get('visaPhoto') as string | undefined,
    }

    return await executeSubmit(formData, photos, ipAddress, userAgent)
  } catch (error: any) {
    console.error('[GLOBAL_CATCH] Error:', error.message, error.stack, error.cause);
    return {
      success: false,
      error: 'Hubo un error inesperado al procesar tu solicitud. Por favor intenta de nuevo o contáctanos.',
      errorCode: 'UNEXPECTED_ERROR',
      digest: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
}

async function executeSubmit(
  formData: any,
  photos: { passport?: string; previousVisa?: string; visaPhoto: string },
  ipAddress: string,
  userAgent: string
) {
  if (
    !process.env.RESEND_API_KEY || 
    !process.env.SUPABASE_SERVICE_ROLE_KEY || 
    !process.env.RESEND_FROM_EMAIL || 
    !process.env.RESEND_ADMIN_EMAIL || 
    !process.env.SUPABASE_STORAGE_BUCKET || 
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    console.error('[ENV_CHECK] Faltan variables de entorno requeridas.')
    return { success: false, error: 'Error de configuración del servidor. Contactanos por WhatsApp.', errorCode: 'ENV_CHECK' }
  }

  const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL

  const applicationId = uuidv4()
  
  // 1. Save to Database FIRST so data is not lost if upload fails
  let pdfData = { path: '' }
  try {

    const { error: dbError } = await supabaseAdmin
      .from('visa_applications_usa')
      .insert({
        id: applicationId,
        data: formData,
        pdf_url: null,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'pending'
      })

    if (dbError) throw new Error(dbError.message)
  } catch (error: any) {
    console.error('[DB_INSERT] Error guardando en BD:', error)
    return { success: false, error: 'No pudimos guardar tu aplicación. Intentá en unos minutos.', errorCode: 'DB_INSERT' }
  }

  // 2. Upload photos to Supabase Storage
  let passportUrl = ''
  let previousVisaUrl = ''
  let visaPhotoUrl = ''
  const photoUrlsForPdf: { passport?: string; previousVisa?: string; visaPhoto?: string } = {}

  try {
    if (photos.passport) {
      const { buffer, ext } = decodeBase64Image(photos.passport)
      passportUrl = await uploadVisaPhoto(buffer, `passport.${ext}`, applicationId, 'passport')
      photoUrlsForPdf.passport = photos.passport // Use base64 directly to avoid PDF network hang
    }

    if (photos.previousVisa) {
      const { buffer, ext } = decodeBase64Image(photos.previousVisa)
      previousVisaUrl = await uploadVisaPhoto(buffer, `previous_visa.${ext}`, applicationId, 'previous_visa')
      photoUrlsForPdf.previousVisa = photos.previousVisa
    }

    if (photos.visaPhoto) {
      const { buffer, ext } = decodeBase64Image(photos.visaPhoto)
      visaPhotoUrl = await uploadVisaPhoto(buffer, `visa_photo.${ext}`, applicationId, 'visa_photo')
      photoUrlsForPdf.visaPhoto = photos.visaPhoto
    }
  } catch (error: any) {
    console.error('[STORAGE_UPLOAD] Error subiendo fotos:', error)
    // Non-blocking: We continue even if photos fail, since DB row exists
  }

  // 3. Generate PDF
  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await generateApplicationPdf(formData, photoUrlsForPdf)
  } catch (error: any) {
    console.error('[PDF_GEN] Error generando PDF:', error)
    // Non-blocking
  }

  // 4. Upload PDF to Storage & Update DB
  if (pdfBuffer) {
    try {
      const pdfPath = `${applicationId}/application.pdf`
      const { data: uploadData, error: pdfError } = await supabaseAdmin.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET)
        .upload(pdfPath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        })
        
      if (pdfError) throw new Error(pdfError.message)
      pdfData = uploadData
      
      await supabaseAdmin
        .from('visa_applications_usa')
        .update({ pdf_url: pdfData.path })
        .eq('id', applicationId)
    } catch (error: any) {
      console.error('[STORAGE_PDF] Error subiendo PDF:', error)
      // Non-blocking
    }
  }

  // 5. Send Emails
  try {
    const clientEmailHtml = getClientConfirmationEmail(formData.step1Contact.fullName)
    const adminEmailHtml = getAdminNotificationEmail(
      formData.step1Contact.fullName,
      formData.step1Contact.email,
      formData.step4Travel.usaVisaType
    )

    const attachments = pdfBuffer ? [{
      filename: `Aplicacion_Visa_USA_${formData.step1Contact.fullName.replace(/\s+/g, '_')}.pdf`,
      content: pdfBuffer
    }] : []

    const adminAttachments = [...attachments]
    if (photos.visaPhoto) {
      const { buffer, ext } = decodeBase64Image(photos.visaPhoto)
      adminAttachments.push({ filename: `Foto_Visa.${ext}`, content: buffer })
    }
    if (photos.passport) {
      const { buffer, ext } = decodeBase64Image(photos.passport)
      adminAttachments.push({ filename: `Pasaporte.${ext}`, content: buffer })
    }
    if (photos.previousVisa) {
      const { buffer, ext } = decodeBase64Image(photos.previousVisa)
      adminAttachments.push({ filename: `Visa_Anterior.${ext}`, content: buffer })
    }

    // Client Email
    resend.emails.send({
      from: FROM_EMAIL,
      to: formData.step1Contact.email,
      subject: 'LATAM VISA - Confirmación de tu solicitud',
      html: clientEmailHtml,
      attachments
    }).catch(err => console.error('[EMAIL_CLIENT] Error enviando email a cliente:', err))

    // Admin Email
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nueva Solicitud Visa USA: ${formData.step1Contact.fullName}`,
      html: adminEmailHtml,
      attachments: adminAttachments
    }).catch(err => console.error('[EMAIL_ADMIN] Error enviando email a admin:', err))

  } catch (error: any) {
    console.error('[EMAIL_GENERAL] Error orquestando emails:', error)
    // Non-blocking
  }

  return { success: true, applicationId }
}
