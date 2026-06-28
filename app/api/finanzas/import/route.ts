import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import crypto from 'crypto';
import { getServiceSupabase } from '@/lib/supabase';
import { classifyDeterministically } from '@/lib/finanzas';
import { classifyWithClaude } from '@/lib/finanzas/ai';
import { FinanzasTransaccion, FinanzasRegla } from '@/lib/finanzas/types';

export const maxDuration = 60; // Max allowed for hobby/pro vercel, might need for Claude.

function sha256(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileContent = await file.text();
    let records = parse(fileContent, {
      skip_empty_lines: true,
      relax_column_count: true,
    });

    // Handle header row: CommBank might have Date,Amount,Description,Balance
    if (records.length > 0 && String(records[0][0]).toLowerCase().includes('date')) {
      records.shift(); // Remove header
    }

    // Load existing hashes to skip dedupe
    // Instead of loading all, we can do it later, but loading all for a single user is fine for a few thousands.
    const { data: existingRecords } = await supabase.from('finanzas_transacciones').select('hash_dedupe');
    const existingHashes = new Set(existingRecords?.map((r) => r.hash_dedupe) || []);

    const { data: reglasData } = await supabase.from('finanzas_reglas').select('*').order('prioridad', { ascending: true });
    const reglas = (reglasData || []) as FinanzasRegla[];

    const newTransactions: any[] = [];
    const aiBatch: { indice: number; descripcion: string }[] = [];
    
    let insertadas = 0;
    let duplicadas_saltadas = 0;
    let clasificadas_por_regla = 0;
    let clasificadas_por_ia = 0;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      if (row.length < 3) continue;

      const fechaRaw = row[0]; // DD/MM/YYYY
      const montoRaw = row[1];
      const descripcion = row[2] || '';
      const balanceRaw = row[3] || '';

      const hash_dedupe = sha256(`${fechaRaw}|${montoRaw}|${descripcion}|${balanceRaw}`);

      if (existingHashes.has(hash_dedupe)) {
        duplicadas_saltadas++;
        continue;
      }

      // Format fecha to YYYY-MM-DD
      const [dd, mm, yyyy] = fechaRaw.split('/');
      const fechaObj = new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`); // Avoid timezone issues
      const mes_origen = `${yyyy}-${mm}`;
      const fechaIso = fechaObj.toISOString().split('T')[0];

      const monto = parseFloat(montoRaw);
      const balance = balanceRaw ? parseFloat(balanceRaw) : null;

      const tx: any = {
        hash_dedupe,
        mes_origen,
        fecha: fechaIso,
        descripcion,
        monto,
        balance,
        es_recurrente: false,
      };

      // Deterministic rule check
      const classified = classifyDeterministically(descripcion, reglas);
      if (classified) {
        tx.categoria = classified.categoria;
        tx.tipo = classified.tipo;
        tx.grupo = classified.grupo;
        tx.es_recurrente = classified.es_recurrente;
        tx.clasificado_por = 'regla';
        clasificadas_por_regla++;
      } else {
        tx.clasificado_por = 'ia';
        tx.categoria = 'Sin clasificar';
        // By default based on sign
        tx.tipo = monto < 0 ? 'gasto' : 'ingreso';
        tx.grupo = 'na';
        aiBatch.push({ indice: newTransactions.length, descripcion });
      }

      newTransactions.push(tx);
    }

    // AI Pass
    if (aiBatch.length > 0) {
      // Chunking if necessary, but Claude can handle a decent amount
      const chunkSize = 50;
      for (let i = 0; i < aiBatch.length; i += chunkSize) {
        const chunk = aiBatch.slice(i, i + chunkSize);
        const aiResults = await classifyWithClaude(chunk);
        
        for (const res of aiResults) {
          const idx = res.indice;
          if (newTransactions[idx]) {
            newTransactions[idx].categoria = res.categoria || 'Sin clasificar';
            newTransactions[idx].grupo = res.grupo || 'na';
            // Determine tipo strictly by sign if AI is confused, or respect AI if it aligns
            const isDebit = newTransactions[idx].monto < 0;
            let assignedTipo = res.tipo;
            if (isDebit && assignedTipo === 'ingreso') assignedTipo = 'gasto';
            if (!isDebit && assignedTipo === 'gasto') assignedTipo = 'ingreso';
            
            // Validate allowed tipo
            if (!['ingreso', 'gasto', 'transferencia_interna', 'reembolso'].includes(assignedTipo)) {
              assignedTipo = isDebit ? 'gasto' : 'ingreso';
            }
            
            newTransactions[idx].tipo = assignedTipo;
            clasificadas_por_ia++;
          }
        }
      }
    }

    if (newTransactions.length > 0) {
      const { error: insertError } = await supabase.from('finanzas_transacciones').insert(newTransactions);
      if (insertError) {
        console.error('Insert Error:', insertError);
        return NextResponse.json({ error: 'Failed to insert transactions' }, { status: 500 });
      }
      insertadas = newTransactions.length;
    }

    return NextResponse.json({
      success: true,
      summary: {
        insertadas,
        duplicadas_saltadas,
        clasificadas_por_regla,
        clasificadas_por_ia
      }
    });

  } catch (err: any) {
    console.error('Import Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
