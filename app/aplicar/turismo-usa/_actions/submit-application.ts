"use server"

import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { uploadVisaPhoto } from '@/lib/supabase/storage'
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

function decodeBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error('Formato base64 inválido')
  }
  const ext = matches[1].split('/')[1] || 'jpg'
  return { buffer: Buffer.from(matches[2], 'base64'), ext }
}

async function executeSubmit(
  formData: any,
  photos: { passport?: string; previousVisa?: string; visaPhoto?: string },
  ipAddress: string,
  userAgent: string
) {
  const t0 = Date.now()
  console.log('[SUBMIT] Start', new Date().toISOString())

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
  const bucket = process.env.SUPABASE_STORAGE_BUCKET

  const applicationId = uuidv4()
  const submittedAt = new Date().toISOString()

  // 1. Save to Database FIRST — insert without photo paths (they come in step 2)
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

  // 2. Upload photos to Supabase Storage
  console.log('[SUBMIT] Step 2: Photo upload', Date.now() - t0, 'ms')
  let passportStoragePath = ''
  let previousVisaStoragePath = ''
  let visaPhotoStoragePath = ''

  try {
    if (photos.passport) {
      const { buffer, ext } = decodeBase64Image(photos.passport)
      console.log('[PHOTO_COMPRESS] passport buffer size:', (buffer.length / 1024).toFixed(1), 'KB')
      passportStoragePath = await uploadVisaPhoto(buffer, `passport.${ext}`, applicationId, 'passport')
      console.log('[PHOTO_UPLOAD] passport path:', passportStoragePath)
    } else {
      console.warn('[PHOTO_UPLOAD] No passport photo provided')
    }

    if (photos.previousVisa) {
      const { buffer, ext } = decodeBase64Image(photos.previousVisa)
      console.log('[PHOTO_COMPRESS] previousVisa buffer size:', (buffer.length / 1024).toFixed(1), 'KB')
      previousVisaStoragePath = await uploadVisaPhoto(buffer, `previous_visa.${ext}`, applicationId, 'previous_visa')
      console.log('[PHOTO_UPLOAD] previousVisa path:', previousVisaStoragePath)
    } else {
      console.log('[PHOTO_UPLOAD] No previous visa photo (optional — ok)')
    }

    if (photos.visaPhoto) {
      const { buffer, ext } = decodeBase64Image(photos.visaPhoto)
      console.log('[PHOTO_COMPRESS] visaPhoto buffer size:', (buffer.length / 1024).toFixed(1), 'KB')
      visaPhotoStoragePath = await uploadVisaPhoto(buffer, `visa_photo.${ext}`, applicationId, 'visa_photo')
      console.log('[PHOTO_UPLOAD] visaPhoto path:', visaPhotoStoragePath)
    } else {
      console.warn('[PHOTO_UPLOAD] No visa photo provided')
    }

    console.log('[SUBMIT] Photo upload OK', Date.now() - t0, 'ms')
  } catch (error: any) {
    console.error('[STORAGE_UPLOAD] Error subiendo fotos:', error)
    // Non-blocking: DB row exists; continue without photos rather than fail the whole submission
  }

  // 3. Update DB row with photo storage paths (critical fix — this was missing)
  console.log('[SUBMIT] Step 3: Update DB with photo paths', Date.now() - t0, 'ms')
  console.log('[PHOTO_PATHS]', {
    passport: passportStoragePath || null,
    previousVisa: previousVisaStoragePath || null,
    visaPhoto: visaPhotoStoragePath || null,
  })

  try {
    await supabaseAdmin
      .from('visa_applications_usa')
      .update({
        passport_photo_url: passportStoragePath || null,
        visa_photo_url: visaPhotoStoragePath || null,
        previous_visa_photo_url: previousVisaStoragePath || null,
      })
      .eq('id', applicationId)
    console.log('[SUBMIT] DB photo paths update OK', Date.now() - t0, 'ms')
  } catch (error: any) {
    console.error('[DB_PHOTO_UPDATE] Error actualizando rutas de fotos:', error)
    // Non-blocking
  }

  // 4. Generate 1-hour signed URLs for admin email photo links
  console.log('[SUBMIT] Step 4: Signed URLs', Date.now() - t0, 'ms')
  const signedPhotoUrls: { passport?: string; previousVisa?: string; visaPhoto?: string } = {}

  try {
    if (passportStoragePath) {
      const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(passportStoragePath, 3600)
      if (data) signedPhotoUrls.passport = data.signedUrl
    }
    if (previousVisaStoragePath) {
      const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(previousVisaStoragePath, 3600)
      if (data) signedPhotoUrls.previousVisa = data.signedUrl
    }
    if (visaPhotoStoragePath) {
      const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(visaPhotoStoragePath, 3600)
      if (data) signedPhotoUrls.visaPhoto = data.signedUrl
    }
    console.log('[SUBMIT] Signed URLs OK', Date.now() - t0, 'ms')
  } catch (error: any) {
    console.error('[SIGNED_URLS] Error:', error)
    // Non-blocking
  }

  // 5. Send Emails (fire-and-forget — do not await, do not block submission)
  console.log('[SUBMIT] Step 5: Sending emails', Date.now() - t0, 'ms')
  try {
    const clientEmailHtml = getClientConfirmationEmail(formData)
    const adminEmailHtml = getAdminNotificationEmail(formData, applicationId, signedPhotoUrls, submittedAt, ipAddress)

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
