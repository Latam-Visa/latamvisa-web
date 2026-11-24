import { supabaseAdmin } from '@/lib/supabase/admin'
import { RegistroClient, type Registro } from './_components/RegistroClient'

export const dynamic = 'force-dynamic'

export default async function RegistroPage() {
  const { data, error } = await supabaseAdmin
    .from('registro_trabajo')
    .select('id, fecha, categoria, descripcion, minutos, evidencia_url')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1000)

  return <RegistroClient registros={(data as Registro[] | null) ?? []} tablaFalta={Boolean(error)} />
}
