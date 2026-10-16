import { CARPETAS_AUSTRALIA, carpetasDePais } from '@/lib/traducciones/shared'

/* Clasificación determinística de documentos en las carpetas del checklist de
   ImmiAccount. Sin IA: solo palabras clave (inglés y español, sin tildes ni
   mayúsculas) sobre el nombre que ya puso el paso de traducción
   (`nombre_archivo`, p. ej. "Income_Tax_Return_…") y, si eso no alcanza, sobre
   el nombre con que llegó el archivo (`nombre_original`, p. ej. "RENTA 2025…").

   Prioridad al resolver la carpeta de una fila (ver resolverCarpeta):
     1. carpeta_manual  — lo que eligió el admin con "Mover a…". Siempre gana.
     2. carpeta         — lo que escribió n8n, si es una carpeta válida.
     3. este mapeo.
     4. null            — "Sin clasificar". */

const [TRAVEL, NATIONAL_ID, FINANCIAL, TOURISM, FAMILY, OTHER] = CARPETAS_AUSTRALIA

/* El orden importa: gana la primera regla que coincide. Familia va antes que
   identidad para que "birth certificate" no caiga en otra cosa, y "Otros" va
   al final porque es el cajón de lo reconocido que no calza arriba. */
const REGLAS: { carpeta: string; claves: string[] }[] = [
  { carpeta: TRAVEL, claves: ['passport', 'pasaporte', 'travel document', 'documento de viaje'] },
  {
    carpeta: FAMILY,
    claves: [
      'registro civil', 'birth certificate', 'birth register', 'acta de nacimiento', 'partida de nacimiento',
      'marriage certificate', 'acta de matrimonio', 'registro de matrimonio', 'family register', 'composicion familiar',
    ],
  },
  {
    carpeta: NATIONAL_ID,
    claves: [
      'cedula', 'national id', 'national identity', 'identity card', 'id card', 'documento de identidad',
      'tarjeta de identidad', 'dni',
    ],
  },
  {
    carpeta: FINANCIAL,
    claves: [
      'bank statement', 'extracto bancario', 'extracto', 'estado de cuenta', 'certificado bancario', 'bank certificate',
      'income tax', 'tax return', 'declaracion de renta', 'renta',
      'certificado de ingresos y retenciones', 'ingresos y retenciones', 'certificado de ingresos',
      'payslip', 'pay slip', 'desprendible', 'desprendible de nomina', 'nomina',
      'employment letter', 'employment certificate', 'certificado laboral', 'carta laboral',
      'certificado de tradicion', 'certificado de tradicion y libertad', 'escritura', 'property', 'deed',
      'cdt', 'term deposit', 'pension', 'colpensiones', 'retirement',
    ],
  },
  {
    carpeta: TOURISM,
    claves: [
      'itinerary', 'itinerario', 'flight', 'vuelo', 'tiquete', 'boarding', 'hotel', 'booking', 'reserva',
      'accommodation', 'alojamiento',
    ],
  },
  {
    carpeta: OTHER,
    claves: [
      'visa', 'others', 'other', 'otros', 'police', 'antecedentes', 'insurance', 'seguro', 'invitation', 'invitacion',
      'letter', 'carta', 'certificate', 'certificado', 'driver license', 'licencia',
    ],
  },
]

/* "Declaración_de-Renta.PDF" -> "declaracion de renta pdf" */
export function normalizar(texto: string | null | undefined): string {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Palabra completa, con plural simple opcional: "pasaporte(s)", pero no "renta" en "rentabilidad".
function contiene(textoNormalizado: string, clave: string): boolean {
  return ` ${textoNormalizado} `.match(new RegExp(`\\s${normalizar(clave)}(s|es)?\\s`)) !== null
}

/* Carpeta para un texto suelto, o null si nada coincide. */
export function categoriaPorTexto(texto: string | null | undefined): string | null {
  const t = normalizar(texto)
  if (!t) return null
  for (const regla of REGLAS) {
    if (regla.claves.some((clave) => contiene(t, clave))) return regla.carpeta
  }
  return null
}

export type OrigenCarpeta = 'manual' | 'n8n' | 'mapeo'

export interface FilaClasificable {
  pais?: string | null
  carpeta?: string | null
  carpeta_manual?: string | null
  nombre_archivo?: string | null
  nombre_original?: string | null
}

/* Carpeta final de una fila. null = país sin carpetas, o "Sin clasificar". */
export function resolverCarpeta(
  fila: FilaClasificable,
  paisPorDefecto?: string | null,
): { carpeta: string | null; origen: OrigenCarpeta | null } {
  const carpetas = carpetasDePais(fila.pais || paisPorDefecto)
  if (!carpetas) return { carpeta: fila.carpeta ?? null, origen: fila.carpeta ? 'n8n' : null }

  const valida = (c: string | null | undefined): c is string => !!c && carpetas.includes(c)

  if (valida(fila.carpeta_manual)) return { carpeta: fila.carpeta_manual, origen: 'manual' }
  if (valida(fila.carpeta)) return { carpeta: fila.carpeta, origen: 'n8n' }

  // Primero el tipo que ya extrajo la traducción; después el nombre del cliente.
  const porMapeo = categoriaPorTexto(fila.nombre_archivo) ?? categoriaPorTexto(fila.nombre_original)
  if (valida(porMapeo)) return { carpeta: porMapeo, origen: 'mapeo' }

  return { carpeta: null, origen: null }
}
