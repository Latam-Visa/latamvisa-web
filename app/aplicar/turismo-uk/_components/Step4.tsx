import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES as COUNTRIES } from '@/lib/constants/countries'

export function Step4() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Dirección de Residencia Actual</h3>

        <FormField label="Dirección - Línea 1" name="step4.residential_address_line1" required error={errors.step4?.residential_address_line1?.message as string}>
          <input {...register('step4.residential_address_line1')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
        </FormField>
        
        <FormField label="Dirección - Línea 2 (Opcional)" name="step4.residential_address_line2" error={errors.step4?.residential_address_line2?.message as string}>
          <input {...register('step4.residential_address_line2')} placeholder="Apto, Suite, Unidad, etc." className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Ciudad" name="step4.residential_city" required error={errors.step4?.residential_city?.message as string}>
            <input {...register('step4.residential_city')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
          
          <FormField label="Estado o Provincia" name="step4.residential_state" required error={errors.step4?.residential_state?.message as string}>
            <input {...register('step4.residential_state')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Código Postal" name="step4.residential_postal_code" required error={errors.step4?.residential_postal_code?.message as string}>
            <input {...register('step4.residential_postal_code')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>

          <FormField label="País" name="step4.residential_country" required error={errors.step4?.residential_country?.message as string}>
            <select {...register('step4.residential_country')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
              <option value="">Seleccionar país</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Tiempo viviendo en esta dirección" hint="Ej: 2 años, 5 meses, etc." name="step4.time_at_current_address" required error={errors.step4?.time_at_current_address?.message as string}>
          <input {...register('step4.time_at_current_address')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
        </FormField>
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Datos de Contacto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Teléfono" hint="Incluir código de país, ej: +57" name="step4.phone" required error={errors.step4?.phone?.message as string}>
            <input type="tel" {...register('step4.phone')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>

          <FormField label="Correo Electrónico" name="step4.email" required error={errors.step4?.email?.message as string}>
            <input type="email" {...register('step4.email')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
        </div>
      </div>
    </div>
  )
}
