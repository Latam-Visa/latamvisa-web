import { NextResponse } from 'next/server';
import { getServiceSupabase, supabase as anonSupabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Regex para eliminar cualquier mención de precios
// Busca $1200, $ 1.200, USD1200, USD 1,200, 1200 USD, etc.
const priceRegex = /(\$\s*[\d,.]+)|(USD\s*[\d,.]+)|([\d,.]+\s*USD)/gi;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Obtener cliente de Supabase (preferible service role si existe, sino anon)
    const supabaseClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? getServiceSupabase() : anonSupabase;

    // 1. Guardar el Lead Inicial
    const { data: leadData, error: leadError } = await supabaseClient
      .from('flight_strategy_leads')
      .insert([
        {
          nombre: body.nombre,
          email: body.email,
          whatsapp: body.whatsapp,
          edad: parseInt(body.edad) || null,
          nacionalidad: body.nacionalidad,
          otra_ciudadania: body.otra_ciudadania,
          pais_residencia: body.pais_residencia,
          ciudad_origen: body.ciudad_origen,
          visas_vigentes: body.visas_vigentes || [],
          destino: body.destino,
          proposito: body.proposito,
          mes_viaje: body.mes,
          duracion: body.duracion,
          prioridades: body.prioridades,
          presupuesto: body.presupuesto,
          step_completed: 5, // Completó todo el form
        }
      ])
      .select('id')
      .single();

    if (leadError) {
      console.error('Error insertando lead:', leadError);
      // No bloqueamos el proceso si falla supabase, pero lo logueamos
    }

    const leadId = leadData?.id;

    // 2. Preparar Prompt para Claude
    const systemPrompt = `You are a senior flight route strategist for LATAM VISA, a premium travel and education consultancy in Brisbane, Australia. You serve Latin Americans planning travel to Australia, USA, Canada, UK, New Zealand, and Japan.

Your job is to analyze a client's profile and produce three ranked route strategies based on their nationality, current residence, valid visas, destination, and priorities.

CRITICAL RULES:
1. NEVER invent specific prices. You have no live flight inventory. You may reference general price-tier reasoning ("rutas vía Asia tienden a ser más económicas") but never specific dollar amounts.
2. NEVER recommend hidden city ticketing, throwaway tickets, or geo-pricing manipulation via VPN. These violate airline terms.
3. NEVER provide legal migration advice. If the client's situation requires legal counsel, recommend a Registered Migration Agent (OMARA).
4. ALWAYS reason from the client's actual visa portfolio. A client with a US B1/B2 visa can route through US hubs. A client residing in Chile can leverage Santiago as a departure hub. A client with EU passport has access to European hubs. Reason explicitly from what they have.
5. ALWAYS write in neutral Colombian Spanish. No voseo. Direct, warm, professional. Use "tú" not "vos".
6. ALWAYS verify what extra documents each route requires (US transit visa for some nationalities, Canadian eTA, etc.) and surface this clearly.

OUTPUT FORMAT: Return ONLY valid JSON matching this schema, no markdown fences, no preamble:
{"strategies":[{"rank":1,"name":"string","why_it_fits":"string","suggested_hubs":["string"],"suggested_airlines":["string"],"best_booking_window":"string","extra_documents_needed":["string"],"risks_or_considerations":"string","where_to_search":["string"]},{...},{...}],"summary_insight":"string","disclaimer":"string"}

The "summary_insight" field should be one powerful sentence that captures the most important strategic insight for this specific client. The "disclaimer" field should always include the LATAM VISA legal disclaimer about not being a registered migration agency.`;

    const userMessage = `Por favor analiza este perfil de cliente:
- Nombre: ${body.nombre}
- Edad: ${body.edad}
- Nacionalidad: ${body.nacionalidad}
- Otra ciudadanía/pasaporte: ${body.otra_ciudadania || 'Ninguna'}
- País de residencia: ${body.pais_residencia}
- Ciudad de origen (aeropuerto más cercano): ${body.ciudad_origen}
- Visas vigentes: ${body.visas_vigentes ? body.visas_vigentes.join(', ') : 'Ninguna'}
- Destino: ${body.destino}
- Propósito del viaje: ${body.proposito}
- Mes estimado de viaje: ${body.mes}
- Duración del viaje: ${body.duracion}
- Prioridades (precio, tiempo, comodidad): ${body.prioridades}
- Presupuesto aproximado: ${body.presupuesto}`;

    // 3. Llamar a Claude
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      temperature: 0.2, // Baja temperatura para JSON predecible
      system: systemPrompt,
      messages: [
        { role: "user", content: userMessage }
      ]
    });

    let textResponse = '';
    if (response.content[0].type === 'text') {
        textResponse = response.content[0].text;
    }

    // 4. Filtro Anti-Precio
    let sanitizedResponse = textResponse.replace(priceRegex, '[Precio Omitido - Consultar en tiempo real]');

    // Intentar parsear el JSON
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(sanitizedResponse);
    } catch (e) {
      console.error('Failed to parse Claude JSON response:', e, sanitizedResponse);
      return NextResponse.json({ error: 'Error procesando la estrategia. Intenta de nuevo.' }, { status: 500 });
    }

    // 5. Guardar Respuesta en Supabase
    if (leadId) {
      await supabaseClient
        .from('flight_strategy_responses')
        .insert([
          {
            lead_id: leadId,
            ai_response: jsonResponse,
          }
        ]);
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
