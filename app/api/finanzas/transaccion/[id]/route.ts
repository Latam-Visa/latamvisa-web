import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    const updateData: any = {};
    if (body.categoria) updateData.categoria = body.categoria;
    if (body.tipo) updateData.tipo = body.tipo;
    if (body.grupo) updateData.grupo = body.grupo;
    if (body.es_recurrente !== undefined) updateData.es_recurrente = body.es_recurrente;
    
    updateData.clasificado_por = 'manual';

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('finanzas_transacciones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update Transaction Error:', error);
      return NextResponse.json({ error: 'Error al actualizar transacción' }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (err: any) {
    console.error('Transaction PATCH Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
