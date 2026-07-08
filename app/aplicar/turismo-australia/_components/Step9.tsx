import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step9() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step9 as any) || {}
  const data = watch('step9') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Soporte Financiero</h3>
        <p className="text-sm text-[#525252] mb-4">Fondos para tu estadía</p>
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="¿Quién financiará tu viaje?" name="step9.funding_type" required error={errs.funding_type?.message as string}>
            <select {...register('step9.funding_type')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Self-funded">Yo mismo</option>
              <option value="Supported by another person">Otra persona (Sponsor)</option>
              <option value="Supported by organisation">Organización / Empresa</option>
            </select>
          </FormField>
          <FormField label={`¿Qué tipo de soporte proveerán? (Alojamiento, vuelos, todo)`} name="step9.support_type" required error={errs.support_type?.message as string}>
          <input type="text" {...register('step9.support_type')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
        </div>
        
        <FormField label={`Detalles de fondos disponibles (Ej: $5000 USD ahorros, Tarjetas crédito...)`} name="step9.funds_available_details" required error={errs.funds_available_details?.message as string}>
          <textarea {...register('step9.funds_available_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
        </FormField>

        {data.funding_type && data.funding_type !== 'Self-funded' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
            <FormField label="Nombre, relación y datos de contacto de quien financia tu viaje" name="step9.supporter_details" error={errs.supporter_details?.message as string}>
              <textarea {...register('step9.supporter_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          </div>
        )}

      </div>
    </div>
  )
}
