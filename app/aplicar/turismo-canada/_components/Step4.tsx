import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'
import { RepeatableTable } from './RepeatableTable'

export function Step4() {
  const { register, formState, watch, setValue } = useFormContext()
  const errors = formState.errors as any

  const mailingSame = watch('step4.mailing_same')

  useEffect(() => {
    if (mailingSame === 'true') {
      setValue('step4.mailing_country', '')
      setValue('step4.mailing_street', '')
      setValue('step4.mailing_city', '')
      setValue('step4.mailing_postal_code', '')
    }
  }, [mailingSame, setValue])

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Dirección Residencial Actual</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="País de residencia" name="step4.residential_country" required error={errors.step4?.residential_country?.message as string}>
            <select {...register('step4.residential_country')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] focus:ring-2 focus:ring-[#2F4A00] transition-colors appearance-none">
              <option value="">Seleccionar país</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Ciudad/Pueblo" name="step4.residential_city" required error={errors.step4?.residential_city?.message as string}>
            <input {...register('step4.residential_city')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] focus:ring-2 focus:ring-[#2F4A00] transition-colors" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Dirección (Calle, número, apto)" name="step4.residential_street" required error={errors.step4?.residential_street?.message as string}>
            <input {...register('step4.residential_street')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] focus:ring-2 focus:ring-[#2F4A00] transition-colors" />
          </FormField>
          <FormField label="Código postal (Opcional)" name="step4.residential_postal_code" error={errors.step4?.residential_postal_code?.message as string}>
            <input {...register('step4.residential_postal_code')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] focus:ring-2 focus:ring-[#2F4A00] transition-colors" />
          </FormField>
        </div>
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Dirección de Correspondencia</h3>

        <FormField label="¿Tu dirección postal es la misma que la residencial?" name="step4.mailing_same" required error={errors.step4?.mailing_same?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step4.mailing_same')} className="w-5 h-5 accent-[#2F4A00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step4.mailing_same')} className="w-5 h-5 accent-[#2F4A00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {mailingSame === 'false' && (
          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="País de correspondencia" name="step4.mailing_country" required error={errors.step4?.mailing_country?.message as string}>
                <select {...register('step4.mailing_country')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors appearance-none">
                  <option value="">Seleccionar país</option>
                  {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Ciudad/Pueblo" name="step4.mailing_city" required error={errors.step4?.mailing_city?.message as string}>
                <input {...register('step4.mailing_city')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors" />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Dirección (Calle, número, apto)" name="step4.mailing_street" required error={errors.step4?.mailing_street?.message as string}>
                <input {...register('step4.mailing_street')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors" />
              </FormField>
              <FormField label="Código postal (Opcional)" name="step4.mailing_postal_code" error={errors.step4?.mailing_postal_code?.message as string}>
                <input {...register('step4.mailing_postal_code')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors" />
              </FormField>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <RepeatableTable
          name="step4.residence_history"
          title="Historial de Residencia"
          description="Añade las direcciones donde has vivido en los últimos 5 años (empezando por la actual)."
          defaultItem={{ country: '', status: '', status_other_detail: '', from: '', to: '' }}
          minItems={1}
          renderItem={(index) => {
            const currentStatus = watch(`step4.residence_history.${index}.status`)
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="País/Territorio" name={`step4.residence_history.${index}.country`} required error={(errors.step4?.residence_history as any)?.[index]?.country?.message as string}>
                  <select {...register(`step4.residence_history.${index}.country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors appearance-none">
                    <option value="">Seleccionar país</option>
                    {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </FormField>
                
                <FormField label="Tu estatus en ese país" name={`step4.residence_history.${index}.status`} required error={(errors.step4?.residence_history as any)?.[index]?.status?.message as string}>
                  <select {...register(`step4.residence_history.${index}.status`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors appearance-none">
                    <option value="">Seleccionar estatus</option>
                    <option value="Citizen">Ciudadano(a)</option>
                    <option value="Permanent Resident">Residente Permanente</option>
                    <option value="Visitor">Visitante</option>
                    <option value="Worker">Trabajador(a)</option>
                    <option value="Student">Estudiante</option>
                    <option value="Other">Otro</option>
                  </select>
                </FormField>

                {currentStatus === 'Other' && (
                  <div className="md:col-span-2">
                    <FormField label="Detalles del estatus" name={`step4.residence_history.${index}.status_other_detail`} error={(errors.step4?.residence_history as any)?.[index]?.status_other_detail?.message as string}>
                      <input {...register(`step4.residence_history.${index}.status_other_detail`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors" placeholder="Especifica tu estatus..." />
                    </FormField>
                  </div>
                )}

                <FormField label="Desde" name={`step4.residence_history.${index}.from`} required error={(errors.step4?.residence_history as any)?.[index]?.from?.message as string}>
                  <input type="date" {...register(`step4.residence_history.${index}.from`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors [color-scheme:light]" />
                </FormField>
                
                <FormField label="Hasta (Fecha actual si es tu residencia actual)" name={`step4.residence_history.${index}.to`} required error={(errors.step4?.residence_history as any)?.[index]?.to?.message as string}>
                  <input type="date" {...register(`step4.residence_history.${index}.to`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#2F4A00] transition-colors [color-scheme:light]" />
                </FormField>
              </div>
            )
          }}
        />
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Biométricos</h3>

        <FormField label="¿Has proporcionado huellas dactilares y foto (biométricos) a Canadá en los últimos 10 años?" name="step4.provided_biometrics_10y" required error={errors.step4?.provided_biometrics_10y?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step4.provided_biometrics_10y')} className="w-5 h-5 accent-[#2F4A00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step4.provided_biometrics_10y')} className="w-5 h-5 accent-[#2F4A00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>
      </div>
    </div>
  )
}
