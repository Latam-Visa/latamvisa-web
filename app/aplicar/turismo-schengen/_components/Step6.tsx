import { useFormContext } from 'react-hook-form'

export function Step6() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 6: Alojamiento y Costos</h2>
        <p className="text-[#525252]">Información sobre quién le invita o dónde se hospedará y cómo cubrirá los gastos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Nombre de la persona que invita / Hotel / Alojamiento temporal</label>
          <input {...register('step6.inviting_person_or_hotel')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step6?.inviting_person_or_hotel && <p className="text-red-500 text-sm mt-1">{(errors.step6.inviting_person_or_hotel as any).message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Dirección postal y correo electrónico de la persona / Hotel</label>
          <input {...register('step6.inviting_address')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step6?.inviting_address && <p className="text-red-500 text-sm mt-1">{(errors.step6.inviting_address as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Teléfono de contacto</label>
          <input {...register('step6.inviting_phone')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step6?.inviting_phone && <p className="text-red-500 text-sm mt-1">{(errors.step6.inviting_phone as any).message}</p>}
        </div>

        <div className="md:col-span-2 mt-4">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-3">Los gastos de viaje y manutención durante su estancia están cubiertos por:</label>
          <select {...register('step6.costs_covered_by')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]">
            <option value="">Selecciona...</option>
            <option value="Por el solicitante mismo">Por el solicitante mismo</option>
            <option value="Por un patrocinador (anfitrión, empresa, organización)">Por un patrocinador</option>
          </select>
          {errors.step6?.costs_covered_by && <p className="text-red-500 text-sm mt-1">{(errors.step6.costs_covered_by as any).message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-3">Medios de subsistencia (Selecciona todos los que apliquen)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Efectivo',
              'Cheques de viaje',
              'Tarjetas de crédito',
              'Alojamiento prepagado',
              'Transporte prepagado',
              'Otros'
            ].map(method => (
              <label key={method} className="flex items-center gap-2 cursor-pointer p-3 border border-[#E5E5E5] rounded-xl hover:bg-[#FAFAF7] transition-colors">
                <input type="checkbox" value={method} {...register('step6.means_of_support')} className="w-4 h-4 text-[#C8FF00] rounded focus:ring-[#C8FF00]" />
                <span className="text-sm text-[#0A0A0A]">{method}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
