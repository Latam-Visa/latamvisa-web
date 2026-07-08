import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step13() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step13 as any) || {}
  const data = watch('step13') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Declaraciones Finales</h3>
        <p className="text-sm text-[#525252] mb-4">Aceptación y entendimiento de las leyes migratorias</p>
        
        
        <div className="space-y-4">
          <p className="text-sm">Al marcar las siguientes casillas certificas que entiendes y aceptas las condiciones.</p>
          <FormField label="¿Has provisto información verdadera y correcta?" name="step13.declarations_consents.true_and_correct" error={(errs.declarations_consents as any)?.true_and_correct?.message as string}>
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register('step13.declarations_consents.true_and_correct')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-sm">Sí, acepto</span>
            </div>
          </FormField>
          <FormField label="¿Entiendes que tu visa puede ser cancelada si provees info falsa?" name="step13.declarations_consents.understand_cancellation" error={(errs.declarations_consents as any)?.understand_cancellation?.message as string}>
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register('step13.declarations_consents.understand_cancellation')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-sm">Sí, acepto</span>
            </div>
          </FormField>
          <FormField label="¿Aceptas que LATAM VISA procese estos datos en tu nombre?" name="step13.declarations_consents.agency_processing" error={(errs.declarations_consents as any)?.agency_processing?.message as string}>
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register('step13.declarations_consents.agency_processing')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-sm">Sí, acepto</span>
            </div>
          </FormField>
        </div>

      </div>
    </div>
  )
}
