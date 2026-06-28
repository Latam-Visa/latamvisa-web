import Anthropic from '@anthropic-ai/sdk';
import { FinanzasTransaccion } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function classifyWithClaude(
  batch: { indice: number; descripcion: string }[]
): Promise<Array<{ indice: number; categoria: string; tipo: string; grupo: string }>> {
  if (batch.length === 0) return [];

  const prompt = `You are a financial transaction classifier for a solo founder (LATAM VISA).
You must return STRICT JSON containing an array of objects. Do NOT wrap it in markdown block quotes. Return only the array.

Inputs to classify:
${JSON.stringify(batch)}

For each input, return an object with:
- "indice": same as the input
- "categoria": A concise category name in Spanish (e.g., "Uber", "Comida", "Software", "Ingreso cliente LATAM VISA")
- "tipo": exactly one of "ingreso", "gasto", "transferencia_interna", "reembolso"
- "grupo": exactly one of "negocio", "personal", "na" (use "na" for transferencias internas or reembolsos if ambiguous, but try to assign "negocio" or "personal" if clear).

DO NOT INCLUDE ANY OTHER TEXT OR EXPLANATION IN YOUR RESPONSE. ONLY THE JSON ARRAY.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    // Strip markdown if accidentally included
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Claude API Error:', error);
    return [];
  }
}

export async function generateNarrativeWithClaude(
  stats: any
): Promise<string> {
  const prompt = `Eres el asesor financiero personal del fundador de LATAM VISA.
Analiza estos números mensuales agregados y devuelve un párrafo de 3 a 4 oraciones como máximo.
Escribe en español colombiano casual, cálido y directo (usa tú, nunca vos). Sin promesas falsas, muy neutral.

Números:
${JSON.stringify(stats, null, 2)}

Recuerda:
- Hablas de frente, al grano.
- "Este mes entró X, tu piso de supervivencia era Y, te sobró Z, deberías haber mandado W a ahorro".
- No uses markdown, no uses bullet points, devuelve texto plano puro.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return content.trim();
  } catch (error) {
    console.error('Claude API Error (Narrative):', error);
    return '';
  }
}
