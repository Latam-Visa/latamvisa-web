import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import COUNTRIES from '@/lib/constants/countries.json'

export function Step2() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Información Personal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nombres" name="step2.first_name" required error={errors.step2?.first_name?.message as string}>
            <input {...register('step2.first_name')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
          
          <FormField label="Apellidos" name="step2.last_name" required error={errors.step2?.last_name?.message as string}>
            <input {...register('step2.last_name')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
        </div>

        <FormField label="Otros nombres utilizados (Opcional)" name="step2.other_names_used" hint="Nombres de soltera, alias, etc." error={errors.step2?.other_names_used?.message as string}>
          <input {...register('step2.other_names_used')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Fecha de Nacimiento" name="step2.date_of_birth" required error={errors.step2?.date_of_birth?.message as string}>
            <input type="date" {...register('step2.date_of_birth')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] [color-scheme:light] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Género" name="step2.gender" required error={errors.step2?.gender?.message as string}>
            <select {...register('step2.gender')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
              <option value="">Seleccionar</option>
              <option value="Male">Masculino</option>
              <option value="Female">Femenino</option>
              <option value="Other">Otro</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Ciudad de Nacimiento" name="step2.place_of_birth" required error={errors.step2?.place_of_birth?.message as string}>
            <input {...register('step2.place_of_birth')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="País de Nacimiento" name="step2.country_of_birth" required error={errors.step2?.country_of_birth?.message as string}>
            <select {...register('step2.country_of_birth')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
              <option value="">Seleccionar país</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </FormField>
        </div>
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Información del Pasaporte</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Número de Pasaporte" name="step2.passport_number" required error={errors.step2?.passport_number?.message as string}>
            <input {...register('step2.passport_number')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] uppercase focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Autoridad que lo emitió" name="step2.passport_issuing_authority" required error={errors.step2?.passport_issuing_authority?.message as string}>
            <input {...register('step2.passport_issuing_authority')} placeholder="Ej: Ministerio de Relaciones Exteriores" className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
        </div>

        <FormField label="País emisor del pasaporte" name="step2.passport_issuing_country" required error={errors.step2?.passport_issuing_country?.message as string}>
          <select {...register('step2.passport_issuing_country')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
            <option value="">Seleccionar país</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
          </select>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Fecha de Emisión" name="step2.passport_issue_date" required error={errors.step2?.passport_issue_date?.message as string}>
            <input type="date" {...register('step2.passport_issue_date')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] [color-scheme:light] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Fecha de Expiración" name="step2.passport_expiry_date" required error={errors.step2?.passport_expiry_date?.message as string}>
            <input type="date" {...register('step2.passport_expiry_date')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] [color-scheme:light] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
        </div>
      </div>
    </div>
  )
}
