import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'
import { RepeatableTable } from './RepeatableTable'

export function Step6() {
  const { register, formState, watch, setValue } = useFormContext()
  const errors = formState.errors as any

  const travelledPast5y = watch('step6.travelled_past_5y')
  const refusedVisa = watch('step6.refused_visa')

  useEffect(() => {
    if (travelledPast5y === 'false') {
      setValue('step6.travel_history', [])
    }
  }, [travelledPast5y, setValue])

  useEffect(() => {
    if (refusedVisa === 'false') {
      setValue('step6.refusal_details', '')
    }
  }, [refusedVisa, setValue])

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Viajes Previos</h3>

        <FormField label="¿Has viajado a otros países en los últimos 5 años?" name="step6.travelled_past_5y" required error={errors.step6?.travelled_past_5y?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step6.travelled_past_5y')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step6.travelled_past_5y')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {travelledPast5y === 'true' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <RepeatableTable
              name="step6.travel_history"
              title="Historial de Viajes"
              description="Añade los países que has visitado en los últimos 5 años (no incluyas tu país de residencia actual ni país de ciudadanía, a menos que estuvieras de visita)."
              defaultItem={{ country: '', location: '', purpose: '', from: '', to: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="País visitado" name={`step6.travel_history.${index}.country`} required error={(errors.step6?.travel_history as any)?.[index]?.country?.message as string}>
                    <select {...register(`step6.travel_history.${index}.country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors appearance-none">
                      <option value="">Seleccionar país</option>
                      {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Ciudad / Ubicación" name={`step6.travel_history.${index}.location`} required error={(errors.step6?.travel_history as any)?.[index]?.location?.message as string}>
                    <input {...register(`step6.travel_history.${index}.location`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors" />
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="Propósito del viaje" name={`step6.travel_history.${index}.purpose`} required error={(errors.step6?.travel_history as any)?.[index]?.purpose?.message as string}>
                      <input {...register(`step6.travel_history.${index}.purpose`)} placeholder="Ej: Turismo, Negocios, Visitar familia" className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors" />
                    </FormField>
                  </div>
                  <FormField label="Desde" name={`step6.travel_history.${index}.from`} required error={(errors.step6?.travel_history as any)?.[index]?.from?.message as string}>
                    <input type="date" {...register(`step6.travel_history.${index}.from`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors [color-scheme:light]" />
                  </FormField>
                  <FormField label="Hasta" name={`step6.travel_history.${index}.to`} required error={(errors.step6?.travel_history as any)?.[index]?.to?.message as string}>
                    <input type="date" {...register(`step6.travel_history.${index}.to`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors [color-scheme:light]" />
                  </FormField>
                </div>
              )}
            />
          </div>
        )}
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Visados y Legalidad</h3>

        <FormField label="¿Alguna vez te has quedado en Canadá más tiempo de lo permitido, estudiado o trabajado sin autorización?" name="step6.stayed_illegally_canada" required error={errors.step6?.stayed_illegally_canada?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step6.stayed_illegally_canada')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step6.stayed_illegally_canada')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Alguna vez te han denegado una visa, permiso, o te han denegado la entrada a Canadá o a cualquier otro país?" name="step6.refused_visa" required error={errors.step6?.refused_visa?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step6.refused_visa')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step6.refused_visa')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {refusedVisa === 'true' && (
          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] animate-in fade-in slide-in-from-top-2">
            <FormField label="Proporciona detalles sobre la denegación" hint="Máximo 500 caracteres" name="step6.refusal_details" required error={errors.step6?.refusal_details?.message as string}>
              <textarea 
                {...register('step6.refusal_details')} 
                className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors min-h-[120px] resize-y" 
                placeholder="Explica qué país te denegó, en qué año y por qué motivo (si lo sabes)..."
              />
            </FormField>
          </div>
        )}
      </div>
    </div>
  )
}
