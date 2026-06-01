import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'

export function Step2() {
  const { register, formState, watch, setValue } = useFormContext()
  const errors = formState.errors as any

  const holdsUsNonimmigrantVisa = watch('step2.holds_us_nonimmigrant_visa')

  useEffect(() => {
    if (holdsUsNonimmigrantVisa === 'false') {
      setValue('step2.us_visa_number', '')
      setValue('step2.us_visa_expiry', '')
      setValue('step2.different_passport_us_visa', '')
    }
  }, [holdsUsNonimmigrantVisa, setValue])

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Datos personales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Apellidos (como en el pasaporte)" name="step2.surname" required error={errors.step2?.surname?.message as string}>
            <input {...register('step2.surname')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
          <FormField label="Nombres (como en el pasaporte)" name="step2.given_name" error={errors.step2?.given_name?.message as string}>
            <input {...register('step2.given_name')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Fecha de nacimiento" name="step2.date_of_birth" required error={errors.step2?.date_of_birth?.message as string}>
            <input type="date" {...register('step2.date_of_birth')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors [color-scheme:light]" />
          </FormField>
          <FormField label="Género" name="step2.gender" required error={errors.step2?.gender?.message as string}>
            <select {...register('step2.gender')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar género</option>
              <option value="Male">Masculino</option>
              <option value="Female">Femenino</option>
              <option value="Another Gender">Otro género</option>
            </select>
          </FormField>
        </div>
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Documento de viaje (Pasaporte)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tipo de documento" name="step2.document_type" required error={errors.step2?.document_type?.message as string}>
            <select {...register('step2.document_type')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar documento</option>
              <option value="Passport">Pasaporte (Regular)</option>
              <option value="Official">Oficial</option>
              <option value="Diplomatic">Diplomático</option>
            </select>
          </FormField>
          <FormField label="Categoría de pasaporte" name="step2.passport_kind" required error={errors.step2?.passport_kind?.message as string}>
            <select {...register('step2.passport_kind')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar categoría</option>
              <option value="Regular">Regular</option>
              <option value="Official">Oficial</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="País que emitió el pasaporte" name="step2.passport_country_code" required error={errors.step2?.passport_country_code?.message as string}>
            <select {...register('step2.passport_country_code')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar país</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code} disabled={c.code === 'DIVIDER'}>{c.flag ? c.flag + ' ' : ''}{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Nacionalidad en el pasaporte" name="step2.passport_nationality" required error={errors.step2?.passport_nationality?.message as string}>
            <select {...register('step2.passport_nationality')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar país</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code} disabled={c.code === 'DIVIDER'}>{c.flag ? c.flag + ' ' : ''}{c.name}</option>)}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Número de pasaporte" name="step2.passport_number" required error={errors.step2?.passport_number?.message as string}>
            <input {...register('step2.passport_number')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors uppercase" />
          </FormField>
          <FormField label="Confirmar número de pasaporte" name="step2.passport_number_confirm" required error={errors.step2?.passport_number_confirm?.message as string}>
            <input {...register('step2.passport_number_confirm')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors uppercase" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Fecha de emisión" name="step2.passport_issue_date" required error={errors.step2?.passport_issue_date?.message as string}>
            <input type="date" {...register('step2.passport_issue_date')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors [color-scheme:light]" />
          </FormField>
          <FormField label="Fecha de vencimiento" name="step2.passport_expiry_date" required error={errors.step2?.passport_expiry_date?.message as string}>
            <input type="date" {...register('step2.passport_expiry_date')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors [color-scheme:light]" />
          </FormField>
        </div>
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Visados y Residencias</h3>

        <FormField label="¿Eres residente permanente legal de los Estados Unidos (Green Card)?" name="step2.us_green_card" required error={errors.step2?.us_green_card?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step2.us_green_card')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step2.us_green_card')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Has tenido una visa canadiense de visitante en los últimos 10 años?" name="step2.held_canadian_visa_10y" required error={errors.step2?.held_canadian_visa_10y?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step2.held_canadian_visa_10y')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step2.held_canadian_visa_10y')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Tienes actualmente una visa de no inmigrante válida de los Estados Unidos?" name="step2.holds_us_nonimmigrant_visa" required error={errors.step2?.holds_us_nonimmigrant_visa?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step2.holds_us_nonimmigrant_visa')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step2.holds_us_nonimmigrant_visa')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {holdsUsNonimmigrantVisa === 'true' && (
          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Número de visa de USA" name="step2.us_visa_number" required error={errors.step2?.us_visa_number?.message as string}>
                <input {...register('step2.us_visa_number')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors uppercase" />
              </FormField>
              <FormField label="Fecha de expiración de la visa" name="step2.us_visa_expiry" required error={errors.step2?.us_visa_expiry?.message as string}>
                <input type="date" {...register('step2.us_visa_expiry')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
              </FormField>
            </div>
            
            <FormField label="¿Esta visa está en un pasaporte diferente al que estás usando para aplicar?" name="step2.different_passport_us_visa" required error={errors.step2?.different_passport_us_visa?.message as string}>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" value="true" {...register('step2.different_passport_us_visa')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
                  <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" value="false" {...register('step2.different_passport_us_visa')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
                  <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
                </label>
              </div>
            </FormField>
          </div>
        )}

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Viajarás a Canadá por vía aérea?" name="step2.travelling_by_air" required error={errors.step2?.travelling_by_air?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step2.travelling_by_air')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step2.travelling_by_air')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>
      </div>
    </div>
  )
}
