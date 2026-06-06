import * as z from 'zod'
import { parseISO } from 'date-fns'

const requiredString = z.string().min(1, 'Este campo es requerido')
const requiredDate = z.string().min(1, 'La fecha es requerida')
const optionalString = z.string().optional()
const requiredBooleanEnum = z.enum(['true', 'false'], { errorMap: () => ({ message: 'Debes responder esta pregunta' }) })

export const step1Schema = z.object({
  purpose_of_visit: requiredString,
  proposed_entry_date: requiredDate,
  proposed_exit_date: requiredDate,
  visited_uk_before: requiredBooleanEnum,
  visited_uk_details: optionalString,
  has_uk_contacts: requiredBooleanEnum,
  uk_contacts: z.array(z.object({
    name: requiredString,
    address: requiredString,
    relationship: requiredString
  })).optional()
}).superRefine((data, ctx) => {
  if (data.proposed_entry_date && data.proposed_exit_date) {
    if (parseISO(data.proposed_exit_date) <= parseISO(data.proposed_entry_date)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La fecha de salida debe ser posterior a la de entrada', path: ['proposed_exit_date'] })
    }
  }
  if (data.visited_uk_before === 'true' && !data.visited_uk_details?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['visited_uk_details'] })
  }
  if (data.has_uk_contacts === 'true') {
    if (!data.uk_contacts || data.uk_contacts.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debes añadir al menos un contacto', path: ['uk_contacts'] })
    }
  }
})

export const step2Schema = z.object({
  first_name: requiredString,
  last_name: requiredString,
  other_names_used: optionalString,
  date_of_birth: requiredDate,
  place_of_birth: requiredString,
  country_of_birth: requiredString,
  gender: requiredString,
  passport_number: requiredString,
  passport_issue_date: requiredDate,
  passport_expiry_date: requiredDate,
  passport_issuing_country: requiredString,
  passport_issuing_authority: requiredString
})

export const step3Schema = z.object({
  current_nationality: requiredString,
  has_other_nationality: requiredBooleanEnum,
  other_nationality: optionalString,
  has_national_id: requiredBooleanEnum,
  national_id_number: optionalString,
  country_of_residence: requiredString,
  time_in_current_residence: requiredString
}).superRefine((data, ctx) => {
  if (data.has_other_nationality === 'true' && !data.other_nationality?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['other_nationality'] })
  }
  if (data.has_national_id === 'true' && !data.national_id_number?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['national_id_number'] })
  }
})

export const step4Schema = z.object({
  residential_address_line1: requiredString,
  residential_address_line2: optionalString,
  residential_city: requiredString,
  residential_state: requiredString,
  residential_postal_code: requiredString,
  residential_country: requiredString,
  time_at_current_address: requiredString,
  phone: requiredString,
  email: z.string().email('Email inválido')
})

export const step5Schema = z.object({
  occupation_status: requiredString,
  employer_name: optionalString,
  employer_address: optionalString,
  job_title: optionalString,
  monthly_income: optionalString,
  monthly_income_currency: optionalString,
  available_funds_gbp: requiredString,
  trip_financed_by_other: requiredBooleanEnum,
  trip_financer_details: optionalString
}).superRefine((data, ctx) => {
  if (data.occupation_status === 'Employed' || data.occupation_status === 'Self-employed') {
    if (!data.employer_name?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['employer_name'] })
    if (!data.job_title?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['job_title'] })
    if (!data.monthly_income?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['monthly_income'] })
    if (!data.monthly_income_currency?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['monthly_income_currency'] })
  }
  if (data.trip_financed_by_other === 'true' && !data.trip_financer_details?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['trip_financer_details'] })
  }
})

export const step6Schema = z.object({
  travel_history: z.array(z.object({
    country: requiredString,
    date: requiredDate,
    purpose: requiredString,
    duration: requiredString
  })).optional(),
  has_valid_visa: requiredBooleanEnum,
  valid_visas: z.array(z.object({
    country: requiredString,
    visa_number: requiredString,
    expiry_date: requiredDate
  })).optional()
}).superRefine((data, ctx) => {
  if (data.has_valid_visa === 'true') {
    if (!data.valid_visas || data.valid_visas.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debes añadir al menos una visa', path: ['valid_visas'] })
    }
  }
})

export const step7Schema = z.object({
  visa_refused_before: requiredBooleanEnum,
  visa_refusal_details: optionalString,
  deported_or_removed: requiredBooleanEnum,
  deportation_details: optionalString,
  criminal_conviction: requiredBooleanEnum,
  criminal_conviction_details: optionalString
}).superRefine((data, ctx) => {
  if (data.visa_refused_before === 'true' && !data.visa_refusal_details?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['visa_refusal_details'] })
  }
  if (data.deported_or_removed === 'true' && !data.deportation_details?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['deportation_details'] })
  }
  if (data.criminal_conviction === 'true' && !data.criminal_conviction_details?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['criminal_conviction_details'] })
  }
})

export const step8Schema = z.object({
  marital_status: requiredString,
  spouse_first_name: optionalString,
  spouse_last_name: optionalString,
  spouse_date_of_birth: optionalString,
  spouse_nationality: optionalString,
  spouse_traveling: optionalString,
  has_children: requiredBooleanEnum,
  children: z.array(z.object({
    name: requiredString,
    date_of_birth: requiredDate,
    traveling: requiredString
  })).optional()
}).superRefine((data, ctx) => {
  if (['Married', 'Common Law', 'Casado(a)', 'Unión libre'].includes(data.marital_status)) {
    if (!data.spouse_first_name?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_first_name'] })
    if (!data.spouse_last_name?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_last_name'] })
    if (!data.spouse_date_of_birth?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_date_of_birth'] })
    if (!data.spouse_nationality?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_nationality'] })
    if (!data.spouse_traveling?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_traveling'] })
  }
  if (data.has_children === 'true') {
    if (!data.children || data.children.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debes añadir al menos un hijo', path: ['children'] })
    }
  }
})

export const step9Schema = z.object({
  has_tuberculosis: requiredBooleanEnum,
  tuberculosis_details: optionalString,
  requires_medical_treatment: requiredBooleanEnum,
  medical_treatment_details: optionalString
}).superRefine((data, ctx) => {
  if (data.has_tuberculosis === 'true' && !data.tuberculosis_details?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['tuberculosis_details'] })
  }
  if (data.requires_medical_treatment === 'true' && !data.medical_treatment_details?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['medical_treatment_details'] })
  }
})

export const step10Schema = z.object({
  passport_file_url: requiredString,
  photo_file_url: requiredString,
  bank_statements_url: z.union([z.string(), z.array(z.string())]).optional(),
  employment_proof_url: optionalString,
  ties_proof_url: optionalString,
  other_visa_url: optionalString,
  itinerary_url: optionalString,
  documents: z.array(z.object({
    type: requiredString,
    name: requiredString,
    url: requiredString,
    uploaded_at: requiredString
  })).optional()
})
