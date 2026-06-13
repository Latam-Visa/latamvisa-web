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

export async function generateApplicationPdfAction(
  applicationId: string,
  destination: 'usa' | 'canada' | 'uk' | 'schengen' = 'usa'
): Promise<{
  success: boolean
  url?: string
  cached?: boolean
  error?: string
}> {
  try {
    const bucket = destination === 'usa' ? (process.env.SUPABASE_STORAGE_BUCKET || 'visa-documents') : 'visa-applications'

    console.log('[PDF_GEN] Starting for application:', applicationId, 'destination:', destination)

    const table = destination === 'usa' ? 'visa_applications_usa' : destination === 'canada' ? 'visa_applications_canada' : destination === 'uk' ? 'visa_applications_uk' : 'visa_applications_schengen'

    const { data: application, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return { success: false, error: 'Aplicación no encontrada' }
    }

    // Check photos presence for caching logic
    let hasPhotos = false
    let photoPaths: Record<string, string | null> = {}

    if (destination === 'usa') {
      hasPhotos = !!(application.passport_photo_url || application.visa_photo_url)
      photoPaths = {
        passport: application.passport_photo_url,
        visaPhoto: application.visa_photo_url,
        previousVisa: application.previous_visa_photo_url
      }
    } else if (destination === 'canada') {
      hasPhotos = !!application.doc_id_passport || !!application.doc_ties
      photoPaths = {
        docIdPassport: application.doc_id_passport,
        docTies: application.doc_ties
      }
    } else if (destination === 'uk') {
      hasPhotos = !!application.passport_file_url || !!application.photo_file_url
      photoPaths = {
        passport: application.passport_file_url,
        photo: application.photo_file_url
      }
    } else if (destination === 'schengen') {
      hasPhotos = !!application.passport_file_url || !!application.photo_file_url
      photoPaths = {
        passport: application.passport_file_url,
        photo: application.photo_file_url
      }
    }

    if (application.pdf_url && !hasPhotos) {
      console.log('[PDF_GEN] PDF already exists, returning cached signed URL')
      const { data: signedData, error: signedError } = await supabaseAdmin
        .storage
        .from(bucket)
        .createSignedUrl(application.pdf_url, 300, { download: 'application.pdf' })

      if (signedError || !signedData) {
        return { success: false, error: 'No pudimos generar el enlace de descarga' }
      }

      return { success: true, url: signedData.signedUrl, cached: true }
    }

    // Fetch signed photo URLs and download as data URIs for embedding in PDF
    console.log('[PDF_GEN] Fetching photo data URIs...')
    const photoDataUris: Record<string, string> = {}
    
    for (const [key, path] of Object.entries(photoPaths)) {
      if (path) {
        const signedUrl = await getSignedUrl(bucket, path)
        const dataUri = await fetchPhotoAsDataUri(signedUrl)
        if (dataUri) photoDataUris[key] = dataUri
      }
    }

    // Render PDF — try with photos first, fall back to text-only if image embedding fails
    console.log('[PDF_GEN] Rendering PDF (with photos)...')
    let pdfBuffer: Buffer
    const pdfData = destination === 'usa' ? application.data : application

    try {
      pdfBuffer = await generateApplicationPdf(pdfData, photoDataUris, destination)
      console.log('[PDF_GEN] PDF with photos generated, size:', pdfBuffer.length, 'bytes')
    } catch (pdfErrWithPhotos: any) {
      console.error('[PDF_GEN] PDF with photos failed:', pdfErrWithPhotos.message, '— retrying without photos')
      try {
        pdfBuffer = await generateApplicationPdf(pdfData, {}, destination)
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
      .from(table)
      .update({ pdf_url: pdfPath })
      .eq('id', applicationId)

    // Return 5-minute signed URL
    const { data: signedData } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(pdfPath, 300, { download: 'application.pdf' })

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
