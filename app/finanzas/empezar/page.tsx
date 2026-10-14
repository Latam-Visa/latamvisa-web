import { redirect } from 'next/navigation'
import { cargarDatos, estadoActual } from '@/lib/finanzas/datos'
import { Consentimiento } from '../_components/Consentimiento'
import { Onboarding } from '../_components/Onboarding'
import { Piloto } from '../_components/Piloto'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Empezar({ searchParams }: { searchParams: { paso?: string } }) {
  const { supabase, user, enPiloto, perfil } = await estadoActual()
  if (!user) redirect('/finanzas')
  if (!enPiloto && !perfil) return <Piloto email={user.email ?? ''} />
  if (!perfil) {
    const nombre = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? ''
    return <Consentimiento nombreSugerido={nombre} />
  }
  const datos = await cargarDatos(supabase)
  const paso = Math.min(7, Math.max(1, Number(searchParams.paso) || perfil.onboarding_step || 1))
  return <Onboarding paso={paso} datos={datos} />
}
