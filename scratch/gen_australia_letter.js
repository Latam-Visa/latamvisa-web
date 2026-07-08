const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/aplicar/turismo-australia/_actions/generate-intention-letter.ts');

const content = `"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'
import { AI_MODELS } from '@/lib/constants'

export async function generateIntentionLetterBg(applicationId: string) {
  try {
    const { data: app, error } = await supabaseAdmin
      .from('aplicaciones_turismo_australia')
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

    const prompt = \`You are a professional immigration consultant writing a Letter of Intent for an Australian Visitor Visa (Subclass 600 - Tourist stream) application. Write a formal, persuasive, ONE-PAGE letter in ENGLISH addressed to "Visa Officer, Department of Home Affairs, Australia".

The letter must:
- Open with the applicant's full name, nationality, and current country of residence.
- State the purpose of the trip clearly, mentioning specific reasons or dates.
- Specify exact entry and exit dates and total trip duration (length of stay).
- Demonstrate strong ties to the country of residence (employment, family, property) — these are the reasons the applicant WILL return.
- Confirm financial capacity to cover the trip, and who is funding it.
- Mention any travelling companions and if they will visit contacts in Australia.
- Close with a respectful request for visa approval and contact information (email).

Tone: formal, confident, concise, professional. Do NOT invent facts; use ONLY the data provided. If a field is missing, omit that section gracefully. Output ONLY the letter body, no preamble or explanation.

Applicant data:
- Full name: \${app.family_name || ''}, \${app.given_names || ''}
- Date of birth: \${app.date_of_birth || ''}
- Nationality: \${app.nationality_passport_holder || ''}
- Passport number: \${app.passport_number || ''}
- Current residence: \${app.usual_country_of_residence || ''}, \${app.res_suburb || ''}, \${app.res_address || ''}
- Email: \${app.email || ''}
- Visa stream: \${app.visa_stream || 'Tourist'}
- Reasons for visit: \${Array.isArray(app.reasons_for_visit) ? app.reasons_for_visit.join(', ') : ''}
- Significant dates / details: \${app.significant_dates_details || ''}
- Intended length of stay: \${app.length_of_stay || ''}
- Entry date: \${app.planned_arrival_date || ''}
- Exit date: \${app.planned_departure_date || ''}
- Employment status: \${app.employment_status || ''} (\${app.occupation || ''} at \${app.employer_name || ''})
- Funding: \${app.funding_type || ''} - \${app.funds_available_details || ''}
- Travelling with others: \${app.travelling_with_others ? 'Yes' : 'No'}
- Will visit contacts in Australia: \${app.will_visit_contacts ? 'Yes' : 'No'}
- Travel history (holds other visa): \${app.holds_other_visa ? 'Yes' : 'No'} (\${app.visa_history_details || ''})
\`

    const msg = await anthropic.messages.create({
      model: AI_MODELS.generation,
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
      .from('aplicaciones_turismo_australia')
      .update({
        ai_intention_letter: letter,
        ai_letter_status: 'completed'
      })
      .eq('id', applicationId)

    return { success: true, letter }

  } catch (error: any) {
    console.error('Error generating AI letter in background:', error)
    await supabaseAdmin
      .from('aplicaciones_turismo_australia')
      .update({
        ai_letter_status: 'failed'
      })
      .eq('id', applicationId)
      
    return { success: false, error: error.message }
  }
}
`;

fs.writeFileSync(filePath, content);
console.log('generate-intention-letter.ts updated');
