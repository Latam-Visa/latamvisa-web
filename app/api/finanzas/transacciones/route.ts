import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mes = url.searchParams.get('mes');

    if (!mes) {
      return NextResponse.json({ error: 'Falta parámetro mes (YYYY-MM)' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('finanzas_transacciones')
      .select('*')
      .eq('mes_origen', mes)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Fetch Transactions Error:', error);
      return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 });
    }

    return NextResponse.json({ success: true, transacciones: data });
  } catch (err: any) {
    console.error('Transactions API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
