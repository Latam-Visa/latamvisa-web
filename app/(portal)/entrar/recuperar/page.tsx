import Link from 'next/link'
import { FormularioRecuperar } from '../../_componentes/formularios'
import { avisoError, enlace, tarjeta, titulo } from '../../_componentes/ui'

export default function RecuperarPage({ searchParams }: { searchParams: { vencido?: string } }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className={`${titulo} text-xl sm:text-2xl`}>Olvidé mi contraseña</h1>
        <p className="text-base text-[#0d2b0d]/80">Escribe el correo de tu cuenta y te mandamos un enlace para elegir una nueva.</p>
      </div>
      {searchParams.vencido && <p role="alert" className={avisoError}>Ese enlace ya venció o ya se usó. Pide uno nuevo aquí.</p>}
      <div className={`${tarjeta} p-5`}>
        <FormularioRecuperar />
      </div>
      <p className="text-center text-sm">
        <Link href="/entrar" className={enlace}>Volver a entrar</Link>
      </p>
    </div>
  )
}
