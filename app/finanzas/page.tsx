import { redirect } from 'next/navigation'
import { estadoActual } from '@/lib/finanzas/datos'
import { Entrar } from './_components/Entrar'
import { titulo } from './_components/ui'

export const dynamic = 'force-dynamic'

export default async function FinanzasInicio({ searchParams }: { searchParams: { error?: string; borrado?: string } }) {
  const { user, perfil } = await estadoActual()
  if (user && !searchParams.borrado) redirect(perfil?.onboarding_done ? '/finanzas/plan' : '/finanzas/empezar')

  return (
    <div className="space-y-8">
      {searchParams.borrado && (
        <p role="status" className="rounded-xl bg-white border border-[#0d2b0d]/10 p-4 text-sm text-[#2F4A00] font-semibold">
          Listo: borramos todos tus datos y archivos.
        </p>
      )}
      <section className="space-y-3">
        <h1 className={`${titulo} text-2xl sm:text-3xl leading-tight`}>Tu plata, semana a semana</h1>
        <p className="text-base text-[#0d2b0d]/80">
          Cuéntanos cuánto te entra y qué tienes que pagar, o sube pantallazos de tu banco. Te armamos un calendario
          semana a semana, el orden para salir de deudas y avisos antes de que un pago te deje corto.
        </p>
        <ul className="text-sm text-[#0d2b0d]/80 space-y-1">
          <li>• Solo tú ves tus datos.</li>
          <li>• Los archivos se borran después del análisis.</li>
          <li>• Puedes borrar todo cuando quieras.</li>
        </ul>
      </section>
      {searchParams.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {searchParams.error === 'vencido'
            ? 'Ese enlace ya venció o ya se usó. Pide uno nuevo aquí abajo.'
            : 'Algo falló al entrar. Intenta otra vez.'}
        </p>
      )}
      {!user && <Entrar />}
    </div>
  )
}
