import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step12() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step12 as any) || {}
  const data = watch('step12') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Historial de Visas</h3>
        <p className="text-sm text-[#525252] mb-4">Experiencia previa con inmigración</p>
        
        
        <FormField label={`¿Tienes o has tenido visas válidas para Australia u otros países?`} name="step12.holds_other_visa" required error={errs.holds_other_visa?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step12.holds_other_visa')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step12.holds_other_visa')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        {data.holds_other_visa === 'true' && (
          <div className="mt-4">
            <FormField label={`Detalles de Visas Previas`} name="step12.visa_history_details"  error={errs.visa_history_details?.message as string}>
          <textarea {...register('step12.visa_history_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
        </FormField>
          </div>
        )}
        
        <FormField label={`¿Alguna vez has excedido el tiempo de estadía o incumplido condiciones de visa?`} name="step12.visa_non_compliance" required error={errs.visa_non_compliance?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step12.visa_non_compliance')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step12.visa_non_compliance')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        {data.visa_non_compliance === 'true' && (
          <div className="mt-4">
            <FormField label={`Detalles de Incumplimiento`} name="step12.visa_non_compliance_details"  error={errs.visa_non_compliance_details?.message as string}>
          <textarea {...register('step12.visa_non_compliance_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
        </FormField>
          </div>
        )}

        <FormField label={`¿Te han denegado o cancelado una visa en cualquier país?`} name="step12.visa_refused_cancelled" required error={errs.visa_refused_cancelled?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step12.visa_refused_cancelled')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step12.visa_refused_cancelled')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        {data.visa_refused_cancelled === 'true' && (
          <div className="mt-4">
            <FormField label={`Detalles de Denegación`} name="step12.visa_refused_details"  error={errs.visa_refused_details?.message as string}>
          <textarea {...register('step12.visa_refused_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
        </FormField>
          </div>
        )}

      </div>
    </div>
  )
}
