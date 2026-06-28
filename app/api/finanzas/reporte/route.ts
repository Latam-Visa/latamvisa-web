import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { computeReport } from '@/lib/finanzas';
import { generateNarrativeWithClaude } from '@/lib/finanzas/ai';
import { FinanzasTransaccion, FinanzasPerfil } from '@/lib/finanzas/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mes = url.searchParams.get('mes');

    if (!mes) {
      return NextResponse.json({ error: 'Falta parámetro mes (YYYY-MM)' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: perfilData, error: perfilError } = await supabase.from('finanzas_perfil').select('*').eq('id', 1).single();
    if (perfilError || !perfilData) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 500 });
    }
    const perfil = perfilData as FinanzasPerfil;

    const { data: txData, error: txError } = await supabase.from('finanzas_transacciones').select('*').eq('mes_origen', mes);
    if (txError) {
      return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 });
    }
    const transacciones = (txData || []) as FinanzasTransaccion[];

    const reportBase = computeReport(mes, transacciones, perfil);

    const narrativa = await generateNarrativeWithClaude(reportBase);

    const reportFinal = {
      ...reportBase,
      narrativa
    };

    const { error: upsertError } = await supabase.from('finanzas_reportes').upsert(reportFinal, { onConflict: 'mes' });
    if (upsertError) {
      console.error('Upsert Report Error:', upsertError);
      return NextResponse.json({ error: 'Error al guardar reporte' }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: reportFinal });

  } catch (err: any) {
    console.error('Report Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
