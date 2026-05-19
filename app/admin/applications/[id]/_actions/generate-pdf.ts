'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateApplicationPdf } from '@/lib/pdf/generate-pdf'

export async function generateApplicationPdfAction(applicationId: string): Promise<{
  success: boolean
  url?: string
  cached?: boolean
  error?: string
}> {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET
    if (!bucket) return { success: false, error: 'SUPABASE_STORAGE_BUCKET no configurado' }

    const { data: application, error } = await supabaseAdmin
      .from('visa_applications_usa')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return { success: false, error: 'Aplicación no encontrada' }
    }

    // If PDF already exists, return a fresh signed URL
    if (application.pdf_url) {
      const { data: signedData, error: signedError } = await supabaseAdmin
        .storage
        .from(bucket)
        .createSignedUrl(application.pdf_url, 300)

      if (signedError || !signedData) {
        return { success: false, error: 'No pudimos generar el enlace de descarga' }
      }

      return { success: true, url: signedData.signedUrl, cached: true }
    }

    // Generate signed URLs for photos so the PDF renderer can fetch them
    console.log('[ADMIN_PDF_GEN] Generating PDF for:', applicationId)
    const photoUrls: { passport?: string; previousVisa?: string; visaPhoto?: string } = {}

    const photoFields: Array<[keyof typeof photoUrls, string]> = [
      ['passport', application.passport_photo_url],
      ['previousVisa', application.previous_visa_photo_url],
      ['visaPhoto', application.visa_photo_url],
    ]

    for (const [key, storagePath] of photoFields) {
      if (storagePath) {
        const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(storagePath, 3600)
        if (data) photoUrls[key] = data.signedUrl
      }
    }

    // Render PDF
    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generateApplicationPdf(application.data, photoUrls)
    } catch (pdfErr: any) {
      console.error('[ADMIN_PDF_GEN] PDF rendering failed:', pdfErr)
      return {
        success: false,
        error: 'La generación del PDF falló. Esto puede pasar con fotos muy grandes o caracteres especiales. Probá descargar los datos en JSON desde el botón de acciones.',
      }
    }

    // Upload to Storage
    const pdfPath = `${applicationId}/application.pdf`
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) {
      console.error('[ADMIN_PDF_GEN] PDF upload failed:', uploadError)
      return { success: false, error: 'No pudimos guardar el PDF generado' }
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

    return { success: true, url: signedData?.signedUrl, cached: false }

  } catch (err: any) {
    console.error('[ADMIN_PDF_GEN_CATCH]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error generando el PDF',
    }
  }
}
