import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

const RadioYesNo = ({ name, label, hint }: { name: string, label: string, hint?: string }) => {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any
  const errorMsg = errors.step8?.[name.split('.')[1]]?.message as string

  return (
    <div className="pt-4 border-t border-[#E5E5E5] first:pt-0 first:border-0">
      <FormField label={label} name={name} hint={hint} required error={errorMsg}>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="true" {...register(name)} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
            <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="false" {...register(name)} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
            <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
          </label>
        </div>
      </FormField>
    </div>
  )
}

export function Step8() {

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Examen Médico y Condiciones de Salud</h3>
        
        <RadioYesNo name="step8.medical_exam_12m" label="¿Te has realizado un examen médico de inmigración realizado por un Médico Aprobado por el Panel de Canadá (Panel Physician) en los últimos 12 meses?" />
        
        <RadioYesNo 
          name="step8.work_in_listed_jobs" 
          label="Durante tu estancia en Canadá, ¿planeas trabajar en un área de la salud, cuidado infantil, escuela primaria/secundaria u otro puesto donde estarás en contacto cercano con personas?" 
          hint="Esto incluye personal médico, profesores, niñeros, asistentes de cuidados, etc."
        />

        <RadioYesNo name="step8.tb_diagnosed_2y" label="En los últimos 2 años, ¿has sido diagnosticado(a) con tuberculosis?" />
        
        <RadioYesNo name="step8.tb_contact_5y" label="En los últimos 5 años, ¿has estado en contacto cercano con alguien que tenga o haya tenido tuberculosis?" />
        
        <RadioYesNo name="step8.dialysis" label="¿Recibes o requerirás recibir tratamiento de diálisis durante tu estancia en Canadá?" />
        
        <RadioYesNo name="step8.drug_alcohol_addiction" label="¿Tienes o has tenido algún problema de adicción a las drogas o al alcohol?" />
        
        <RadioYesNo name="step8.mental_health_condition" label="¿Tienes alguna condición de salud mental por la que hayas recibido tratamiento psiquiátrico en los últimos años?" />
        
        <RadioYesNo name="step8.syphilis" label="¿Has sido diagnosticado(a) con sífilis que no haya sido tratada exitosamente?" />
      </div>
    </div>
  )
}
