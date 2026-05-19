import { useFormContext } from 'react-hook-form'
import { FormField } from './FormField'

export function Step8Additional() {
  const { register, watch, formState } = useFormContext()
  const errors = formState.errors as any

  const militaryService = watch('step8Additional.militaryService')

  return (
    <div className="space-y-8">
      <FormField label="¿Has servido en el ejército?" name="step8Additional.militaryService" required error={errors.step8Additional?.militaryService?.message as string}>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step8Additional.militaryService')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" /><span className="text-[#525252] group-hover:text-[#0A0A0A]">Sí</span></label>
          <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step8Additional.militaryService')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" /><span className="text-[#525252] group-hover:text-[#0A0A0A]">No</span></label>
        </div>
      </FormField>

      {militaryService === 'true' && (
        <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
          <h3 className="text-[#C8FF00] font-medium text-sm uppercase tracking-wider mb-2">Detalles del servicio militar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Ciudad donde serviste" name="step8Additional.militaryCity" required error={errors.step8Additional?.militaryCity?.message as string}>
              <input {...register('step8Additional.militaryCity')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
            </FormField>
            <FormField label="Rango que alcanzaste" name="step8Additional.militaryRank" required error={errors.step8Additional?.militaryRank?.message as string}>
              <input {...register('step8Additional.militaryRank')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Fecha de inicio" name="step8Additional.militaryStartDate" required error={errors.step8Additional?.militaryStartDate?.message as string}>
              <input type="date" {...register('step8Additional.militaryStartDate')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] [color-scheme:light]" />
            </FormField>
            <FormField label="Fecha de fin" name="step8Additional.militaryEndDate" required error={errors.step8Additional?.militaryEndDate?.message as string}>
              <input type="date" {...register('step8Additional.militaryEndDate')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] [color-scheme:light]" />
            </FormField>
          </div>
          <FormField label="Tareas que realizaste" name="step8Additional.militaryDuties" required error={errors.step8Additional?.militaryDuties?.message as string}>
            <textarea {...register('step8Additional.militaryDuties')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] min-h-[80px]" />
          </FormField>
        </div>
      )}

      <div className="pt-4 border-t border-[#E5E5E5] space-y-6">
        <FormField label="Detalles de antecedentes penales o arrestos previos" name="step8Additional.criminalRecord" required hint="Si no tienes, escribe 'No tengo antecedentes'. Si tienes, sé honesto y específico." error={errors.step8Additional?.criminalRecord?.message as string}>
          <textarea defaultValue="No tengo antecedentes" {...register('step8Additional.criminalRecord')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] min-h-[80px]" />
        </FormField>
        <FormField label="Información sobre condiciones médicas o enfermedades relevantes" name="step8Additional.medicalConditions" required hint="Si no tienes, escribe 'Ninguna'." error={errors.step8Additional?.medicalConditions?.message as string}>
          <textarea defaultValue="Ninguna" {...register('step8Additional.medicalConditions')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] min-h-[80px]" />
        </FormField>
        <FormField label="Detalles de deportación o negación de entrada a algún país" name="step8Additional.deportationHistory" required hint="Si no te ha pasado, escribe 'No aplica'." error={errors.step8Additional?.deportationHistory?.message as string}>
          <textarea defaultValue="No aplica" {...register('step8Additional.deportationHistory')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] min-h-[80px]" />
        </FormField>
      </div>

      <div className="mt-2 bg-[#F0FFF0] border border-[#C8FF00]/40 rounded-xl px-5 py-4 flex gap-3">
        <span className="text-xl shrink-0">📸</span>
        <p className="text-sm text-[#525252] leading-relaxed">
          <strong className="text-[#0A0A0A]">Fotos requeridas:</strong> Las fotos (pasaporte y foto tipo visa) te las pediremos por WhatsApp luego de que envíes este formulario. No necesitás adjuntar nada aquí.
        </p>
      </div>
    </div>
  )
}
