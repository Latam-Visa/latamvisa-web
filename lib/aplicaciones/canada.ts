// Guardado de la aplicación de Canadá + tareas posteriores.
// Orden: normalizar -> guardar en Supabase -> responder. Emails, PDF y la
// carta con IA corren después (ver segundo-plano.ts) y nunca bloquean.

import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { generateApplicationPdf } from '@/lib/pdf/generate-pdf'
import { getClientConfirmationEmail } from '@/lib/emails/client-confirmation'
import { generateIntentionLetterBg } from '@/app/aplicar/turismo-canada/_actions/generate-intention-letter'
import { aBool, aEntero, aFechaISO, vacioANull, type Ajustes } from './normalizar'
import { enSegundoPlano } from './segundo-plano'

const TABLA = 'visa_applications_canada'
const FROM_EMAIL = 'noreply@latamvisatravel.com'
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || 'future@latamvisas.com.au'

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export interface EnvioCanada {
  // UUID generado en el navegador al primer intento; es el id de la fila,
  // así un doble clic o un reintento no crean duplicados.
  submissionId: string
  data: any
  passportScanPath?: string | null
}

export function contactoDe(data: any) {
  const nombre = [data?.step2?.given_name, data?.step2?.surname].filter(Boolean).join(' ') || null
  return { nombre, email: data?.step10?.email || null }
}

