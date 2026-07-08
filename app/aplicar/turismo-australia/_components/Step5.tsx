import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step5() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step5 as any) || {}
  const data = watch('step5') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Compañeros de Viaje</h3>
        <p className="text-sm text-[#525252] mb-4">¿Viajas con alguien más?</p>
        
        
        <FormField label={`¿Viajas con otras personas?`} name="step5.travelling_with_others" required error={errs.travelling_with_others?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step5.travelling_with_others')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step5.travelling_with_others')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>

      
        {data.travelling_with_others === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
             <FormField label="Nombres y relación de las personas con las que viajas" name="step5.travelling_companions_details" error={errs.travelling_companions_details?.message as string}>
              <textarea {...register('step5.travelling_companions_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}
      </div>
    </div>
  )
}
  
