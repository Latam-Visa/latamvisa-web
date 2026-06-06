import { useFormContext, useWatch } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { RepeatableTable } from './RepeatableTable'
import { ALL_COUNTRIES as COUNTRIES } from '@/lib/constants/countries'

export function Step6() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  const hasValidVisa = useWatch({ name: 'step6.has_valid_visa' })

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Historial de Viajes</h3>
        <p className="text-sm text-[#525252] mb-4">Menciona tus viajes internacionales en los últimos 10 años, especialmente a USA, UK, Canadá, Australia, Nueva Zelanda y zona Schengen.</p>

        <RepeatableTable
          name="step6.travel_history"
          title="Viajes anteriores"
          defaultItem={{ country: '', date: '', purpose: '', duration: '' }}
          minItems={0}
          renderItem={(index) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="País visitado" name={`step6.travel_history.${index}.country`} required error={errors.step6?.travel_history?.[index]?.country?.message as string}>
                <select {...register(`step6.travel_history.${index}.country`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
                  <option value="">Seleccionar país</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Fecha del viaje (aprox)" name={`step6.travel_history.${index}.date`} required error={errors.step6?.travel_history?.[index]?.date?.message as string}>
                <input type="month" {...register(`step6.travel_history.${index}.date`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] [color-scheme:light] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
              <FormField label="Motivo de visita" name={`step6.travel_history.${index}.purpose`} required error={errors.step6?.travel_history?.[index]?.purpose?.message as string}>
                <input {...register(`step6.travel_history.${index}.purpose`)} placeholder="Ej: Turismo, Negocios" className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
              <FormField label="Duración (aprox)" name={`step6.travel_history.${index}.duration`} required error={errors.step6?.travel_history?.[index]?.duration?.message as string}>
                <input {...register(`step6.travel_history.${index}.duration`)} placeholder="Ej: 15 días" className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
            </div>
          )}
        />
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Visas Vigentes</h3>
        
        <FormField label="¿Tienes alguna visa vigente para USA, Canadá, Australia, Nueva Zelanda o Schengen?" name="step6.has_valid_visa" required error={errors.step6?.has_valid_visa?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step6.has_valid_visa')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step6.has_valid_visa')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {hasValidVisa === 'true' && (
          <RepeatableTable
            name="step6.valid_visas"
            title="Detalles de Visas Vigentes"
            defaultItem={{ country: '', visa_number: '', expiry_date: '' }}
            minItems={1}
            renderItem={(index) => (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="País" name={`step6.valid_visas.${index}.country`} required error={errors.step6?.valid_visas?.[index]?.country?.message as string}>
                  <select {...register(`step6.valid_visas.${index}.country`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
                    <option value="">Seleccionar</option>
                    <option value="USA">Estados Unidos</option>
                    <option value="Canada">Canadá</option>
                    <option value="Australia">Australia</option>
                    <option value="New Zealand">Nueva Zelanda</option>
                    <option value="Schengen">Schengen</option>
                  </select>
                </FormField>
                <FormField label="Número de Visa" name={`step6.valid_visas.${index}.visa_number`} required error={errors.step6?.valid_visas?.[index]?.visa_number?.message as string}>
                  <input {...register(`step6.valid_visas.${index}.visa_number`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
                </FormField>
                <FormField label="Fecha de expiración" name={`step6.valid_visas.${index}.expiry_date`} required error={errors.step6?.valid_visas?.[index]?.expiry_date?.message as string}>
                  <input type="date" {...register(`step6.valid_visas.${index}.expiry_date`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] [color-scheme:light] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
                </FormField>
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}
