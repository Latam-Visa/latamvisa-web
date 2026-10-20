import Link from 'next/link'
import { redirect } from 'next/navigation'
import { GOOGLE_ACTIVO, usuarioActual } from '@/lib/portal/supabase'
import { FormularioEntrar } from '../_componentes/formularios'
import { avisoError, enlace, tarjeta, titulo } from '../_componentes/ui'

export const dynamic = 'force-dynamic'
// force-dynamic no apaga el Data Cache de Next para los fetch de supabase-js
// (ver admin/solicitudes): sin esto, una fila leída antes de activarse se
// sigue sirviendo vieja.
export const fetchCache = 'force-no-store'

const ERRORES: Record<string, string> = {
  google: 'No pudimos entrar con Google. Intenta otra vez o usa tu correo y contraseña.',
  confirmar: 'El enlace ya venció o ya se usó. Si ya confirmaste tu correo, entra con tu correo y contraseña.',
}

export default async function EntrarPage({ searchParams }: { searchParams: { error?: string } }) {
  const { user } = await usuarioActual()
  if (user) redirect('/mi-cuenta')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className={`${titulo} text-xl sm:text-2xl`}>Entra a tu cuenta</h1>
        <p className="text-base text-[#0d2b0d]/80">Aquí llenas tu solicitud y sigues tu trámite de visa.</p>
      </div>
      {searchParams.error && (
        <p role="alert" className={avisoError}>{ERRORES[searchParams.error] ?? 'Algo falló al entrar. Intenta otra vez.'}</p>
      )}
      <div className={`${tarjeta} p-5`}>
        <FormularioEntrar google={GOOGLE_ACTIVO} />
      </div>
      <p className="text-center text-sm text-[#0d2b0d]/70">
        ¿Todavía no tienes cuenta? <Link href="/registro" className={enlace}>Mira cómo crearla</Link>
      </p>
    </div>
  )
}
