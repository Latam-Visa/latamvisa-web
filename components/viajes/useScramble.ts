'use client'
import { type RefObject } from 'react'

/* Efecto ScrambleText retirado a pedido.

   El texto definitivo siempre vivió en el HTML (el plugin solo lo reescribía
   encima mientras duraba la animación), así que al volver este hook un no-op
   todos los textos de /viajes se leen exactamente igual, pero sin el revoltijo
   de letras.

   Se conserva la firma para no tener que tocar los componentes que lo invocan
   ni los atributos [data-scramble] del marcado, que ahora quedan inertes. */
export function useScramble(_scopeRef: RefObject<HTMLElement>, _retrigger?: unknown) {
  // intencionalmente vacío
}
