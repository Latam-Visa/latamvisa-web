// Rutina semanal fija (vive en código, no en la base). Las tareas de la base
// se muestran debajo del bloque cuyo `slot` coincide ese día.

import { indiceDia, type Fecha } from './dates'

export const CATEGORIAS = ['latam', 'ingenieria', 'estudio', 'ingles', 'cuerpo', 'vida', 'hito'] as const
export type Categoria = (typeof CATEGORIAS)[number]
export const SLOTS = ['am', 'pm', 'noche', 'hito'] as const
export type Slot = (typeof SLOTS)[number]

// 'trabajo' solo existe para los bloques de turno (no hay tareas con esa categoría).
export type CategoriaBloque = Categoria | 'trabajo'

export interface Bloque {
  time: string // '07:00' o '—'
  label: string
  category: CategoriaBloque
  slot?: Exclude<Slot, 'hito'>
  isWork?: boolean
  isClass?: boolean
}

export const ETIQUETA_CATEGORIA: Record<CategoriaBloque, string> = {
  latam: 'LATAM VISA',
  ingenieria: 'Ingeniería',
  estudio: 'Estudio',
  ingles: 'Inglés',
  cuerpo: 'Cuerpo',
  vida: 'Vida',
  hito: 'Hito',
  trabajo: 'Trabajo',
}

// Cuadros de color pequeños (nunca fondos completos).
export const COLOR_CATEGORIA: Record<CategoriaBloque, string> = {
  latam: '#4D7C0F',
  ingenieria: '#2563EB',
  estudio: '#7C3AED',
  ingles: '#0D9488',
  cuerpo: '#EA580C',
  vida: '#92400E',
  trabajo: '#9CA3AF',
  hito: '#DC2626',
}

export const ETIQUETA_SLOT: Record<Slot, string> = { am: 'Mañana', pm: 'Tarde', noche: 'Noche', hito: 'Hito' }

const ingles = (time: string): Bloque => ({ time, label: 'Inglés 30 min', category: 'ingles' })
const clase: Bloque = { time: '19:00', label: 'Clase del diplomado', category: 'estudio', isClass: true }

// Índice 0 = lunes … 6 = domingo
const RUTINA: Bloque[][] = [
  [
    { time: '07:00', label: 'Gym · Pecho y tríceps', category: 'cuerpo' },
    ingles('08:30'),
    { time: '09:30', label: 'LATAM VISA', category: 'latam', slot: 'am' },
    { time: '14:00', label: 'LATAM VISA', category: 'latam', slot: 'pm' },
    { time: '21:00', label: 'Lectura, cuaderno y piel', category: 'vida', slot: 'noche' },
  ],
  [
    { time: '07:00', label: 'Gym · Espalda y bíceps', category: 'cuerpo' },
    ingles('08:30'),
    { time: '09:30', label: 'LATAM VISA', category: 'latam', slot: 'am' },
    { time: '14:00', label: 'Ingeniería', category: 'ingenieria', slot: 'pm' },
    { time: '21:00', label: 'Lectura, cuaderno y piel', category: 'vida', slot: 'noche' },
  ],
  [
    { time: '07:00', label: 'Gym · Hombros', category: 'cuerpo' },
    ingles('08:15'),
    { time: '09:00', label: 'Bloque flexible', category: 'estudio', slot: 'am' },
    { time: '—', label: 'Turno · horario variable', category: 'trabajo', isWork: true },
    clase,
    { time: '21:15', label: 'Piel y cuaderno', category: 'vida', slot: 'noche' },
  ],
  [
    { time: '07:00', label: 'Gym · Pierna posterior', category: 'cuerpo' },
    ingles('08:15'),
    { time: '09:00', label: 'Bloque flexible', category: 'ingenieria', slot: 'am' },
    { time: '—', label: 'Turno · horario variable', category: 'trabajo', isWork: true },
    clase,
    { time: '21:15', label: 'Piel y cuaderno', category: 'vida', slot: 'noche' },
  ],
  [
    { time: '07:00', label: 'Gym · Pierna anterior', category: 'cuerpo' },
    ingles('08:30'),
    { time: '10:00', label: 'Cartier hasta las 19:00', category: 'trabajo', isWork: true },
    { time: '20:00', label: 'Descanso, piel', category: 'vida', slot: 'noche' },
  ],
  [
    { time: '07:00', label: 'Correr 30 a 40 min', category: 'cuerpo' },
    ingles('08:30'),
    { time: '10:00', label: 'Cartier hasta las 17:00', category: 'trabajo', isWork: true },
    { time: '18:00', label: 'Bloque corto', category: 'latam', slot: 'noche' },
  ],
  [
    { time: '07:30', label: 'Descanso activo: caminar', category: 'cuerpo' },
    ingles('08:30'),
    { time: '10:00', label: 'Cartier hasta las 17:00', category: 'trabajo', isWork: true },
    { time: '18:00', label: 'Revisión semanal', category: 'vida', slot: 'noche' },
  ],
]

// Las clases del diplomado terminan el jueves 2026-12-17.
export const ULTIMA_CLASE: Fecha = '2026-12-17'

export function etiquetaBloque(b: Bloque, fecha: Fecha): string {
  if (!b.isClass) return b.label
  if (fecha < ULTIMA_CLASE) return 'Clase del diplomado'
  if (fecha === ULTIMA_CLASE) return 'Última clase del diplomado'
  return 'Noche libre'
}

export function bloquesDelDia(fecha: Fecha): (Bloque & { etiqueta: string })[] {
  return RUTINA[indiceDia(fecha)].map((b) => ({ ...b, etiqueta: etiquetaBloque(b, fecha) }))
}

export const HABITOS = [
  { id: 'ingles', label: 'Inglés 30 min' },
  { id: 'cuerpo', label: 'Gym o correr' },
  { id: 'piel_am', label: 'Piel mañana' },
  { id: 'piel_pm', label: 'Piel noche' },
  { id: 'lectura', label: 'Lectura 20 min' },
  { id: 'cuaderno', label: 'Cuaderno de ideas' },
] as const
export type Habito = (typeof HABITOS)[number]['id']
