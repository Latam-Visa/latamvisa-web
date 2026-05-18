import { useFormContext } from 'react-hook-form'
import { FormField } from './FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'

export function Step1Contact() {
  const { register, watch, formState } = useFormContext()
  const errors = formState.errors as any
  
  const currentVisaType = watch('step1Contact.currentVisaType')
  const selectedCountryCode = watch('step1Contact.currentCountry')
  
  const selectedCountry = ALL_COUNTRIES.find(c => c.code === selectedCountryCode)
  const defaultPhoneCode = selectedCountry ? selectedCountry.phoneCode : '+57'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Nombre completo" 
          name="step1Contact.fullName" 
          required 
          error={errors.step1Contact?.fullName?.message as string}
          hint="Tal como aparece en tu pasaporte"
        >
          <input
            {...register('step1Contact.fullName')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
            placeholder="Ej: Juan Carlos Pérez Gómez"
          />
        </FormField>

        <FormField 
          label="Correo electrónico" 
          name="step1Contact.email" 
          required 
          error={errors.step1Contact?.email?.message as string}
        >
          <input
            type="email"
            {...register('step1Contact.email')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
            placeholder="correo@ejemplo.com"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="¿Qué visa tienes actualmente?" 
          name="step1Contact.currentVisaType" 
          error={errors.step1Contact?.currentVisaType?.message as string}
        >
          <select
            {...register('step1Contact.currentVisaType')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors appearance-none"
          >
            <option value="">Seleccionar (opcional)</option>
            <option value="Visa de estudiante">Visa de estudiante</option>
            <option value="Pareja">Pareja</option>
            <option value="Bridging">Bridging</option>
            <option value="Otra">Otra</option>
          </select>
        </FormField>

        {currentVisaType === 'Otra' && (
          <FormField 
            label="Especifica qué visa tienes" 
            name="step1Contact.currentVisaOther" 
            required 
            error={errors.step1Contact?.currentVisaOther?.message as string}
          >
            <input
              {...register('step1Contact.currentVisaOther')}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
              placeholder="Escribe el tipo de visa"
            />
          </FormField>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="País donde vives actualmente" 
          name="step1Contact.currentCountry" 
          required 
          error={errors.step1Contact?.currentCountry?.message as string}
        >
          <select
            {...register('step1Contact.currentCountry')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors appearance-none"
          >
            <option value="">Seleccionar país</option>
            {ALL_COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField 
          label="Ciudad donde vives actualmente" 
          name="step1Contact.currentCity" 
          required 
          error={errors.step1Contact?.currentCity?.message as string}
        >
          <input
            {...register('step1Contact.currentCity')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
            placeholder="Ej: Bogotá"
          />
        </FormField>
      </div>

      <FormField 
        label="Dirección completa actual" 
        name="step1Contact.currentAddress" 
        required 
        error={errors.step1Contact?.currentAddress?.message as string}
      >
        <textarea
          {...register('step1Contact.currentAddress')}
          className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors min-h-[100px] resize-y"
          placeholder="Calle, número, apartamento, barrio..."
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Código postal" 
          name="step1Contact.currentPostcode" 
          error={errors.step1Contact?.currentPostcode?.message as string}
        >
          <input
            {...register('step1Contact.currentPostcode')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
            placeholder="Ej: 110111"
          />
        </FormField>

        <FormField 
          label="WhatsApp" 
          name="step1Contact.whatsapp" 
          required 
          error={errors.step1Contact?.whatsapp?.message as string}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#A3A3A3]">
              {defaultPhoneCode}
            </div>
            <input
              {...register('step1Contact.whatsapp')}
              className={`w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg py-3 pr-4 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors`}
              style={{ paddingLeft: `${defaultPhoneCode.length * 10 + 24}px` }}
              placeholder="300 123 4567"
            />
          </div>
        </FormField>
      </div>

      <FormField 
        label="Facebook / Instagram" 
        name="step1Contact.socialMedia" 
        hint="Ej: @latamvisas"
        error={errors.step1Contact?.socialMedia?.message as string}
      >
        <input
          {...register('step1Contact.socialMedia')}
          className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
          placeholder="@usuario"
        />
      </FormField>
    </div>
  )
}
