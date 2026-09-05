/* Piezas compartidas entre las solicitudes del formulario público y los lotes
   de traducción manual del admin. Ambos lados leen las mismas filas de
   `documentos_traducidos` y disparan el mismo webhook de n8n. */

export const VISA_APPLICATIONS_BUCKET = 'visa-applications'

/* 24h, no 1h: el pipeline de n8n tarda 14-17 minutos y con vigencias cortas
   fallaba a mitad de proceso con "exp claim timestamp check failed".
   No bajar este número. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24

export const PAISES_TRADUCCION = [
  { value: 'australia', label: 'Australia' },
  { value: 'usa', label: 'Estados Unidos' },
  { value: 'canada', label: 'Canadá' },
  { value: 'uk', label: 'Reino Unido' },
  { value: 'schengen', label: 'Schengen' },
  { value: 'japon', label: 'Japón' },
  { value: 'nueva-zelanda', label: 'Nueva Zelanda' },
] as const

export type PaisTraduccion = (typeof PAISES_TRADUCCION)[number]['value']

export const PAIS_TRADUCCION_DEFAULT: PaisTraduccion = 'australia'

export function labelPais(pais: string | null | undefined): string | null {
  if (!pais) return null
  return PAISES_TRADUCCION.find((p) => p.value === pais)?.label ?? pais
}

export type DocStatus = 'traducido' | 'no_traducido' | 'error'

/* Los estados desconocidos o nulos (filas viejas, anteriores a la columna)
   se leen como 'traducido'. */
export function normalizeDocStatus(status: string | null | undefined): DocStatus {
  return status === 'no_traducido' || status === 'error' ? status : 'traducido'
}

export interface TranslatedDocument {
  id: string
  nombre_original: string
  nombre_archivo: string
  status: string
  motivo: string | null
  created_at: string
  downloadUrl?: string
}

export const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const

export const MAX_FILES_POR_LOTE = 20
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

export function extForMimeType(fileType: string): string {
  if (fileType === 'image/jpeg') return 'jpg'
  if (fileType === 'image/png') return 'png'
  return 'pdf'
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

/* Los archivos se guardan como `<uuid>__<nombre saneado>` para que el nombre
   real del cliente sobreviva en la ruta: el reintento reconstruye la lista
   leyendo la carpeta de Storage, y sin esto le mandaría a n8n el UUID como
   nombre del documento. El UUID delante evita choques entre archivos que se
   llamen igual. */
const SEPARADOR_NOMBRE = '__'

export function nombreSeguroParaStorage(nombre: string): string {
  const limpio = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // sin tildes: las claves de Storage son ASCII
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
  return limpio.slice(-80) || 'documento'
}

export function nombreOriginalDesdePath(path: string): string {
  const archivo = path.split('/').pop() || path
  const i = archivo.indexOf(SEPARADOR_NOMBRE)
  return i === -1 ? archivo : archivo.slice(i + SEPARADOR_NOMBRE.length)
}

export function construirNombreEnStorage(uuid: string, nombreOriginal: string): string {
  return `${uuid}${SEPARADOR_NOMBRE}${nombreSeguroParaStorage(nombreOriginal)}`
}
