import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step4() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step4 as any) || {}
  const data = watch('step4') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Direcciones y Contacto</h3>
        <p className="text-sm text-[#525252] mb-4">Información de residencia</p>
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={`País de Residencia Usual`} name="step4.usual_country_of_residence" required error={errs.usual_country_of_residence?.message as string}>
          <input type="text" {...register('step4.usual_country_of_residence')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          
          <FormField label={`País de Residencia Actual`} name="step4.res_country" required error={errs.res_country?.message as string}>
          <input type="text" {...register('step4.res_country')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Dirección Residencial`} name="step4.res_address" required error={errs.res_address?.message as string}>
          <input type="text" {...register('step4.res_address')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Barrio/Suburbio`} name="step4.res_suburb" required error={errs.res_suburb?.message as string}>
          <input type="text" {...register('step4.res_suburb')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Estado/Provincia`} name="step4.res_state" required error={errs.res_state?.message as string}>
          <input type="text" {...register('step4.res_state')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Código Postal`} name="step4.res_postcode"  error={errs.res_postcode?.message as string}>
          <input type="text" {...register('step4.res_postcode')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label={`Teléfono Fijo`} name="step4.phone_home"  error={errs.phone_home?.message as string}>
          <input type="text" {...register('step4.phone_home')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Teléfono Negocio`} name="step4.phone_business"  error={errs.phone_business?.message as string}>
          <input type="text" {...register('step4.phone_business')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          <FormField label={`Teléfono Móvil`} name="step4.phone_mobile" required error={errs.phone_mobile?.message as string}>
          <input type="text" {...register('step4.phone_mobile')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
        </div>

        <FormField label={`¿La dirección postal es la misma que la residencial?`} name="step4.postal_same_as_residential" required error={errs.postal_same_as_residential?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step4.postal_same_as_residential')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step4.postal_same_as_residential')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        
        {data.postal_same_as_residential === 'false' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm mt-4">
            <FormField label={`País Postal`} name="step4.postal_country"  error={errs.postal_country?.message as string}>
          <input type="text" {...register('step4.postal_country')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
            <FormField label={`Dirección Postal`} name="step4.postal_address"  error={errs.postal_address?.message as string}>
          <input type="text" {...register('step4.postal_address')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
            <FormField label={`Barrio/Suburbio Postal`} name="step4.postal_suburb"  error={errs.postal_suburb?.message as string}>
          <input type="text" {...register('step4.postal_suburb')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
            <FormField label={`Estado/Provincia Postal`} name="step4.postal_state"  error={errs.postal_state?.message as string}>
          <input type="text" {...register('step4.postal_state')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
            <FormField label={`Código Postal Postal`} name="step4.postal_postcode"  error={errs.postal_postcode?.message as string}>
          <input type="text" {...register('step4.postal_postcode')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          </div>
        )}

        <FormField label={`Correo Electrónico`} name="step4.email" required error={errs.email?.message as string}>
          <input type="email" {...register('step4.email')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
        <FormField label={`¿Autorizas a otra persona a recibir correspondencia oficial?`} name="step4.has_authorised_recipient" required error={errs.has_authorised_recipient?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step4.has_authorised_recipient')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step4.has_authorised_recipient')} className="w-5 h-5 accent-[#C8FF00]" />
              <span className="text-[#525252]">No</span>
            </label>
          </div>
        </FormField>
        {data.has_authorised_recipient === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
            <FormField label="Nombre, relación y contacto de la persona autorizada" name="step4.authorised_recipient_details" error={errs.authorised_recipient_details?.message as string}>
              <textarea {...register('step4.authorised_recipient_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          </div>
        )}

      </div>
    </div>
  )
}
