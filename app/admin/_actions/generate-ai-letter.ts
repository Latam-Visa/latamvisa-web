"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

export async function generateAiLetter(applicationId: string) {
  try {
    const { data: app, error } = await supabaseAdmin
      .from('visa_applications_canada')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (error || !app) throw new Error('Aplicación no encontrada')

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Falta la variable ANTHROPIC_API_KEY en el servidor')
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const prompt = `Escribe una carta de propósito (Cover Letter) formal en INGLÉS para la solicitud de visa canadiense (Temporary Resident Visa).
    
Detalles del aplicante:
Nombre: ${app.given_name} ${app.surname}
Pasaporte: ${app.passport_number}
Fecha de nacimiento: ${app.date_of_birth}
Nacionalidad: ${app.passport_nationality}
País de residencia: ${app.residential_country}

Motivo de viaje: ${app.visa_reason}
Actividades planeadas: ${app.activities_in_canada}
Fechas de viaje: Desde ${app.entry_date} hasta ${app.leave_date}

Historial laboral: ${JSON.stringify(app.work_history)}
Historial de viajes: ${JSON.stringify(app.travel_history)}

Escribe una carta estructurada, formal y persuasiva dirigida a "Immigration, Refugees and Citizenship Canada (IRCC)".
Debe incluir:
1. Introducción clara del propósito de viaje.
2. Lazos fuertes con el país de origen (por ejemplo, empleo actual, familia) para demostrar arraigo.
3. Historial de viajes si aplica, demostrando el cumplimiento de leyes migratorias anteriores.
4. Conclusión respetuosa.

La carta debe estar completamente en inglés. Devuelve SOLO el cuerpo y el texto de la carta (sin introducciones tuyas tipo "Aquí tienes la carta", ni explicaciones).`

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const letter = (msg.content[0] as any).text

    await supabaseAdmin
      .from('visa_applications_canada')
      .update({
        ai_intention_letter: letter,
        ai_letter_generated_at: new Date().toISOString(),
        ai_letter_status: 'generated'
      })
      .eq('id', applicationId)

    return { success: true, letter }

  } catch (error: any) {
    console.error('Error generating AI letter:', error)
    return { success: false, error: error.message }
  }
}
