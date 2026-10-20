import Link from 'next/link'
import { redirect } from 'next/navigation'
import { solicitudPorToken } from '@/lib/portal/solicitudes'
import { GOOGLE_ACTIVO, usuarioActual } from '@/lib/portal/supabase'
import { nombrePaisPortal } from '@/lib/portal/textos'
import { activarConSesion, usarOtraCuenta } from '../../acciones'
import { FormularioActivar } from '../../_componentes/formularios'
import { WHATSAPP, btnPrimario, btnSecundario, enlace, tarjeta, titulo } from '../../_componentes/ui'

export const dynamic = 'force-dynamic'
// force-dynamic no apaga el Data Cache de Next para los fetch de supabase-js
// (ver admin/solicitudes): sin esto, una fila leída antes de activarse se
// sigue sirviendo vieja.
export const fetchCache = 'force-no-store'

function Aviso({ encabezado, children }: { encabezado: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h1 className={`${titulo} text-xl sm:text-2xl`}>{encabezado}</h1>
      <div className={`${tarjeta} p-5 space-y-4 text-base text-[#0d2b0d]/80`}>{children}</div>
    </div>
  )
}

const Escribenos = () => (
  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className={btnPrimario}>
    Escribir a LATAM VISA
  </a>
)

export default async function ActivarPage({ params, searchParams }: { params: { token: string }; searchParams: { error?: string } }) {
  // Sin dueño todavía, RLS no deja leer la fila: se lee desde el servidor.
  const solicitud = await solicitudPorToken(params.token)

  if (!solicitud) {
    return (
      <Aviso encabezado="Este link no funciona">
        <p>No encontramos una solicitud con este link. Puede que esté incompleto o mal copiado.</p>
        <p>Escríbenos y te ayudamos a entrar a tu cuenta.</p>
        <Escribenos />
      </Aviso>
    )
  }

  const { user } = await usuarioActual()

  if (solicitud.activada_at) {
    if (user && user.id === solicitud.user_id) redirect('/mi-cuenta')
    // No se dice de quién es la cuenta.
    return (
      <Aviso encabezado="Este link ya fue usado">
        <p>Con este link ya se creó una cuenta. Si fuiste tú, entra con tu correo y contraseña.</p>
        <Link href="/entrar" className={btnPrimario}>Entrar a mi cuenta</Link>
        <p className="text-sm">
          ¿No fuiste tú?{' '}
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className={enlace}>Escríbenos</a>.
        </p>
      </Aviso>
    )
  }

  const pais = nombrePaisPortal(solicitud.pais)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="inline-flex items-center rounded-full bg-[#C8FF00] px-3 py-1 text-xs font-bold text-[#0d2b0d]">Pago confirmado</p>
        <h1 className={`${titulo} text-xl sm:text-2xl`}>Crea tu cuenta</h1>
        <p className="text-base text-[#0d2b0d]/80">
          Desde tu cuenta vas a llenar tu solicitud de visa de <strong className="text-[#0d2b0d]">{pais}</strong>, subir tus documentos y ver en qué va tu trámite.
        </p>
      </div>

      {searchParams.error === 'confirmar' && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          El enlace de confirmación ya venció o ya se usó. Si ya confirmaste tu correo, elige &quot;Ya tengo cuenta&quot; y entra.
        </p>
      )}

      <div className={`${tarjeta} p-5`}>
        {user ? (
          <div className="space-y-4">
            <p className="text-base text-[#0d2b0d]/80">
              Ya entraste como <strong className="text-[#0d2b0d] break-all">{user.email}</strong>. ¿Quieres guardar esta solicitud en esa cuenta?
            </p>
            <form action={activarConSesion.bind(null, params.token)}>
              <button type="submit" className={btnPrimario}>Sí, usar esta cuenta</button>
            </form>
            <form action={usarOtraCuenta.bind(null, params.token)}>
              <button type="submit" className={btnSecundario}>Usar otra cuenta</button>
            </form>
          </div>
        ) : (
          <FormularioActivar token={params.token} emailPago={solicitud.email_pago} google={GOOGLE_ACTIVO} />
        )}
      </div>
    </div>
  )
}
