const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '../app/aplicar/turismo-australia/_components');

function makeStep(n, title, desc, fields) {
  const content = `import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step${n}() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step${n} as any) || {}
  const data = watch('step${n}') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">${title}</h3>
        <p className="text-sm text-[#525252] mb-4">${desc}</p>
        
        ${fields}
      </div>
    </div>
  )
}
`;
  fs.writeFileSync(path.join(out, `Step${n}.tsx`), content);
}

function radio(n, name, label) {
  return `<FormField label={\`${label}\`} name="step${n}.${name}" required error={errs.${name}?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step${n}.${name}')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step${n}.${name}')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>`;
}

function input(n, name, label, required = false, type = "text") {
  return `<FormField label={\`${label}\`} name="step${n}.${name}" ${required ? "required" : ""} error={errs.${name}?.message as string}>
          <input type="${type}" {...register('step${n}.${name}')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>`;
}

function textarea(n, name, label, required = false) {
  return `<FormField label={\`${label}\`} name="step${n}.${name}" ${required ? "required" : ""} error={errs.${name}?.message as string}>
          <textarea {...register('step${n}.${name}')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
        </FormField>`;
}

// Step 1
makeStep(1, 'Detalles de Aplicación', 'Motivo del viaje y fechas', `
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
            <span className="text-sm text-[#0A0A0A]">Confirmo que deseo iniciar mi proceso con LATAM VISA.</span>
          </div>
        </FormField>

        ${radio(1, 'currently_outside_australia', '¿Te encuentras actualmente fuera de Australia?')}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${input(1, 'current_location_country', 'País de ubicación actual', true)}
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

        ${textarea(1, 'significant_dates_details', 'Fechas significativas o detalles del evento (Opcional)')}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${radio(1, 'group_processing', '¿Estás aplicando como parte de un grupo?')}
          ${radio(1, 'special_category_entry', '¿Eres un representante de un gobierno extranjero o viajas bajo privilegios de la ONU?')}
        </div>
`);

// Step 2
makeStep(2, 'Datos Personales', 'Información de pasaporte', `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${input(2, 'family_name', 'Apellidos', true)}
          ${input(2, 'given_names', 'Nombres', true)}
          <FormField label="Sexo" name="step2.sex" required error={errs.sex?.message as string}>
            <select {...register('step2.sex')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Male">Masculino</option>
              <option value="Female">Femenino</option>
              <option value="Other">Otro</option>
            </select>
          </FormField>
          ${input(2, 'date_of_birth', 'Fecha de Nacimiento', true, 'date')}
          ${input(2, 'passport_number', 'Número de Pasaporte', true)}
          ${input(2, 'country_of_passport', 'País del Pasaporte', true)}
          ${input(2, 'nationality_passport_holder', 'Nacionalidad del Titular', true)}
          ${input(2, 'passport_place_of_issue', 'Lugar de Emisión', true)}
          ${input(2, 'passport_issue_date', 'Fecha de Emisión', true, 'date')}
          ${input(2, 'passport_expiry_date', 'Fecha de Expiración', true, 'date')}
        </div>
`);

// Step 3
makeStep(3, 'Identificación Adicional', 'Documentos nacionales de identidad y nacimiento', `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${input(3, 'birth_town_city', 'Ciudad/Pueblo de Nacimiento', true)}
          ${input(3, 'birth_state_province', 'Estado/Provincia de Nacimiento', true)}
          ${input(3, 'country_of_birth', 'País de Nacimiento', true)}
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

        ${radio(3, 'has_national_id', '¿Tienes documento nacional de identidad (Cédula)?')}
        {data.has_national_id === 'true' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm mt-4">
            ${input(3, 'nid_family_name', 'Apellidos (ID)')}
            ${input(3, 'nid_given_names', 'Nombres (ID)')}
            ${input(3, 'nid_number', 'Número de Identificación')}
            ${input(3, 'nid_country_of_issue', 'País de Emisión')}
            ${input(3, 'nid_issue_date', 'Fecha de Emisión (Opcional)', false, 'date')}
            ${input(3, 'nid_expiry_date', 'Fecha de Expiración (Opcional)', false, 'date')}
          </div>
        )}

        ${radio(3, 'has_other_names', '¿Has sido conocido por otros nombres?')}
        ${radio(3, 'citizen_of_passport_country', '¿Eres ciudadano del país de tu pasaporte?')}
        ${radio(3, 'citizen_other_country', '¿Eres ciudadano de algún otro país?')}
        ${radio(3, 'previous_travel_australia', '¿Has viajado a Australia antes?')}
        ${radio(3, 'previously_applied_australia_visa', '¿Has aplicado a una visa australiana antes?')}
        
        {data.previously_applied_australia_visa === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm mt-4">
            ${radio(3, 'has_grant_number', '¿Tienes un número de grant de visa previo?')}
            {data.has_grant_number === 'true' && (
              <div className="mt-4">
                ${input(3, 'grant_number', 'Grant Number')}
              </div>
            )}
          </div>
        )}

        ${radio(3, 'other_travel_documents', '¿Tienes otros documentos de viaje?')}
        ${radio(3, 'other_identity_documents', '¿Tienes otros documentos de identidad?')}
        ${radio(3, 'health_exam_last_12_months', '¿Te has hecho un examen médico para una visa australiana en los últimos 12 meses?')}
        ${radio(3, 'pacific_australia_card', '¿Tienes una Pacific Australia Card (PAC)?')}
`);

