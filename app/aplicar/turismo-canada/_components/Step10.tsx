import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'
import { RepeatableTable } from './RepeatableTable'
import { DocumentUploader } from './DocumentUploader'
import { getAge } from '@/lib/dates'

export function Step10() {
  const { register, formState, watch } = useFormContext()
  const errors = formState.errors as any

  const dob = watch('step2.date_of_birth')
  const age = dob ? getAge(dob) : 0
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
              <option value="en">Inglés</option>
              <option value="fr">Francés</option>
              <option value="both">Ambos</option>
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
                  {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code} disabled={c.code === 'DIVIDER'}>{c.flag ? c.flag + ' ' : ''}{c.name}</option>)}
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
          label="Cédula o documento de identidad nacional"
          required
          multiple
          specsList={[
            'Sube ambos lados de tu cédula o documento de identidad nacional, claro y a color.'
          ]}
        />

        <DocumentUploader
          name="step10.doc_ties"
          label="Prueba de lazos con el país de origen (Trabajo/Estudios)"
          required
          multiple
          specsList={[
            'Demuestra que tienes razones fuertes para regresar a tu país. Sube uno o varios de estos según tu caso:',
            'Si estás en Australia con visa de estudio/sponsor: tu visa actual + un bill o lease a tu nombre con tu dirección.',
            'Si vives en tu país de origen: certificado laboral (cargo, salario, antigüedad, vacaciones aprobadas) + certificados de propiedades o vehículos si los tienes.',
            'Si eres estudiante: carta de la institución confirmando matrícula activa.'
          ]}
        />

        {!isMinor && (
          <DocumentUploader
            name="step10.doc_bank_statements"
            label="Extractos bancarios"
            required
            multiple
            specsList={[
              'Extractos bancarios de los últimos 3 a 6 meses (PDF descargado del banco, NO screenshots).',
              '💡 Tip pro: Si tu banco genera una \'carta de balance\' o \'balance letter\' (en CommBank, ANZ, NAB y Bancolombia se puede), súbela también. Este documento suma puntos importantes.'
            ]}
          />
        )}

        <DocumentUploader
          name="step10.doc_travel_itinerary"
          label="Itinerario de viaje y Carta de Intención"
          multiple
          specsList={[
            'Como parte del servicio de $290, nuestro equipo profesional prepara tu carta de intención personalizada basada en los datos que nos diste. No tienes que escribir nada.',
            'Si prefieres subir tu propio itinerario en Word o PDF, puedes hacerlo acá (opcional).'
          ]}
        />

        <DocumentUploader
          name="step10.doc_forms_letters"
          label="Cartas adicionales (Opcional)"
          multiple
          specsList={[
            'Solo si vas a visitar familia o amigos en Canadá: sube la carta de invitación de tu anfitrión + copia de su pasaporte o residencia canadiense.'
          ]}
        />

        <DocumentUploader
          name="step10.doc_us_visa"
          label="Visa de Estados Unidos (si tienes)"
          multiple
          specsList={[
            'Si tienes una visa de Estados Unidos estampada en tu pasaporte (B1/B2, F1, J1, etc.), súbela. Esto SUMA PUNTOS importantes para tu visa de Canadá porque demuestra que ya pasaste un control consular estricto. Sube una foto clara del sticker de la visa en tu pasaporte.'
          ]}
        />
      </div>
    </div>
  )
}
