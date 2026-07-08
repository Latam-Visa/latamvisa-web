
import * as z from 'zod'

const booleanRadio = z.preprocess(
  (val) => val === 'true' || val === true ? true : val === 'false' || val === false ? false : val,
  z.boolean({ required_error: "Requerido", invalid_type_error: "Requerido" })
);


export const step1Schema = z.object({
  terms_accepted: z.preprocess((val) => val === "true" || val === true ? true : val === "false" || val === false ? false : val, z.boolean()).refine(val => val === true, { message: "Debes aceptar los términos" }),
  currently_outside_australia: booleanRadio,
  current_location_country: z.string().min(1, "Requerido"),
  current_location_legal_status: z.string().min(1, "Requerido"),
  visa_stream: z.string().default('tourist'),
  reasons_for_visit: z.array(z.string()).min(1, "Selecciona al menos un motivo"),
  significant_dates_details: z.string().optional(),
  group_processing: booleanRadio,
  group_processing_details: z.string().optional(),
  special_category_entry: booleanRadio,
  special_category_entry_details: z.string().optional(),
});

export const step2Schema = z.object({
  family_name: z.string().min(1, "Requerido"),
  given_names: z.string().min(1, "Requerido"),
  sex: z.string().min(1, "Requerido"),
  date_of_birth: z.string().min(1, "Requerido"),
  passport_number: z.string().min(1, "Requerido"),
  country_of_passport: z.string().min(1, "Requerido"),
  nationality_passport_holder: z.string().min(1, "Requerido"),
  passport_issue_date: z.string().min(1, "Requerido"),
  passport_expiry_date: z.string().min(1, "Requerido"),
  passport_place_of_issue: z.string().min(1, "Requerido"),
});

export const step3Schema = z.object({
  has_national_id: booleanRadio.optional(),
  doc_national_id_url: z.string().optional(),
  nid_family_name: z.string().optional(),
  nid_given_names: z.string().optional(),
  nid_number: z.string().optional(),
  nid_country_of_issue: z.string().optional(),
  nid_issue_date: z.string().optional(),
  nid_expiry_date: z.string().optional(),
  pacific_australia_card: booleanRadio,
  pacific_australia_card_number: z.string().optional(),
  birth_town_city: z.string().min(1, "Requerido"),
  birth_state_province: z.string().min(1, "Requerido"),
  country_of_birth: z.string().min(1, "Requerido"),
  relationship_status: z.string().min(1, "Requerido"),
  has_other_names: booleanRadio,
  other_names_list: z.array(z.object({
    family_name: z.string(), given_names: z.string()
  })).optional(),
  citizen_of_passport_country: booleanRadio,
  citizen_other_country: booleanRadio,
  other_citizenships: z.array(z.any()).optional(),
  previous_travel_australia: booleanRadio,
  previous_travel_details: z.string().optional(),
  previously_applied_australia_visa: booleanRadio,
  has_grant_number: z.preprocess((val) => val === "true" || val === true ? true : val === "false" || val === false ? false : val, z.boolean().optional()),
  grant_number: z.string().optional(),
  other_travel_documents: booleanRadio,
  other_travel_documents_details: z.string().optional(),
  other_identity_documents: booleanRadio,
  other_identity_documents_details: z.string().optional(),
  health_exam_last_12_months: booleanRadio,
});

export const step4Schema = z.object({
  usual_country_of_residence: z.string().min(1, "Requerido"),
  department_office: z.string().optional(),
  res_country: z.string().min(1, "Requerido"),
  res_address: z.string().min(1, "Requerido"),
  res_suburb: z.string().min(1, "Requerido"),
  res_state: z.string().min(1, "Requerido"),
  res_postcode: z.string().optional(),
  phone_home: z.string().optional(),
  phone_business: z.string().optional(),
  phone_mobile: z.string().min(1, "Requerido"),
  postal_same_as_residential: booleanRadio,
  postal_country: z.string().optional(),
  postal_address: z.string().optional(),
  postal_suburb: z.string().optional(),
  postal_state: z.string().optional(),
  postal_postcode: z.string().optional(),
  email: z.string().email("Email inválido"),
  has_authorised_recipient: booleanRadio,
  authorised_recipient_details: z.string().optional(),
  correspondence_email: z.string().email("Email inválido").optional(),
});

export const step5Schema = z.object({
  travelling_with_others: booleanRadio,
  travelling_companions_details: z.string().optional(),
});

export const step6Schema = z.object({
  has_non_accompanying_family: booleanRadio,
  non_accompanying_family: z.array(z.any()).optional(),
});

export const step7Schema = z.object({
  multiple_entries: booleanRadio,
  length_of_stay: z.string().min(1, "Requerido"),
  planned_arrival_date: z.string().min(1, "Requerido"),
  planned_departure_date: z.string().min(1, "Requerido"),
  study_in_australia: booleanRadio,
  study_details: z.string().optional(),
  will_visit_contacts: booleanRadio,
  contacts_in_australia_details: z.string().optional(),
});

export const step8Schema = z.object({
  employment_status: z.string().min(1, "Requerido"),
  employer_name: z.string().optional(),
  occupation: z.string().optional(),
  employer_address: z.string().optional(),
  work_phone: z.string().optional(),
  monthly_income: z.string().optional(),
  retirement_date: z.string().optional(),
  business_details: z.string().optional(),
});

export const step9Schema = z.object({
  funding_type: z.string().min(1, "Requerido"),
  support_type: z.string().min(1, "Requerido"),
  funds_available_details: z.string().min(1, "Requerido"),
  supporter_details: z.string().optional(),
});

export const step10Schema = z.object({
  health_declarations: z.any().optional(),
  health_details: z.string().optional(),
});

export const step11Schema = z.object({
  character_declarations: z.any().optional(),
  character_details: z.string().optional(),
});

export const step12Schema = z.object({
  holds_other_visa: booleanRadio,
  visa_history_details: z.string().optional(),
  visa_non_compliance: booleanRadio,
  visa_non_compliance_details: z.string().optional(),
  visa_refused_cancelled: booleanRadio,
  visa_refused_details: z.string().optional(),
});

export const step13Schema = z.object({
  declarations_consents: z.any().optional(),
});

export const step14Schema = z.object({
  doc_group1_arraigo: z.array(z.string()).optional(),
  doc_group2_fondos: z.array(z.string()).optional(),
  doc_group3_viajes: z.array(z.string()).optional(),
});
