import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'

export function Step2() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step2 as any) || {}
  const data = watch('step2') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Datos Personales</h3>
        <p className="text-sm text-[#525252] mb-4">Información de pasaporte</p>
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={`Apellidos`} name="step2.family_name" required error={errs.family_name?.message as string}>
          <input type="text" {...register('step2.family_name')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Nombres`} name="step2.given_names" required error={errs.given_names?.message as string}>
          <input type="text" {...register('step2.given_names')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label="Sexo" name="step2.sex" required error={errs.sex?.message as string}>
            <select {...register('step2.sex')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Male">Masculino</option>
              <option value="Female">Femenino</option>
              <option value="Other">Otro</option>
            </select>
          </FormField>
          <FormField label={`Fecha de Nacimiento`} name="step2.date_of_birth" required error={errs.date_of_birth?.message as string}>
          <input type="date" {...register('step2.date_of_birth')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Número de Pasaporte`} name="step2.passport_number" required error={errs.passport_number?.message as string}>
          <input type="text" {...register('step2.passport_number')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`País del Pasaporte`} name="step2.country_of_passport" required error={errs.country_of_passport?.message as string}>
            <select {...register('step2.country_of_passport')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code} disabled={c.code === 'DIVIDER'}>{c.flag ? c.flag + ' ' : ''}{c.name}</option>)}
            </select>
          </FormField>
          <FormField label={`Nacionalidad del Titular`} name="step2.nationality_passport_holder" required error={errs.nationality_passport_holder?.message as string}>
            <select {...register('step2.nationality_passport_holder')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code} disabled={c.code === 'DIVIDER'}>{c.flag ? c.flag + ' ' : ''}{c.name}</option>)}
            </select>
          </FormField>
          <FormField label={`Lugar de Emisión`} name="step2.passport_place_of_issue" required error={errs.passport_place_of_issue?.message as string}>
          <input type="text" {...register('step2.passport_place_of_issue')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Fecha de Emisión`} name="step2.passport_issue_date" required error={errs.passport_issue_date?.message as string}>
          <input type="date" {...register('step2.passport_issue_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Fecha de Expiración`} name="step2.passport_expiry_date" required error={errs.passport_expiry_date?.message as string}>
          <input type="date" {...register('step2.passport_expiry_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
        </div>

      </div>
    </div>
  )
}
