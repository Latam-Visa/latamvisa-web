import { supabaseAdmin } from './admin'

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'visa-applications'

export async function uploadVisaPhoto(
  file: Buffer,
  fileName: string,
  applicationId: string,
  photoType: 'passport' | 'previous_visa' | 'visa_photo'
): Promise<string> {
  const ext = fileName.split('.').pop()
  const timestamp = Date.now()
  const path = `${applicationId}/${photoType}_${timestamp}.${ext}`

  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      upsert: true,
      contentType: mimeType,
    })

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  return data.path
}

export async function getSignedUrl(path: string, expiresInSeconds: number = 31536000): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresInSeconds)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

export async function downloadFile(path: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .download(path)

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`)
  }

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
