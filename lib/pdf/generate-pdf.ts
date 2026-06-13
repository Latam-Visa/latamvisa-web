import { renderToBuffer } from '@react-pdf/renderer'
import { ApplicationPDF } from './ApplicationPDF'
import React from 'react'

export async function generateApplicationPdf(
  data: any,
  photoUrls: Record<string, string> = {},
  destination: 'usa' | 'canada' | 'uk' | 'schengen' = 'usa'
): Promise<Buffer> {
  let title = 'Solicitud de Visa'
  let subtitle = ''
  let sections: any[] = []
  let photos: any[] = []

  if (destination === 'usa') {
    title = 'Solicitud de Visa USA'
    subtitle = `Aplicante: ${data?.step1Contact?.fullName || ''} | Email: ${data?.step1Contact?.email || ''}`
    
    sections = [
      {
        title: '1. Información de Contacto',
        rows: [
          { label: 'Nombre completo', value: data?.step1Contact?.fullName },
          { label: 'Email', value: data?.step1Contact?.email },
          { label: 'WhatsApp', value: data?.step1Contact?.whatsapp },
          { label: 'País residencia', value: data?.step1Contact?.currentCountry },
          { label: 'Ciudad', value: data?.step1Contact?.currentCity },
          { label: 'Dirección', value: data?.step1Contact?.currentAddress },
          { label: 'Visa actual', value: data?.step1Contact?.currentVisaType },
        ]
      },
      {
        title: '2. Información Personal',
        rows: [
          { label: 'Género', value: data?.step2Personal?.gender },
          { label: 'Estado civil', value: data?.step2Personal?.maritalStatus },
          { label: 'Fecha de nacimiento', value: data?.step2Personal?.dateOfBirth },
          { label: 'Ciudad de nacimiento', value: data?.step2Personal?.cityOfBirth },
          { label: 'Nacionalidad', value: data?.step2Personal?.nationality },
          { label: 'Identificación', value: data?.step2Personal?.identificationNumber },
        ]
      },
      {
        title: '3. Pasaporte',
        rows: [
          { label: 'Número', value: data?.step3Passport?.passportNumber },
          { label: 'Emisión', value: data?.step3Passport?.passportIssueDate },
          { label: 'Expiración', value: data?.step3Passport?.passportExpiryDate },
          { label: 'País de emisión', value: data?.step3Passport?.passportIssueCountry },
          { label: '¿Perdido/Robado?', value: data?.step3Passport?.passportLostStolen },
        ]
      },
      {
        title: '4. Viaje',
        rows: [
          { label: 'Tipo de visa', value: data?.step4Travel?.usaVisaType },
          { label: 'Llegada estimada', value: data?.step4Travel?.arrivalDate },
          { label: 'Salida estimada', value: data?.step4Travel?.departureDate },
          { label: '¿Quién paga?', value: data?.step4Travel?.tripPaidBy },
        ]
      }
    ]

    photos = [
      { label: 'Foto del pasaporte', dataUri: photoUrls.passport, hasPhotoField: !!data?.step3Passport?.passportPhotoPath },
      { label: 'Foto tipo visa', dataUri: photoUrls.visaPhoto, hasPhotoField: !!data?.step3Passport?.visaPhotoPath },
      { label: 'Foto visa anterior', dataUri: photoUrls.previousVisa, hasPhotoField: !!data?.step3Passport?.previousVisaPhotoPath },
    ]

  } else if (destination === 'canada') {
    title = 'Solicitud de Visa Canadá'
    subtitle = `Aplicante: ${data?.given_name || ''} ${data?.surname || ''} | Email: ${data?.email || ''}`
    
    sections = [
      {
        title: '1. Detalles de Visita',
        rows: [
          { label: 'Aplica para', value: data?.apply_for },
          { label: 'Motivo', value: data?.visa_reason },
          { label: 'Actividades', value: data?.activities_in_canada },
          { label: 'Entrada', value: data?.entry_date },
          { label: 'Salida', value: data?.leave_date },
        ]
      },
      {
        title: '2. Personal',
        rows: [
          { label: 'Apellidos', value: data?.surname },
          { label: 'Nombres', value: data?.given_name },
          { label: 'Nacimiento', value: data?.date_of_birth },
          { label: 'Género', value: data?.gender },
          { label: 'Pasaporte', value: data?.passport_number },
          { label: '¿Viaja por aire?', value: data?.travelling_by_air },
        ]
      },
      {
        title: '3. Ciudadanía',
        rows: [
          { label: 'País nac.', value: data?.birth_country },
          { label: 'Ciudadanía', value: data?.citizenship_country },
          { label: 'Tiene ID', value: data?.has_national_id },
          { label: 'ID Nacional', value: data?.national_id_number },
        ]
      },
      {
        title: '4. Contacto',
        rows: [
          { label: 'Email', value: data?.email },
          { label: 'País', value: data?.residential_country },
          { label: 'Ciudad', value: data?.residential_city },
          { label: 'Dirección', value: data?.residential_street },
        ]
      }
    ]

    photos = [
      { label: 'Pasaporte (PDF/IMG)', dataUri: photoUrls.docIdPassport, hasPhotoField: !!data?.doc_id_passport },
      { label: 'Lazos de arraigo', dataUri: photoUrls.docTies, hasPhotoField: !!data?.doc_ties },
    ]

  } else if (destination === 'uk') {
    title = 'Solicitud de Visa UK'
    // UK uses application.form_data (which is stored nested like step1, step2...)
    // But data passed could be the raw DB row or form_data. Let's use DB flat fields since it's easier and consistent.
    subtitle = `Aplicante: ${data?.first_name || ''} ${data?.last_name || ''} | Email: ${data?.email || ''}`
    
    sections = [
      {
        title: '1. Viaje',
        rows: [
          { label: 'Propósito', value: data?.purpose_of_visit },
          { label: 'Entrada', value: data?.proposed_entry_date },
          { label: 'Salida', value: data?.proposed_exit_date },
        ]
      },
      {
        title: '2. Personal',
        rows: [
          { label: 'Nombres', value: data?.first_name },
          { label: 'Apellidos', value: data?.last_name },
          { label: 'Nacimiento', value: data?.date_of_birth },
          { label: 'Pasaporte', value: data?.passport_number },
        ]
      },
      {
        title: '3. Contacto',
        rows: [
          { label: 'País', value: data?.country_of_residence },
          { label: 'Dirección 1', value: data?.residential_address_line1 },
          { label: 'Teléfono', value: data?.phone },
          { label: 'Email', value: data?.email },
        ]
      },
      {
        title: '4. Finanzas',
        rows: [
          { label: 'Situación', value: data?.occupation_status },
          { label: 'Empleador', value: data?.employer_name },
          { label: 'Cargo', value: data?.job_title },
          { label: 'Ingreso', value: `${data?.monthly_income} ${data?.monthly_income_currency}` },
        ]
      }
    ]

    photos = [
      { label: 'Pasaporte', dataUri: photoUrls.passport, hasPhotoField: !!data?.passport_file_url },
      { label: 'Foto', dataUri: photoUrls.photo, hasPhotoField: !!data?.photo_file_url },
    ]
  } else if (destination === 'schengen') {
    title = 'Solicitud de Visa Schengen'
    subtitle = `Aplicante: ${data?.first_names || ''} ${data?.surname || ''} | Email: ${data?.home_email || ''}`
    
    sections = [
      {
        title: '1. Identidad',
        rows: [
          { label: 'Apellidos', value: data?.surname },
          { label: 'Nombres', value: data?.first_names },
          { label: 'Fecha de nacimiento', value: data?.date_of_birth },
          { label: 'Lugar de nacimiento', value: data?.place_of_birth },
          { label: 'País de nacimiento', value: data?.country_of_birth },
          { label: 'Nacionalidad actual', value: data?.current_nationality },
          { label: 'Sexo', value: data?.sex },
          { label: 'Estado civil', value: data?.civil_status },
        ]
      },
      {
        title: '2. Documento de Viaje',
        rows: [
          { label: 'Tipo', value: data?.travel_document_type },
          { label: 'Número', value: data?.passport_number },
          { label: 'Emisión', value: data?.passport_issue_date },
          { label: 'Expiración', value: data?.passport_expiry_date },
          { label: 'País Emisor', value: data?.passport_issuing_country },
        ]
      },
      {
        title: '3. Contacto y Residencia',
        rows: [
          { label: 'Dirección', value: data?.home_address },
          { label: 'Email', value: data?.home_email },
          { label: 'Teléfono', value: data?.home_phone },
          { label: 'Ocupación', value: data?.current_occupation },
        ]
      },
      {
        title: '4. Viaje',
        rows: [
          { label: 'Propósito', value: data?.purpose_of_journey },
          { label: 'Destino', value: data?.member_state_destination },
          { label: 'Primera Entrada', value: data?.member_state_first_entry },
          { label: 'Entradas', value: data?.number_of_entries },
          { label: 'Duración (días)', value: data?.duration_of_stay_days },
          { label: 'Llegada', value: data?.intended_arrival_date },
          { label: 'Salida', value: data?.intended_departure_date },
        ]
      }
    ]

    photos = [
      { label: 'Pasaporte', dataUri: photoUrls.passport, hasPhotoField: !!data?.passport_file_url },
      { label: 'Foto', dataUri: photoUrls.photo, hasPhotoField: !!data?.photo_file_url },
    ]
  }

  const pdfElement = React.createElement(ApplicationPDF, { title, subtitle, sections, photos })
  const buffer = await renderToBuffer(pdfElement as any)
  return buffer
}
