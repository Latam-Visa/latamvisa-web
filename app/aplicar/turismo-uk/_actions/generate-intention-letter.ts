"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

export async function generateIntentionLetterBg(applicationId: string) {
  try {
    const { data: app, error } = await supabaseAdmin
      .from('visa_applications_uk')
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

    const hasPartner = ['Married', 'Common Law', 'Casado(a)', 'Unión libre'].includes(app.marital_status)
    let spouseInfo = ""
    if (hasPartner && (app.spouse_first_name || app.spouse_last_name)) {
      spouseInfo = `, spouse: ${app.spouse_first_name || ''} ${app.spouse_last_name || ''}, accompanying: ${app.spouse_traveling === 'Yes' ? 'Yes' : 'No'}`
    }

    let travelHistorySummary = "None"
    if (app.travel_history && Array.isArray(app.travel_history) && app.travel_history.length > 0) {
      travelHistorySummary = app.travel_history.map((t: any) => `${t.country} (${t.date}, purpose: ${t.purpose})`).join(", ")
    }

    const hasChildren = app.has_children === true || app.has_children === 'true'
    const childrenCount = Array.isArray(app.children) ? app.children.length : "none"

    const prompt = `You are a professional immigration consultant writing a Letter of Intent for a UK Standard Visitor Visa application. Write a formal, persuasive, ONE-PAGE letter in ENGLISH addressed to "Entry Clearance Officer, UK Visas and Immigration (UKVI)".

The letter must:
- Open with the applicant's full name, nationality, and current country of residence.
- State the purpose of the trip clearly, with specific entry and exit dates.
- Demonstrate strong ties to the country of residence (employment, family, property, studies) — these are the reasons the applicant WILL return.
- Confirm financial capacity to cover the trip (the amount in GBP).
- Mention prior travel history if relevant (shows the applicant respects visa conditions).
- If the applicant holds a valid US, Schengen, Canada, Aus or NZ visa, mention it explicitly — this strengthens credibility.
- Close with a respectful request for visa approval and contact information (email).

Tone: formal, confident, concise, professional. Do NOT invent facts; use ONLY the data provided. If a field is missing, omit that section gracefully. Output ONLY the letter body, no preamble or explanation.

Applicant data:
- Full name: ${app.first_name || ''} ${app.last_name || ''}
- Date of birth: ${app.date_of_birth || ''}
- Nationality: ${app.current_nationality || ''}
- Passport number: ${app.passport_number || ''}
- Current residence: ${app.residential_country || ''}, ${app.residential_city || ''}, ${app.residential_address_line1 || ''}
- Email: ${app.email || ''}
- Trip purpose: ${app.purpose_of_visit || ''}
- Entry date: ${app.proposed_entry_date || ''}
- Exit date: ${app.proposed_exit_date || ''}
- Funds available (GBP): ${app.available_funds_gbp || ''}
- Current employment: ${app.occupation_status || ''}, ${app.job_title || ''} at ${app.employer_name || ''}. Income: ${app.monthly_income || ''} ${app.monthly_income_currency || ''}
- Financed by other: ${app.trip_financed_by_other === true ? `Yes, details: ${app.trip_financer_details}` : "No"}
- Marital status: ${app.marital_status || ''}${spouseInfo}
- Children: ${hasChildren ? childrenCount : "none"}
- Has valid visas: ${app.has_valid_visa === true ? "Yes" : "No"}
- Previous international travel (last 10 years): ${travelHistorySummary}`

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
      .from('visa_applications_uk')
      .update({
        ai_intention_letter: letter,
        ai_letter_generated_at: new Date().toISOString(),
        ai_letter_status: 'completed'
      })
      .eq('id', applicationId)

    return { success: true, letter }

  } catch (error: any) {
    console.error('Error generating AI letter in background:', error)
    await supabaseAdmin
      .from('visa_applications_uk')
      .update({
        ai_letter_status: 'failed'
      })
      .eq('id', applicationId)
      
    return { success: false, error: error.message }
  }
}
