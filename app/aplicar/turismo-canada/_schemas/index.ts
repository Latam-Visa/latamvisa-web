import * as z from 'zod'
import { differenceInYears, parseISO } from 'date-fns'

const requiredString = z.string().min(1, 'Este campo es requerido')
const requiredDate = z.string().min(1, 'La fecha es requerida')
const optionalString = z.string().optional()
const requiredBooleanEnum = z.enum(['true', 'false'], { error: 'Debes responder esta pregunta' })

export const step1Schema = z.object({
  apply_for: requiredString,
  visa_reason: requiredString,
  activities_in_canada: requiredString.max(475, 'Máximo 475 caracteres'),
  entry_date: requiredDate,
  leave_date: requiredDate,
  uci: optionalString,
  applying_on_behalf: requiredBooleanEnum,
}).superRefine((data, ctx) => {
  if (data.entry_date && data.leave_date) {
    if (parseISO(data.leave_date) <= parseISO(data.entry_date)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La fecha de salida debe ser posterior a la de entrada', path: ['leave_date'] })
    }
  }
})

export const step2Schema = z.object({
  surname: requiredString,
  given_name: optionalString,
  date_of_birth: requiredDate,
  gender: requiredString,
  document_type: requiredString,
  passport_kind: requiredString,
  passport_country_code: requiredString,
  passport_nationality: requiredString,
  passport_number: requiredString,
  passport_number_confirm: requiredString,
  passport_issue_date: requiredDate,
  passport_expiry_date: requiredDate,
  us_green_card: requiredBooleanEnum,
  held_canadian_visa_10y: requiredBooleanEnum,
  holds_us_nonimmigrant_visa: requiredBooleanEnum,
  us_visa_number: optionalString,
  us_visa_expiry: optionalString,
  different_passport_us_visa: optionalString,
  travelling_by_air: requiredBooleanEnum,
}).superRefine((data, ctx) => {
  if (data.passport_number !== data.passport_number_confirm) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Los números de pasaporte no coinciden', path: ['passport_number_confirm'] })
  }
  if (data.holds_us_nonimmigrant_visa === 'true') {
    if (!data.us_visa_number?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['us_visa_number'] })
    if (!data.us_visa_expiry?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['us_visa_expiry'] })
    if (!data.different_passport_us_visa?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debes responder', path: ['different_passport_us_visa'] })
  }
})

export const step3Schema = z.object({
  birth_country: requiredString,
  birth_city: requiredString,
  multiple_citizenship: requiredBooleanEnum,
  citizenship_country: requiredString,
  citizen_since_birth: requiredBooleanEnum,
  citizen_since_date: optionalString,
  has_national_id: requiredBooleanEnum,
  national_id_number: optionalString,
  national_id_issue_date: optionalString,
  national_id_country: optionalString,
  used_other_name: requiredBooleanEnum,
  other_names: z.array(z.object({
    surname: requiredString,
    given_name: optionalString
  })).optional()
}).superRefine((data, ctx) => {
  if (data.citizen_since_birth === 'false' && !data.citizen_since_date?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['citizen_since_date'] })
  }
  if (data.has_national_id === 'true') {
    if (!data.national_id_number?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['national_id_number'] })
    if (!data.national_id_issue_date?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['national_id_issue_date'] })
    if (!data.national_id_country?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['national_id_country'] })
  }
  if (data.used_other_name === 'true') {
    if (!data.other_names || data.other_names.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debes añadir al menos un nombre', path: ['other_names'] })
    }
  }
})

export const step4Schema = z.object({
  residential_country: requiredString,
  residential_street: requiredString,
  residential_city: requiredString,
  residential_postal_code: optionalString,
  mailing_same: requiredBooleanEnum,
  mailing_country: optionalString,
  mailing_street: optionalString,
  mailing_city: optionalString,
  mailing_postal_code: optionalString,
  residence_history: z.array(z.object({
    country: requiredString,
    status: requiredString,
    status_other_detail: optionalString,
    from: requiredDate,
    to: requiredDate
  })).min(1, 'Debes añadir al menos un registro'),
  provided_biometrics_10y: requiredBooleanEnum
}).superRefine((data, ctx) => {
  if (data.mailing_same === 'false') {
    if (!data.mailing_country?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['mailing_country'] })
    if (!data.mailing_street?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['mailing_street'] })
    if (!data.mailing_city?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['mailing_city'] })
  }
})

export const step5Schema = z.object({
  funds_cad: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Debe ser un valor positivo'),
  someone_else_funding: requiredBooleanEnum,
  studied_postsecondary: requiredBooleanEnum,
  education_history: z.array(z.object({
    school: requiredString,
    from: requiredDate,
    to: requiredDate,
    level: requiredString,
    field: requiredString,
    country: requiredString,
    street: requiredString,
    city: requiredString
  })).optional(),
  military_service: requiredBooleanEnum,
  military_details: z.array(z.any()).optional(), // Assuming similar structure, left flexible
  work_history: z.array(z.object({
    activity: requiredString,
    job_title: optionalString,
    employer: optionalString,
    duties: optionalString,
    country: requiredString,
    street: requiredString,
    city: requiredString,
    from: requiredDate,
    to: optionalString,
    ongoing: z.boolean().optional()
  })).min(1, 'Debes añadir al menos un registro')
}).superRefine((data, ctx) => {
  if (data.studied_postsecondary === 'true' && (!data.education_history || data.education_history.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debes añadir al menos un registro educativo', path: ['education_history'] })
  }
  // If unemployed, job_title, employer, duties are optional. Else required.
  data.work_history.forEach((work, idx) => {
    const isUnemployed = work.activity === 'Unemployed' || work.activity === 'Retired' || work.activity === 'Student';
    if (!isUnemployed) {
      if (!work.job_title?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['work_history', idx, 'job_title'] })
      if (!work.employer?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['work_history', idx, 'employer'] })
      if (!work.duties?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['work_history', idx, 'duties'] })
    }
    if (!work.ongoing && !work.to?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La fecha es requerida', path: ['work_history', idx, 'to'] })
    }
  })
})

