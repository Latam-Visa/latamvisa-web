const fs = require('fs')
const path = require('path')

const stepsPath = path.join(__dirname, '../app/aplicar/turismo-australia/_components')

const header = (stepNum, title, desc) => `import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step${stepNum}() {
  const { register, formState: { errors }, watch, control } = useFormContext()
  const errs = errors.step${stepNum} as any || {}
  const data = watch('step${stepNum}') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">${title}</h3>
        <p className="text-sm text-[#525252] mb-4">${desc}</p>
`
const footer = `      </div>
    </div>
  )
}
`

const getRadio = (name, label, yesNo = true) => `
        <FormField label="${label}" name="step\${stepNum}.${name}" required error={errs.${name}?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register(`step\${stepNum}.${name}`)} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register(`step\${stepNum}.${name}`)} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
`

const steps = [
  {
    n: 1, title: 'Detalles de Aplicación', desc: 'Motivo del viaje y fechas',
    content: `
        <div className="mb-6 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm">
          <h4 className="font-medium mb-3 text-sm">Resumen de pasaporte extraído</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-[#525252]">
            <div><strong>Nombres:</strong> {watch('step2.given_names') || '—'}</div>
            <div><strong>Apellidos:</strong> {watch('step2.family_name') || '—'}</div>
            <div><strong>F. Nacimiento:</strong> {watch('step2.date_of_birth') || '—'}</div>
            <div><strong>Pasaporte:</strong> {watch('step2.passport_number') || '—'}</div>
          </div>
        </div>

        <FormField label="¿Aceptas los términos y condiciones?" name="step1.terms_accepted" required error={errs.terms_accepted?.message as string}>
          <div className="flex items-center gap-3">
            <input type="checkbox" {...register('step1.terms_accepted')} className="w-5 h-5 accent-[#C8FF00]" />
            <span className="text-sm">Confirmo que deseo iniciar mi proceso con LATAM VISA.</span>
          </div>
        </FormField>

        ${getRadio('currently_outside_australia', '¿Te encuentras actualmente fuera de Australia?').replace(/step\$\{stepNum\}/g, 'step1')}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="País de ubicación actual" name="step1.current_location_country" required error={errs.current_location_country?.message as string}>
            <input {...register('step1.current_location_country')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" placeholder="Ej: Colombia" />
          </FormField>
          <FormField label="Estatus legal en ese país" name="step1.current_location_legal_status" required error={errs.current_location_legal_status?.message as string}>
            <select {...register('step1.current_location_legal_status')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Citizen">Ciudadano</option>
              <option value="Permanent Resident">Residente Permanente</option>
              <option value="Visitor">Visitante</option>
              <option value="Student">Estudiante</option>
              <option value="Work Visa">Visa de Trabajo</option>
              <option value="Other">Otro</option>
            </select>
          </FormField>
        </div>

        <FormField label="Stream de Visa" name="step1.visa_stream" required error={errs.visa_stream?.message as string}>
          <select {...register('step1.visa_stream')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
            <option value="tourist">Tourist Stream</option>
          </select>
        </FormField>

        <FormField label="Motivos de la visita" name="step1.reasons_for_visit" required error={errs.reasons_for_visit?.message as string}>
          <div className="space-y-2 mt-2 text-sm text-[#0A0A0A]">
            {['Tourism', 'Visit family or friends', 'Business visitor', 'Other'].map(r => (
              <label key={r} className="flex items-center gap-3">
                <input type="checkbox" value={r} {...register('step1.reasons_for_visit')} className="w-5 h-5 accent-[#C8FF00]" />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="Fechas significativas o detalles del evento (Opcional)" name="step1.significant_dates_details" error={errs.significant_dates_details?.message as string}>
          <textarea {...register('step1.significant_dates_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" placeholder="Ej: Boda familiar el 15 de Noviembre..." />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${getRadio('group_processing', '¿Estás aplicando como parte de un grupo?').replace(/step\$\{stepNum\}/g, 'step1')}
          ${getRadio('special_category_entry', '¿Eres un representante de un gobierno extranjero o viajas bajo privilegios de la ONU?').replace(/step\$\{stepNum\}/g, 'step1')}
        </div>
    `
  },
  {
    n: 2, title: 'Datos Personales', desc: 'Información de pasaporte',
    content: `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Apellidos" name="step2.family_name" required error={errs.family_name?.message as string}>
            <input {...register('step2.family_name')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Nombres" name="step2.given_names" required error={errs.given_names?.message as string}>
            <input {...register('step2.given_names')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Sexo" name="step2.sex" required error={errs.sex?.message as string}>
            <select {...register('step2.sex')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Male">Masculino</option>
              <option value="Female">Femenino</option>
              <option value="Other">Otro</option>
            </select>
          </FormField>
          <FormField label="Fecha de Nacimiento" name="step2.date_of_birth" required error={errs.date_of_birth?.message as string}>
            <input type="date" {...register('step2.date_of_birth')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Número de Pasaporte" name="step2.passport_number" required error={errs.passport_number?.message as string}>
            <input {...register('step2.passport_number')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="País del Pasaporte" name="step2.country_of_passport" required error={errs.country_of_passport?.message as string}>
            <input {...register('step2.country_of_passport')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Nacionalidad del Titular" name="step2.nationality_passport_holder" required error={errs.nationality_passport_holder?.message as string}>
            <input {...register('step2.nationality_passport_holder')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Lugar de Emisión" name="step2.passport_place_of_issue" required error={errs.passport_place_of_issue?.message as string}>
            <input {...register('step2.passport_place_of_issue')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Fecha de Emisión" name="step2.passport_issue_date" required error={errs.passport_issue_date?.message as string}>
            <input type="date" {...register('step2.passport_issue_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Fecha de Expiración" name="step2.passport_expiry_date" required error={errs.passport_expiry_date?.message as string}>
            <input type="date" {...register('step2.passport_expiry_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
        </div>
    `
  },
  {
    n: 3, title: 'Identificación Adicional', desc: 'Documentos nacionales de identidad y nacimiento',
    content: `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Ciudad/Pueblo de Nacimiento" name="step3.birth_town_city" required error={errs.birth_town_city?.message as string}>
            <input {...register('step3.birth_town_city')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Estado/Provincia de Nacimiento" name="step3.birth_state_province" required error={errs.birth_state_province?.message as string}>
            <input {...register('step3.birth_state_province')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="País de Nacimiento" name="step3.country_of_birth" required error={errs.country_of_birth?.message as string}>
            <input {...register('step3.country_of_birth')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Estado Civil" name="step3.relationship_status" required error={errs.relationship_status?.message as string}>
            <select {...register('step3.relationship_status')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Single">Soltero/a</option>
              <option value="Married">Casado/a</option>
              <option value="De facto">De facto (Concubinato)</option>
              <option value="Divorced">Divorciado/a</option>
              <option value="Widowed">Viudo/a</option>
            </select>
          </FormField>
        </div>

        ${getRadio('has_national_id', '¿Tienes documento nacional de identidad (Cédula)?').replace(/step\$\{stepNum\}/g, 'step3')}
        {data.has_national_id === 'true' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm">
            <FormField label="Apellidos (ID)" name="step3.nid_family_name" error={errs.nid_family_name?.message as string}>
              <input {...register('step3.nid_family_name')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Nombres (ID)" name="step3.nid_given_names" error={errs.nid_given_names?.message as string}>
              <input {...register('step3.nid_given_names')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Número de Identificación" name="step3.nid_number" error={errs.nid_number?.message as string}>
              <input {...register('step3.nid_number')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="País de Emisión" name="step3.nid_country_of_issue" error={errs.nid_country_of_issue?.message as string}>
              <input {...register('step3.nid_country_of_issue')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Fecha de Emisión (Opcional)" name="step3.nid_issue_date" error={errs.nid_issue_date?.message as string}>
              <input type="date" {...register('step3.nid_issue_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Fecha de Expiración (Opcional)" name="step3.nid_expiry_date" error={errs.nid_expiry_date?.message as string}>
              <input type="date" {...register('step3.nid_expiry_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        ${getRadio('has_other_names', '¿Has sido conocido por otros nombres?').replace(/step\$\{stepNum\}/g, 'step3')}
        ${getRadio('citizen_of_passport_country', '¿Eres ciudadano del país de tu pasaporte?').replace(/step\$\{stepNum\}/g, 'step3')}
        ${getRadio('citizen_other_country', '¿Eres ciudadano de algún otro país?').replace(/step\$\{stepNum\}/g, 'step3')}
        ${getRadio('previous_travel_australia', '¿Has viajado a Australia antes?').replace(/step\$\{stepNum\}/g, 'step3')}
        ${getRadio('previously_applied_australia_visa', '¿Has aplicado a una visa australiana antes?').replace(/step\$\{stepNum\}/g, 'step3')}
        
        {data.previously_applied_australia_visa === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm mt-4">
            ${getRadio('has_grant_number', '¿Tienes un número de grant de visa previo?').replace(/step\$\{stepNum\}/g, 'step3')}
            {data.has_grant_number === 'true' && (
              <div className="mt-4">
                <FormField label="Grant Number" name="step3.grant_number" error={errs.grant_number?.message as string}>
                  <input {...register('step3.grant_number')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                </FormField>
              </div>
            )}
          </div>
        )}

        ${getRadio('other_travel_documents', '¿Tienes otros documentos de viaje?').replace(/step\$\{stepNum\}/g, 'step3')}
        ${getRadio('other_identity_documents', '¿Tienes otros documentos de identidad?').replace(/step\$\{stepNum\}/g, 'step3')}
        ${getRadio('health_exam_last_12_months', '¿Te has hecho un examen médico para una visa australiana en los últimos 12 meses?').replace(/step\$\{stepNum\}/g, 'step3')}
        ${getRadio('pacific_australia_card', '¿Tienes una Pacific Australia Card (PAC)?').replace(/step\$\{stepNum\}/g, 'step3')}
    `
  },
  {
    n: 4, title: 'Direcciones y Contacto', desc: 'Información de residencia',
    content: `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="País de Residencia Usual" name="step4.usual_country_of_residence" required error={errs.usual_country_of_residence?.message as string}>
            <input {...register('step4.usual_country_of_residence')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Oficina del Departamento" name="step4.department_office" required error={errs.department_office?.message as string}>
            <input {...register('step4.department_office')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" placeholder="Oficina más cercana" />
          </FormField>
          <FormField label="País de Residencia Actual" name="step4.res_country" required error={errs.res_country?.message as string}>
            <input {...register('step4.res_country')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Dirección Residencial" name="step4.res_address" required error={errs.res_address?.message as string}>
            <input {...register('step4.res_address')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Barrio/Suburbio" name="step4.res_suburb" required error={errs.res_suburb?.message as string}>
            <input {...register('step4.res_suburb')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Estado/Provincia" name="step4.res_state" required error={errs.res_state?.message as string}>
            <input {...register('step4.res_state')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Código Postal" name="step4.res_postcode" error={errs.res_postcode?.message as string}>
            <input {...register('step4.res_postcode')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Teléfono Fijo" name="step4.phone_home" error={errs.phone_home?.message as string}>
            <input {...register('step4.phone_home')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Teléfono Negocio" name="step4.phone_business" error={errs.phone_business?.message as string}>
            <input {...register('step4.phone_business')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Teléfono Móvil" name="step4.phone_mobile" required error={errs.phone_mobile?.message as string}>
            <input {...register('step4.phone_mobile')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
        </div>

        ${getRadio('postal_same_as_residential', '¿La dirección postal es la misma que la residencial?').replace(/step\$\{stepNum\}/g, 'step4')}
        
        {data.postal_same_as_residential === 'false' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm mt-4">
            <FormField label="País Postal" name="step4.postal_country" error={errs.postal_country?.message as string}>
              <input {...register('step4.postal_country')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Dirección Postal" name="step4.postal_address" error={errs.postal_address?.message as string}>
              <input {...register('step4.postal_address')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Barrio/Suburbio Postal" name="step4.postal_suburb" error={errs.postal_suburb?.message as string}>
              <input {...register('step4.postal_suburb')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Estado/Provincia Postal" name="step4.postal_state" error={errs.postal_state?.message as string}>
              <input {...register('step4.postal_state')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Código Postal Postal" name="step4.postal_postcode" error={errs.postal_postcode?.message as string}>
              <input {...register('step4.postal_postcode')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        <FormField label="Correo Electrónico" name="step4.email" required error={errs.email?.message as string}>
          <input type="email" {...register('step4.email')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
        
        ${getRadio('has_authorised_recipient', '¿Autorizas a otra persona a recibir correspondencia oficial?').replace(/step\$\{stepNum\}/g, 'step4')}
    `
  },
  {
    n: 5, title: 'Compañeros de Viaje', desc: '¿Viajas con alguien más?',
    content: `
        ${getRadio('travelling_with_others', '¿Viajas con otras personas?').replace(/step\$\{stepNum\}/g, 'step5')}
    `
  },
  {
    n: 6, title: 'Familia no Acompañante', desc: 'Familiares que no viajan a Australia',
    content: `
        ${getRadio('has_non_accompanying_family', '¿Tienes familiares cercanos que NO viajarán contigo a Australia?').replace(/step\$\{stepNum\}/g, 'step6')}
    `
  },
  {
    n: 7, title: 'Detalles de Estadía', desc: 'Fechas y actividades en Australia',
    content: `
        ${getRadio('multiple_entries', '¿Planeas múltiples entradas a Australia?').replace(/step\$\{stepNum\}/g, 'step7')}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tiempo de estadía planeado" name="step7.length_of_stay" required error={errs.length_of_stay?.message as string}>
            <select {...register('step7.length_of_stay')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Up to 3 months">Hasta 3 meses</option>
              <option value="Up to 6 months">Hasta 6 meses</option>
              <option value="Up to 12 months">Hasta 12 meses</option>
            </select>
          </FormField>
          <FormField label="Fecha de Llegada Planeada" name="step7.planned_arrival_date" required error={errs.planned_arrival_date?.message as string}>
            <input type="date" {...register('step7.planned_arrival_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Fecha de Salida Planeada" name="step7.planned_departure_date" required error={errs.planned_departure_date?.message as string}>
            <input type="date" {...register('step7.planned_departure_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
        </div>

        ${getRadio('study_in_australia', '¿Planeas estudiar un curso corto en Australia?').replace(/step\$\{stepNum\}/g, 'step7')}
        {data.study_in_australia === 'true' && (
          <div className="mt-4">
            <FormField label="Detalles del estudio" name="step7.study_details" error={errs.study_details?.message as string}>
              <textarea {...register('step7.study_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        ${getRadio('will_visit_contacts', '¿Visitarás a algún contacto, familiar o amigo en Australia?').replace(/step\$\{stepNum\}/g, 'step7')}
    `
  },
  {
    n: 8, title: 'Empleo', desc: 'Tu situación laboral actual',
    content: `
        <FormField label="Estado de Empleo Actual" name="step8.employment_status" required error={errs.employment_status?.message as string}>
          <select {...register('step8.employment_status')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
            <option value="">Seleccionar</option>
            <option value="Employed">Empleado</option>
            <option value="Self-employed">Independiente / Emprendedor</option>
            <option value="Student">Estudiante</option>
            <option value="Retired">Retirado / Jubilado</option>
            <option value="Unemployed">Desempleado</option>
            <option value="Other">Otro</option>
          </select>
        </FormField>
        
        {['Employed', 'Self-employed'].includes(data.employment_status) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm mt-4">
            <FormField label="Nombre del Empleador o Empresa" name="step8.employer_name" error={errs.employer_name?.message as string}>
              <input {...register('step8.employer_name')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Ocupación / Cargo" name="step8.occupation" error={errs.occupation?.message as string}>
              <input {...register('step8.occupation')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Dirección del Empleador" name="step8.employer_address" error={errs.employer_address?.message as string}>
              <input {...register('step8.employer_address')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Teléfono Laboral" name="step8.work_phone" error={errs.work_phone?.message as string}>
              <input {...register('step8.work_phone')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Ingreso Mensual (Opcional)" name="step8.monthly_income" error={errs.monthly_income?.message as string}>
              <input {...register('step8.monthly_income')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" placeholder="USD o moneda local" />
            </FormField>
          </div>
        )}
    `
  },
  {
    n: 9, title: 'Soporte Financiero', desc: 'Fondos para tu estadía',
    content: `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="¿Quién financiará tu viaje?" name="step9.funding_type" required error={errs.funding_type?.message as string}>
            <select {...register('step9.funding_type')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Self-funded">Yo mismo</option>
              <option value="Supported by another person">Otra persona (Sponsor)</option>
              <option value="Supported by organisation">Organización / Empresa</option>
            </select>
          </FormField>
          <FormField label="¿Qué tipo de soporte proveerán? (Alojamiento, vuelos, todo)" name="step9.support_type" required error={errs.support_type?.message as string}>
            <input {...register('step9.support_type')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
        </div>
        
        <FormField label="Detalles de fondos disponibles (Ej: $5000 USD ahorros, Tarjetas crédito...)" name="step9.funds_available_details" required error={errs.funds_available_details?.message as string}>
          <textarea {...register('step9.funds_available_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
        </FormField>
    `
  },
  {
    n: 10, title: 'Declaraciones Médicas', desc: 'Estado de salud actual',
    content: `
        <div className="space-y-4">
          <p className="text-sm font-medium">Por favor, responde honestamente a las siguientes preguntas médicas impuestas por Home Affairs:</p>
          
          <FormField label="En los últimos 5 años, ¿Has estado en un país de riesgo de tuberculosis?" name="step10.health_declarations_tb" error={errs.health_declarations_tb?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step10.health_declarations_tb')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step10.health_declarations_tb')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          <FormField label="¿Tienes tuberculosis o alguna condición relacionada?" name="step10.health_declarations_has_tb" error={errs.health_declarations_has_tb?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step10.health_declarations_has_tb')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step10.health_declarations_has_tb')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          
          <FormField label="Si respondiste 'Sí' a alguna pregunta, proporciona detalles:" name="step10.health_details" error={errs.health_details?.message as string}>
            <textarea {...register('step10.health_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
        </div>
    `
  },
  {
    n: 11, title: 'Carácter', desc: 'Antecedentes judiciales y de seguridad',
    content: `
        <div className="space-y-4">
          <p className="text-sm font-medium">Historial legal (Debe ser reportado todo así haya sido hace años):</p>
          <FormField label="¿Has sido arrestado o condenado por un crimen?" name="step11.character_declarations_convicted" error={errs.character_declarations_convicted?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step11.character_declarations_convicted')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step11.character_declarations_convicted')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          
          <FormField label="Si respondiste 'Sí' a alguna pregunta, proporciona detalles:" name="step11.character_details" error={errs.character_details?.message as string}>
            <textarea {...register('step11.character_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
        </div>
    `
  },
  {
    n: 12, title: 'Historial de Visas', desc: 'Experiencia previa con inmigración',
    content: `
        ${getRadio('holds_other_visa', '¿Tienes o has tenido visas válidas para Australia u otros países?').replace(/step\$\{stepNum\}/g, 'step12')}
        {data.holds_other_visa === 'true' && (
          <div className="mt-4">
            <FormField label="Detalles de Visas Previas" name="step12.visa_history_details" error={errs.visa_history_details?.message as string}>
              <textarea {...register('step12.visa_history_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}
        
        ${getRadio('visa_non_compliance', '¿Alguna vez has excedido el tiempo de estadía o incumplido condiciones de visa?').replace(/step\$\{stepNum\}/g, 'step12')}
        {data.visa_non_compliance === 'true' && (
          <div className="mt-4">
            <FormField label="Detalles de Incumplimiento" name="step12.visa_non_compliance_details" error={errs.visa_non_compliance_details?.message as string}>
              <textarea {...register('step12.visa_non_compliance_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        ${getRadio('visa_refused_cancelled', '¿Te han denegado o cancelado una visa en cualquier país?').replace(/step\$\{stepNum\}/g, 'step12')}
        {data.visa_refused_cancelled === 'true' && (
          <div className="mt-4">
            <FormField label="Detalles de Denegación" name="step12.visa_refused_details" error={errs.visa_refused_details?.message as string}>
              <textarea {...register('step12.visa_refused_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}
    `
  },
  {
    n: 13, title: 'Declaraciones Finales', desc: 'Aceptación y entendimiento de las leyes migratorias',
    content: `
        <div className="space-y-4">
          <p className="text-sm">Al marcar las siguientes casillas certificas que entiendes y aceptas las condiciones.</p>
          <FormField label="¿Has provisto información verdadera y correcta?" name="step13.true_and_correct" error={errs.true_and_correct?.message as string}>
            <input type="checkbox" {...register('step13.true_and_correct')} className="w-5 h-5 accent-[#C8FF00]" />
          </FormField>
          <FormField label="¿Entiendes que tu visa puede ser cancelada si provees info falsa?" name="step13.understand_cancellation" error={errs.understand_cancellation?.message as string}>
            <input type="checkbox" {...register('step13.understand_cancellation')} className="w-5 h-5 accent-[#C8FF00]" />
          </FormField>
          <FormField label="¿Aceptas que LATAM VISA procese estos datos en tu nombre?" name="step13.agency_processing" error={errs.agency_processing?.message as string}>
            <input type="checkbox" {...register('step13.agency_processing')} className="w-5 h-5 accent-[#C8FF00]" />
          </FormField>
        </div>
    `
  },
  {
    n: 14, title: 'Documentos', desc: 'Sube la evidencia para respaldar tu aplicación',
    content: `
        <div className="bg-[#FEF2F2] border border-[#DC2626] p-4 rounded-xl mb-4">
          <p className="text-sm font-medium text-[#DC2626]">Esta versión de la plataforma delega la carga final de documentos a nuestro equipo interno tras contactar al cliente o a través de WhatsApp. Si deseas subir un documento preliminar (ej. Pasaporte manual), hazlo, o presiona <strong>Siguiente</strong> para enviar el formulario y nos contactaremos contigo.</p>
        </div>
        
        <p className="text-sm text-[#525252]">El archivo debe estar en formato PDF o Imagen (JPG/PNG).</p>

        <FormField label="Pasaporte Actual" name="step14.doc_passport_current" error={errs.doc_passport_current?.message as string}>
          <input type="text" {...register('step14.doc_passport_current')} placeholder="URL o Referencia local (Pendiente)" className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
        <FormField label="Documento de Identidad Nacional (DNI)" name="step14.doc_national_id" error={errs.doc_national_id?.message as string}>
          <input type="text" {...register('step14.doc_national_id')} placeholder="URL o Referencia local" className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
    `
  }
]

steps.forEach(step => {
  const fileContent = header(step.n, step.title, step.desc) + step.content + footer
  fs.writeFileSync(path.join(stepsPath, `Step${step.n}.tsx`), fileContent)
})

console.log('14 steps generated.')
