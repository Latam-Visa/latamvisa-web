import { useFormContext, useWatch } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step9() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  const tb = useWatch({ name: 'step9.has_tuberculosis' })
  const medical = useWatch({ name: 'step9.requires_medical_treatment' })

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Información Médica</h3>

        <FormField label="¿Has padecido o estado en contacto con alguien con tuberculosis?" name="step9.has_tuberculosis" required error={errors.step9?.has_tuberculosis?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step9.has_tuberculosis')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step9.has_tuberculosis')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {tb === 'true' && (
          <FormField label="Proporciona detalles" name="step9.tuberculosis_details" required error={errors.step9?.tuberculosis_details?.message as string}>
            <textarea 
              {...register('step9.tuberculosis_details')} 
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors min-h-[100px] resize-y" 
            />
          </FormField>
        )}

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Necesitas recibir tratamiento médico en el Reino Unido?" name="step9.requires_medical_treatment" required error={errors.step9?.requires_medical_treatment?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step9.requires_medical_treatment')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step9.requires_medical_treatment')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {medical === 'true' && (
          <FormField label="Proporciona detalles de la condición médica y tratamiento" name="step9.medical_treatment_details" required error={errors.step9?.medical_treatment_details?.message as string}>
            <textarea 
              {...register('step9.medical_treatment_details')} 
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors min-h-[100px] resize-y" 
            />
          </FormField>
        )}
      </div>
    </div>
  )
}
