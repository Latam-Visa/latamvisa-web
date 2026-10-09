// Utilidades de archivos en el navegador para los formularios de aplicación.

const EXT_HEIC = /\.(heic|heif)$/i

// iPhone: las fotos HEIC/HEIF a veces llegan con type '' (Chrome/Windows) o
// 'image/heif', así que se detectan también por extensión.
export function esHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || EXT_HEIC.test(file.name)
}

/**
 * Convierte HEIC/HEIF a JPEG (la IA que lee documentos, el PDF y Storage no
 * aceptan HEIF). heic2any pesa ~1 MB, por eso se carga solo cuando hace falta.
 */
export async function convertirHeicAJpeg(file: File): Promise<File> {
  if (!esHeic(file)) return file
  const { default: heic2any } = await import('heic2any')
  const resultado = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
  const blob = Array.isArray(resultado) ? resultado[0] : resultado
  return new File([blob], file.name.replace(EXT_HEIC, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() })
}

export function formatoMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`
}

export function mensajeArchivoGrande(file: File, maxBytes: number): string {
  return `«${file.name}» pesa ${formatoMB(file.size)} y el máximo es ${formatoMB(maxBytes)}. Sube una versión más liviana (por ejemplo, una foto con menor resolución o un PDF comprimido).`
}
