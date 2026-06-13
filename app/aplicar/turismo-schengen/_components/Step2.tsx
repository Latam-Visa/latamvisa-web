import { useFormContext } from 'react-hook-form'

export function Step2() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 2: Documento de viaje</h2>
        <p className="text-[#525252]">Información de tu pasaporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Tipo de documento de viaje</label>
          <select {...register('step2.travel_document_type')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]">
            <option value="">Selecciona...</option>
            <option value="Pasaporte ordinario">Pasaporte ordinario</option>
            <option value="Pasaporte diplomático">Pasaporte diplomático</option>
            <option value="Pasaporte de servicio">Pasaporte de servicio</option>
            <option value="Pasaporte oficial">Pasaporte oficial</option>
            <option value="Pasaporte especial">Pasaporte especial</option>
            <option value="Otro">Otro documento de viaje</option>
          </select>
          {errors.step2?.travel_document_type && <p className="text-red-500 text-sm mt-1">{(errors.step2.travel_document_type as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Número de pasaporte</label>
          <input {...register('step2.passport_number')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step2?.passport_number && <p className="text-red-500 text-sm mt-1">{(errors.step2.passport_number as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Fecha de expedición</label>
          <input type="date" {...register('step2.passport_issue_date')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step2?.passport_issue_date && <p className="text-red-500 text-sm mt-1">{(errors.step2.passport_issue_date as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Fecha de caducidad</label>
          <input type="date" {...register('step2.passport_expiry_date')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step2?.passport_expiry_date && <p className="text-red-500 text-sm mt-1">{(errors.step2.passport_expiry_date as any).message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">País de expedición</label>
          <input {...register('step2.passport_issuing_country')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step2?.passport_issuing_country && <p className="text-red-500 text-sm mt-1">{(errors.step2.passport_issuing_country as any).message}</p>}
        </div>
      </div>
    </div>
  )
}
