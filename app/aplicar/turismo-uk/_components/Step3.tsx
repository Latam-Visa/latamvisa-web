import { useFormContext, useWatch } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import COUNTRIES from '@/lib/constants/countries.json'

export function Step3() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  const hasOtherNationality = useWatch({ name: 'step3.has_other_nationality' })
  const hasNationalId = useWatch({ name: 'step3.has_national_id' })

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Nacionalidad e Identidad</h3>

        <FormField label="Nacionalidad Actual" name="step3.current_nationality" required error={errors.step3?.current_nationality?.message as string}>
          <select {...register('step3.current_nationality')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
            <option value="">Seleccionar país</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
          </select>
        </FormField>

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Tienes otra nacionalidad?" name="step3.has_other_nationality" required error={errors.step3?.has_other_nationality?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step3.has_other_nationality')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step3.has_other_nationality')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {hasOtherNationality === 'true' && (
          <FormField label="Otra nacionalidad" name="step3.other_nationality" required error={errors.step3?.other_nationality?.message as string}>
            <select {...register('step3.other_nationality')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
              <option value="">Seleccionar país</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </FormField>
        )}

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Tienes un documento de identidad nacional?" hint="Cédula, DNI, RUT, etc." name="step3.has_national_id" required error={errors.step3?.has_national_id?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step3.has_national_id')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step3.has_national_id')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {hasNationalId === 'true' && (
          <FormField label="Número de Identidad Nacional" name="step3.national_id_number" required error={errors.step3?.national_id_number?.message as string}>
            <input {...register('step3.national_id_number')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
        )}
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Residencia Actual</h3>

        <FormField label="País de Residencia Actual" name="step3.country_of_residence" required error={errors.step3?.country_of_residence?.message as string}>
          <select {...register('step3.country_of_residence')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
            <option value="">Seleccionar país</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
          </select>
        </FormField>

        <FormField label="Tiempo viviendo en el país actual" hint="Ej: Desde nacimiento, 5 años, 6 meses, etc." name="step3.time_in_current_residence" required error={errors.step3?.time_in_current_residence?.message as string}>
          <input {...register('step3.time_in_current_residence')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
        </FormField>
      </div>
    </div>
  )
}
