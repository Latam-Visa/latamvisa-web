import { createHash, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BUCKET } from '@/lib/finanzas/datos'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Limpieza diaria (Vercel Cron, ver vercel.json): borra de Storage los
// archivos de Finanzas vencidos (7 días) y vacía lo extraído. Único uso de la
// service role en Finanzas: no lee ni devuelve datos, solo cuenta.
function autorizado(req: Request): boolean {
  const secreto = process.env.CRON_SECRET
  const enviado = req.headers.get('authorization') ?? ''
  if (!secreto) return false
  const a = createHash('sha256').update(enviado).digest()
  const b = createHash('sha256').update(`Bearer ${secreto}`).digest()
  return timingSafeEqual(a, b)
}

export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: vencidas, error } = await supabaseAdmin
    .from('fin_uploads')
    .select('id, storage_path, status')
    .is('file_deleted_at', null)
    .lt('delete_after', new Date().toISOString())
    .limit(500)
  if (error) {
    console.error('[FINANZAS] limpieza: no se pudo leer', { code: error.code })
    return NextResponse.json({ error: 'No se pudo leer' }, { status: 500 })
  }

  let borrados = 0
  for (let i = 0; i < (vencidas || []).length; i += 100) {
    const lote = vencidas!.slice(i, i + 100)
    const { error: e2 } = await supabaseAdmin.storage.from(BUCKET).remove(lote.map((f) => f.storage_path))
    if (e2) {
      console.error('[FINANZAS] limpieza: no se pudo borrar un lote', { tamaño: lote.length })
      continue
    }
    const ahora = new Date().toISOString()
    for (const f of lote) {
      const pendiente = ['subido', 'extraido', 'manual'].includes(f.status)
      await supabaseAdmin
        .from('fin_uploads')
        .update({ file_deleted_at: ahora, extracted: null, ...(pendiente ? { status: 'descartado' } : {}) })
        .eq('id', f.id)
      borrados++
    }
  }
  return NextResponse.json({ revisados: vencidas?.length ?? 0, borrados })
}
