'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Tras volver de Stripe, el webhook puede tardar unos segundos en marcar la
// cotización como pagada. Re-renderiza la página (la base de datos manda)
// hasta que eso pase o se agoten los intentos.
export function RefrescoPago() {
  const router = useRouter()

  useEffect(() => {
    let intentos = 0
    const id = setInterval(() => {
      intentos += 1
      router.refresh()
      if (intentos >= 15) clearInterval(id)
    }, 4000)
    return () => clearInterval(id)
  }, [router])

  return null
}