export const step6Schema = z.object({
  travelled_past_5y: requiredBooleanEnum,
  travel_history: z.array(z.object({
    from: requiredDate,
    to: requiredDate,
    country: requiredString,
    location: requiredString,
    purpose: requiredString
  })).optional(),
  stayed_illegally_canada: requiredBooleanEnum,
  refused_visa: requiredBooleanEnum,
  refusal_details: optionalString
}).superRefine((data, ctx) => {
  if (data.travelled_past_5y === 'true' && (!data.travel_history || data.travel_history.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Añade tu historial de viaje', path: ['travel_history'] })
  }
  if (data.refused_visa === 'true') {
    if (!data.refusal_details?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['refusal_details'] })
    } else if (data.refusal_details.length > 500) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Máximo 500 caracteres', path: ['refusal_details'] })
    }
  }
})

export const step7Schema = z.object({
  committed_crime: requiredBooleanEnum,
  arrested: requiredBooleanEnum,
  charged: requiredBooleanEnum,
  convicted: requiredBooleanEnum,
  violent_political_group: requiredBooleanEnum,
  witnessed_ill_treatment: requiredBooleanEnum
})

export const step8Schema = z.object({
  medical_exam_12m: requiredBooleanEnum,
  work_in_listed_jobs: requiredBooleanEnum,
  tb_diagnosed_2y: requiredBooleanEnum,
  tb_contact_5y: requiredBooleanEnum,
  dialysis: requiredBooleanEnum,
  drug_alcohol_addiction: requiredBooleanEnum,
  mental_health_condition: requiredBooleanEnum,
  syphilis: requiredBooleanEnum
})

export const step9Schema = z.object({
  marital_status: requiredString,
  marriage_date: optionalString,
  spouse_surname: optionalString,
  spouse_given_name: optionalString,
  spouse_date_of_birth: optionalString,
  spouse_birth_country: optionalString,
  spouse_occupation: optionalString,
  spouse_address_same: optionalString,
  spouse_accompany: optionalString,
  has_children: requiredBooleanEnum,
  children: z.array(z.object({
    last_name: requiredString,
    first_name: requiredString,
    dob: requiredDate,
    relationship: requiredString,
    birth_country: requiredString
  })).optional(),
  parents: z.array(z.object({
    surname: requiredString,
    given_name: requiredString,
    relationship: requiredString,
    dob: requiredDate,
    birth_country: requiredString,
    occupation: requiredString,
    address_same: requiredString,
    country: optionalString, // Required if address_same is false
    street: optionalString,
    city: optionalString,
    accompany: requiredString
  })).min(2, 'Debes añadir la información de ambos padres')
}).superRefine((data, ctx) => {
  if (['Married', 'Common Law', 'Casado(a)', 'Unión libre'].includes(data.marital_status)) {
    if (!data.marriage_date?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['marriage_date'] })
    if (!data.spouse_surname?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_surname'] })
    if (!data.spouse_date_of_birth?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_date_of_birth'] })
    if (!data.spouse_birth_country?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_birth_country'] })
    if (!data.spouse_occupation?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_occupation'] })
    if (!data.spouse_address_same?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_address_same'] })
    if (!data.spouse_accompany?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['spouse_accompany'] })
  }
  if (data.has_children === 'true' && (!data.children || data.children.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Debes añadir al menos un hijo', path: ['children'] })
  }
  data.parents.forEach((parent, idx) => {
    if (parent.address_same === 'false') {
      if (!parent.country?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['parents', idx, 'country'] })
      if (!parent.street?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['parents', idx, 'street'] })
      if (!parent.city?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo requerido', path: ['parents', idx, 'city'] })
    }
  })
})

export const step10Schema = z.object({
  native_language: requiredString,
  communicate_language: requiredString, // English/French/Both/Neither
  email: z.string().email('Email inválido'),
  email_confirm: z.string().email('Email inválido'),
  phones: z.array(z.object({
    type: requiredString,
    country: requiredString,
    dial_code: requiredString,
    number: requiredString,
    extension: optionalString
  })).min(1, 'Añade al menos un teléfono'),
  doc_id_passport: z.union([z.string(), z.array(z.string())]).refine(val => val.length > 0, 'Este campo es requerido'),
  doc_ties: requiredString,
  doc_bank_statements: optionalString,
  doc_travel_itinerary: requiredString,
  doc_forms_letters: optionalString,
  doc_us_visa: z.union([z.string(), z.array(z.string())]).optional()
}).superRefine((data, ctx) => {
  if (data.email !== data.email_confirm) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Los correos no coinciden', path: ['email_confirm'] })
  }
})

// Will add cross-step validation in page.tsx for the final formSchema to handle age-related bank statement require logic.
