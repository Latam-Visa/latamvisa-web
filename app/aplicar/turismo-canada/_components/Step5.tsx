import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'
import { RepeatableTable } from './RepeatableTable'

export function Step5() {
  const { register, formState, watch, setValue } = useFormContext()
  const errors = formState.errors as any

  const studiedPostsecondary = watch('step5.studied_postsecondary')
  const militaryService = watch('step5.military_service')

  useEffect(() => {
    if (studiedPostsecondary === 'false') {
      setValue('step5.education_history', [])
    }
  }, [studiedPostsecondary, setValue])

  useEffect(() => {
    if (militaryService === 'false') {
      setValue('step5.military_details', [])
    }
  }, [militaryService, setValue])

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Fondos para el Viaje</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Dinero disponible para tu estancia en Canadá (CAD)" hint="Dólares Canadienses" name="step5.funds_cad" required error={errors.step5?.funds_cad?.message as string}>
            <input type="number" {...register('step5.funds_cad')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" placeholder="Ej: 3000" />
          </FormField>
        </div>

        <FormField label="¿Alguien más está financiando tu viaje?" name="step5.someone_else_funding" required error={errors.step5?.someone_else_funding?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step5.someone_else_funding')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step5.someone_else_funding')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {watch('step5.someone_else_funding') === 'true' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <FormField label="¿Quién le da los recursos y por qué?" name="step5.funding_details" error={errors.step5?.funding_details?.message as string}>
              <textarea rows={3} {...register('step5.funding_details')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors resize-none" />
            </FormField>
          </div>
        )}
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Educación Post-Secundaria</h3>

        <FormField label="¿Has cursado estudios universitarios, técnicos o equivalentes?" name="step5.studied_postsecondary" required error={errors.step5?.studied_postsecondary?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step5.studied_postsecondary')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step5.studied_postsecondary')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {studiedPostsecondary === 'true' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <RepeatableTable
              name="step5.education_history"
              title="Historial de Educación"
              description="Añade tus estudios superiores (universidad, instituto, etc.)"
              defaultItem={{ school: '', from: '', to: '', level: '', field: '', country: '', street: '', city: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Institución" name={`step5.education_history.${index}.school`} required error={(errors.step5?.education_history as any)?.[index]?.school?.message as string}>
                    <input {...register(`step5.education_history.${index}.school`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Campo de estudio" name={`step5.education_history.${index}.field`} required error={(errors.step5?.education_history as any)?.[index]?.field?.message as string}>
                    <input {...register(`step5.education_history.${index}.field`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Nivel académico" name={`step5.education_history.${index}.level`} required error={(errors.step5?.education_history as any)?.[index]?.level?.message as string}>
                    <input {...register(`step5.education_history.${index}.level`)} placeholder="Ej: Pregrado, Maestría" className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="País" name={`step5.education_history.${index}.country`} required error={(errors.step5?.education_history as any)?.[index]?.country?.message as string}>
                    <select {...register(`step5.education_history.${index}.country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                      <option value="">Seleccionar país</option>
                      {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Ciudad" name={`step5.education_history.${index}.city`} required error={(errors.step5?.education_history as any)?.[index]?.city?.message as string}>
                    <input {...register(`step5.education_history.${index}.city`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Dirección" name={`step5.education_history.${index}.street`} required error={(errors.step5?.education_history as any)?.[index]?.street?.message as string}>
                    <input {...register(`step5.education_history.${index}.street`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Código postal" name={`step5.education_history.${index}.postal_code`} error={(errors.step5?.education_history as any)?.[index]?.postal_code?.message as string}>
                    <input {...register(`step5.education_history.${index}.postal_code`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Desde" name={`step5.education_history.${index}.from`} required error={(errors.step5?.education_history as any)?.[index]?.from?.message as string}>
                    <input type="date" {...register(`step5.education_history.${index}.from`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
                  </FormField>
                  <FormField label="Hasta" name={`step5.education_history.${index}.to`} required error={(errors.step5?.education_history as any)?.[index]?.to?.message as string}>
                    <input type="date" {...register(`step5.education_history.${index}.to`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
                  </FormField>
                </div>
              )}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <RepeatableTable
          name="step5.work_history"
          title="Historial Laboral"
          description="Añade tus empleos en los últimos 10 años (o desde los 18 años). Empieza por el más reciente."
          defaultItem={{ activity: '', job_title: '', employer: '', duties: '', country: '', street: '', city: '', from: '', to: '', ongoing: false }}
          minItems={1}
          renderItem={(index) => {
            const currentActivity = watch(`step5.work_history.${index}.activity`)
            const isOngoing = watch(`step5.work_history.${index}.ongoing`)
            const isUnemployed = currentActivity === 'Unemployed' || currentActivity === 'Retired' || currentActivity === 'Student'

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Actividad principal" name={`step5.work_history.${index}.activity`} required error={(errors.step5?.work_history as any)?.[index]?.activity?.message as string}>
                  <select {...register(`step5.work_history.${index}.activity`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                    <option value="">Seleccionar actividad</option>
                    <option value="Employed">Empleado</option>
                    <option value="Self-Employed">Independiente / Autónomo</option>
                    <option value="Student">Estudiante</option>
                    <option value="Unemployed">Desempleado</option>
                    <option value="Retired">Jubilado</option>
                  </select>
                </FormField>

                {!isUnemployed && (
                  <>
                    <FormField label="Cargo / Profesión" name={`step5.work_history.${index}.job_title`} required error={(errors.step5?.work_history as any)?.[index]?.job_title?.message as string}>
                      <input {...register(`step5.work_history.${index}.job_title`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                    </FormField>
                    <FormField label="Sector de trabajo" name={`step5.work_history.${index}.sector`} error={(errors.step5?.work_history as any)?.[index]?.sector?.message as string}>
                      <input placeholder="ej: salud, tecnología, educación" {...register(`step5.work_history.${index}.sector`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                    </FormField>
                    <FormField label="Empleador / Empresa" name={`step5.work_history.${index}.employer`} required error={(errors.step5?.work_history as any)?.[index]?.employer?.message as string}>
                      <input {...register(`step5.work_history.${index}.employer`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                    </FormField>
                    <FormField label="Breve descripción de tareas" name={`step5.work_history.${index}.duties`} required error={(errors.step5?.work_history as any)?.[index]?.duties?.message as string}>
                      <input {...register(`step5.work_history.${index}.duties`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                    </FormField>
                  </>
                )}

                <FormField label="País" name={`step5.work_history.${index}.country`} required error={(errors.step5?.work_history as any)?.[index]?.country?.message as string}>
                  <select {...register(`step5.work_history.${index}.country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                    <option value="">Seleccionar país</option>
                    {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </FormField>
                
                <FormField label="Ciudad" name={`step5.work_history.${index}.city`} required error={(errors.step5?.work_history as any)?.[index]?.city?.message as string}>
                  <input {...register(`step5.work_history.${index}.city`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                </FormField>

                {!isUnemployed && (
                  <FormField label="Dirección de trabajo" name={`step5.work_history.${index}.street`} required error={(errors.step5?.work_history as any)?.[index]?.street?.message as string}>
                    <input {...register(`step5.work_history.${index}.street`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                )}

                <FormField label="Desde" name={`step5.work_history.${index}.from`} required error={(errors.step5?.work_history as any)?.[index]?.from?.message as string}>
                  <input type="date" {...register(`step5.work_history.${index}.from`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
                </FormField>

                <div className="flex flex-col">
                  <FormField label="Hasta" name={`step5.work_history.${index}.to`} required={!isOngoing} error={(errors.step5?.work_history as any)?.[index]?.to?.message as string}>
                    <input type="date" disabled={isOngoing} {...register(`step5.work_history.${index}.to`)} className={`w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light] ${isOngoing ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </FormField>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" {...register(`step5.work_history.${index}.ongoing`)} className="w-4 h-4 accent-[#C8FF00]" onChange={(e) => {
                      setValue(`step5.work_history.${index}.ongoing`, e.target.checked)
                      if (e.target.checked) setValue(`step5.work_history.${index}.to`, '')
                    }} />
                    <span className="text-sm text-[#525252]">Es mi ocupación actual</span>
                  </label>
                </div>
              </div>
            )
          }}
        />
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Servicio Militar</h3>

        <FormField label="¿Has prestado servicio militar alguna vez?" name="step5.military_service" required error={errors.step5?.military_service?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step5.military_service')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step5.military_service')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {militaryService === 'true' && (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-6 mt-6">
            <FormField label="¿Ha trabajado específicamente en área militar (fuerzas armadas, defensa)?" name="step5.military_area" required error={errors.step5?.military_area?.message as string}>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" value="true" {...register('step5.military_area')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                  <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" value="false" {...register('step5.military_area')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                  <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
                </label>
              </div>
            </FormField>

            <RepeatableTable
              name="step5.military_details"
              title="Detalles de Servicio Militar"
              defaultItem={{ country: '', branch: '', rank: '', from: '', to: '', duties: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="País" name={`step5.military_details.${index}.country`} required error={(errors.step5?.military_details as any)?.[index]?.country?.message as string}>
                    <select {...register(`step5.military_details.${index}.country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                      <option value="">Seleccionar país</option>
                      {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Rama (Ej: Armada, Marina)" name={`step5.military_details.${index}.branch`} required error={(errors.step5?.military_details as any)?.[index]?.branch?.message as string}>
                    <input {...register(`step5.military_details.${index}.branch`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Rango" name={`step5.military_details.${index}.rank`} required error={(errors.step5?.military_details as any)?.[index]?.rank?.message as string}>
                    <input {...register(`step5.military_details.${index}.rank`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Desde" name={`step5.military_details.${index}.from`} required error={(errors.step5?.military_details as any)?.[index]?.from?.message as string}>
                    <input type="date" {...register(`step5.military_details.${index}.from`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
                  </FormField>
                  <FormField label="Hasta" name={`step5.military_details.${index}.to`} required error={(errors.step5?.military_details as any)?.[index]?.to?.message as string}>
                    <input type="date" {...register(`step5.military_details.${index}.to`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="Breve descripción de funciones" name={`step5.military_details.${index}.duties`} required error={(errors.step5?.military_details as any)?.[index]?.duties?.message as string}>
                      <input {...register(`step5.military_details.${index}.duties`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                    </FormField>
                  </div>
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}
