import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'
import { RepeatableTable } from './RepeatableTable'
import { DocumentUploader } from './DocumentUploader'

export function Step10() {
  const { register, formState, watch } = useFormContext()
  const errors = formState.errors as any

  const dob = watch('step2.date_of_birth')
  const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 0
  const isMinor = age < 18

  const emailValue = watch('step10.email')
  const emailConfirmValue = watch('step10.email_confirm')

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Idiomas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Idioma nativo / Materno" name="step10.native_language" required error={errors.step10?.native_language?.message as string}>
            <input {...register('step10.native_language')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
          <FormField label="¿Qué idiomas oficiales de Canadá dominas?" name="step10.communicate_language" required error={errors.step10?.communicate_language?.message as string}>
            <select {...register('step10.communicate_language')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar</option>
              <option value="English">Inglés</option>
              <option value="French">Francés</option>
              <option value="Both">Ambos</option>
              <option value="Neither">Ninguno</option>
            </select>
          </FormField>
        </div>

      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Medios de Contacto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Correo electrónico" name="step10.email" required error={errors.step10?.email?.message as string}>
            <input type="email" {...register('step10.email')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
          <FormField label="Confirmar correo" name="step10.email_confirm" required error={errors.step10?.email_confirm?.message as string}>
            <input 
              type="email" 
              {...register('step10.email_confirm')} 
              onPaste={(e) => e.preventDefault()} 
              className={`w-full bg-white border rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:ring-2 transition-colors ${
                emailValue && emailConfirmValue && emailValue !== emailConfirmValue 
                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20' 
                  : 'border-[#E5E5E5] focus:border-[#C8FF00] focus:ring-[#C8FF00]'
              }`} 
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-6">
        <RepeatableTable
          name="step10.phones"
          title="Números de Teléfono"
          description="Añade tus números de contacto (Celular, Casa, Trabajo)."
          defaultItem={{ type: '', country: '', dial_code: '', number: '', extension: '' }}
          minItems={1}
          renderItem={(index) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Tipo de teléfono" name={`step10.phones.${index}.type`} required error={(errors.step10?.phones as any)?.[index]?.type?.message as string}>
                <select {...register(`step10.phones.${index}.type`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                  <option value="">Seleccionar tipo</option>
                  <option value="Cellular">Celular / Móvil</option>
                  <option value="Residence">Casa / Residencia</option>
                  <option value="Business">Trabajo</option>
                </select>
              </FormField>
              
              <FormField label="País" name={`step10.phones.${index}.country`} required error={(errors.step10?.phones as any)?.[index]?.country?.message as string}>
                <select {...register(`step10.phones.${index}.country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                  <option value="">Seleccionar país</option>
                  {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </FormField>
              
              <div className="md:col-span-2 grid grid-cols-[1fr_2fr_1fr] gap-4">
                <FormField label="Cod. área/país" name={`step10.phones.${index}.dial_code`} required error={(errors.step10?.phones as any)?.[index]?.dial_code?.message as string}>
                  <input {...register(`step10.phones.${index}.dial_code`)} placeholder="+00" className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                </FormField>
                <FormField label="Número telefónico" name={`step10.phones.${index}.number`} required error={(errors.step10?.phones as any)?.[index]?.number?.message as string}>
                  <input type="tel" {...register(`step10.phones.${index}.number`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                </FormField>
                <FormField label="Ext." name={`step10.phones.${index}.extension`} error={(errors.step10?.phones as any)?.[index]?.extension?.message as string}>
                  <input {...register(`step10.phones.${index}.extension`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                </FormField>
              </div>
            </div>
          )}
        />
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-8">
        <div>
          <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Carga de Documentos</h3>
          <p className="text-sm text-[#525252]">Por favor carga los documentos requeridos en formato PDF, Word, o imagen.</p>
        </div>

        <DocumentUploader
          name="step10.doc_id_passport"
          label="Pasaporte (Hoja de datos biográficos)"
          required
          specsList={[
            'Debe ser una copia clara a color.',
            'Asegúrate de que no haya reflejos que oculten tu foto o los datos.'
          ]}
        />

        <DocumentUploader
          name="step10.doc_ties"
          label="Prueba de lazos con el país de origen (Trabajo/Estudios)"
          required
          specsList={[
            'Si trabajas: Carta laboral indicando tu cargo, sueldo, tiempo de servicio y aprobación de vacaciones.',
            'Si estudias: Certificado de estudios, pago de matrícula o carta de la institución.'
          ]}
        />

        {!isMinor && (
          <DocumentUploader
            name="step10.doc_bank_statements"
            label="Extractos bancarios de los últimos 4 meses"
            required
            specsList={[
              'Deben mostrar tu nombre y saldo final.',
              'Debe demostrar que cuentas con los fondos indicados en el paso de finanzas.'
            ]}
          />
        )}

        <DocumentUploader
          name="step10.doc_travel_itinerary"
          label="Itinerario de viaje (Vuelos y alojamiento)"
          required
          specsList={[
            'No necesitas comprar los pasajes. Solo evidencia de reservas de vuelos y hotel.',
            'Si te quedas con un familiar, carga una carta de invitación.'
          ]}
        />

        <DocumentUploader
          name="step10.doc_forms_letters"
          label="Cartas adicionales o documentos de apoyo (Opcional)"
          specsList={[
            'Carta explicativa de los motivos del viaje.',
            'Documentos adicionales que prueben arraigo (propiedades, etc.).'
          ]}
        />
      </div>
    </div>
  )
}
