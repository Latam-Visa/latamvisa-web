import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step1() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step1 as any) || {}
  const data = watch('step1') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Detalles de Aplicación</h3>
        <p className="text-sm text-[#525252] mb-4">Motivo del viaje y fechas</p>
        
        
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

        <FormField label={`¿Te encuentras actualmente fuera de Australia?`} name="step1.currently_outside_australia" required error={errs.currently_outside_australia?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step1.currently_outside_australia')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step1.currently_outside_australia')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={`País de ubicación actual`} name="step1.current_location_country" required error={errs.current_location_country?.message as string}>
          <input type="text" {...register('step1.current_location_country')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
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

        <FormField label="Motivos de la visita" name="step1.reasons_for_visit" required error={errs.reasons_for_visit?.message as string}>
          <div className="space-y-2 mt-2 text-sm text-[#0A0A0A]">
            {[
              { val: 'Tourism', label: 'Turismo (vacaciones, recreación)' },
              { val: 'Visit family or friends', label: 'Visitar familiares o amigos' },
              { val: 'Business visitor', label: 'Visitante de negocios' },
              { val: 'Other', label: 'Otro' }
            ].map(r => (
              <label key={r.val} className="flex items-center gap-3">
                <input type="checkbox" value={r.val} {...register('step1.reasons_for_visit')} className="w-5 h-5 accent-[#C8FF00]" />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </FormField>

        <FormField label={`Fechas significativas o detalles del evento (Opcional)`} name="step1.significant_dates_details"  error={errs.significant_dates_details?.message as string}>
          <textarea {...register('step1.significant_dates_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={`¿Estás aplicando como parte de un grupo?`} name="step1.group_processing" required error={errs.group_processing?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step1.group_processing')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step1.group_processing')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
          <FormField label={`¿Eres un representante de un gobierno extranjero o viajas bajo privilegios de la ONU?`} name="step1.special_category_entry" required error={errs.special_category_entry?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step1.special_category_entry')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step1.special_category_entry')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        </div>

        {data.group_processing === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
            <FormField label="Nombre del grupo/tour y con quién viajas" name="step1.group_processing_details" error={errs.group_processing_details?.message as string}>
              <textarea {...register('step1.group_processing_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          </div>
        )}

        {data.special_category_entry === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
            <FormField label="Detalles del cargo o privilegio (gobierno, organismo, rol)" name="step1.special_category_entry_details" error={errs.special_category_entry_details?.message as string}>
              <textarea {...register('step1.special_category_entry_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          </div>
        )}

      </div>
    </div>
  )
}
