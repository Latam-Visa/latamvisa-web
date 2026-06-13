"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'

export async function getUploadUrl(
  fileType: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET
    if (!bucket) {
      return { success: false, error: 'SUPABASE_STORAGE_BUCKET no está configurado.' }
    }

    // Determine extension from mime type
    let ext = 'jpg'
    if (fileType === 'image/png') ext = 'png'
    else if (fileType === 'image/webp') ext = 'webp'
    else if (fileType === 'application/pdf') ext = 'pdf'

    // Generate unique path
    const path = `uploads/${new Date().toISOString().split('T')[0]}/${uuidv4()}.${ext}`

    // Create a signed upload URL valid for 30 minutes
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUploadUrl(path)

    if (error || !data) {
      console.error('[GET_UPLOAD_URL] Error:', error)
      return { success: false, error: 'No se pudo generar la URL de subida.' }
    }

    return {
      success: true,
      url: data.signedUrl,
      path: path
    }
  } catch (error: any) {
    console.error('[GET_UPLOAD_URL_CATCH] Error:', error)
    return { success: false, error: 'Ocurrió un error inesperado al preparar la subida.' }
  }
}
