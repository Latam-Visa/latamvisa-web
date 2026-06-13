import { useFormContext } from 'react-hook-form'

export function Step8() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 8: Confirmaciones y Firma</h2>
        <p className="text-[#525252]">Declaraciones legales y confirmación de requisitos indispensables para el espacio Schengen.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#F5F5F0] p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-start pt-1">
              <input type="checkbox" {...register('step8.travel_insurance_confirmed')} className="w-5 h-5 rounded border-[#E5E5E5] text-[#C8FF00] focus:ring-[#C8FF00] transition-colors" />
            </div>
            <div>
              <p className="font-bold text-[#0A0A0A] text-sm mb-1">Seguro Médico de Viaje</p>
              <p className="text-[#525252] text-sm">Tengo conocimiento de la necesidad de disponer de un seguro médico de viaje adecuado con una cobertura mínima de 30.000 EUR que cubra todo el espacio Schengen.</p>
              {errors.step8?.travel_insurance_confirmed && <p className="text-red-500 text-xs mt-1">{(errors.step8.travel_insurance_confirmed as any).message}</p>}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-start pt-1">
              <input type="checkbox" {...register('step8.proof_of_funds_eur')} className="w-5 h-5 rounded border-[#E5E5E5] text-[#C8FF00] focus:ring-[#C8FF00] transition-colors" />
            </div>
            <div>
              <p className="font-bold text-[#0A0A0A] text-sm mb-1">Medios Económicos</p>
              <p className="text-[#525252] text-sm">Confirmo que poseo los medios económicos suficientes para mi estancia (aprox. 108 EUR por día por persona) comprobables en mi extracto bancario.</p>
              {errors.step8?.proof_of_funds_eur && <p className="text-red-500 text-xs mt-1">{(errors.step8.proof_of_funds_eur as any).message}</p>}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-start pt-1">
              <input type="checkbox" {...register('step8.accommodation_proof')} className="w-5 h-5 rounded border-[#E5E5E5] text-[#C8FF00] focus:ring-[#C8FF00] transition-colors" />
            </div>
            <div>
              <p className="font-bold text-[#0A0A0A] text-sm mb-1">Alojamiento Confirmado</p>
              <p className="text-[#525252] text-sm">Cuento con reservas de hotel confirmadas para todas las noches dentro del espacio Schengen o una carta de invitación oficial debidamente legalizada.</p>
              {errors.step8?.accommodation_proof && <p className="text-red-500 text-xs mt-1">{(errors.step8.accommodation_proof as any).message}</p>}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-start pt-1">
              <input type="checkbox" {...register('step8.return_ticket_confirmed')} className="w-5 h-5 rounded border-[#E5E5E5] text-[#C8FF00] focus:ring-[#C8FF00] transition-colors" />
            </div>
            <div>
              <p className="font-bold text-[#0A0A0A] text-sm mb-1">Boleto de Retorno</p>
              <p className="text-[#525252] text-sm">Cuento con reservación de vuelo de ida y vuelta a mi país de residencia u origen.</p>
              {errors.step8?.return_ticket_confirmed && <p className="text-red-500 text-xs mt-1">{(errors.step8.return_ticket_confirmed as any).message}</p>}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-start pt-1">
              <input type="checkbox" {...register('step8.ties_to_home_country')} className="w-5 h-5 rounded border-[#E5E5E5] text-[#C8FF00] focus:ring-[#C8FF00] transition-colors" />
            </div>
            <div>
              <p className="font-bold text-[#0A0A0A] text-sm mb-1">Arraigo en País de Origen</p>
              <p className="text-[#525252] text-sm">Poseo documentación que comprueba mi arraigo social y económico (certificado de trabajo, estudios, propiedades, etc.) que incentiva mi regreso.</p>
              {errors.step8?.ties_to_home_country && <p className="text-red-500 text-xs mt-1">{(errors.step8.ties_to_home_country as any).message}</p>}
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E5E5E5]">
          <div>
            <label className="block text-sm font-bold text-[#0A0A0A] mb-2">Lugar y Fecha de firma de este formulario</label>
            <input {...register('step8.place_and_date')} placeholder="Ej: Quito, 12 de Octubre 2026" className="w-full bg-[#FAFAF7] border border-[#E5E5E5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors text-[#0A0A0A]" />
            {errors.step8?.place_and_date && <p className="text-red-500 text-sm mt-1">{(errors.step8.place_and_date as any).message}</p>}
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-3 cursor-pointer group bg-[#0A0A0A] p-4 rounded-xl border border-transparent hover:border-[#C8FF00] transition-colors">
              <input type="checkbox" {...register('step8.signature_confirmed')} className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-[#C8FF00] focus:ring-[#C8FF00] transition-colors" />
              <div>
                <p className="font-bold text-white text-sm">Firma y Declaración Final</p>
                <p className="text-gray-400 text-xs">Declaro que a mi leal saber y entender todos los datos son correctos y completos. Acepto la preparación de mi expediente.</p>
              </div>
            </label>
            {errors.step8?.signature_confirmed && <p className="text-red-500 text-xs mt-1">{(errors.step8.signature_confirmed as any).message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
