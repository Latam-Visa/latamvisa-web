"use server"

import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { generateIntentionLetterBg } from './generate-intention-letter'

export async function submitUkApplication(
  formDataInput: FormData
): Promise<{ success: boolean; applicationId?: string; error?: string; errorCode?: string; digest?: string }> {

  try {
    const formData = JSON.parse(formDataInput.get('data') as string)
    return await executeSubmit(formData)
  } catch (error: any) {
    console.error('[GLOBAL_CATCH] Error:', error.message, error.stack)
    return {
      success: false,
      error: 'Hubo un error inesperado al procesar tu solicitud. Por favor intenta de nuevo o contáctanos.',
      errorCode: 'UNEXPECTED_ERROR',
      digest: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
}

async function executeSubmit(formData: any) {
  const t0 = Date.now()
  console.log('[SUBMIT_UK] Start', new Date().toISOString())

  if (
    !process.env.RESEND_API_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    console.error('[ENV_CHECK] Faltan variables de entorno requeridas.')
    return { success: false, error: 'Error de configuración del servidor. Contactanos por WhatsApp.', errorCode: 'ENV_CHECK' }
  }

  const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || 'future@latamvisas.com.au'
  const FROM_EMAIL = 'noreply@latamvisatravel.com'

  const applicationId = uuidv4()
  const submittedAt = new Date().toISOString()

  const toBool = (val: any) => val === 'true' || val === true
  
  const deepNullify = (obj: any): any => {
    if (obj === '') return null
    if (Array.isArray(obj)) return obj.map(deepNullify)
    if (obj !== null && typeof obj === 'object') {
      const newObj: any = {}
      for (const key in obj) {
        newObj[key] = deepNullify(obj[key])
      }
      return newObj
    }
    return obj
  }
  
  const nullify = deepNullify

  const step1 = formData.step1 || {}
  const step2 = formData.step2 || {}
  const step3 = formData.step3 || {}
  const step4 = formData.step4 || {}
  const step5 = formData.step5 || {}
  const step6 = formData.step6 || {}
  const step7 = formData.step7 || {}
  const step8 = formData.step8 || {}
  const step9 = formData.step9 || {}
  const step10 = formData.step10 || {}

  console.log('[SUBMIT_UK] Step 1: DB insert')
  try {
    const { error: dbError } = await supabaseAdmin
      .from('visa_applications_uk')
      .insert({
        id: applicationId,
        status: 'pending',
        
        // Paso 1
        purpose_of_visit: nullify(step1.purpose_of_visit),
        proposed_entry_date: nullify(step1.proposed_entry_date),
        proposed_exit_date: nullify(step1.proposed_exit_date),
        visited_uk_before: toBool(step1.visited_uk_before),
        visited_uk_details: nullify(step1.visited_uk_details),
        has_uk_contacts: toBool(step1.has_uk_contacts),
        uk_contacts: deepNullify(step1.uk_contacts || []),

        // Paso 2
        first_name: nullify(step2.first_name),
        last_name: nullify(step2.last_name),
        other_names_used: nullify(step2.other_names_used),
        date_of_birth: nullify(step2.date_of_birth),
        place_of_birth: nullify(step2.place_of_birth),
        country_of_birth: nullify(step2.country_of_birth),
        gender: nullify(step2.gender),
        passport_number: nullify(step2.passport_number),
        passport_issue_date: nullify(step2.passport_issue_date),
        passport_expiry_date: nullify(step2.passport_expiry_date),
        passport_issuing_country: nullify(step2.passport_issuing_country),
        passport_issuing_authority: nullify(step2.passport_issuing_authority),

        // Paso 3
        current_nationality: nullify(step3.current_nationality),
        has_other_nationality: toBool(step3.has_other_nationality),
        other_nationality: nullify(step3.other_nationality),
        has_national_id: toBool(step3.has_national_id),
        national_id_number: nullify(step3.national_id_number),
        country_of_residence: nullify(step3.country_of_residence),
        time_in_current_residence: nullify(step3.time_in_current_residence),

        // Paso 4
        residential_address_line1: nullify(step4.residential_address_line1),
        residential_address_line2: nullify(step4.residential_address_line2),
        residential_city: nullify(step4.residential_city),
        residential_state: nullify(step4.residential_state),
        residential_postal_code: nullify(step4.residential_postal_code),
        residential_country: nullify(step4.residential_country),
        time_at_current_address: nullify(step4.time_at_current_address),
        phone: nullify(step4.phone),
        email: nullify(step4.email),

        // Paso 5
        occupation_status: nullify(step5.occupation_status),
        employer_name: nullify(step5.employer_name),
        employer_address: nullify(step5.employer_address),
        job_title: nullify(step5.job_title),
        monthly_income: nullify(step5.monthly_income),
        monthly_income_currency: nullify(step5.monthly_income_currency),
        available_funds_gbp: nullify(step5.available_funds_gbp),
        trip_financed_by_other: toBool(step5.trip_financed_by_other),
        trip_financer_details: nullify(step5.trip_financer_details),

        // Paso 6
        travel_history: deepNullify(step6.travel_history || []),
        has_valid_visa: toBool(step6.has_valid_visa),
        valid_visas: deepNullify(step6.valid_visas || []),

        // Paso 7
        visa_refused_before: toBool(step7.visa_refused_before),
        visa_refusal_details: nullify(step7.visa_refusal_details),
        deported_or_removed: toBool(step7.deported_or_removed),
        deportation_details: nullify(step7.deportation_details),
        criminal_conviction: toBool(step7.criminal_conviction),
        criminal_conviction_details: nullify(step7.criminal_conviction_details),

        // Paso 8
        marital_status: nullify(step8.marital_status),
        spouse_first_name: nullify(step8.spouse_first_name),
        spouse_last_name: nullify(step8.spouse_last_name),
        spouse_date_of_birth: nullify(step8.spouse_date_of_birth),
        spouse_nationality: nullify(step8.spouse_nationality),
        spouse_traveling: nullify(step8.spouse_traveling),
        has_children: toBool(step8.has_children),
        children: deepNullify(step8.children || []),

        // Paso 9
        has_tuberculosis: toBool(step9.has_tuberculosis),
        tuberculosis_details: nullify(step9.tuberculosis_details),
        requires_medical_treatment: toBool(step9.requires_medical_treatment),
        medical_treatment_details: nullify(step9.medical_treatment_details),

        // Paso 10
        passport_file_url: nullify(step10.passport_file_url),
        photo_file_url: nullify(step10.photo_file_url),
        bank_statements_url: deepNullify(step10.bank_statements_url),
        employment_proof_url: nullify(step10.employment_proof_url),
        ties_proof_url: nullify(step10.ties_proof_url),
        other_visa_url: nullify(step10.other_visa_url),
        itinerary_url: nullify(step10.itinerary_url),
        documents: deepNullify(step10.documents || []),

        // Form Data raw
        form_data: formData,

        // Letter status initial
        ai_letter_status: 'generating'
      })

    if (dbError) throw new Error(dbError.message)
    console.log('[SUBMIT_UK] DB insert OK')

    // Kick off AI letter generation in the background
    generateIntentionLetterBg(applicationId).catch(err => console.error('[BG_AI_LETTER] failed to start:', err))
  } catch (error: any) {
    console.error('[DB_INSERT_UK] Error:', error)
    return { success: false, error: 'No pudimos guardar tu aplicación. Intenta en unos minutos.', errorCode: 'DB_INSERT' }
  }

  const emailStyle = `
    font-family: sans-serif;
    background-color: #0A0A0A;
    color: #FAFAF7;
    padding: 40px 20px;
  `
  const cardStyle = `
    background-color: #1A1A1A;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 30px;
    max-w: 600px;
    margin: 0 auto;
  `
  const titleStyle = `
    color: #C8FF00;
    margin-top: 0;
    font-size: 24px;
    border-bottom: 1px solid #333;
    padding-bottom: 15px;
  `

  try {
    const adminHtml = `
      <div style="${emailStyle}">
        <div style="${cardStyle}">
          <h2 style="${titleStyle}">Nueva solicitud visa UK — ${step2.first_name || ''} ${step2.last_name || ''}</h2>
          <p><strong>Aplicante:</strong> ${step2.first_name || ''} ${step2.last_name || ''}</p>
          <p><strong>Email:</strong> ${step4.email}</p>
          <p><strong>ID de Aplicación:</strong> ${applicationId}</p>
          <p>Revisa la base de datos de Supabase para ver todos los documentos y detalles de la aplicación.</p>
        </div>
      </div>
    `
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nueva solicitud visa UK — ${step2.first_name || ''} ${step2.last_name || ''}`,
      html: adminHtml,
    })
    console.log('[EMAIL_ADMIN] sent')
  } catch (error: any) {
    console.error('[EMAIL_ADMIN] failed:', error)
  }

  try {
    const clientHtml = `
      <div style="${emailStyle}">
        <div style="${cardStyle}">
          <h2 style="${titleStyle}">Recibimos tu solicitud de visa UK 🇬🇧</h2>
          <p>Hola ${step2.first_name || step2.last_name},</p>
          <p>Hemos recibido exitosamente tu formulario de aplicación y documentos para la visa del Reino Unido.</p>
          <p>Nuestro equipo de expertos revisará tu perfil en las próximas 24-48 horas hábiles y nos pondremos en contacto contigo vía WhatsApp o correo electrónico para los siguientes pasos.</p>
          <br/>
          <p>Atentamente,</p>
          <p style="color: #C8FF00; font-weight: bold;">El equipo de LATAM VISA</p>
        </div>
      </div>
    `
    await resend.emails.send({
      from: FROM_EMAIL,
      to: step4.email,
      subject: `Recibimos tu solicitud de visa UK 🇬🇧`,
      html: clientHtml,
    })
    console.log('[EMAIL_CLIENT] sent')
  } catch (error: any) {
    console.error('[EMAIL_CLIENT] failed:', error)
  }

  console.log('[SUBMIT_UK] Done', Date.now() - t0, 'ms')
  return { success: true, applicationId }
}
