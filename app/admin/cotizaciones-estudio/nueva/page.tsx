import { redirect } from 'next/navigation'
import Link from 'next/link'
import { crearBorradorEstudio } from '../_actions/actions'

export const dynamic = 'force-dynamic'

// Crea un borrador nuevo y manda directo a su editor. Si algo falla, muestra
// un aviso con el enlace de vuelta (no revienta la navegación).
export default async function NuevaEstudioPage() {
  const res = await crearBorradorEstudio()
  if (res.success && res.id) {
    redirect(`/admin/cotizaciones-estudio/${res.id}`)
  }

  return (
    <div className="mx-auto w-full max-w-[600px] py-16 text-center">
      <p className="text-sm text-red-700">{res.error || 'No pudimos crear la cotización.'}</p>
      <Link href="/admin/cotizaciones-estudio" className="mt-4 inline-block text-sm font-bold text-[#2F4A00] underline">
        Volver a Cotizaciones Estudio
      </Link>
    </div>
  )
}
