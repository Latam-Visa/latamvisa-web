import { useFormContext } from 'react-hook-form'

export function Step1() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 1: Identidad</h2>
        <p className="text-[#525252]">Información personal del aplicante.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Apellidos actuales</label>
          <input {...register('step1.surname')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step1?.surname && <p className="text-red-500 text-sm mt-1">{(errors.step1.surname as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Apellidos de nacimiento (si difieren)</label>
          <input {...register('step1.surname_at_birth')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step1?.surname_at_birth && <p className="text-red-500 text-sm mt-1">{(errors.step1.surname_at_birth as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Nombres</label>
          <input {...register('step1.first_names')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step1?.first_names && <p className="text-red-500 text-sm mt-1">{(errors.step1.first_names as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Fecha de nacimiento</label>
          <input type="date" {...register('step1.date_of_birth')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step1?.date_of_birth && <p className="text-red-500 text-sm mt-1">{(errors.step1.date_of_birth as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Lugar de nacimiento</label>
          <input {...register('step1.place_of_birth')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step1?.place_of_birth && <p className="text-red-500 text-sm mt-1">{(errors.step1.place_of_birth as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">País de nacimiento</label>
          <input {...register('step1.country_of_birth')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step1?.country_of_birth && <p className="text-red-500 text-sm mt-1">{(errors.step1.country_of_birth as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Nacionalidad actual</label>
          <input {...register('step1.current_nationality')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step1?.current_nationality && <p className="text-red-500 text-sm mt-1">{(errors.step1.current_nationality as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Nacionalidad al nacer (Opcional)</label>
          <input {...register('step1.nationality_at_birth')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Otras nacionalidades (Opcional)</label>
          <input {...register('step1.other_nationalities')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-3">Sexo</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Masculino" {...register('step1.sex')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>Masculino</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Femenino" {...register('step1.sex')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>Femenino</span>
            </label>
          </div>
          {errors.step1?.sex && <p className="text-red-500 text-sm mt-1">{(errors.step1.sex as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Estado civil</label>
          <select {...register('step1.civil_status')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]">
            <option value="">Selecciona...</option>
            <option value="Soltero/a">Soltero/a</option>
            <option value="Casado/a">Casado/a</option>
            <option value="Separado/a">Separado/a</option>
            <option value="Divorciado/a">Divorciado/a</option>
            <option value="Viudo/a">Viudo/a</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.step1?.civil_status && <p className="text-red-500 text-sm mt-1">{(errors.step1.civil_status as any).message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Número de identidad nacional (Opcional)</label>
          <input {...register('step1.national_id_number')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
        </div>
      </div>
    </div>
  )
}