// Step 4
makeStep(4, 'Direcciones y Contacto', 'Información de residencia', `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${input(4, 'usual_country_of_residence', 'País de Residencia Usual', true)}
          ${input(4, 'department_office', 'Oficina del Departamento', true)}
          ${input(4, 'res_country', 'País de Residencia Actual', true)}
          ${input(4, 'res_address', 'Dirección Residencial', true)}
          ${input(4, 'res_suburb', 'Barrio/Suburbio', true)}
          ${input(4, 'res_state', 'Estado/Provincia', true)}
          ${input(4, 'res_postcode', 'Código Postal')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${input(4, 'phone_home', 'Teléfono Fijo')}
          ${input(4, 'phone_business', 'Teléfono Negocio')}
          ${input(4, 'phone_mobile', 'Teléfono Móvil', true)}
        </div>

        ${radio(4, 'postal_same_as_residential', '¿La dirección postal es la misma que la residencial?')}
        
        {data.postal_same_as_residential === 'false' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm mt-4">
            ${input(4, 'postal_country', 'País Postal')}
            ${input(4, 'postal_address', 'Dirección Postal')}
            ${input(4, 'postal_suburb', 'Barrio/Suburbio Postal')}
            ${input(4, 'postal_state', 'Estado/Provincia Postal')}
            ${input(4, 'postal_postcode', 'Código Postal Postal')}
          </div>
        )}

        ${input(4, 'email', 'Correo Electrónico', true, 'email')}
        ${radio(4, 'has_authorised_recipient', '¿Autorizas a otra persona a recibir correspondencia oficial?')}
`);

// Step 5
makeStep(5, 'Compañeros de Viaje', '¿Viajas con alguien más?', `
        ${radio(5, 'travelling_with_others', '¿Viajas con otras personas?')}
`);

// Step 6
makeStep(6, 'Familia no Acompañante', 'Familiares que no viajan a Australia', `
        ${radio(6, 'has_non_accompanying_family', '¿Tienes familiares cercanos que NO viajarán contigo a Australia?')}
`);

// Step 7
makeStep(7, 'Detalles de Estadía', 'Fechas y actividades en Australia', `
        ${radio(7, 'multiple_entries', '¿Planeas múltiples entradas a Australia?')}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tiempo de estadía planeado" name="step7.length_of_stay" required error={errs.length_of_stay?.message as string}>
            <select {...register('step7.length_of_stay')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Up to 3 months">Hasta 3 meses</option>
              <option value="Up to 6 months">Hasta 6 meses</option>
              <option value="Up to 12 months">Hasta 12 meses</option>
            </select>
          </FormField>
          ${input(7, 'planned_arrival_date', 'Fecha de Llegada Planeada', true, 'date')}
          ${input(7, 'planned_departure_date', 'Fecha de Salida Planeada', true, 'date')}
        </div>

        ${radio(7, 'study_in_australia', '¿Planeas estudiar un curso corto en Australia?')}
        {data.study_in_australia === 'true' && (
          <div className="mt-4">
            ${textarea(7, 'study_details', 'Detalles del estudio')}
          </div>
        )}

        ${radio(7, 'will_visit_contacts', '¿Visitarás a algún contacto, familiar o amigo en Australia?')}
`);

// Step 8
makeStep(8, 'Empleo', 'Tu situación laboral actual', `
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
            ${input(8, 'employer_name', 'Nombre del Empleador o Empresa')}
            ${input(8, 'occupation', 'Ocupación / Cargo')}
            ${input(8, 'employer_address', 'Dirección del Empleador')}
            ${input(8, 'work_phone', 'Teléfono Laboral')}
            ${input(8, 'monthly_income', 'Ingreso Mensual (Opcional)')}
          </div>
        )}
`);

// Step 9
makeStep(9, 'Soporte Financiero', 'Fondos para tu estadía', `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="¿Quién financiará tu viaje?" name="step9.funding_type" required error={errs.funding_type?.message as string}>
            <select {...register('step9.funding_type')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Self-funded">Yo mismo</option>
              <option value="Supported by another person">Otra persona (Sponsor)</option>
              <option value="Supported by organisation">Organización / Empresa</option>
            </select>
          </FormField>
          ${input(9, 'support_type', '¿Qué tipo de soporte proveerán? (Alojamiento, vuelos, todo)', true)}
        </div>
        
        ${textarea(9, 'funds_available_details', 'Detalles de fondos disponibles (Ej: $5000 USD ahorros, Tarjetas crédito...)', true)}
`);

