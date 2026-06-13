import * as z from 'zod'

const req = { required_error: 'Este campo es obligatorio' }

export const step1Schema = z.object({
  surname: z.string(req).min(1, 'Obligatorio'),
  surname_at_birth: z.string(req).min(1, 'Obligatorio'),
  first_names: z.string(req).min(1, 'Obligatorio'),
  date_of_birth: z.string(req).min(1, 'Obligatorio'),
  place_of_birth: z.string(req).min(1, 'Obligatorio'),
  country_of_birth: z.string(req).min(1, 'Obligatorio'),
  current_nationality: z.string(req).min(1, 'Obligatorio'),
  nationality_at_birth: z.string().optional(),
  other_nationalities: z.string().optional(),
  sex: z.string(req).min(1, 'Obligatorio'),
  civil_status: z.string(req).min(1, 'Obligatorio'),
  civil_status_other: z.string().optional(),
  parental_authority_name: z.string().optional(),
  parental_authority_address: z.string().optional(),
  national_id_number: z.string().optional()
})

export const step2Schema = z.object({
  travel_document_type: z.string(req).min(1, 'Obligatorio'),
  travel_document_other: z.string().optional(),
  passport_number: z.string(req).min(1, 'Obligatorio'),
  passport_issue_date: z.string(req).min(1, 'Obligatorio'),
  passport_expiry_date: z.string(req).min(1, 'Obligatorio'),
  passport_issuing_country: z.string(req).min(1, 'Obligatorio')
})

export const step3Schema = z.object({
  home_address: z.string(req).min(1, 'Obligatorio'),
  home_email: z.string(req).email('Email inválido'),
  home_phone: z.string(req).min(1, 'Obligatorio'),
  residence_other_country: z.string(req).min(1, 'Obligatorio'),
  residence_permit_number: z.string().optional(),
  residence_permit_valid_until: z.string().optional(),
  current_occupation: z.string(req).min(1, 'Obligatorio'),
  employer_name: z.string().optional(),
  employer_address: z.string().optional(),
  employer_phone: z.string().optional()
})

export const step4Schema = z.object({
  purpose_of_journey: z.string(req).min(1, 'Obligatorio'),
  purpose_other: z.string().optional(),
  member_state_destination: z.string(req).min(1, 'Obligatorio'),
  additional_destinations: z.string().optional(),
  member_state_first_entry: z.string(req).min(1, 'Obligatorio'),
  number_of_entries: z.string(req).min(1, 'Obligatorio'),
  intended_arrival_date: z.string(req).min(1, 'Obligatorio'),
  intended_departure_date: z.string(req).min(1, 'Obligatorio'),
  duration_of_stay_days: z.string(req).min(1, 'Obligatorio')
})

export const step5Schema = z.object({
  previous_schengen_visas: z.string(req).min(1, 'Obligatorio'),
  previous_visas: z.array(z.object({
    date_from: z.string(),
    date_to: z.string(),
    sticker_number: z.string().optional()
  })).optional(),
  fingerprints_collected: z.string(req).min(1, 'Obligatorio'),
  fingerprints_date: z.string().optional(),
  final_destination_permit: z.string(req).min(1, 'Obligatorio'),
  final_permit_issued_by: z.string().optional(),
  final_permit_valid_from: z.string().optional(),
  final_permit_valid_until: z.string().optional()
})

export const step6Schema = z.object({
  inviting_person_or_hotel: z.string(req).min(1, 'Obligatorio'),
  inviting_address: z.string(req).min(1, 'Obligatorio'),
  inviting_phone: z.string(req).min(1, 'Obligatorio'),
  inviting_company: z.string().optional(),
  inviting_company_contact: z.string().optional(),
  costs_covered_by: z.string(req).min(1, 'Obligatorio'),
  sponsor_details: z.string().optional(),
  means_of_support: z.array(z.string()).optional()
})

export const step7Schema = z.object({
  eu_family_member: z.string(req).min(1, 'Obligatorio'),
  eu_family_surname: z.string().optional(),
  eu_family_first_name: z.string().optional(),
  eu_family_dob: z.string().optional(),
  eu_family_nationality: z.string().optional(),
  eu_family_doc_number: z.string().optional(),
  eu_family_relationship: z.string().optional()
})

export const step8Schema = z.object({
  travel_insurance_confirmed: z.boolean().refine(val => val === true, { message: 'Debes confirmar que cuentas con seguro.' }),
  proof_of_funds_eur: z.boolean().refine(val => val === true, { message: 'Debes confirmar fondos.' }),
  accommodation_proof: z.boolean().refine(val => val === true, { message: 'Debes confirmar alojamiento.' }),
  return_ticket_confirmed: z.boolean().refine(val => val === true, { message: 'Debes confirmar boleto.' }),
  ties_to_home_country: z.boolean().refine(val => val === true, { message: 'Debes confirmar arraigo.' }),
  place_and_date: z.string(req).min(1, 'Obligatorio'),
  signature_confirmed: z.boolean().refine(val => val === true, { message: 'Debes firmar.' })
})

export const step9Schema = z.object({
  passport_file_url: z.string().optional(),
  photo_file_url: z.string().optional(),
  travel_insurance_url: z.string().optional(),
  bank_statements_url: z.array(z.string()).optional(),
  accommodation_url: z.string().optional(),
  flight_itinerary_url: z.string().optional(),
  employment_proof_url: z.string().optional(),
  ties_proof_url: z.string().optional(),
  documents: z.array(z.object({ name: z.string(), url: z.string() })).optional()
})
