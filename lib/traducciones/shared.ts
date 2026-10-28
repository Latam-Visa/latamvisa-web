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

/* A dónde se suben los documentos del admin. La misma maquinaria sirve a dos
   destinos: un lote de traducción manual (`/admin/traducciones`) y una
   solicitud del formulario público (`/admin/applications/[id]`), donde el
   admin agrega lo que el cliente mandó por WhatsApp después de aplicar.

   Para una solicitud se carga el `pais` porque, a diferencia del lote, no hay
   fila en `lotes_traduccion` de dónde leerlo: lo sabe la ficha del país. */
export type Destino =
  | { tipo: 'lote'; id: string }
  | { tipo: 'solicitud'; id: string; pais: string }

/* Carpeta raíz dentro de `visa-applications`. Prefijos disjuntos entre sí y
   del formulario público (`<pais>/…`, `<pais>/sol-…`): `manual/<loteId>` para
   los lotes, `admin/<solicitudId>` para lo que el admin agrega a una solicitud.
   Que sean disjuntos es lo que evita que un reintento liste archivos de otro. */
export function prefijoStorage(destino: Destino): string {
  return destino.tipo === 'lote' ? `manual/${destino.id}` : `admin/${destino.id}`
}

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
  // Carpeta de ImmiAccount ya resuelta (manual > n8n > mapeo, ver
  // lib/docs/categorias.ts); null = sin clasificar o país sin carpetas.
  carpeta: string | null
  carpetaOrigen?: 'manual' | 'n8n' | 'mapeo' | null
  created_at: string
  downloadUrl?: string
  /* Quién subió el documento: 'admin' = lo agregó el admin a mano después del
     formulario; 'formulario' o null = lo subió el cliente al aplicar. Solo se
     usa para la etiqueta "Agregado por admin"; null se trata como formulario. */
  origen?: string | null
}

// Este listado debe coincidir con el nodo "Asignar Carpetas" de n8n.
// Si se cambia aca, hay que cambiarlo alla tambien.
export const CARPETAS_AUSTRALIA = [
  'Travel Document',
  'National Identity Document (other than Passport)',
  'Evidence of the financial status and funding for visit',
  'Evidence of planned tourism activities in Australia',
  'Family register and composition form (if applicable)',
  'Other Documents',
] as const

export const CARPETAS_POR_PAIS: Record<string, readonly string[]> = {
  australia: CARPETAS_AUSTRALIA,
}

/* null = el país no usa carpetas y los documentos se agrupan por estado. */
export function carpetasDePais(pais: string | null | undefined): readonly string[] | null {
  return (pais && CARPETAS_POR_PAIS[pais]) || null
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
