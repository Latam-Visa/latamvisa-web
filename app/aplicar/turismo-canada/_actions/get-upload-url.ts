"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'

export async function getUploadUrl(
  fileType: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const bucket = 'visa-applications'
    
    let ext = 'pdf'
    if (fileType === 'image/jpeg') ext = 'jpg'
    else if (fileType === 'image/png') ext = 'png'
    else if (fileType === 'image/webp') ext = 'webp'
    else if (fileType === 'image/heic') ext = 'heic'
    else if (fileType === 'application/msword') ext = 'doc'
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ext = 'docx'

    // Generate a pseudo-application ID for the folder since actual ID is created on submit
    const pseudoAppId = uuidv4()
    const path = `canada/${pseudoAppId}/${uuidv4()}.${ext}`

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
