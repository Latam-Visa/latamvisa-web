import { useFormContext, useWatch } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { RepeatableTable } from './RepeatableTable'

export function Step1() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  const visitedUkBefore = useWatch({ name: 'step1.visited_uk_before' })
  const hasUkContacts = useWatch({ name: 'step1.has_uk_contacts' })

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Detalles principales de la aplicación</h3>
        
        <FormField label="Motivo principal del viaje" name="step1.purpose_of_visit" required error={errors.step1?.purpose_of_visit?.message as string}>
          <select {...register('step1.purpose_of_visit')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
            <option value="">Seleccionar motivo</option>
            <option value="Tourism">Turismo</option>
            <option value="Family Visit">Visitar familia/amigos</option>
            <option value="Business">Negocios</option>
            <option value="Transit">Tránsito</option>
          </select>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Fecha estimada de entrada a UK" name="step1.proposed_entry_date" required error={errors.step1?.proposed_entry_date?.message as string}>
            <input type="date" {...register('step1.proposed_entry_date')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors [color-scheme:light]" />
          </FormField>

          <FormField label="Fecha estimada de salida de UK" name="step1.proposed_exit_date" required error={errors.step1?.proposed_exit_date?.message as string}>
            <input type="date" {...register('step1.proposed_exit_date')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors [color-scheme:light]" />
          </FormField>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Has visitado el Reino Unido antes?" name="step1.visited_uk_before" required error={errors.step1?.visited_uk_before?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step1.visited_uk_before')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step1.visited_uk_before')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {visitedUkBefore === 'true' && (
          <FormField label="Detalles de tus visitas anteriores" name="step1.visited_uk_details" required error={errors.step1?.visited_uk_details?.message as string}>
            <textarea 
              {...register('step1.visited_uk_details')} 
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors min-h-[100px] resize-y" 
              placeholder="Indica fechas aproximadas y motivos de viaje..."
            />
          </FormField>
        )}

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Tienes familiares o amigos en el Reino Unido?" name="step1.has_uk_contacts" required error={errors.step1?.has_uk_contacts?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step1.has_uk_contacts')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step1.has_uk_contacts')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {hasUkContacts === 'true' && (
          <RepeatableTable
            name="step1.uk_contacts"
            title="Tus contactos en Reino Unido"
            defaultItem={{ name: '', address: '', relationship: '' }}
            minItems={1}
            renderItem={(index) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre completo" name={`step1.uk_contacts.${index}.name`} required error={errors.step1?.uk_contacts?.[index]?.name?.message as string}>
                  <input {...register(`step1.uk_contacts.${index}.name`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
                </FormField>
                <FormField label="Relación" name={`step1.uk_contacts.${index}.relationship`} required error={errors.step1?.uk_contacts?.[index]?.relationship?.message as string}>
                  <input {...register(`step1.uk_contacts.${index}.relationship`)} placeholder="Ej: Hermano, Amigo" className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Dirección / Ciudad" name={`step1.uk_contacts.${index}.address`} required error={errors.step1?.uk_contacts?.[index]?.address?.message as string}>
                    <input {...register(`step1.uk_contacts.${index}.address`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
                  </FormField>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}
