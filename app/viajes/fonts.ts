import { Anton } from 'next/font/google'

/* Display de la campaña: sans condensada y pesada, en la línea de las piezas
   ("PARCE... ¿Y SI NOS PEGAMOS DOS VACACIONES?"). Anton trae un solo peso
   (400) que ya es negro y estrecho, que es exactamente el registro que pide
   el diseño — por eso .viajes-display usa font-weight 400 y no 900.

   Se expone como variable CSS para que globals.css la consuma desde
   .viajes-display sin acoplar el CSS a un className generado. */
export const viajesDisplay = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-viajes-display',
  display: 'swap',
})
