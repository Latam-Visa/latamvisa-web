import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Enforce id=1
    const perfil = {
      id: 1,
      ...body,
      onboarding_completo: true
    };

    const supabase = getServiceSupabase();
    const { data, error } = await supabase.from('finanzas_perfil').upsert(perfil).select().single();

    if (error) {
      console.error('Perfil Upsert Error:', error);
      return NextResponse.json({ error: 'Error al guardar perfil' }, { status: 500 });
    }

    return NextResponse.json({ success: true, perfil: data });
  } catch (err: any) {
    console.error('Perfil API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
