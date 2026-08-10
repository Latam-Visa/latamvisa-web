"use server"

import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { getClientConfirmationEmail } from '@/lib/emails/client-confirmation'
import { formatCalendarDate } from '@/lib/dates'
import { generateIntentionLetterBg } from './generate-intention-letter'

export async function submitAustraliaApplication(
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
  console.log('[SUBMIT_AUSTRALIA] Start', new Date().toISOString())

  if (
    !process.env.RESEND_API_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    console.error('[ENV_CHECK] Faltan variables de entorno requeridas.')
    return { success: false, error: 'Error de configuración del servidor. Contactanos por WhatsApp.', errorCode: 'ENV_CHECK' }
  }

  const ADMIN_EMAILS = Array.from(new Set([
    process.env.RESEND_ADMIN_EMAIL || 'future@latamvisas.com.au',
    'future@latamvisas.com',
  ]))
  const FROM_EMAIL = 'noreply@latamvisatravel.com'

  const applicationId = uuidv4()
  
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
  const step11 = formData.step11 || {}
  const step12 = formData.step12 || {}
  const step13 = formData.step13 || {}
  const step14 = formData.step14 || {}

  console.log('[SUBMIT_AUSTRALIA] DB insert')
  try {
    const { error: dbError } = await supabaseAdmin
      .from('aplicaciones_turismo_australia')
      .insert({
        id: applicationId,
        status: 'pending',
        ai_letter_status: 'generating',
        
        // Step 1
        terms_accepted: toBool(step1.terms_accepted),
        currently_outside_australia: toBool(step1.currently_outside_australia),
        current_location_country: nullify(step1.current_location_country),
        current_location_legal_status: nullify(step1.current_location_legal_status),
        visa_stream: nullify(step1.visa_stream),
        reasons_for_visit: nullify(step1.reasons_for_visit),
        significant_dates_details: nullify(step1.significant_dates_details),
        group_processing: toBool(step1.group_processing),
        group_processing_details: nullify(step1.group_processing_details),
        special_category_entry: toBool(step1.special_category_entry),
        special_category_entry_details: nullify(step1.special_category_entry_details),

        // Step 2
        family_name: nullify(step2.family_name),
        given_names: nullify(step2.given_names),
        sex: nullify(step2.sex),
        date_of_birth: nullify(step2.date_of_birth),
        passport_number: nullify(step2.passport_number),
        country_of_passport: nullify(step2.country_of_passport),
        nationality_passport_holder: nullify(step2.nationality_passport_holder),
        passport_issue_date: nullify(step2.passport_issue_date),
        passport_expiry_date: nullify(step2.passport_expiry_date),
        passport_place_of_issue: nullify(step2.passport_place_of_issue),

        // Step 3
        has_national_id: toBool(step3.has_national_id),
        doc_national_id_url: nullify(step3.doc_national_id_url),
        nid_family_name: nullify(step3.nid_family_name),
        nid_given_names: nullify(step3.nid_given_names),
        nid_number: nullify(step3.nid_number),
        nid_country_of_issue: nullify(step3.nid_country_of_issue),
        nid_issue_date: nullify(step3.nid_issue_date),
        nid_expiry_date: nullify(step3.nid_expiry_date),
        pacific_australia_card: toBool(step3.pacific_australia_card),
        pacific_australia_card_number: nullify(step3.pacific_australia_card_number),
        birth_town_city: nullify(step3.birth_town_city),
        birth_state_province: nullify(step3.birth_state_province),
        country_of_birth: nullify(step3.country_of_birth),
        relationship_status: nullify(step3.relationship_status),
        has_other_names: toBool(step3.has_other_names),
        // La UI captura esto como texto libre (step3.other_names_details), no como
        // la lista estructurada que sugiere el nombre de la columna en BD.
        other_names_list: step3.other_names_details ? [nullify(step3.other_names_details)] : deepNullify(step3.other_names_list || []),
        citizen_of_passport_country: toBool(step3.citizen_of_passport_country),
        citizen_other_country: toBool(step3.citizen_other_country),
        other_citizenships: deepNullify(step3.other_citizenships || []),
        previous_travel_australia: toBool(step3.previous_travel_australia),
        previously_applied_australia_visa: toBool(step3.previously_applied_australia_visa),
        has_grant_number: toBool(step3.has_grant_number),
        grant_number: nullify(step3.grant_number),
        other_travel_documents: toBool(step3.other_travel_documents),
        other_travel_documents_details: nullify(step3.other_travel_documents_details),
        other_identity_documents: toBool(step3.other_identity_documents),
        other_identity_documents_details: nullify(step3.other_identity_documents_details),
        health_exam_last_12_months: toBool(step3.health_exam_last_12_months),

        // Step 4
        usual_country_of_residence: nullify(step4.usual_country_of_residence),
        department_office: nullify(step4.department_office),
        res_country: nullify(step4.res_country),
        res_address: nullify(step4.res_address),
        res_suburb: nullify(step4.res_suburb),
        res_state: nullify(step4.res_state),
        res_postcode: nullify(step4.res_postcode),
        phone_home: nullify(step4.phone_home),
        phone_business: nullify(step4.phone_business),
        phone_mobile: nullify(step4.phone_mobile),
        postal_same_as_residential: toBool(step4.postal_same_as_residential),
        postal_country: nullify(step4.postal_country),
        postal_address: nullify(step4.postal_address),
        postal_suburb: nullify(step4.postal_suburb),
        postal_state: nullify(step4.postal_state),
        postal_postcode: nullify(step4.postal_postcode),
        email: nullify(step4.email),
        has_authorised_recipient: toBool(step4.has_authorised_recipient),
        authorised_recipient_details: nullify(step4.authorised_recipient_details),
        correspondence_email: nullify(step4.correspondence_email),

        // Step 5
        travelling_with_others: toBool(step5.travelling_with_others),
        travelling_companions_details: nullify(step5.travelling_companions_details),

        // Step 6
        has_non_accompanying_family: toBool(step6.has_non_accompanying_family),
        non_accompanying_family: deepNullify(step6.non_accompanying_family || []),

        // Step 7
        multiple_entries: toBool(step7.multiple_entries),
        length_of_stay: nullify(step7.length_of_stay),
        planned_arrival_date: nullify(step7.planned_arrival_date),
        planned_departure_date: nullify(step7.planned_departure_date),
        study_in_australia: toBool(step7.study_in_australia),
        study_details: nullify(step7.study_details),
        will_visit_contacts: toBool(step7.will_visit_contacts),
        contacts_in_australia_details: nullify(step7.contacts_in_australia_details),

        // Step 8
        employment_status: nullify(step8.employment_status),
        employer_name: nullify(step8.employer_name),
        occupation: nullify(step8.occupation),
        employer_address: nullify(step8.employer_address),
        work_phone: nullify(step8.work_phone),
        monthly_income: nullify(step8.monthly_income),
        retirement_date: nullify(step8.retirement_date),
        business_details: nullify(step8.business_details),

        // Step 9
        funding_type: nullify(step9.funding_type),
        support_type: nullify(step9.support_type),
        funds_available_details: nullify(step9.funds_available_details),
        supporter_details: nullify(step9.supporter_details),

        // Step 10
        health_declarations: deepNullify(step10.health_declarations || {}),
        health_details: nullify(step10.health_details),

        // Step 11
        character_declarations: deepNullify(step11.character_declarations || {}),
        character_details: nullify(step11.character_details),

        // Step 12
        holds_other_visa: toBool(step12.holds_other_visa),
        visa_history_details: nullify(step12.visa_history_details),
        visa_non_compliance: toBool(step12.visa_non_compliance),
        visa_non_compliance_details: nullify(step12.visa_non_compliance_details),
        visa_refused_cancelled: toBool(step12.visa_refused_cancelled),
        visa_refused_details: nullify(step12.visa_refused_details),

        // Step 13
        declarations_consents: deepNullify(step13.declarations_consents || {}),

        // Step 14 (Documents) — one consolidated field per group
        doc_group1_arraigo: deepNullify(step14.doc_group1_arraigo || []),
        doc_group2_fondos: deepNullify(step14.doc_group2_fondos || []),
        doc_group3_viajes: deepNullify(step14.doc_group3_viajes || []),
      })

    if (dbError) throw new Error(dbError.message)
    console.log('[SUBMIT_AUSTRALIA] DB insert OK')

    generateIntentionLetterBg(applicationId).catch(err => console.error('[BG_AI_LETTER] failed to start:', err))
  } catch (error: any) {
    console.error('[DB_INSERT_AUSTRALIA] Error:', error)
    return { success: false, error: 'No pudimos guardar tu aplicación. Intenta en unos minutos.', errorCode: 'DB_INSERT' }
  }

  // 2. Send internal admin notification email
  try {
    const applicantName = `${step2.given_names || ''} ${step2.family_name || ''}`.trim()
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://latamvisatravel.com'}/admin/applications/${applicationId}`
    const travelDates = [step7.planned_arrival_date, step7.planned_departure_date]
      .filter(Boolean)
      .map((d: string) => formatCalendarDate(d))
      .join(' — ') || 'No especificadas'

    const adminHtml = `
      <div style="font-family: sans-serif; background-color: #0A0A0A; color: #FAFAF7; padding: 40px 20px;">
        <div style="background-color: #1A1A1A; border: 1px solid #333; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C8FF00; margin-top: 0; font-size: 24px; border-bottom: 1px solid #333; padding-bottom: 15px;">Nueva Aplicación Australia Recibida</h2>
          <p><strong>Aplicante:</strong> ${applicantName || '—'}</p>
          <p><strong>Email:</strong> ${step4.email || '—'}</p>
          <p><strong>Teléfono:</strong> ${step4.phone_mobile || step4.phone_home || step4.phone_business || '—'}</p>
          <p><strong>Ubicación actual:</strong> ${step1.current_location_country || '—'}</p>
          <p><strong>Estatus legal actual:</strong> ${step1.current_location_legal_status || '—'}</p>
          <p><strong>Fechas de viaje planeadas:</strong> ${travelDates}</p>
          <p><strong>ID de Aplicación:</strong> ${applicationId}</p>
          <p style="margin-top: 24px;">
            <a href="${adminUrl}" style="background-color: #C8FF00; color: #0A0A0A; text-decoration: none; font-weight: bold; padding: 12px 20px; border-radius: 8px; display: inline-block;">Ver aplicación en el panel de administración</a>
          </p>
        </div>
      </div>
    `
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `Nueva aplicación — Turismo Australia — ${applicantName || 'Sin nombre'}`,
      html: adminHtml,
    })
    console.log('[EMAIL_ADMIN] sent')
  } catch (error: any) {
    console.error('[EMAIL_ADMIN] failed:', error)
  }

  // 3. Send client confirmation email
  try {
    const clientHtml = getClientConfirmationEmail(
      { given_names: step2.given_names, family_name: step2.family_name, email: step4.email, planned_arrival_date: step7.planned_arrival_date },
      'australia',
      false
    )
    await resend.emails.send({
      from: FROM_EMAIL,
      to: step4.email,
      subject: '🇦🇺 Recibimos tu solicitud para Australia — LATAM VISA',
      html: clientHtml,
    })
    console.log('[EMAIL_CLIENT] sent')
  } catch (error: any) {
    console.error('[EMAIL_CLIENT] failed:', error)
  }

  console.log('[SUBMIT_AUSTRALIA] Done', Date.now() - t0, 'ms')
  return { success: true, applicationId }
}
