import { redirect } from 'next/navigation'
import { usuarioActual } from '@/lib/portal/supabase'
import { estadoEnPalabras, fechaCompra, nombrePaisPortal } from '@/lib/portal/textos'
import { salir } from '../acciones'
import { WHATSAPP, enlace, tarjeta, titulo } from '../_componentes/ui'

export const dynamic = 'force-dynamic'
// force-dynamic no apaga el Data Cache de Next para los fetch de supabase-js
// (ver admin/solicitudes): sin esto, una fila leída antes de activarse se
// sigue sirviendo vieja.
export const fetchCache = 'force-no-store'

interface Solicitud {
  id: string
  pais: string
  servicio: string | null
  estado: string
  created_at: string
  nombre_cliente: string | null
}

export default async function MiCuentaPage() {
  // El middleware ya exige sesión; esto la vuelve a validar en el servidor.
  const { supabase, user } = await usuarioActual()
  if (!user) redirect('/entrar')

  // Con la sesión del cliente (no la service key): RLS solo devuelve sus filas.
  const { data, error } = await supabase
    .from('solicitudes')
    .select('id, pais, servicio, estado, created_at, nombre_cliente')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) console.error('[PORTAL] mi-cuenta no pudo leer solicitudes', { code: error.code })
  const solicitudes = (data ?? []) as Solicitud[]

  const nombre = (user.user_metadata?.full_name as string | undefined) || solicitudes[0]?.nombre_cliente || null
  const primerNombre = nombre?.trim().split(/\s+/)[0]

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className={`${titulo} text-xl sm:text-2xl`}>{primerNombre ? `Hola, ${primerNombre}` : 'Hola'}</h1>
          <p className="text-sm text-[#0d2b0d]/70 break-all">{user.email}</p>
        </div>
        <form action={salir} className="shrink-0">
          <button type="submit" className={`min-h-[44px] px-2 text-sm ${enlace}`}>Salir</button>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#0d2b0d]">{solicitudes.length === 1 ? 'Tu solicitud' : 'Tus solicitudes'}</h2>

        {error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No pudimos cargar tus solicitudes. Recarga la página en un momento.
          </p>
        ) : solicitudes.length === 0 ? (
          <div className={`${tarjeta} p-5 text-base text-[#0d2b0d]/80`}>
            Todavía no hay solicitudes en esta cuenta. Si ya pagaste, usa el link del correo &quot;Recibimos tu pago&quot; para conectarla, o{' '}
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className={enlace}>escríbenos</a>.
          </div>
        ) : (
          <ul className="space-y-3">
            {solicitudes.map((s) => (
              <li key={s.id} className={`${tarjeta} p-5 space-y-3`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-lg font-bold text-[#0d2b0d]">Visa de {nombrePaisPortal(s.pais)}</p>
                  <p className="text-sm text-[#0d2b0d]/60">Compra del {fechaCompra(s.created_at)}</p>
                </div>
                {s.servicio && <p className="text-sm text-[#0d2b0d]/70 break-words">{s.servicio}</p>}
                <p className="inline-flex rounded-full bg-[#C8FF00] px-3 py-1 text-sm font-bold text-[#0d2b0d]">{estadoEnPalabras(s.estado)}</p>
                <p className="text-sm text-[#0d2b0d]/70">Tu formulario estará disponible muy pronto.</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
