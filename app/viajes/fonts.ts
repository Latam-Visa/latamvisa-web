import localFont from 'next/font/local'
import { Playball } from 'next/font/google'

/* Display de la campaña: PPMonumentCondensed, el corte estrecho de la propia
   tipografía de marca. Los archivos ya estaban en public/fonts/PPMonument
   pero ninguna @font-face los registraba — el sitio solo tenía dada de alta
   la variante Extended, que es la MÁS ancha de las cinco.

   Medido a 200px, el ancho de "LATAM" contra la altura de mayúscula:
   Condensed 2.78 · Narrow 3.94 · Normal 5.10 · Wide 6.23 · Extended 7.35.
   Condensed es 2.6x más estrecha que la que usa el resto del sitio, que es
   exactamente el registro alargado que pide el wordmark.

   Reemplaza a Anton (next/font/google): siendo la fuente de la marca y ya
   presente en el repo, no hay razón para depender de Google Fonts. */
export const viajesDisplay = localFont({
  src: [
    { path: '../../public/fonts/PPMonument/PPMonumentCondensed-Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/PPMonument/PPMonumentCondensed-Black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-viajes-display',
  display: 'swap',
})

/* Script de la campaña. Playball trae un único peso (400) y es una cursiva
   de rótulo: contrasta con la condensada sin competir por el mismo registro.
   Se usa en la palabra "Travel", en "1 viaje / 2 vacaciones" y en los
   acentos editoriales del resto de la página.

   Va en caja mixta a propósito: una script en MAYÚSCULAS pierde los enlaces
   entre letras, que es justo lo que la hace legible. */
export const viajesScript = Playball({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-viajes-script',
  display: 'swap',
})
