import { RepeatableTable } from './RepeatableTable'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step6() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step6 as any) || {}
  const data = watch('step6') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Familiares que no viajan contigo</h3>
        <p className="text-sm text-[#525252] mb-4">Familiares cercanos que NO viajarán contigo a Australia</p>
        
        <FormField label="¿Tienes familiares cercanos que NO viajarán contigo a Australia?" name="step6.has_non_accompanying_family" required error={errs.has_non_accompanying_family?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step6.has_non_accompanying_family')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step6.has_non_accompanying_family')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>

        {data.has_non_accompanying_family === 'true' && (
          
          <div className="mt-4">
            <RepeatableTable
              name="step6.non_accompanying_family"
              title="Familiares que no viajan"
              description="Ingresa los datos de los familiares (padres, cónyuge, hijos, hermanos) que NO viajarán contigo."
              defaultItem={{ relationship: '', family_name: '', given_names: '', sex: '', dob: '', country_of_birth: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <FormField label="Parentesco" name={`step6.non_accompanying_family.${index}.relationship`} error={errs.non_accompanying_family?.[index]?.relationship?.message}>
                    <input type="text" {...register(`step6.non_accompanying_family.${index}.relationship`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" placeholder="Ej: Padre, Hermano, etc." />
                  </FormField>
                  <FormField label="Apellidos" name={`step6.non_accompanying_family.${index}.family_name`} error={errs.non_accompanying_family?.[index]?.family_name?.message}>
                    <input type="text" {...register(`step6.non_accompanying_family.${index}.family_name`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                  <FormField label="Nombres" name={`step6.non_accompanying_family.${index}.given_names`} error={errs.non_accompanying_family?.[index]?.given_names?.message}>
                    <input type="text" {...register(`step6.non_accompanying_family.${index}.given_names`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                  <FormField label="Sexo" name={`step6.non_accompanying_family.${index}.sex`} error={errs.non_accompanying_family?.[index]?.sex?.message}>
                    <select {...register(`step6.non_accompanying_family.${index}.sex`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
                      <option value="">Seleccionar</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option>
                    </select>
                  </FormField>
                  <FormField label="Fecha de Nacimiento" name={`step6.non_accompanying_family.${index}.dob`} error={errs.non_accompanying_family?.[index]?.dob?.message}>
                    <input type="date" {...register(`step6.non_accompanying_family.${index}.dob`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                  <FormField label="País de Nacimiento" name={`step6.non_accompanying_family.${index}.country_of_birth`} error={errs.non_accompanying_family?.[index]?.country_of_birth?.message}>
                    <input type="text" {...register(`step6.non_accompanying_family.${index}.country_of_birth`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                </div>
              )}
            />
          </div>

        )}
      </div>
    </div>
  )
}
