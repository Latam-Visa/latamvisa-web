"use server"

import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'

export async function submitCanadaApplication(
  formDataInput: FormData
): Promise<{ success: boolean; applicationId?: string; error?: string; errorCode?: string; digest?: string }> {

  let ipAddress = 'unknown'
  let userAgent = 'unknown'

  try {
    const headersList = headers()
    ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    userAgent = headersList.get('user-agent') || 'unknown'
  } catch (e) {
    // Ignore
  }

  try {
    const formData = JSON.parse(formDataInput.get('data') as string)
    return await executeSubmit(formData, ipAddress, userAgent)
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

async function executeSubmit(formData: any, ipAddress: string, userAgent: string) {
  const t0 = Date.now()
  console.log('[SUBMIT_CANADA] Start', new Date().toISOString())

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

  // Mapeo seguro de booleanos (de string "true" / "false" a boolean real)
  const toBool = (val: any) => val === 'true' || val === true
  
  // Convert empty strings to null
  const nullify = (val: any) => val === '' ? null : val

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

  console.log('[SUBMIT_CANADA] Step 1: DB insert')
  try {
    const { error: dbError } = await supabaseAdmin
      .from('visa_applications_canada')
      .insert({
        id: applicationId,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'pending',
        
        // Step 1
        apply_for: nullify(step1.apply_for),
        visa_reason: nullify(step1.visa_reason),
        activities_in_canada: nullify(step1.activities_in_canada),
        entry_date: nullify(step1.entry_date),
        leave_date: nullify(step1.leave_date),
        uci: nullify(step1.uci),
        applying_on_behalf: toBool(step1.applying_on_behalf),

        // Step 2
        surname: nullify(step2.surname),
        given_name: nullify(step2.given_name),
        date_of_birth: nullify(step2.date_of_birth),
        gender: nullify(step2.gender),
        document_type: nullify(step2.document_type),
        passport_kind: nullify(step2.passport_kind),
        passport_country_code: nullify(step2.passport_country_code),
        passport_nationality: nullify(step2.passport_nationality),
        passport_number: nullify(step2.passport_number),
        passport_issue_date: nullify(step2.passport_issue_date),
        passport_expiry_date: nullify(step2.passport_expiry_date),
        us_green_card: toBool(step2.us_green_card),
        held_canadian_visa_10y: toBool(step2.held_canadian_visa_10y),
        holds_us_nonimmigrant_visa: toBool(step2.holds_us_nonimmigrant_visa),
        us_visa_number: nullify(step2.us_visa_number),
        us_visa_expiry: nullify(step2.us_visa_expiry),
        different_passport_us_visa: step2.different_passport_us_visa ? toBool(step2.different_passport_us_visa) : null,
        travelling_by_air: toBool(step2.travelling_by_air),

        // Step 3
        birth_country: nullify(step3.birth_country),
        birth_city: nullify(step3.birth_city),
        multiple_citizenship: toBool(step3.multiple_citizenship),
        citizenship_country: nullify(step3.citizenship_country),
        citizen_since_birth: toBool(step3.citizen_since_birth),
        citizen_since_date: nullify(step3.citizen_since_date),
        has_national_id: toBool(step3.has_national_id),
        national_id_number: nullify(step3.national_id_number),
        national_id_issue_date: nullify(step3.national_id_issue_date),
        national_id_country: nullify(step3.national_id_country),
        used_other_name: toBool(step3.used_other_name),
        other_names: step3.other_names || [],

        // Step 4
        residential_country: nullify(step4.residential_country),
        residential_street: nullify(step4.residential_street),
        residential_city: nullify(step4.residential_city),
        residential_postal_code: nullify(step4.residential_postal_code),
        mailing_same: toBool(step4.mailing_same),
        mailing_country: nullify(step4.mailing_country),
        mailing_street: nullify(step4.mailing_street),
        mailing_city: nullify(step4.mailing_city),
        mailing_postal_code: nullify(step4.mailing_postal_code),
        residence_history: step4.residence_history || [],
        provided_biometrics_10y: toBool(step4.provided_biometrics_10y),

        // Step 5
        funds_cad: step5.funds_cad === '' ? null : (step5.funds_cad ? Number(step5.funds_cad) : null),
        someone_else_funding: toBool(step5.someone_else_funding),
        studied_postsecondary: toBool(step5.studied_postsecondary),
        education_history: step5.education_history || [],
        military_service: toBool(step5.military_service),
        military_details: step5.military_details || [],
        work_history: step5.work_history || [],

        // Step 6
        travelled_past_5y: toBool(step6.travelled_past_5y),
        travel_history: step6.travel_history || [],
        stayed_illegally_canada: toBool(step6.stayed_illegally_canada),
        refused_visa: toBool(step6.refused_visa),
        refusal_details: nullify(step6.refusal_details),

        // Step 7
        committed_crime: toBool(step7.committed_crime),
        arrested: toBool(step7.arrested),
        charged: toBool(step7.charged),
        convicted: toBool(step7.convicted),
        violent_political_group: toBool(step7.violent_political_group),
        witnessed_ill_treatment: toBool(step7.witnessed_ill_treatment),

        // Step 8
        medical_exam_12m: toBool(step8.medical_exam_12m),
        work_in_listed_jobs: toBool(step8.work_in_listed_jobs),
        tb_diagnosed_2y: toBool(step8.tb_diagnosed_2y),
        tb_contact_5y: toBool(step8.tb_contact_5y),
        dialysis: toBool(step8.dialysis),
        drug_alcohol_addiction: toBool(step8.drug_alcohol_addiction),
        mental_health_condition: toBool(step8.mental_health_condition),
        syphilis: toBool(step8.syphilis),

        // Step 9
        marital_status: nullify(step9.marital_status),
        marriage_date: nullify(step9.marriage_date),
        spouse_surname: nullify(step9.spouse_surname),
        spouse_given_name: nullify(step9.spouse_given_name),
        spouse_date_of_birth: nullify(step9.spouse_date_of_birth),
        spouse_birth_country: nullify(step9.spouse_birth_country),
        spouse_occupation: nullify(step9.spouse_occupation),
        spouse_address_same: step9.spouse_address_same ? toBool(step9.spouse_address_same) : null,
        spouse_accompany: step9.spouse_accompany ? toBool(step9.spouse_accompany) : null,
        has_children: toBool(step9.has_children),
        children: step9.children || [],
        parents: step9.parents || [],

        // Step 10
        native_language: nullify(step10.native_language),
        communicate_language: nullify(step10.communicate_language),
        email: nullify(step10.email),
        phones: step10.phones || [],
        
        // Documents
        doc_id_passport: nullify(step10.doc_id_passport),
        doc_ties: nullify(step10.doc_ties),
        doc_bank_statements: nullify(step10.doc_bank_statements),
        doc_travel_itinerary: nullify(step10.doc_travel_itinerary),
        doc_forms_letters: nullify(step10.doc_forms_letters),
      })

    if (dbError) throw new Error(dbError.message)
    console.log('[SUBMIT_CANADA] DB insert OK')
  } catch (error: any) {
    console.error('[DB_INSERT_CANADA] Error:', error)
    return { success: false, error: 'No pudimos guardar tu aplicación. Intenta en unos minutos.', errorCode: 'DB_INSERT' }
  }

  // Define Dark Theme email styles
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

  // 2. Send admin email
  try {
    const adminHtml = `
      <div style="${emailStyle}">
        <div style="${cardStyle}">
          <h2 style="${titleStyle}">Nueva Aplicación Canadá Recibida</h2>
          <p><strong>Aplicante:</strong> ${step2.given_name || ''} ${step2.surname}</p>
          <p><strong>Email:</strong> ${step10.email}</p>
          <p><strong>Tipo de Visa:</strong> ${step1.apply_for}</p>
          <p><strong>ID de Aplicación:</strong> ${applicationId}</p>
          <p>Revisa la base de datos de Supabase para ver todos los documentos y detalles de la aplicación.</p>
        </div>
      </div>
    `
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🇨🇦 Canadá / Visa de Visitante — ${step2.surname}`,
      html: adminHtml,
    })
    console.log('[EMAIL_ADMIN] sent')
  } catch (error: any) {
    console.error('[EMAIL_ADMIN] failed:', error)
  }

  // 3. Send client email
  try {
    const clientHtml = `
      <div style="${emailStyle}">
        <div style="${cardStyle}">
          <h2 style="${titleStyle}">¡Recibimos tu aplicación para Canadá!</h2>
          <p>Hola ${step2.given_name || step2.surname},</p>
          <p>Hemos recibido exitosamente tu formulario de aplicación y documentos para la visa de Canadá.</p>
          <p>Nuestro equipo de expertos revisará tu perfil en las próximas 24-48 horas hábiles y nos pondremos en contacto contigo vía WhatsApp o correo electrónico para los siguientes pasos.</p>
          <br/>
          <p>Atentamente,</p>
          <p style="color: #C8FF00; font-weight: bold;">El equipo de LATAM VISA</p>
        </div>
      </div>
    `
    await resend.emails.send({
      from: FROM_EMAIL,
      to: step10.email,
      subject: '🇨🇦 Recibimos tu aplicación para Canadá — LATAM VISA',
      html: clientHtml,
    })
    console.log('[EMAIL_CLIENT] sent')
  } catch (error: any) {
    console.error('[EMAIL_CLIENT] failed:', error)
  }

  console.log('[SUBMIT_CANADA] Done', Date.now() - t0, 'ms')
  return { success: true, applicationId }
}
