import { useFormContext } from 'react-hook-form'

export function Step4() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 4: El Viaje</h2>
        <p className="text-[#525252]">Detalles del propósito de viaje y estancia en el espacio Schengen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Propósito principal del viaje</label>
          <select {...register('step4.purpose_of_journey')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]">
            <option value="">Selecciona...</option>
            <option value="Turismo">Turismo</option>
            <option value="Negocios">Negocios</option>
            <option value="Visita familiar o amigos">Visita a familiares o amigos</option>
            <option value="Cultural">Cultural</option>
            <option value="Deportes">Deportes</option>
            <option value="Visita oficial">Visita oficial</option>
            <option value="Razones médicas">Razones médicas</option>
            <option value="Estudios">Estudios</option>
            <option value="Tránsito aeroportuario">Tránsito aeroportuario</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.step4?.purpose_of_journey && <p className="text-red-500 text-sm mt-1">{(errors.step4.purpose_of_journey as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Estado miembro de destino principal</label>
          <select {...register('step4.member_state_destination')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]">
            <option value="">Selecciona el país...</option>
            <option value="Alemania">Alemania</option>
            <option value="Austria">Austria</option>
            <option value="Bélgica">Bélgica</option>
            <option value="Dinamarca">Dinamarca</option>
            <option value="Eslovaquia">Eslovaquia</option>
            <option value="Eslovenia">Eslovenia</option>
            <option value="España">España</option>
            <option value="Estonia">Estonia</option>
            <option value="Finlandia">Finlandia</option>
            <option value="Francia">Francia</option>
            <option value="Grecia">Grecia</option>
            <option value="Hungría">Hungría</option>
            <option value="Islandia">Islandia</option>
            <option value="Italia">Italia</option>
            <option value="Letonia">Letonia</option>
            <option value="Liechtenstein">Liechtenstein</option>
            <option value="Lituania">Lituania</option>
            <option value="Luxemburgo">Luxemburgo</option>
            <option value="Malta">Malta</option>
            <option value="Noruega">Noruega</option>
            <option value="Países Bajos">Países Bajos</option>
            <option value="Polonia">Polonia</option>
            <option value="Portugal">Portugal</option>
            <option value="República Checa">República Checa</option>
            <option value="Suecia">Suecia</option>
            <option value="Suiza">Suiza</option>
          </select>
          {errors.step4?.member_state_destination && <p className="text-red-500 text-sm mt-1">{(errors.step4.member_state_destination as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Estado miembro de primera entrada</label>
          <input {...register('step4.member_state_first_entry')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step4?.member_state_first_entry && <p className="text-red-500 text-sm mt-1">{(errors.step4.member_state_first_entry as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Otros destinos (Opcional)</label>
          <input {...register('step4.additional_destinations')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Número de entradas solicitadas</label>
          <select {...register('step4.number_of_entries')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]">
            <option value="">Selecciona...</option>
            <option value="Una entrada">Una entrada</option>
            <option value="Dos entradas">Dos entradas</option>
            <option value="Múltiples entradas">Múltiples entradas</option>
          </select>
          {errors.step4?.number_of_entries && <p className="text-red-500 text-sm mt-1">{(errors.step4.number_of_entries as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Duración de la estancia prevista (días)</label>
          <input type="number" {...register('step4.duration_of_stay_days')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step4?.duration_of_stay_days && <p className="text-red-500 text-sm mt-1">{(errors.step4.duration_of_stay_days as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Fecha prevista de llegada</label>
          <input type="date" {...register('step4.intended_arrival_date')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step4?.intended_arrival_date && <p className="text-red-500 text-sm mt-1">{(errors.step4.intended_arrival_date as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Fecha prevista de salida</label>
          <input type="date" {...register('step4.intended_departure_date')} className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
          {errors.step4?.intended_departure_date && <p className="text-red-500 text-sm mt-1">{(errors.step4.intended_departure_date as any).message}</p>}
        </div>
      </div>
    </div>
  )
}
