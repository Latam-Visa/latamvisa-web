"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'

interface FileInput {
  name: string
  size: number
}

interface UploadTarget {
  originalName: string
  path: string
  signedUrl: string
  token: string
}

function sanitizeFilename(name: string): string {
  const lastDot = name.lastIndexOf('.')
  const base = lastDot > 0 ? name.slice(0, lastDot) : name
  const ext = lastDot > 0 ? name.slice(lastDot + 1) : ''

  const safeBase = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'documento'

  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

  return safeExt ? `${safeBase}.${safeExt}` : safeBase
}

export async function createUploadUrls(
  applicationId: string,
  files: FileInput[]
): Promise<{ success: boolean; targets?: UploadTarget[]; error?: string }> {
  if (!applicationId || !files || files.length === 0) {
    return { success: false, error: 'Faltan datos para preparar la subida.' }
  }

  try {
    const bucket = 'documentos-originales'
    const usedNames = new Set<string>()
    const targets: UploadTarget[] = []

    for (const file of files) {
      const sanitized = sanitizeFilename(file.name)

      let finalName = sanitized
      let counter = 1
      while (usedNames.has(finalName)) {
        const lastDot = sanitized.lastIndexOf('.')
        const base = lastDot > 0 ? sanitized.slice(0, lastDot) : sanitized
        const ext = lastDot > 0 ? sanitized.slice(lastDot) : ''
        finalName = `${base}-${counter}${ext}`
        counter++
      }
      usedNames.add(finalName)

      const path = `australia/${applicationId}/${finalName}`

      const { data, error } = await supabaseAdmin
        .storage
        .from(bucket)
        .createSignedUploadUrl(path)

      if (error || !data) {
        console.error('[CREATE_UPLOAD_URLS] Error:', error)
        return { success: false, error: `No se pudo generar la URL de subida para ${file.name}.` }
      }

      targets.push({
        originalName: file.name,
        path,
        signedUrl: data.signedUrl,
        token: data.token,
      })
    }

    return { success: true, targets }
  } catch (error: any) {
    console.error('[CREATE_UPLOAD_URLS_CATCH] Error:', error)
    return { success: false, error: 'Ocurrió un error inesperado al preparar la subida.' }
  }
}
