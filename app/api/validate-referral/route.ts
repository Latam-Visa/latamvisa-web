import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('referral_codes')
      .select('code, influencer_name, discount_pct')
      .eq('code', code.trim().toLowerCase())
      .eq('active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      code: data.code,
      influencer: data.influencer_name,
      discount_pct: data.discount_pct,
    });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
