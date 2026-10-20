import { NextResponse } from 'next/server'
import { activarSolicitud } from '@/lib/portal/solicitudes'
import { usuarioActual } from '@/lib/portal/supabase'

export const dynamic = 'force-dynamic'
// force-dynamic no apaga el Data Cache de Next para los fetch de supabase-js
// (ver admin/solicitudes): sin esto, una fila leída antes de activarse se
// sigue sirviendo vieja.
export const fetchCache = 'force-no-store'

/* Activación después de confirmar el correo o de volver de Google. La sesión
   la valida el servidor (getUser) y la escritura de user_id va con la service
   key; el navegador solo llega aquí con su cookie. */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const url = new URL(req.url)
  const ir = (ruta: string) => NextResponse.redirect(new URL(ruta, url.origin))

  const { user } = await usuarioActual()
  if (!user) return ir(`/activar/${params.token}`)

  const resultado = await activarSolicitud(params.token, user.id)
  if (resultado === 'activada' || resultado === 'ya_tuya') return ir('/mi-cuenta')
  return ir(`/activar/${params.token}`)
}
