import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step10() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step10 as any) || {}
  const data = watch('step10') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Declaraciones Médicas</h3>
        <p className="text-sm text-[#525252] mb-4">Estado de salud actual</p>
        
        
        <div className="space-y-4">
          <p className="text-sm font-medium">Por favor, responde honestamente a las siguientes preguntas médicas impuestas por Home Affairs:</p>
          <FormField label="¿En los últimos 5 años has estado en un país de riesgo de tuberculosis?" name="step10.health_declarations.tuberculosis" error={(errs.health_declarations as any)?.tuberculosis?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step10.health_declarations.tuberculosis')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step10.health_declarations.tuberculosis')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          
          <FormField label="¿Tienes tuberculosis o alguna condición relacionada?" name="step10.health_declarations.has_tb" error={(errs.health_declarations as any)?.has_tb?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step10.health_declarations.has_tb')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step10.health_declarations.has_tb')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          
          
        
          {(data.health_declarations?.tuberculosis === 'true' || data.health_declarations?.has_tb === 'true') && (
            <FormField label="Proporciona detalles de las condiciones de salud afirmativas" name="step10.health_details" error={errs.health_details?.message as string}>
              <textarea {...register('step10.health_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          )}
        </div>
      </div>
    </div>
  )
}

