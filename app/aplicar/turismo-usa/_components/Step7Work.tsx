import { useFormContext } from 'react-hook-form'
import { FormField } from './FormField'

export function Step7Work() {
  const { register, watch, formState } = useFormContext()
  const errors = formState.errors as any
  
  const hadPreviousJob = watch('step7Work.hadPreviousJob')

  return (
    <div className="space-y-8">
      <FormField label="Ocupación actual" name="step7Work.occupation" required hint="Ej: Estudiante, Cocinero, Ingeniero, Ama de casa, Desempleado" error={errors.step7Work?.occupation?.message as string}>
        <input {...register('step7Work.occupation')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
      </FormField>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Trabajo o institución educativa actual</h3>
        <FormField label="Nombre de la empresa o institución" name="step7Work.currentEmployer" required error={errors.step7Work?.currentEmployer?.message as string}>
          <input {...register('step7Work.currentEmployer')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
        </FormField>
        <FormField label="Dirección" name="step7Work.currentEmployerAddress" required error={errors.step7Work?.currentEmployerAddress?.message as string}>
          <input {...register('step7Work.currentEmployerAddress')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Código postal" name="step7Work.currentEmployerZip" required error={errors.step7Work?.currentEmployerZip?.message as string}>
            <input {...register('step7Work.currentEmployerZip')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
          </FormField>
          <FormField label="Teléfono" name="step7Work.currentEmployerPhone" required error={errors.step7Work?.currentEmployerPhone?.message as string}>
            <input {...register('step7Work.currentEmployerPhone')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
          </FormField>
        </div>
        <FormField label="Email" name="step7Work.currentEmployerEmail" hint="Opcional" error={errors.step7Work?.currentEmployerEmail?.message as string}>
          <input type="email" {...register('step7Work.currentEmployerEmail')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Fecha de inicio de trabajo y/o inicio de estudios"
          name="step7Work.currentJobStartDate"
          required
          hint="Desde cuándo estás en tu trabajo o estudio actual"
          error={errors.step7Work?.currentJobStartDate?.message as string}
        >
          <input type="date" {...register('step7Work.currentJobStartDate')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] [color-scheme:light]" />
        </FormField>

        <FormField label="Salario mensual aproximado en USD" name="step7Work.monthlySalaryUsd" required error={errors.step7Work?.monthlySalaryUsd?.message as string}>
          <input type="number" min="0" {...register('step7Work.monthlySalaryUsd')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" placeholder="Ej: 1500" />
        </FormField>
      </div>

      <FormField label="Responsabilidades en tu trabajo actual o qué estudias" name="step7Work.currentJobResponsibilities" required hint="Mínimo 30 caracteres" error={errors.step7Work?.currentJobResponsibilities?.message as string}>
        <textarea {...register('step7Work.currentJobResponsibilities')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] min-h-[100px] resize-y" />
      </FormField>

      <div className="pt-4 border-t border-[#E5E5E5]">
        <FormField label="¿Tuviste un trabajo anterior?" name="step7Work.hadPreviousJob" error={errors.step7Work?.hadPreviousJob?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step7Work.hadPreviousJob')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" /><span className="text-[#525252] group-hover:text-[#0A0A0A]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step7Work.hadPreviousJob')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" /><span className="text-[#525252] group-hover:text-[#0A0A0A]">No</span></label>
          </div>
        </FormField>
      </div>

      {hadPreviousJob === 'true' && (
        <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
          <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Detalles del trabajo anterior</h3>
          <FormField label="Nombre de la empresa" name="step7Work.previousEmployer" required error={errors.step7Work?.previousEmployer?.message as string}>
            <input {...register('step7Work.previousEmployer')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Dirección" name="step7Work.previousEmployerAddress" required error={errors.step7Work?.previousEmployerAddress?.message as string}>
              <input {...register('step7Work.previousEmployerAddress')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
            </FormField>
            <FormField label="Teléfono" name="step7Work.previousEmployerPhone" required error={errors.step7Work?.previousEmployerPhone?.message as string}>
              <input {...register('step7Work.previousEmployerPhone')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Fecha de inicio" name="step7Work.previousJobStartDate" required error={errors.step7Work?.previousJobStartDate?.message as string}>
              <input type="date" {...register('step7Work.previousJobStartDate')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] [color-scheme:light]" />
            </FormField>
            <FormField label="Fecha de fin" name="step7Work.previousJobEndDate" required error={errors.step7Work?.previousJobEndDate?.message as string}>
              <input type="date" {...register('step7Work.previousJobEndDate')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] [color-scheme:light]" />
            </FormField>
          </div>
          <FormField label="Nombre completo del supervisor directo" name="step7Work.previousJobSupervisor" required error={errors.step7Work?.previousJobSupervisor?.message as string}>
            <input {...register('step7Work.previousJobSupervisor')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
          </FormField>
          <FormField label="Email del trabajo anterior" name="step7Work.previousJobEmail" hint="Opcional" error={errors.step7Work?.previousJobEmail?.message as string}>
            <input type="email" {...register('step7Work.previousJobEmail')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
          </FormField>
          <FormField label="Responsabilidades en ese trabajo" name="step7Work.previousJobResponsibilities" required error={errors.step7Work?.previousJobResponsibilities?.message as string}>
            <textarea {...register('step7Work.previousJobResponsibilities')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] min-h-[80px]" />
          </FormField>
        </div>
      )}

      <div className="pt-4 border-t border-[#E5E5E5] space-y-6">
        <FormField label="Nivel más alto de educación completado" name="step7Work.highestEducation" required error={errors.step7Work?.highestEducation?.message as string}>
          <select {...register('step7Work.highestEducation')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] appearance-none">
            <option value="">Seleccionar nivel</option>
            <option value="Primaria">Primaria</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Técnico">Técnico</option>
            <option value="Tecnólogo">Tecnólogo</option>
            <option value="Pregrado universitario">Pregrado universitario</option>
            <option value="Postgrado">Postgrado</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
          </select>
        </FormField>

        <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
          <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Detalles de la institución educativa</h3>
          <FormField label="Nombre de la institución" name="step7Work.educationInstitution" required error={errors.step7Work?.educationInstitution?.message as string}>
            <input {...register('step7Work.educationInstitution')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
          </FormField>
          <FormField label="Dirección" name="step7Work.educationAddress" required error={errors.step7Work?.educationAddress?.message as string}>
            <input {...register('step7Work.educationAddress')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Fechas que asististe" name="step7Work.educationDates" required hint="Ej: Febrero 2018 - Diciembre 2022" error={errors.step7Work?.educationDates?.message as string}>
              <input {...register('step7Work.educationDates')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
            </FormField>
            <FormField label="Qué estudiaste / título obtenido" name="step7Work.educationDegree" required error={errors.step7Work?.educationDegree?.message as string}>
              <input {...register('step7Work.educationDegree')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
            </FormField>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E5E5E5] space-y-6">
        <FormField label="Idiomas que hablas" name="step7Work.languages" required hint="Ej: Español (nativo), Inglés (intermedio)" error={errors.step7Work?.languages?.message as string}>
          <input {...register('step7Work.languages')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00]" />
        </FormField>
        <FormField label="Países visitados en los últimos 5 años" name="step7Work.countriesVisited5Years" hint="Sin contar conexiones de vuelo. Ej: México 2022, España 2023, Turquía 2024 (Opcional)" error={errors.step7Work?.countriesVisited5Years?.message as string}>
          <textarea {...register('step7Work.countriesVisited5Years')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] min-h-[80px]" />
        </FormField>
        <FormField label="¿Has pertenecido a organizaciones profesionales, sociales o caritativas? Cuáles" name="step7Work.organizationsMembership" hint="Ej: Iglesia X, Voluntariado en fundación Y, gremio de ingenieros Z (Opcional)" error={errors.step7Work?.organizationsMembership?.message as string}>
          <textarea {...register('step7Work.organizationsMembership')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] min-h-[80px]" />
        </FormField>
      </div>
    </div>
  )
}
