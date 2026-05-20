'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateApplicationPdf } from '@/lib/pdf/generate-pdf'

async function getSignedUrl(bucket: string, path: string | null | undefined): Promise<string | undefined> {
  if (!path) return undefined
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 300)
    if (error || !data) return undefined
    return data.signedUrl
  } catch {
    return undefined
  }
}

async function fetchPhotoAsDataUri(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined
  try {
    const res = await fetch(url)
    if (!res.ok) return undefined
    const buf = await res.arrayBuffer()
    const base64 = Buffer.from(buf).toString('base64')
    return `data:image/jpeg;base64,${base64}`
  } catch {
    return undefined
  }
}

export async function generateApplicationPdfAction(applicationId: string): Promise<{
  success: boolean
  url?: string
  cached?: boolean
  error?: string
}> {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET
    if (!bucket) return { success: false, error: 'SUPABASE_STORAGE_BUCKET no configurado' }

    console.log('[PDF_GEN] Starting for application:', applicationId)

    const { data: application, error } = await supabaseAdmin
      .from('visa_applications_usa')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return { success: false, error: 'Aplicación no encontrada' }
    }

    // If PDF already exists AND the application has no photos, return cached
    // (if photos exist we always regenerate so they're embedded)
    const hasPhotos = !!(application.passport_photo_url || application.visa_photo_url)
    if (application.pdf_url && !hasPhotos) {
      console.log('[PDF_GEN] PDF already exists, returning cached signed URL')
      const { data: signedData, error: signedError } = await supabaseAdmin
        .storage
        .from(bucket)
        .createSignedUrl(application.pdf_url, 300)

      if (signedError || !signedData) {
        return { success: false, error: 'No pudimos generar el enlace de descarga' }
      }

      return { success: true, url: signedData.signedUrl, cached: true }
    }

    // Fetch signed photo URLs and download as data URIs for embedding in PDF
    console.log('[PDF_GEN] Fetching photo data URIs...')
    const [passportSignedUrl, visaSignedUrl, prevVisaSignedUrl] = await Promise.all([
      getSignedUrl(bucket, application.passport_photo_url),
      getSignedUrl(bucket, application.visa_photo_url),
      getSignedUrl(bucket, application.previous_visa_photo_url),
    ])
    const [passportDataUri, visaDataUri, prevVisaDataUri] = await Promise.all([
      fetchPhotoAsDataUri(passportSignedUrl),
      fetchPhotoAsDataUri(visaSignedUrl),
      fetchPhotoAsDataUri(prevVisaSignedUrl),
    ])
    const photoUrls: Record<string, string> = {}
    if (passportDataUri) photoUrls.passport = passportDataUri
    if (visaDataUri) photoUrls.visaPhoto = visaDataUri
    if (prevVisaDataUri) photoUrls.previousVisa = prevVisaDataUri

    // Render PDF — try with photos first, fall back to text-only if image embedding fails
    console.log('[PDF_GEN] Rendering PDF (with photos)...')
    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generateApplicationPdf(application.data, photoUrls)
      console.log('[PDF_GEN] PDF with photos generated, size:', pdfBuffer.length, 'bytes')
    } catch (pdfErrWithPhotos: any) {
      console.error('[PDF_GEN] PDF with photos failed:', pdfErrWithPhotos.message, '— retrying without photos')
      try {
        pdfBuffer = await generateApplicationPdf(application.data, {})
        console.log('[PDF_GEN] PDF text-only generated, size:', pdfBuffer.length, 'bytes')
      } catch (pdfErrNoPhotos: any) {
        console.error('[PDF_GEN] PDF text-only also failed:', pdfErrNoPhotos.message)
        return {
          success: false,
          error: `Error al generar PDF: ${pdfErrNoPhotos.message}`,
        }
      }
    }

    // Upload to Storage
    console.log('[PDF_GEN] Uploading to storage...')
    const pdfPath = `${applicationId}/application.pdf`
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) {
      console.error('[PDF_GEN] Upload failed:', uploadError)
      return { success: false, error: 'Error subiendo PDF a almacenamiento' }
    }

    // Update DB row with pdf_url
    await supabaseAdmin
      .from('visa_applications_usa')
      .update({ pdf_url: pdfPath })
      .eq('id', applicationId)

    // Return 5-minute signed URL
    const { data: signedData } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(pdfPath, 300)

    console.log('[PDF_GEN] Done.')
    return { success: true, url: signedData?.signedUrl, cached: false }

  } catch (err: any) {
    console.error('[PDF_GEN_CATCH]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error generando el PDF',
    }
  }
}