export function construirFila({ submissionId, data, passportScanPath }: EnvioCanada) {
  const ajustes: Ajustes = []
  const s = (n: number) => (data?.[`step${n}`] || {}) as Record<string, any>
  const [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s)
  const txt = (v: unknown) => vacioANull(v) as string | null
  const json = (v: unknown) => vacioANull(v ?? [])
  const fecha = (v: unknown, campo: string) => aFechaISO(v, campo, ajustes)
  const boolOpcional = (v: unknown) => (v === undefined || v === null || v === '' ? null : aBool(v))

  const fila = {
    id: submissionId,
    status: 'pending',

    // Paso 1
    apply_for: txt(s1.apply_for),
    visa_reason: txt(s1.visa_reason),
    activities_in_canada: txt(s1.activities_in_canada),
    entry_date: fecha(s1.entry_date, 'entry_date'),
    leave_date: fecha(s1.leave_date, 'leave_date'),
    uci: txt(s1.uci),
    applying_on_behalf: aBool(s1.applying_on_behalf),

    // Paso 2
    surname: txt(s2.surname),
    given_name: txt(s2.given_name),
    date_of_birth: fecha(s2.date_of_birth, 'date_of_birth'),
    gender: txt(s2.gender),
    document_type: txt(s2.document_type),
    passport_kind: txt(s2.passport_kind),
    passport_country_code: txt(s2.passport_country_code),
    passport_nationality: txt(s2.passport_nationality),
    passport_number: txt(s2.passport_number),
    passport_issue_date: fecha(s2.passport_issue_date, 'passport_issue_date'),
    passport_expiry_date: fecha(s2.passport_expiry_date, 'passport_expiry_date'),
    us_green_card: aBool(s2.us_green_card),
    held_canadian_visa_10y: aBool(s2.held_canadian_visa_10y),
    holds_us_nonimmigrant_visa: aBool(s2.holds_us_nonimmigrant_visa),
    us_visa_number: txt(s2.us_visa_number),
    us_visa_expiry: fecha(s2.us_visa_expiry, 'us_visa_expiry'),
    different_passport_us_visa: boolOpcional(s2.different_passport_us_visa),
    travelling_by_air: aBool(s2.travelling_by_air),

    // Paso 3
    birth_country: txt(s3.birth_country),
    birth_city: txt(s3.birth_city),
    multiple_citizenship: aBool(s3.multiple_citizenship),
    citizenship_country: txt(s3.citizenship_country),
    citizen_since_birth: aBool(s3.citizen_since_birth),
    citizen_since_date: fecha(s3.citizen_since_date, 'citizen_since_date'),
    has_national_id: aBool(s3.has_national_id),
    national_id_number: txt(s3.national_id_number),
    national_id_issue_date: fecha(s3.national_id_issue_date, 'national_id_issue_date'),
    national_id_country: txt(s3.national_id_country),
    used_other_name: aBool(s3.used_other_name),
    other_names: json(s3.other_names),

    // Paso 4
    residential_country: txt(s4.residential_country),
    residential_street: txt(s4.residential_street),
    residential_city: txt(s4.residential_city),
    residential_postal_code: txt(s4.residential_postal_code),
    mailing_same: aBool(s4.mailing_same),
    mailing_country: txt(s4.mailing_country),
    mailing_street: txt(s4.mailing_street),
    mailing_city: txt(s4.mailing_city),
    mailing_postal_code: txt(s4.mailing_postal_code),
    residence_history: json(s4.residence_history),
    provided_biometrics_10y: aBool(s4.provided_biometrics_10y),

    // Paso 5 (funds_cad es integer en la base: se redondea)
    funds_cad: aEntero(s5.funds_cad, 'funds_cad', ajustes),
    someone_else_funding: aBool(s5.someone_else_funding),
    funding_details: txt(s5.funding_details),
    studied_postsecondary: aBool(s5.studied_postsecondary),
    education_history: json(s5.education_history),
    military_service: aBool(s5.military_service),
    military_area: boolOpcional(s5.military_area),
    military_details: json(s5.military_details),
    work_history: json(s5.work_history),

    // Paso 6
    travelled_past_5y: aBool(s6.travelled_past_5y),
    travel_history: json(s6.travel_history),
    stayed_illegally_canada: aBool(s6.stayed_illegally_canada),
    refused_visa: aBool(s6.refused_visa),
    refusal_details: txt(s6.refusal_details),

    // Paso 7
    committed_crime: aBool(s7.committed_crime),
    arrested: aBool(s7.arrested),
    charged: aBool(s7.charged),
    convicted: aBool(s7.convicted),
    violent_political_group: aBool(s7.violent_political_group),
    witnessed_ill_treatment: aBool(s7.witnessed_ill_treatment),

    // Paso 8
    medical_exam_12m: aBool(s8.medical_exam_12m),
    work_in_listed_jobs: aBool(s8.work_in_listed_jobs),
    tb_diagnosed_2y: aBool(s8.tb_diagnosed_2y),
    tb_contact_5y: aBool(s8.tb_contact_5y),
    dialysis: aBool(s8.dialysis),
    drug_alcohol_addiction: aBool(s8.drug_alcohol_addiction),
    mental_health_condition: aBool(s8.mental_health_condition),
    syphilis: aBool(s8.syphilis),

    // Paso 9
    marital_status: txt(s9.marital_status),
    marriage_date: fecha(s9.marriage_date, 'marriage_date'),
    spouse_surname: txt(s9.spouse_surname),
    spouse_given_name: txt(s9.spouse_given_name),
    spouse_date_of_birth: fecha(s9.spouse_date_of_birth, 'spouse_date_of_birth'),
    spouse_birth_country: txt(s9.spouse_birth_country),
    spouse_occupation: txt(s9.spouse_occupation),
    spouse_address_same: boolOpcional(s9.spouse_address_same),
    spouse_accompany: boolOpcional(s9.spouse_accompany),
    has_children: aBool(s9.has_children),
    children: json(s9.children),
    parents: json(s9.parents),

    // Paso 10
    native_language: txt(s10.native_language),
    communicate_language: txt(s10.communicate_language),
    email: txt(s10.email),
    phones: json(s10.phones),

    // Documentos (rutas en Storage; los archivos ya se subieron directo)
    doc_id_passport: vacioANull(s10.doc_id_passport ?? null),
    doc_ties: vacioANull(s10.doc_ties ?? null),
    doc_bank_statements: vacioANull(s10.doc_bank_statements ?? null),
    doc_travel_itinerary: vacioANull(s10.doc_travel_itinerary ?? null),
    doc_us_visa: vacioANull(s10.doc_us_visa ?? null),
    doc_forms_letters: vacioANull(s10.doc_forms_letters ?? null),
    doc_passport_scan: txt(passportScanPath ?? null),
    ai_letter_status: 'generating',

    admin_notes: null as string | null,
  }

  if (ajustes.length) fila.admin_notes = `Ajustes automáticos al guardar:\n- ${ajustes.join('\n- ')}`
  return { fila, ajustes }
}

export type ResultadoGuardar =
  | { ok: true; nueva: boolean; emergencia: boolean }
  | { ok: false; error: unknown }

const esDuplicado = (e: { code?: string } | null) => e?.code === '23505'
// Errores de datos de Postgres (clase 22: tipo/formato/rango, 23502 not null...).
const esErrorDeDatos = (e: { code?: string } | null) => !!e?.code && (e.code.startsWith('22') || e.code === '23502' || e.code === '23514')

/**
 * Guarda la fila. Idempotente por id. Si Postgres rechaza algún valor, hace
 * un guardado de emergencia con los datos de contacto y el formulario
 * completo en admin_notes, para que la aplicación nunca se pierda.
 */
