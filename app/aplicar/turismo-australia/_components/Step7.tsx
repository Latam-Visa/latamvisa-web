import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step7() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step7 as any) || {}
  const data = watch('step7') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Detalles de Estadía</h3>
        <p className="text-sm text-[#525252] mb-4">Fechas y actividades en Australia</p>
        
        
        <FormField label={`¿Planeas múltiples entradas a Australia?`} name="step7.multiple_entries" required error={errs.multiple_entries?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step7.multiple_entries')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step7.multiple_entries')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tiempo de estadía planeado" name="step7.length_of_stay" required error={errs.length_of_stay?.message as string}>
            <select {...register('step7.length_of_stay')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Up to 3 months">Hasta 3 meses</option>
              <option value="Up to 6 months">Hasta 6 meses</option>
              <option value="Up to 12 months">Hasta 12 meses</option>
            </select>
          </FormField>
          <FormField label={`Fecha de Llegada Planeada`} name="step7.planned_arrival_date" required error={errs.planned_arrival_date?.message as string}>
          <input type="date" {...register('step7.planned_arrival_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Fecha de Salida Planeada`} name="step7.planned_departure_date" required error={errs.planned_departure_date?.message as string}>
          <input type="date" {...register('step7.planned_departure_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
        </div>

        <FormField label={`¿Planeas estudiar un curso corto en Australia?`} name="step7.study_in_australia" required error={errs.study_in_australia?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step7.study_in_australia')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step7.study_in_australia')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        {data.study_in_australia === 'true' && (
          <div className="mt-4">
            <FormField label={`Detalles del estudio`} name="step7.study_details"  error={errs.study_details?.message as string}>
          <textarea {...register('step7.study_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
        </FormField>
          </div>
        )}

        <FormField label={`¿Visitarás a algún contacto, familiar o amigo en Australia?`} name="step7.will_visit_contacts" required error={errs.will_visit_contacts?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step7.will_visit_contacts')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step7.will_visit_contacts')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        {data.will_visit_contacts === 'true' && (
          <div className="mt-4">
            <FormField label="Nombre y relación de los contactos que visitarás" name="step7.contacts_in_australia_details" error={errs.contacts_in_australia_details?.message as string}>
              <textarea {...register('step7.contacts_in_australia_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          </div>
        )}

      </div>
    </div>
  )
}
