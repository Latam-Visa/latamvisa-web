import { useFormContext } from 'react-hook-form'

export function Step3() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 3: Contacto y Ocupación</h2>
        <p className="text-[#525252]">Información de contacto, residencia actual y trabajo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Dirección de residencia (domicilio completo)</label>
          <input {...register('step3.home_address')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step3?.home_address && <p className="text-red-500 text-sm mt-1">{(errors.step3.home_address as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Correo electrónico</label>
          <input type="email" {...register('step3.home_email')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step3?.home_email && <p className="text-red-500 text-sm mt-1">{(errors.step3.home_email as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Teléfono</label>
          <input {...register('step3.home_phone')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step3?.home_phone && <p className="text-red-500 text-sm mt-1">{(errors.step3.home_phone as any).message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-3">¿Reside en un país distinto al de su nacionalidad actual?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Sí" {...register('step3.residence_other_country')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>Sí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="No" {...register('step3.residence_other_country')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>No</span>
            </label>
          </div>
          {errors.step3?.residence_other_country && <p className="text-red-500 text-sm mt-1">{(errors.step3.residence_other_country as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Ocupación actual</label>
          <input {...register('step3.current_occupation')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" placeholder="Ej. Ingeniero, Estudiante, etc." />
          {errors.step3?.current_occupation && <p className="text-red-500 text-sm mt-1">{(errors.step3.current_occupation as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Nombre del empleador / institución</label>
          <input {...register('step3.employer_name')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
        </div>
      </div>
    </div>
  )
}
