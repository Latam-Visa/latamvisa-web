import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step11() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step11 as any) || {}
  const data = watch('step11') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Carácter</h3>
        <p className="text-sm text-[#525252] mb-4">Antecedentes judiciales y de seguridad</p>
        
        
        <div className="space-y-4">
          <p className="text-sm font-medium">Historial legal (Debe ser reportado todo así haya sido hace años):</p>
          <FormField label="¿Has sido arrestado o condenado por un crimen?" name="step11.character_declarations.convicted" error={(errs.character_declarations as any)?.convicted?.message as string}>
            <div className="flex gap-4">
              <label><input type="radio" value="true" {...register('step11.character_declarations.convicted')} className="accent-[#C8FF00]" /> Sí</label>
              <label><input type="radio" value="false" {...register('step11.character_declarations.convicted')} className="accent-[#C8FF00]" /> No</label>
            </div>
          </FormField>
          
          
        
          {data.character_declarations?.convicted === 'true' && (
            <FormField label="Proporciona detalles del arresto o condena" name="step11.character_details" error={errs.character_details?.message as string}>
              <textarea {...register('step11.character_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          )}
        </div>
      </div>
    </div>
  )
}

