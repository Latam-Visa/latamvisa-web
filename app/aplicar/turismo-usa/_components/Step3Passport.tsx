import { useFormContext } from 'react-hook-form'
import { FormField } from './FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'

export function Step3Passport() {
  const { register, watch, formState } = useFormContext()
  const errors = formState.errors as any

  const passportLostStolen = watch('step3Passport.passportLostStolen')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Número de pasaporte"
          name="step3Passport.passportNumber"
          required
          error={errors.step3Passport?.passportNumber?.message as string}
        >
          <input
            {...register('step3Passport.passportNumber')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors uppercase"
            placeholder="Ej: AV123456"
          />
        </FormField>

        <FormField
          label="País de emisión"
          name="step3Passport.passportIssueCountry"
          required
          error={errors.step3Passport?.passportIssueCountry?.message as string}
        >
          <select
            {...register('step3Passport.passportIssueCountry')}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Fecha de emisión"
          name="step3Passport.passportIssueDate"
          required
          error={errors.step3Passport?.passportIssueDate?.message as string}
        >
          <input
            type="date"
            {...register('step3Passport.passportIssueDate')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]"
          />
        </FormField>

        <FormField
          label="Fecha de expiración"
          name="step3Passport.passportExpiryDate"
          required
          error={errors.step3Passport?.passportExpiryDate?.message as string}
        >
          <input
            type="date"
            {...register('step3Passport.passportExpiryDate')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]"
          />
        </FormField>
      </div>

      <div className="pt-4 border-t border-[#E5E5E5]">
        <FormField
          label="¿Has perdido o te han robado un pasaporte alguna vez?"
          name="step3Passport.passportLostStolen"
          required
          error={errors.step3Passport?.passportLostStolen?.message as string}
        >
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                value="true"
                {...register('step3Passport.passportLostStolen')}
                className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]"
              />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                value="false"
                {...register('step3Passport.passportLostStolen')}
                className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]"
              />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>
      </div>

      {passportLostStolen === 'true' && (
        <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
          <FormField
            label="Breve explicación de lo ocurrido"
            name="step3Passport.passportLostDetails"
            required
            error={errors.step3Passport?.passportLostDetails?.message as string}
          >
            <textarea
              {...register('step3Passport.passportLostDetails')}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors min-h-[100px] resize-y"
              placeholder="Ej: Fui víctima de robo en..."
            />
          </FormField>
        </div>
      )}

      <div className="mt-2 bg-[#F0FFF0] border border-[#C8FF00]/40 rounded-xl px-5 py-4 flex gap-3">
        <span className="text-xl shrink-0">📸</span>
        <p className="text-sm text-[#525252] leading-relaxed">
          <strong className="text-[#0A0A0A]">Sobre las fotos:</strong> Después de enviar este formulario, te contactaremos por WhatsApp para pedirte las fotos que necesitamos (pasaporte, foto tipo visa). Es más rápido y seguro mandarlas por ese medio.
        </p>
      </div>
    </div>
  )
}
