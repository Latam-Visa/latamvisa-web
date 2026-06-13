import { useEffect } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormField } from './FormField'
import { Trash2, Plus } from 'lucide-react'
import { ALL_COUNTRIES } from '@/lib/constants/countries'

export function Step4Travel() {
  const { register, watch, control, formState, setValue } = useFormContext()
  const errors = formState.errors as any
  
  const tripPaidBy = watch('step4Travel.tripPaidBy')
  const travelsWithOthers = watch('step4Travel.travelsWithOthers')
  
  useEffect(() => {
    if (travelsWithOthers === 'false') {
      setValue('step4Travel.travelCompanions', [])
    }
  }, [travelsWithOthers, setValue])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'step4Travel.travelCompanions'
  })
  
  const { fields: placeFields, append: appendPlace, remove: removePlace } = useFieldArray({
    control,
    name: 'step4Travel.touristPlaces'
  })

  // Accommodation FieldArray (Prompt asks for 3 fields in a group: Dirección, Código postal, Teléfono)
  const { fields: accFields } = useFieldArray({
    control,
    name: 'step4Travel.accommodation'
  })

  // Ensure there's at least one accommodation block on render if none exists (via useeffect in orchestrator or just rendering index 0)

  return (
    <div className="space-y-6">
      <FormField 
        label="¿Es tu primera solicitud de visa o una renovación?" 
        name="step4Travel.usaVisaType" 
        required 
        error={errors.step4Travel?.usaVisaType?.message as string}
      >
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="Primera vez" {...register('step4Travel.usaVisaType')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
            <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Primera vez</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="Renovación" {...register('step4Travel.usaVisaType')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
            <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Renovación</span>
          </label>
        </div>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Fecha estimada de llegada a USA" 
          name="step4Travel.arrivalDate" 
          required 
          error={errors.step4Travel?.arrivalDate?.message as string}
        >
          <input
            type="date"
            {...register('step4Travel.arrivalDate')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]"
          />
        </FormField>

        <FormField 
          label="Fecha estimada de salida de USA" 
          name="step4Travel.departureDate" 
          required 
          error={errors.step4Travel?.departureDate?.message as string}
        >
          <input
            type="date"
            {...register('step4Travel.departureDate')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]"
          />
        </FormField>
      </div>

      <FormField 
        label="¿Qué ciudades te gustaría visitar y por qué?" 
        name="step4Travel.citiesToVisit" 
        required 
        error={errors.step4Travel?.citiesToVisit?.message as string}
      >
        <textarea
          {...register('step4Travel.citiesToVisit')}
          className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors min-h-[100px] resize-y"
          placeholder="Ej: Miami por las playas, Orlando por los parques, New York por la cultura..."
        />
      </FormField>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Lugares turísticos que piensa visitar (la embajada los pide)</h3>
        <p className="text-sm text-[#525252] mb-4">La embajada pide los lugares que planeas visitar.</p>
        
        {placeFields.map((item, index) => (
          <div key={item.id} className="relative flex gap-4">
            <FormField label="Lugar" name={`step4Travel.touristPlaces.${index}.place`} required error={(errors.step4Travel?.touristPlaces as any)?.[index]?.place?.message as string}>
              <input {...register(`step4Travel.touristPlaces.${index}.place`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" placeholder="Ej: Disney World, Estatua de la Libertad..." />
            </FormField>
            {index > 0 && (
              <button type="button" onClick={() => removePlace(index)} className="mt-8 text-[#A3A3A3] hover:text-[#DC2626] transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        {placeFields.length < 2 && (
          <button type="button" onClick={() => appendPlace({ place: '' })} className="flex items-center gap-2 text-[#C8FF00] hover:text-[#A8D900] font-medium px-4 py-2 border border-[#C8FF00]/30 rounded-lg bg-[#C8FF00]/5 transition-colors">
            <Plus className="w-4 h-4" /> Agregar otro lugar
          </button>
        )}
      </div>

      {/* Accommodation Block (Simple single block as requested: address, zip, phone) */}
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
        <h3 className="text-[#0A0A0A] font-medium mb-2">¿Dónde te vas a quedar?</h3>
        <FormField 
          label="Dirección completa" 
          name="step4Travel.accommodation.0.address" 
          required 
          error={(errors.step4Travel?.accommodation as any)?.[0]?.address?.message as string}
        >
          <input
            {...register('step4Travel.accommodation.0.address')}
            className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
            placeholder="Dirección del hotel o casa"
          />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Código postal" name="step4Travel.accommodation.0.zip" required>
            <input
              {...register('step4Travel.accommodation.0.zip')}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
              placeholder="Ej: 33132"
            />
          </FormField>
          <FormField label="Teléfono del lugar" name="step4Travel.accommodation.0.phone" required>
            <input
              {...register('step4Travel.accommodation.0.phone')}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
              placeholder="+1 ..."
            />
          </FormField>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E5E5E5]">
        <FormField 
          label="¿Quién paga el viaje?" 
          name="step4Travel.tripPaidBy" 
          required 
          error={errors.step4Travel?.tripPaidBy?.message as string}
        >
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                value="Yo mismo"
                {...register('step4Travel.tripPaidBy')}
                className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]"
              />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Yo mismo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                value="Otra persona"
                {...register('step4Travel.tripPaidBy')}
                className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]"
              />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Otra persona u organización</span>
            </label>
          </div>
        </FormField>
      </div>

      {tripPaidBy === 'Otra persona' && (
        <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
          <h3 className="text-[#C8FF00] font-medium text-sm uppercase tracking-wider mb-2">Detalles de quien paga</h3>
          <FormField label="Nombre completo" name="step4Travel.payerName" required>
            <input {...register('step4Travel.payerName')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors" />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Teléfono" name="step4Travel.payerPhone" required>
              <input {...register('step4Travel.payerPhone')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors" />
            </FormField>
            <FormField label="Email" name="step4Travel.payerEmail" required>
              <input type="email" {...register('step4Travel.payerEmail')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors" />
            </FormField>
          </div>
          <FormField label="Relación contigo" name="step4Travel.payerRelationship" required>
            <select {...register('step4Travel.payerRelationship')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors appearance-none">
              <option value="">Seleccionar...</option>
              <option value="Padre">Padre</option>
              <option value="Madre">Madre</option>
              <option value="Hijo(a)">Hijo(a)</option>
              <option value="Esposo(a)">Esposo(a)</option>
              <option value="Amigo(a)">Amigo(a)</option>
              <option value="Otro familiar">Otro familiar</option>
              <option value="Otro">Otro</option>
            </select>
          </FormField>
        </div>
      )}

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Contacto en Estados Unidos (Opcional)</h3>
        <p className="text-sm text-[#525252] mb-4">Puede ser una persona, hotel, empresa o lugar que planeas visitar.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Apellidos del contacto" name="step4Travel.usaContactSurnames">
            <input {...register('step4Travel.usaContactSurnames')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
          <FormField label="Nombres del contacto" name="step4Travel.usaContactGivenNames">
            <input {...register('step4Travel.usaContactGivenNames')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nombre de la organización (si aplica)" name="step4Travel.usaContactOrganization">
            <input {...register('step4Travel.usaContactOrganization')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
          <FormField label="Relación con usted" name="step4Travel.usaContactRelationship">
            <input {...register('step4Travel.usaContactRelationship')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
          </FormField>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E5E5E5]">
        <FormField 
          label="¿Viaja con más personas a Estados Unidos?" 
          name="step4Travel.travelsWithOthers" 
          required 
          error={errors.step4Travel?.travelsWithOthers?.message as string}
        >
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step4Travel.travelsWithOthers')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step4Travel.travelsWithOthers')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>
      </div>

      {travelsWithOthers === 'true' && (
        <div className="space-y-4">
          {fields.map((item, index) => (
            <div key={item.id} className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] relative">
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-[#A3A3A3] hover:text-[#DC2626] transition-colors"
                title="Eliminar acompañante"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-medium text-[#0A0A0A] mb-4">Acompañante {index + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre completo del acompañante" name={`step4Travel.travelCompanions.${index}.fullName`} required error={(errors.step4Travel?.travelCompanions as any)?.[index]?.fullName?.message as string}>
                  <input {...register(`step4Travel.travelCompanions.${index}.fullName`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" />
                </FormField>
                <FormField label="Relación con usted" name={`step4Travel.travelCompanions.${index}.relationship`} required error={(errors.step4Travel?.travelCompanions as any)?.[index]?.relationship?.message as string}>
                  <input {...register(`step4Travel.travelCompanions.${index}.relationship`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" placeholder="Ej: Esposo(a), Amigo(a)" />
                </FormField>
              </div>
            </div>
          ))}

          {fields.length < 2 && (
            <button
              type="button"
              onClick={() => append({ fullName: '', relationship: '' })}
              className="flex items-center gap-2 text-[#C8FF00] hover:text-[#A8D900] font-medium px-4 py-2 border border-[#C8FF00]/30 rounded-lg bg-[#C8FF00]/5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar acompañante
            </button>
          )}
        </div>
      )}
    </div>
  )
}
