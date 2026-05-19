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

    console.log('[PDF_GEN] Starting for application:', applicationId)

    const { data: application, error } = await supabaseAdmin
      .from('visa_applications_usa')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return { success: false, error: 'Aplicación no encontrada' }
    }

    // If PDF already exists, return a fresh 5-minute signed URL
    if (application.pdf_url) {
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

    // Render PDF (no photos — they are requested via WhatsApp)
    console.log('[PDF_GEN] Rendering PDF...')
    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generateApplicationPdf(application.data, {})
      console.log('[PDF_GEN] PDF generated, size:', pdfBuffer.length, 'bytes')
    } catch (pdfErr: any) {
      console.error('[PDF_GEN] PDF rendering failed:', pdfErr)
      return {
        success: false,
        error: 'Error renderizando PDF. Puede ocurrir con caracteres especiales. Intenta de nuevo o contacta soporte.',
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
