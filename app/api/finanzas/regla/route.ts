import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patron, categoria, tipo, grupo, es_recurrente } = body;

    if (!patron || !categoria || !tipo || !grupo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    // Auto assign priority: check current max priority and append
    const { data: maxPriData } = await supabase.from('finanzas_reglas').select('prioridad').order('prioridad', { ascending: false }).limit(1);
    const prioridad = (maxPriData && maxPriData.length > 0) ? maxPriData[0].prioridad + 10 : 10;

    const { data, error } = await supabase.from('finanzas_reglas').insert([{
      patron,
      categoria,
      tipo,
      grupo,
      es_recurrente: es_recurrente || false,
      prioridad
    }]).select().single();

    if (error) {
      console.error('Insert Rule Error:', error);
      return NextResponse.json({ error: 'Error al crear regla' }, { status: 500 });
    }

    return NextResponse.json({ success: true, regla: data });
  } catch (err: any) {
    console.error('Regla POST Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
