import { useFormContext, useWatch } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step7() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  const visaRefused = useWatch({ name: 'step7.visa_refused_before' })
  const deported = useWatch({ name: 'step7.deported_or_removed' })
  const criminal = useWatch({ name: 'step7.criminal_conviction' })

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Historial de Visas y Deportaciones</h3>

        <FormField label="¿Te han negado alguna vez una visa para cualquier país?" name="step7.visa_refused_before" required error={errors.step7?.visa_refused_before?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step7.visa_refused_before')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step7.visa_refused_before')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>
        
        {visaRefused === 'true' && (
          <FormField label="Explica qué país y por qué (si lo sabes)" name="step7.visa_refusal_details" required error={errors.step7?.visa_refusal_details?.message as string}>
            <textarea 
              {...register('step7.visa_refusal_details')} 
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors min-h-[100px] resize-y" 
            />
          </FormField>
        )}

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Has sido deportado, expulsado o se te ha exigido abandonar algún país?" name="step7.deported_or_removed" required error={errors.step7?.deported_or_removed?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step7.deported_or_removed')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step7.deported_or_removed')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {deported === 'true' && (
          <FormField label="Proporciona detalles" name="step7.deportation_details" required error={errors.step7?.deportation_details?.message as string}>
            <textarea 
              {...register('step7.deportation_details')} 
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors min-h-[100px] resize-y" 
            />
          </FormField>
        )}
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Historial Penal</h3>

        <FormField label="¿Tienes alguna condena penal o cargo pendiente en cualquier país?" name="step7.criminal_conviction" required error={errors.step7?.criminal_conviction?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step7.criminal_conviction')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step7.criminal_conviction')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>
        
        {criminal === 'true' && (
          <FormField label="Proporciona detalles" name="step7.criminal_conviction_details" required error={errors.step7?.criminal_conviction_details?.message as string}>
            <textarea 
              {...register('step7.criminal_conviction_details')} 
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors min-h-[100px] resize-y" 
            />
          </FormField>
        )}
      </div>
    </div>
  )
}
