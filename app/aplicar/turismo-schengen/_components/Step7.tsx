import { useFormContext } from 'react-hook-form'

export function Step7() {
  const { register, formState: { errors }, watch } = useFormContext()

  const hasEUFamily = watch('step7.eu_family_member')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 7: Familiar en la UE / EEE / CH</h2>
        <p className="text-[#525252]">Solo aplica si viajas para visitar a un familiar ciudadano de la Unión Europea, Espacio Económico Europeo o Suiza.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-3">¿Eres familiar de un ciudadano de la UE, del EEE o de Suiza?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Sí" {...register('step7.eu_family_member')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>Sí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="No" {...register('step7.eu_family_member')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>No</span>
            </label>
          </div>
          {errors.step7?.eu_family_member && <p className="text-red-500 text-sm mt-1">{(errors.step7.eu_family_member as any).message}</p>}
        </div>

        {hasEUFamily === 'Sí' && (
          <>
            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Apellidos del familiar</label>
              <input {...register('step7.eu_family_surname')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Nombres del familiar</label>
              <input {...register('step7.eu_family_first_name')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Fecha de nacimiento</label>
              <input type="date" {...register('step7.eu_family_dob')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Nacionalidad</label>
              <input {...register('step7.eu_family_nationality')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Número de documento o pasaporte</label>
              <input {...register('step7.eu_family_doc_number')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Parentesco</label>
              <select {...register('step7.eu_family_relationship')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]">
                <option value="">Selecciona...</option>
                <option value="Cónyuge">Cónyuge</option>
                <option value="Hijo/a">Hijo/a</option>
                <option value="Nieto/a">Nieto/a</option>
                <option value="Ascendiente a cargo">Ascendiente a cargo</option>
                <option value="Pareja registrada">Pareja registrada</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