export async function guardarCanada(envio: EnvioCanada, fila: ReturnType<typeof construirFila>['fila']): Promise<ResultadoGuardar> {
  const { error } = await supabaseAdmin.from(TABLA).insert(fila)
  if (!error) return { ok: true, nueva: true, emergencia: false }
  if (esDuplicado(error)) return { ok: true, nueva: false, emergencia: false }
  if (!esErrorDeDatos(error)) return { ok: false, error }

  console.error('[CANADA] Insert rechazado por datos, guardado de emergencia:', error)
  const emergencia = {
    id: fila.id,
    status: 'pending',
    given_name: fila.given_name,
    surname: fila.surname,
    email: fila.email,
    phones: fila.phones,
    apply_for: fila.apply_for,
    doc_id_passport: fila.doc_id_passport,
    doc_ties: fila.doc_ties,
    doc_bank_statements: fila.doc_bank_statements,
    doc_travel_itinerary: fila.doc_travel_itinerary,
    doc_us_visa: fila.doc_us_visa,
    doc_forms_letters: fila.doc_forms_letters,
    doc_passport_scan: fila.doc_passport_scan,
    ai_letter_status: 'failed',
    admin_notes: `GUARDADO DE EMERGENCIA — la base rechazó un valor (${error.code}: ${error.message}). Formulario completo:\n${JSON.stringify(envio.data)}`,
  }
  const { error: error2 } = await supabaseAdmin.from(TABLA).insert(emergencia)
  if (!error2 || esDuplicado(error2)) return { ok: true, nueva: !error2, emergencia: true }
  return { ok: false, error: error2 }
}

export function programarTareasCanada(envio: EnvioCanada, fila: ReturnType<typeof construirFila>['fila'], emergencia: boolean) {
  const { nombre, email } = contactoDe(envio.data)
  const alerta = { formulario: 'Canadá', nombre, email, applicationId: fila.id }

  enSegundoPlano(
    'email-admin',
    () =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🇨🇦 Canadá / Visa de Visitante — ${fila.surname ?? nombre ?? 'Sin nombre'}${emergencia ? ' (guardado de emergencia)' : ''}`,
        html: `<div style="font-family:sans-serif;padding:20px">
          <h2>Nueva aplicación Canadá recibida</h2>
          <p><strong>Aplicante:</strong> ${esc([fila.given_name, fila.surname].filter(Boolean).join(' '))}</p>
          <p><strong>Email:</strong> ${esc(fila.email)}</p>
          <p><strong>Tipo de visa:</strong> ${esc(fila.apply_for)}</p>
          <p><strong>ID de aplicación:</strong> ${fila.id}</p>
          ${fila.admin_notes ? `<p><strong>Notas:</strong> revisa admin_notes en Supabase (hubo ajustes automáticos${emergencia ? ' y guardado de emergencia' : ''}).</p>` : ''}
        </div>`,
      }).then(({ error }) => {
        if (error) throw new Error(`Resend: ${error.message}`)
      }),
    { timeoutMs: 15_000, alerta },
  )

  if (fila.email) {
    enSegundoPlano(
      'pdf-y-email-cliente',
      async () => {
        let pdf: Buffer | undefined
        try {
          pdf = await generateApplicationPdf(fila, {}, 'canada')
        } catch (err) {
          // Sin PDF igual se manda la confirmación; el fallo queda en el log.
          console.error('[CANADA] PDF del cliente falló:', err)
        }
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: fila.email!,
          subject: '🇨🇦 Recibimos tu solicitud para Canadá — LATAM VISA',
          html: getClientConfirmationEmail(fila, 'canada', Boolean(pdf)),
          attachments: pdf ? [{ filename: 'resumen-solicitud-latam-visa.pdf', content: pdf }] : [],
        })
        if (error) throw new Error(`Resend: ${error.message}`)
      },
      { timeoutMs: 30_000, alerta },
    )
  }

  if (!emergencia) {
    enSegundoPlano(
      'carta-ia',
      async () => {
        // generateIntentionLetterBg captura sus propios errores y marca la
        // fila como 'failed'; se revisa el estado para poder alertar.
        await generateIntentionLetterBg(fila.id)
        const { data } = await supabaseAdmin.from(TABLA).select('ai_letter_status').eq('id', fila.id).maybeSingle()
        if (data?.ai_letter_status !== 'completed') throw new Error(`La carta con IA quedó en estado "${data?.ai_letter_status}"`)
      },
      { timeoutMs: 55_000, alerta },
    )
  }
}
