import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormField } from './FormField'
import { Plus, Trash2 } from 'lucide-react'
import { ALL_COUNTRIES } from '@/lib/constants/countries'

export function Step6Family() {
  const { register, watch, control, formState } = useFormContext()
  const errors = formState.errors as any
  
  const familyInUsa = watch('step6Family.familyInUsa')
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'step6Family.familyInUsaDetails'
  })

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] border-b border-[#E5E5E5] pb-2">Datos del Padre</h3>
        <FormField label="Nombre completo del padre" name="step6Family.fatherFullName" error={errors.step6Family?.fatherFullName?.message as string}>
          <input {...register('step6Family.fatherFullName')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors" />
        </FormField>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nacionalidad del padre" name="step6Family.fatherNationality" error={errors.step6Family?.fatherNationality?.message as string}>
            <select {...register('step6Family.fatherNationality')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors appearance-none">
              <option value="">Seleccionar país</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </FormField>
          
          <FormField label="Fecha de nacimiento del padre" name="step6Family.fatherDateOfBirth" hint="Si no la sabes exacta, pon una fecha aproximada. (Opcional)" error={errors.step6Family?.fatherDateOfBirth?.message as string}>
            <input type="date" {...register('step6Family.fatherDateOfBirth')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]" />
          </FormField>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-lg font-medium text-[#0A0A0A] border-b border-[#E5E5E5] pb-2">Datos de la Madre</h3>
        <FormField label="Nombre completo de la madre" name="step6Family.motherFullName" error={errors.step6Family?.motherFullName?.message as string}>
          <input {...register('step6Family.motherFullName')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors" />
        </FormField>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nacionalidad de la madre" name="step6Family.motherNationality" error={errors.step6Family?.motherNationality?.message as string}>
            <select {...register('step6Family.motherNationality')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors appearance-none">
              <option value="">Seleccionar país</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </FormField>
          
          <FormField label="Fecha de nacimiento de la madre" name="step6Family.motherDateOfBirth" hint="Opcional" error={errors.step6Family?.motherDateOfBirth?.message as string}>
            <input type="date" {...register('step6Family.motherDateOfBirth')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]" />
          </FormField>
        </div>
      </div>

      <div className="pt-6 border-t border-[#E5E5E5]">
        <FormField label="¿Tienes familia en USA?" name="step6Family.familyInUsa" required error={errors.step6Family?.familyInUsa?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step6Family.familyInUsa')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step6Family.familyInUsa')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A]">No</span>
            </label>
          </div>
        </FormField>
      </div>

      {familyInUsa === 'true' && (
        <div className="space-y-4">
          {fields.map((item, index) => (
            <div key={item.id} className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] relative space-y-4">
              <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-[#A3A3A3] hover:text-[#DC2626] transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Familiar en USA {index + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre completo" name={`step6Family.familyInUsaDetails.${index}.fullName`} required error={errors.step6Family?.familyInUsaDetails?.[index]?.fullName?.message as string}>
                  <input {...register(`step6Family.familyInUsaDetails.${index}.fullName`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
                </FormField>
                <FormField label="Fecha de nacimiento (aprox)" name={`step6Family.familyInUsaDetails.${index}.dateOfBirth`} required error={errors.step6Family?.familyInUsaDetails?.[index]?.dateOfBirth?.message as string}>
                  <input type="date" {...register(`step6Family.familyInUsaDetails.${index}.dateOfBirth`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] [color-scheme:light]" />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Relación contigo" name={`step6Family.familyInUsaDetails.${index}.relationship`} required error={errors.step6Family?.familyInUsaDetails?.[index]?.relationship?.message as string}>
                  <select {...register(`step6Family.familyInUsaDetails.${index}.relationship`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] appearance-none">
                    <option value="">Seleccionar...</option>
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Hermano(a)">Hermano(a)</option>
                    <option value="Tío(a)">Tío(a)</option>
                    <option value="Primo(a)">Primo(a)</option>
                    <option value="Abuelo(a)">Abuelo(a)</option>
                    <option value="Otro">Otro</option>
                  </select>
                </FormField>
                <FormField label="Estatus migratorio" name={`step6Family.familyInUsaDetails.${index}.statusInUsa`} required error={errors.step6Family?.familyInUsaDetails?.[index]?.statusInUsa?.message as string}>
                  <select {...register(`step6Family.familyInUsaDetails.${index}.statusInUsa`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] appearance-none">
                    <option value="">Seleccionar...</option>
                    <option value="Ciudadano americano">Ciudadano americano</option>
                    <option value="Residente permanente">Residente permanente</option>
                    <option value="Otro estatus">Otro estatus</option>
                    <option value="No sé">No sé</option>
                  </select>
                </FormField>
              </div>
            </div>
          ))}

          {fields.length < 10 && (
            <button
              type="button"
              onClick={() => append({ fullName: '', dateOfBirth: '', relationship: '', statusInUsa: '' })}
              className="flex items-center gap-2 text-[#C8FF00] hover:text-[#A8D900] font-medium px-4 py-2 border border-[#C8FF00]/30 rounded-lg bg-[#C8FF00]/5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar familiar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
