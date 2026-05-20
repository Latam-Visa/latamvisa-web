import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from './FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'

export function Step2Personal() {
  const { register, formState, watch, setValue } = useFormContext()
  const errors = formState.errors as any
  const maritalStatus = watch('step2Personal.maritalStatus')

  useEffect(() => {
    if (maritalStatus && maritalStatus !== 'Casado(a)' && maritalStatus !== 'Unión libre') {
      setValue('step2Personal.spouseSurnames', '')
      setValue('step2Personal.spouseGivenNames', '')
      setValue('step2Personal.spouseDateOfBirth', '')
      setValue('step2Personal.spouseNationality', '')
      setValue('step2Personal.spouseBirthCity', '')
      setValue('step2Personal.spouseBirthCountry', '')
    }
  }, [maritalStatus, setValue])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Género" 
          name="step2Personal.gender" 
          required 
          error={errors.step2Personal?.gender?.message as string}
        >
          <div className="flex flex-col gap-2 mt-2">
            {['Masculino', 'Femenino', 'Otro'].map(option => (
              <label key={option} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  value={option}
                  {...register('step2Personal.gender')}
                  className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]"
                />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">{option}</span>
              </label>
            ))}
          </div>
        </FormField>

        <FormField 
          label="Estado civil" 
          name="step2Personal.maritalStatus" 
          required 
          error={errors.step2Personal?.maritalStatus?.message as string}
        >
          <select
            {...register('step2Personal.maritalStatus')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors appearance-none"
          >
            <option value="">Seleccionar estado civil</option>
            <option value="Soltero(a)">Soltero(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Unión libre">Unión libre</option>
            <option value="Viudo(a)">Viudo(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Separado(a) legalmente">Separado(a) legalmente</option>
            <option value="Otro">Otro</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Fecha de nacimiento" 
          name="step2Personal.dateOfBirth" 
          required 
          error={errors.step2Personal?.dateOfBirth?.message as string}
        >
          <input
            type="date"
            {...register('step2Personal.dateOfBirth')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]"
          />
        </FormField>

        <FormField 
          label="Nacionalidad" 
          name="step2Personal.nationality" 
          required 
          error={errors.step2Personal?.nationality?.message as string}
        >
          <select
            {...register('step2Personal.nationality')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors appearance-none"
          >
            <option value="">Seleccionar nacionalidad</option>
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
          label="Ciudad de nacimiento" 
          name="step2Personal.cityOfBirth" 
          required 
          error={errors.step2Personal?.cityOfBirth?.message as string}
        >
          <input
            {...register('step2Personal.cityOfBirth')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
            placeholder="Ej: Medellín"
          />
        </FormField>

        <FormField 
          label="Departamento / Estado / Provincia" 
          name="step2Personal.stateOfBirth" 
          required 
          error={errors.step2Personal?.stateOfBirth?.message as string}
        >
          <input
            {...register('step2Personal.stateOfBirth')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
            placeholder="Ej: Antioquia"
          />
        </FormField>
      </div>

      <FormField 
        label="Número de identificación" 
        name="step2Personal.identificationNumber" 
        required 
        hint="Tu número de identificación nacional (Cédula, DNI, CURP, etc.)"
        error={errors.step2Personal?.identificationNumber?.message as string}
      >
        <input
          {...register('step2Personal.identificationNumber')}
          className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
          placeholder="Ej: 1020304050"
        />
      </FormField>
    </div>
  )
}
