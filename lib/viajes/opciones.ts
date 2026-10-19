/* Opciones del formulario "Dos Vacaciones". Editar acá cambia el formulario,
   la validación (lib/viajes/schema.ts) y lo que llega al cotizador.

   - `value` es lo que se guarda y lo que compara el cotizador. Las ciudades
     tienen que escribirse IGUAL que en hotel_properties.city (con tilde).
   - `label` es lo que ve el usuario. */

export interface Opcion<V extends string = string> {
  value: V
  label: string
}

export const SALIDAS = [
  { value: 'BNE', label: 'Brisbane' },
  { value: 'SYD', label: 'Sídney' },
  { value: 'MEL', label: 'Melbourne' },
] as const satisfies readonly Opcion[]

// 'Otro' abre un campo de texto para escribir el país.
export const OTRO = 'Otro'

export const PAISES_LATAM: Opcion[] = [
  { value: 'Colombia', label: 'Colombia' },
  { value: 'México', label: 'México' },
  { value: 'Perú', label: 'Perú' },
  { value: 'Chile', label: 'Chile' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Venezuela', label: 'Venezuela' },
  { value: OTRO, label: 'Otro' },
]

// El value es el país del pasaporte: el cotizador reconoce 'Colombia' y 'Australia'.
export const PASAPORTES: Opcion[] = [
  { value: 'Colombia', label: 'Colombiano' },
  { value: 'Australia', label: 'Australiano' },
  { value: 'México', label: 'Mexicano' },
  { value: 'Perú', label: 'Peruano' },
  { value: 'Chile', label: 'Chileno' },
  { value: OTRO, label: 'Otro' },
]

export const DIAS_EUROPA = [4, 7, 10, 14] as const

export const MAX_CIUDADES = 3
export const CIUDADES_EUROPA: Opcion[] = [
  { value: 'París', label: 'París' },
  { value: 'Niza', label: 'Niza' },
  { value: 'Marsella', label: 'Marsella' },
  { value: 'Roma', label: 'Roma' },
  { value: 'Barcelona', label: 'Barcelona' },
  { value: 'Madrid', label: 'Madrid' },
  { value: 'Lisboa', label: 'Lisboa' },
  { value: 'Oporto', label: 'Oporto' },
]

// Las claves tienen que coincidir con CIUDADES_POR_ESTILO del cotizador.
export const ESTILOS = ['rumba', 'cultura', 'playa', 'comida', 'descanso'] as const
export const ESTILOS_OPCIONES: Opcion<(typeof ESTILOS)[number]>[] = [
  { value: 'rumba', label: 'Rumba' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'playa', label: 'Playa' },
  { value: 'comida', label: 'Comida' },
  { value: 'descanso', label: 'Descanso' },
]

export const MAX_ADULTOS = 10
export const MAX_NINOS = 10
