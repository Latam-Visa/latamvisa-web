import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { usuarioActual } from '@/lib/portal/supabase'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { nombrePaisPortal } from '@/lib/portal/textos'
import { enlace, tarjeta, titulo } from '../../../_componentes/ui'
import FormularioAustralia from './FormularioAustralia'

export const dynamic = 'force-dynamic'
// Igual que en mi-cuenta/admin: force-dynamic no apaga el Data Cache de Next
// para los fetch de supabase-js; sin esto podríamos servir un borrador viejo.
export const fetchCache = 'force-no-store'

const volver = (
  <Link href="/mi-cuenta" className={`inline-block text-sm ${enlace}`}>
    ← Volver a mi cuenta
  </Link>
)

export default async function FormularioPage({ params }: { params: { id: string } }) {
  // El middleware ya exige sesión; esto la revalida en el servidor.
  const { user } = await usuarioActual()
  if (!user) redirect('/entrar')

  // Lectura con service key pero acotada al dueño: nunca confiamos en el id solo.
  const { data: sol } = await supabaseAdmin
    .from('solicitudes')
    .select('id, user_id, pais, servicio, estado, nombre_cliente, borrador_formulario')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!sol) notFound()

  if (sol.pais !== 'australia') {
    return (
      <div className="space-y-6">
        {volver}
        <div className={`${tarjeta} p-6 space-y-2`}>
          <h1 className={`${titulo} text-xl`}>Visa de {nombrePaisPortal(sol.pais)}</h1>
          <p className="text-base text-[#0d2b0d]/80">
            El formulario en línea para este destino estará disponible muy pronto. Te avisaremos apenas lo abramos.
          </p>
        </div>
      </div>
    )
  }

  if (sol.estado === 'enviada' || sol.estado === 'completada') {
    return (
      <div className="space-y-6">
        {volver}
        <div className={`${tarjeta} p-6 space-y-2`}>
          <h1 className={`${titulo} text-xl`}>Formulario enviado</h1>
          <p className="text-base text-[#0d2b0d]/80">
            Ya recibimos tu formulario de Australia y lo estamos revisando. Si necesitas cambiar algo, escríbenos por WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  const guardado = sol.borrador_formulario as { data?: unknown; step?: number } | null
  const borradorInicial = guardado && guardado.data ? guardado : null

  return (
    <FormularioAustralia
      solicitudId={sol.id}
      borradorInicial={borradorInicial}
    />
  )
}
