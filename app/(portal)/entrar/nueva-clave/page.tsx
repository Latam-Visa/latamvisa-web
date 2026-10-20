import { redirect } from 'next/navigation'
import { usuarioActual } from '@/lib/portal/supabase'
import { FormularioNuevaClave } from '../../_componentes/formularios'
import { tarjeta, titulo } from '../../_componentes/ui'

export const dynamic = 'force-dynamic'
// force-dynamic no apaga el Data Cache de Next para los fetch de supabase-js
// (ver admin/solicitudes): sin esto, una fila leída antes de activarse se
// sigue sirviendo vieja.
export const fetchCache = 'force-no-store'

// Se llega desde el enlace de recuperación, que ya dejó la sesión abierta.
export default async function NuevaClavePage() {
  const { user } = await usuarioActual()
  if (!user) redirect('/entrar/recuperar?vencido=1')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className={`${titulo} text-xl sm:text-2xl`}>Elige tu nueva contraseña</h1>
        <p className="text-base text-[#0d2b0d]/80 break-words">Para la cuenta {user.email}.</p>
      </div>
      <div className={`${tarjeta} p-5`}>
        <FormularioNuevaClave />
      </div>
    </div>
  )
}
