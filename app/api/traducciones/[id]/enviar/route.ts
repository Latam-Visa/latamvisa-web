import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { enviarPendientes } from '@/lib/traducciones/enviar-pendientes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/* POST /api/traducciones/[id]/enviar — "Ya terminé" y "Enviar a traducir" del
   aviso ámbar. Manda a n8n lo cargado y sin enviar del lote. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  // También lo exige middleware.ts; esto es por si el matcher cambia.
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim()
  if (!envPassword || cookies().get('admin_auth')?.value !== envPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!UUID.test(params.id)) return NextResponse.json({ error: 'Traducción inválida.' }, { status: 400 })

  const resultado = await enviarPendientes(params.id)
  if (!resultado.ok) return NextResponse.json({ error: resultado.error, enviados: 0 }, { status: 502 })

  revalidatePath(`/admin/traducciones/${params.id}`)
  revalidatePath('/admin/traducciones')
  return NextResponse.json({ enviados: resultado.enviados })
}
