import localFont from 'next/font/local'

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
