import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de tu Fee Administrativo
const ADMIN_FEE_FIXED = 120; // $120 USD de gestión
const ADMIN_FEE_PERCENTAGE = 1.05; // 5% de markup sobre la tarifa base

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, email, whatsapp, origen, destino, nacionalidad, visas_vigentes } = body;

    // 1. Simulación de cotización 
    // Generamos un precio base simulado entre $1200 y $1800 para probar el flujo
    const basePrice = Math.floor(Math.random() * (1800 - 1200 + 1)) + 1200; 
    const finalPrice = Math.round((basePrice * ADMIN_FEE_PERCENTAGE) + ADMIN_FEE_FIXED);
    
    // Simulación de lógica de ruta 
    const tieneVisaUSA = visas_vigentes?.includes('USA (B1/B2, F1, J1, etc.)') || visas_vigentes?.includes('USA (Tránsito C1)');
    const rutaSugerida = tieneVisaUSA ? "Ruta Rápida Norteamericana (vía USA)" : "Ruta Sur Transpacífica (vía LATAM/NZ)";

    // 2. Guardar en Supabase
    // Configuramos la expiración a 2 horas desde el momento actual
    const expiraEn = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const { data: quoteData, error: dbError } = await supabase
      .from('cotizaciones_vuelos')
      .insert([
        {
          cliente_nombre: nombre,
          cliente_email: email,
          cliente_whatsapp: whatsapp,
          origen,
          destino,
          nacionalidad,
          visas_vigentes,
          ruta_estrategica: rutaSugerida,
          precio_cotizado: finalPrice,
          estado: 'pendiente_pago',
          expira_en: expiraEn
        }
      ])
      .select('id')
      .single();

    if (dbError) {
      console.error("Error en DB:", dbError);
      throw new Error("No se pudo guardar la cotización");
    }

    // 3. Disparar Webhook de n8n 
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://tu-railway-app.up.railway.app/webhook/cotizacion-vuelos';
    
    // Disparamos el webhook sin esperar (fire and forget)
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId: quoteData.id,
        nombre,
        email,
        origen,
        destino,
        rutaSugerida,
        precioFinal: finalPrice,
        expiraEn
      })
    }).catch(err => console.error("Error disparando webhook de n8n:", err));

    // 4. Retornar éxito al Frontend
    return NextResponse.json({
      success: true,
      quoteId: quoteData.id,
      displayedPrice: finalPrice,
      rutaSugerida
    });

  } catch (error: any) {
    console.error("Error en el endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Error procesando tu perfil estratégico." },
      { status: 500 }
    );
  }
}
