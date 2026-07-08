const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../app/aplicar/turismo-australia');
const schemasPath = path.join(targetDir, '_schemas/index.ts');
const componentsDir = path.join(targetDir, '_components');

// Ensure directories exist
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// Write the schemas file
const schemasContent = `
import * as z from 'zod'

export const step1Schema = z.object({
  terms_accepted: z.boolean().refine(val => val === true, { message: "Debes aceptar los términos" }),
  currently_outside_australia: z.boolean({ required_error: "Requerido" }),
  current_location_country: z.string().min(1, "Requerido"),
  current_location_legal_status: z.string().min(1, "Requerido"),
  visa_stream: z.string().default('tourist'),
  reasons_for_visit: z.array(z.string()).min(1, "Selecciona al menos un motivo"),
  significant_dates_details: z.string().optional(),
  group_processing: z.boolean({ required_error: "Requerido" }),
  special_category_entry: z.boolean({ required_error: "Requerido" }),
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
  has_national_id: z.boolean({ required_error: "Requerido" }),
  nid_family_name: z.string().optional(),
  nid_given_names: z.string().optional(),
  nid_number: z.string().optional(),
  nid_country_of_issue: z.string().optional(),
  nid_issue_date: z.string().optional(),
  nid_expiry_date: z.string().optional(),
  pacific_australia_card: z.boolean({ required_error: "Requerido" }),
  birth_town_city: z.string().min(1, "Requerido"),
  birth_state_province: z.string().min(1, "Requerido"),
  country_of_birth: z.string().min(1, "Requerido"),
  relationship_status: z.string().min(1, "Requerido"),
  has_other_names: z.boolean({ required_error: "Requerido" }),
  other_names_list: z.array(z.object({
    family_name: z.string(), given_names: z.string()
  })).optional(),
  citizen_of_passport_country: z.boolean({ required_error: "Requerido" }),
  citizen_other_country: z.boolean({ required_error: "Requerido" }),
  other_citizenships: z.array(z.any()).optional(),
  previous_travel_australia: z.boolean({ required_error: "Requerido" }),
  previously_applied_australia_visa: z.boolean({ required_error: "Requerido" }),
  has_grant_number: z.boolean().optional(),
  grant_number: z.string().optional(),
  other_travel_documents: z.boolean({ required_error: "Requerido" }),
  other_travel_documents_details: z.string().optional(),
  other_identity_documents: z.boolean({ required_error: "Requerido" }),
  other_identity_documents_details: z.string().optional(),
  health_exam_last_12_months: z.boolean({ required_error: "Requerido" }),
});

export const step4Schema = z.object({
  usual_country_of_residence: z.string().min(1, "Requerido"),
  department_office: z.string().min(1, "Requerido"),
  res_country: z.string().min(1, "Requerido"),
  res_address: z.string().min(1, "Requerido"),
  res_suburb: z.string().min(1, "Requerido"),
  res_state: z.string().min(1, "Requerido"),
  res_postcode: z.string().optional(),
  phone_home: z.string().optional(),
  phone_business: z.string().optional(),
  phone_mobile: z.string().min(1, "Requerido"),
  postal_same_as_residential: z.boolean({ required_error: "Requerido" }),
  postal_country: z.string().optional(),
  postal_address: z.string().optional(),
  postal_suburb: z.string().optional(),
  postal_state: z.string().optional(),
  postal_postcode: z.string().optional(),
  email: z.string().email("Email inválido"),
  has_authorised_recipient: z.boolean({ required_error: "Requerido" }),
  authorised_recipient: z.any().optional(),
  correspondence_email: z.string().email("Email inválido").optional(),
});

export const step5Schema = z.object({
  travelling_with_others: z.boolean({ required_error: "Requerido" }),
  travelling_companions: z.array(z.any()).optional(),
});

export const step6Schema = z.object({
  has_non_accompanying_family: z.boolean({ required_error: "Requerido" }),
  non_accompanying_family: z.array(z.any()).optional(),
});

export const step7Schema = z.object({
  multiple_entries: z.boolean({ required_error: "Requerido" }),
  length_of_stay: z.string().min(1, "Requerido"),
  planned_arrival_date: z.string().min(1, "Requerido"),
  planned_departure_date: z.string().min(1, "Requerido"),
  study_in_australia: z.boolean({ required_error: "Requerido" }),
  study_details: z.string().optional(),
  will_visit_contacts: z.boolean({ required_error: "Requerido" }),
  contacts_in_australia: z.array(z.any()).optional(),
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
  supporter: z.any().optional(),
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
  holds_other_visa: z.boolean({ required_error: "Requerido" }),
  visa_history_details: z.string().optional(),
  visa_non_compliance: z.boolean({ required_error: "Requerido" }),
  visa_non_compliance_details: z.string().optional(),
  visa_refused_cancelled: z.boolean({ required_error: "Requerido" }),
  visa_refused_details: z.string().optional(),
});

export const step13Schema = z.object({
  declarations_consents: z.any().optional(),
});

export const step14Schema = z.object({
  doc_passport_current: z.string().min(1, "Requerido"),
  doc_passport_old: z.string().optional(),
  doc_passport_stamp_pages: z.string().optional(),
  doc_national_id: z.string().optional(),
  doc_usa_visa: z.string().optional(),
  doc_civil_registry: z.string().optional(),
  doc_children_civil_registries: z.array(z.string()).optional(),
  doc_residence_letter: z.string().optional(),
  doc_property_certificates: z.array(z.string()).optional(),
  doc_vehicle_ownership: z.string().optional(),
  doc_bank_statements: z.array(z.string()).optional(),
  doc_pension_proof: z.string().optional(),
  doc_itinerary: z.string().optional(),
  host_doc_passport_id: z.string().optional(),
  host_doc_australian_visa: z.string().optional(),
  host_doc_proof_of_address: z.string().optional(),
  host_doc_relationship_evidence: z.string().optional(),
  host_doc_payslips: z.array(z.string()).optional(),
  host_doc_employment_letter: z.string().optional(),
  host_doc_bank_statements: z.array(z.string()).optional(),
  host_doc_savings: z.string().optional(),
  host_doc_tenancy_agreement: z.string().optional(),
  host_doc_sponsor_letter: z.string().optional(),
  host_doc_activity_plan: z.string().optional(),
});
`;

fs.writeFileSync(schemasPath, schemasContent);
console.log('Schemas generated');
