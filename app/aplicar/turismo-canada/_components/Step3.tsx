import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'
import { RepeatableTable } from './RepeatableTable'

export function Step3() {
  const { register, formState, watch, setValue } = useFormContext()
  const errors = formState.errors as any

  const citizenSinceBirth = watch('step3.citizen_since_birth')
  const hasNationalId = watch('step3.has_national_id')
  const usedOtherName = watch('step3.used_other_name')

  useEffect(() => {
    if (citizenSinceBirth === 'true') {
      setValue('step3.citizen_since_date', '')
    }
  }, [citizenSinceBirth, setValue])

  useEffect(() => {
    if (hasNationalId === 'false') {
      setValue('step3.national_id_number', '')
      setValue('step3.national_id_issue_date', '')
      setValue('step3.national_id_country', '')
    }
  }, [hasNationalId, setValue])

  useEffect(() => {
    if (usedOtherName === 'false') {
      setValue('step3.other_names', [])
    }
  }, [usedOtherName, setValue])

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Lugar de Nacimiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="País de nacimiento" name="step3.birth_country" required error={errors.step3?.birth_country?.message as string}>
            <select {...register('step3.birth_country')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar país</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code} disabled={c.code === 'DIVIDER'}>{c.flag ? c.flag + ' ' : ''}{c.name}</option>)}
            </select>
          </FormField>

          <FormField label="Ciudad/Pueblo de nacimiento" name="step3.birth_city" required error={errors.step3?.birth_city?.message as string}>
            <input {...register('step3.birth_city')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
        </div>
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Nacionalidad</h3>

        <FormField label="¿Tienes ciudadanía de más de un país/territorio?" name="step3.multiple_citizenship" required error={errors.step3?.multiple_citizenship?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step3.multiple_citizenship')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step3.multiple_citizenship')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        <FormField label="¿De qué país/territorio eres ciudadano principal?" name="step3.citizenship_country" required error={errors.step3?.citizenship_country?.message as string}>
          <select {...register('step3.citizenship_country')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
            <option value="">Seleccionar país</option>
            {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code} disabled={c.code === 'DIVIDER'}>{c.flag ? c.flag + ' ' : ''}{c.name}</option>)}
          </select>
        </FormField>

        <FormField label="¿Eres ciudadano de ese país desde que naciste?" name="step3.citizen_since_birth" required error={errors.step3?.citizen_since_birth?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step3.citizen_since_birth')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step3.citizen_since_birth')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {citizenSinceBirth === 'false' && (
          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] animate-in fade-in slide-in-from-top-2">
            <FormField label="¿Desde qué fecha eres ciudadano?" name="step3.citizen_since_date" required error={errors.step3?.citizen_since_date?.message as string}>
              <input type="date" {...register('step3.citizen_since_date')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
            </FormField>
          </div>
        )}
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Documento Nacional de Identidad</h3>

        <FormField label="¿Tienes un documento nacional de identidad? (Ej. Cédula, DNI)" name="step3.has_national_id" required error={errors.step3?.has_national_id?.message as string}>
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

        {hasNationalId === 'true' && (
          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] space-y-4 animate-in fade-in slide-in-from-top-2">
            <FormField label="Número de documento" name="step3.national_id_number" required error={errors.step3?.national_id_number?.message as string}>
              <input {...register('step3.national_id_number')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors uppercase" />
            </FormField>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Fecha de emisión" name="step3.national_id_issue_date" required error={errors.step3?.national_id_issue_date?.message as string}>
                <input type="date" {...register('step3.national_id_issue_date')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
              </FormField>
              
              <FormField label="País de emisión" name="step3.national_id_country" required error={errors.step3?.national_id_country?.message as string}>
                <select {...register('step3.national_id_country')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                  <option value="">Seleccionar país</option>
                  {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code} disabled={c.code === 'DIVIDER'}>{c.flag ? c.flag + ' ' : ''}{c.name}</option>)}
                </select>
              </FormField>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Nombres Adicionales</h3>

        <FormField label="¿Has usado algún otro nombre en el pasado? (Alias, nombre de soltero/a, etc.)" name="step3.used_other_name" required error={errors.step3?.used_other_name?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step3.used_other_name')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step3.used_other_name')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {usedOtherName === 'true' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <RepeatableTable
              name="step3.other_names"
              title="Añade los otros nombres usados"
              defaultItem={{ surname: '', given_name: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Apellidos" name={`step3.other_names.${index}.surname`} required error={(errors.step3?.other_names as any)?.[index]?.surname?.message as string}>
                    <input {...register(`step3.other_names.${index}.surname`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Nombres" name={`step3.other_names.${index}.given_name`} error={(errors.step3?.other_names as any)?.[index]?.given_name?.message as string}>
                    <input {...register(`step3.other_names.${index}.given_name`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
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