// Step 10
makeStep(10, 'Declaraciones Médicas', 'Estado de salud actual', `
        <div className="space-y-4">
          <p className="text-sm font-medium">Por favor, responde honestamente a las siguientes preguntas médicas impuestas por Home Affairs:</p>
          <FormField label="¿En los últimos 5 años has estado en un país de riesgo de tuberculosis?" name="step10.health_declarations.tuberculosis" error={(errs.health_declarations as any)?.tuberculosis?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step10.health_declarations.tuberculosis')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step10.health_declarations.tuberculosis')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          
          <FormField label="¿Tienes tuberculosis o alguna condición relacionada?" name="step10.health_declarations.has_tb" error={(errs.health_declarations as any)?.has_tb?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step10.health_declarations.has_tb')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step10.health_declarations.has_tb')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          
          ${textarea(10, 'health_details', 'Si respondiste "Sí" a alguna pregunta, proporciona detalles:')}
        </div>
`);

// Step 11
makeStep(11, 'Carácter', 'Antecedentes judiciales y de seguridad', `
        <div className="space-y-4">
          <p className="text-sm font-medium">Historial legal (Debe ser reportado todo así haya sido hace años):</p>
          <FormField label="¿Has sido arrestado o condenado por un crimen?" name="step11.character_declarations.convicted" error={(errs.character_declarations as any)?.convicted?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step11.character_declarations.convicted')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step11.character_declarations.convicted')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          
          ${textarea(11, 'character_details', 'Si respondiste "Sí" a alguna pregunta, proporciona detalles:')}
        </div>
`);

// Step 12
makeStep(12, 'Historial de Visas', 'Experiencia previa con inmigración', `
        ${radio(12, 'holds_other_visa', '¿Tienes o has tenido visas válidas para Australia u otros países?')}
        {data.holds_other_visa === 'true' && (
          <div className="mt-4">
            ${textarea(12, 'visa_history_details', 'Detalles de Visas Previas')}
          </div>
        )}
        
        ${radio(12, 'visa_non_compliance', '¿Alguna vez has excedido el tiempo de estadía o incumplido condiciones de visa?')}
        {data.visa_non_compliance === 'true' && (
          <div className="mt-4">
            ${textarea(12, 'visa_non_compliance_details', 'Detalles de Incumplimiento')}
          </div>
        )}

        ${radio(12, 'visa_refused_cancelled', '¿Te han denegado o cancelado una visa en cualquier país?')}
        {data.visa_refused_cancelled === 'true' && (
          <div className="mt-4">
            ${textarea(12, 'visa_refused_details', 'Detalles de Denegación')}
          </div>
        )}
`);

// Step 13
makeStep(13, 'Declaraciones Finales', 'Aceptación y entendimiento de las leyes migratorias', `
        <div className="space-y-4">
          <p className="text-sm">Al marcar las siguientes casillas certificas que entiendes y aceptas las condiciones.</p>
          <FormField label="¿Has provisto información verdadera y correcta?" name="step13.declarations_consents.true_and_correct" error={(errs.declarations_consents as any)?.true_and_correct?.message as string}>
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register('step13.declarations_consents.true_and_correct')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-sm">Sí, acepto</span>
            </div>
          </FormField>
          <FormField label="¿Entiendes que tu visa puede ser cancelada si provees info falsa?" name="step13.declarations_consents.understand_cancellation" error={(errs.declarations_consents as any)?.understand_cancellation?.message as string}>
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register('step13.declarations_consents.understand_cancellation')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-sm">Sí, acepto</span>
            </div>
          </FormField>
          <FormField label="¿Aceptas que LATAM VISA procese estos datos en tu nombre?" name="step13.declarations_consents.agency_processing" error={(errs.declarations_consents as any)?.agency_processing?.message as string}>
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register('step13.declarations_consents.agency_processing')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-sm">Sí, acepto</span>
            </div>
          </FormField>
        </div>
`);

// Step 14
makeStep(14, 'Documentos', 'Sube la evidencia para respaldar tu aplicación', `
        <div className="bg-[#FEF2F2] border border-[#DC2626] p-4 rounded-xl mb-4">
          <p className="text-sm font-medium text-[#DC2626]">Esta versión de la plataforma delega la carga final de documentos a nuestro equipo interno tras contactar al cliente o a través de WhatsApp. Si deseas subir un documento preliminar (ej. Pasaporte manual), hazlo, o presiona <strong>Siguiente</strong> para enviar el formulario y nos contactaremos contigo.</p>
        </div>
        
        <p className="text-sm text-[#525252]">El archivo debe estar en formato PDF o Imagen (JPG/PNG).</p>

        ${input(14, 'doc_passport_current', 'Pasaporte Actual')}
        ${input(14, 'doc_national_id', 'Documento de Identidad Nacional (DNI)')}
`);

console.log('Generated successfully.');
