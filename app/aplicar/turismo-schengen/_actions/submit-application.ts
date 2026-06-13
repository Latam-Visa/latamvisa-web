"use server"

import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { generateIntentionLetterBg } from './generate-intention-letter'
import { getClientConfirmationEmail } from '@/lib/emails/client-confirmation'
import { generateApplicationPdf } from '@/lib/pdf/generate-pdf'

export async function submitSchengenApplication(
  formDataInput: FormData
): Promise<{ success: boolean; applicationId?: string; error?: string; errorCode?: string; digest?: string; paymentUrl?: string }> {

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
  console.log('[SUBMIT_SCHENGEN] Start', new Date().toISOString())

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

  // Convert empty strings to null recursively (crucial for dates in JSONB)
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

  console.log('[SUBMIT_SCHENGEN] Step 1: DB insert')
  try {
    const { error: dbError } = await supabaseAdmin
      .from('visa_applications_schengen')
      .insert({
        id: applicationId,
        status: 'pending',
        
        // Identidad
        surname: nullify(step1.surname),
        surname_at_birth: nullify(step1.surname_at_birth),
        first_names: nullify(step1.first_names),
        date_of_birth: nullify(step1.date_of_birth),
        place_of_birth: nullify(step1.place_of_birth),
        country_of_birth: nullify(step1.country_of_birth),
        current_nationality: nullify(step1.current_nationality),
        nationality_at_birth: nullify(step1.nationality_at_birth),
        other_nationalities: nullify(step1.other_nationalities),
        sex: nullify(step1.sex),
        civil_status: nullify(step1.civil_status),
        civil_status_other: nullify(step1.civil_status_other),
        parental_authority_name: nullify(step1.parental_authority_name),
        parental_authority_address: nullify(step1.parental_authority_address),
        national_id_number: nullify(step1.national_id_number),

        // Documento
        travel_document_type: nullify(step2.travel_document_type),
        travel_document_other: nullify(step2.travel_document_other),
        passport_number: nullify(step2.passport_number),
        passport_issue_date: nullify(step2.passport_issue_date),
        passport_expiry_date: nullify(step2.passport_expiry_date),
        passport_issuing_country: nullify(step2.passport_issuing_country),

        // Contacto/residencia/ocupación
        home_address: nullify(step3.home_address),
        home_email: nullify(step3.home_email),
        home_phone: nullify(step3.home_phone),
        residence_other_country: nullify(step3.residence_other_country),
        residence_permit_number: nullify(step3.residence_permit_number),
        residence_permit_valid_until: nullify(step3.residence_permit_valid_until),
        current_occupation: nullify(step3.current_occupation),
        employer_name: nullify(step3.employer_name),
        employer_address: nullify(step3.employer_address),
        employer_phone: nullify(step3.employer_phone),

        // Viaje
        purpose_of_journey: nullify(step4.purpose_of_journey),
        purpose_other: nullify(step4.purpose_other),
        additional_destinations: nullify(step4.additional_destinations),
        member_state_destination: nullify(step4.member_state_destination),
        member_state_first_entry: nullify(step4.member_state_first_entry),
        number_of_entries: nullify(step4.number_of_entries),
        intended_arrival_date: nullify(step4.intended_arrival_date),
        intended_departure_date: nullify(step4.intended_departure_date),
        duration_of_stay_days: !step4.duration_of_stay_days ? null : Number(step4.duration_of_stay_days),

        // Historial
        previous_schengen_visas: nullify(step5.previous_schengen_visas),
        previous_visas: nullify(step5.previous_visas),
        fingerprints_collected: nullify(step5.fingerprints_collected),
        fingerprints_date: nullify(step5.fingerprints_date),
        final_destination_permit: nullify(step5.final_destination_permit),
        final_permit_issued_by: nullify(step5.final_permit_issued_by),
        final_permit_valid_from: nullify(step5.final_permit_valid_from),
        final_permit_valid_until: nullify(step5.final_permit_valid_until),

        // Invitación/costos
        inviting_person_or_hotel: nullify(step6.inviting_person_or_hotel),
        inviting_address: nullify(step6.inviting_address),
        inviting_phone: nullify(step6.inviting_phone),
        inviting_company: nullify(step6.inviting_company),
        inviting_company_contact: nullify(step6.inviting_company_contact),
        costs_covered_by: nullify(step6.costs_covered_by),
        sponsor_details: nullify(step6.sponsor_details),
        means_of_support: nullify(step6.means_of_support),

        // Familiar UE
        eu_family_member: nullify(step7.eu_family_member),
        eu_family_surname: nullify(step7.eu_family_surname),
        eu_family_first_name: nullify(step7.eu_family_first_name),
        eu_family_dob: nullify(step7.eu_family_dob),
        eu_family_nationality: nullify(step7.eu_family_nationality),
        eu_family_doc_number: nullify(step7.eu_family_doc_number),
        eu_family_relationship: nullify(step7.eu_family_relationship),

        // Firma
        place_and_date: nullify(step8.place_and_date),
        signature_confirmed: step8.signature_confirmed === true,

        // Soportes
        travel_insurance_confirmed: step8.travel_insurance_confirmed === true,
        proof_of_funds_eur: step8.proof_of_funds_eur === true,
        accommodation_proof: step8.accommodation_proof === true,
        return_ticket_confirmed: step8.return_ticket_confirmed === true,
        ties_to_home_country: step8.ties_to_home_country === true,

        // Documentos
        passport_file_url: nullify(step9.passport_file_url),
        photo_file_url: nullify(step9.photo_file_url),
        travel_insurance_url: nullify(step9.travel_insurance_url),
        bank_statements_url: nullify(step9.bank_statements_url),
        accommodation_url: nullify(step9.accommodation_url),
        flight_itinerary_url: nullify(step9.flight_itinerary_url),
        employment_proof_url: nullify(step9.employment_proof_url),
        ties_proof_url: nullify(step9.ties_proof_url),
        documents: nullify(step9.documents),

        // Carta
        ai_letter_status: 'generating',
        
        // Raw
        form_data: formData
      })

    if (dbError) throw new Error(dbError.message)
    console.log('[SUBMIT_SCHENGEN] DB insert OK')

    // Kick off AI letter generation in the background
    generateIntentionLetterBg(applicationId).catch(err => console.error('[BG_AI_LETTER] failed to start:', err))
  } catch (error: any) {
    console.error('[DB_INSERT_SCHENGEN] Error:', error)
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

  // 2. Send admin email
  try {
    const adminHtml = `
      <div style="${emailStyle}">
        <div style="${cardStyle}">
          <h2 style="${titleStyle}">Nueva Aplicación Schengen Recibida</h2>
          <p><strong>Aplicante:</strong> ${step1.first_names || ''} ${step1.surname || ''}</p>
          <p><strong>Email:</strong> ${step3.home_email}</p>
          <p><strong>Destino:</strong> ${step4.member_state_destination}</p>
          <p><strong>ID de Aplicación:</strong> ${applicationId}</p>
        </div>
      </div>
    `
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nueva solicitud visa Schengen — ${step1.first_names} ${step1.surname}`,
      html: adminHtml,
    })
    console.log('[EMAIL_ADMIN] sent')
  } catch (error: any) {
    console.error('[EMAIL_ADMIN] failed:', error)
  }

  // 3. Generar PDF
  let pdfBuffer: Buffer | undefined
  try {
    pdfBuffer = await generateApplicationPdf(insertData, {}, 'schengen')
  } catch (pdfError) {
    console.error('[PDF_GEN_SCHENGEN] Error generating PDF for client:', pdfError)
  }

  // 4. Send client email
  try {
    const clientHtml = getClientConfirmationEmail(insertData, 'schengen')
    
    const attachments = pdfBuffer ? [{
      filename: 'resumen-solicitud-latam-visa.pdf',
      content: pdfBuffer
    }] : undefined

    await resend.emails.send({
      from: FROM_EMAIL,
      to: step3.home_email,
      subject: '🇪🇺 Recibimos tu solicitud para Schengen — LATAM VISA',
      html: clientHtml,
      attachments
    })
    console.log('[EMAIL_CLIENT] sent')
  } catch (error: any) {
    console.error('[EMAIL_CLIENT] failed:', error)
  }

  console.log('[SUBMIT_SCHENGEN] Done', Date.now() - t0, 'ms')
  
  // They already paid before starting the form, so we don't redirect to payment
  return { success: true, applicationId }
}
