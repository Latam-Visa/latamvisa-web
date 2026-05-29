"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

export async function generateIntentionLetterBg(applicationId: string) {
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

    // Prepare data summaries
    let currentEmployment = "Not specified"
    if (app.work_history && Array.isArray(app.work_history) && app.work_history.length > 0) {
      const current = app.work_history[0]
      currentEmployment = `${current.job_title} at ${current.employer}, ${current.country} (since ${current.from}${current.ongoing ? ", ongoing" : ""})`
    }

    let spouseInfo = ""
    if (app.spouse_given_name || app.spouse_surname) {
      spouseInfo = `, spouse: ${app.spouse_given_name || ''} ${app.spouse_surname || ''}, accompanying: ${app.spouse_accompany === true || app.spouse_accompany === 'true' ? 'Yes' : 'No'}`
    }

    let travelHistorySummary = "None"
    if (app.travel_history && Array.isArray(app.travel_history) && app.travel_history.length > 0) {
      travelHistorySummary = app.travel_history.map((t: any) => `${t.country} (${new Date(t.from).getFullYear()})`).join(", ")
    }

    let educationSummary = "Not specified"
    if (app.education_history && Array.isArray(app.education_history) && app.education_history.length > 0) {
      const highest = app.education_history[0]
      educationSummary = `${highest.level} in ${highest.field} at ${highest.school}`
    }

    const hasChildren = app.has_children === true || app.has_children === 'true'
    const childrenCount = Array.isArray(app.children) ? app.children.length : "none"

    const prompt = `You are a professional immigration consultant writing a Letter of Intent for a Canadian Visitor Visa (TRV) application. Write a formal, persuasive, ONE-PAGE letter in ENGLISH addressed to "Visa Officer, Immigration, Refugees and Citizenship Canada (IRCC)".

The letter must:
- Open with the applicant's full name, nationality, and current country of residence.
- State the purpose of the trip clearly (tourism), with specific cities and activities.
- Specify exact entry and exit dates and total trip duration.
- Demonstrate strong ties to the country of residence (employment, family, property, studies, lease, dependents) — these are the reasons the applicant WILL return.
- Confirm financial capacity to cover the trip (the amount in CAD).
- Mention prior travel history if relevant (shows the applicant respects visa conditions).
- If the applicant holds a valid US non-immigrant visa, mention it explicitly — this strengthens credibility.
- Close with a respectful request for visa approval and contact information (email).

Tone: formal, confident, concise, professional. Do NOT invent facts; use ONLY the data provided. If a field is missing, omit that section gracefully. Output ONLY the letter body, no preamble or explanation.

Applicant data:
- Full name: ${app.surname || ''}, ${app.given_name || ''}
- Date of birth: ${app.date_of_birth || ''}
- Nationality: ${app.passport_nationality || ''}
- Passport number: ${app.passport_number || ''}
- Current residence: ${app.residential_country || ''}, ${app.residential_city || ''}, ${app.residential_street || ''}
- Email: ${app.email || ''}
- Trip purpose: ${app.visa_reason || ''}
- Activities in Canada: ${app.activities_in_canada || ''}
- Entry date: ${app.entry_date || ''}
- Exit date: ${app.leave_date || ''}
- Funds available (CAD): ${app.funds_cad || ''}
- Current employment: ${currentEmployment}
- Marital status: ${app.marital_status || ''}${spouseInfo}
- Children: ${hasChildren ? childrenCount : "none"}
- Holds valid US non-immigrant visa: ${app.holds_us_nonimmigrant_visa === true || app.holds_us_nonimmigrant_visa === 'true' ? `Yes, valid until ${app.us_visa_expiry || 'Unknown'}` : "No"}
- Previous international travel (last 5 years): ${travelHistorySummary}
- Education: ${educationSummary}`

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
        ai_letter_status: 'completed'
      })
      .eq('id', applicationId)

    return { success: true, letter }

  } catch (error: any) {
    console.error('Error generating AI letter in background:', error)
    await supabaseAdmin
      .from('visa_applications_canada')
      .update({
        ai_letter_status: 'failed'
      })
      .eq('id', applicationId)
      
    return { success: false, error: error.message }
  }
}
