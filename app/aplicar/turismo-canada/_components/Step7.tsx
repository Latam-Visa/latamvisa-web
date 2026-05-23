import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

const RadioYesNo = ({ name, label }: { name: string, label: string }) => {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any
  const errorMsg = errors.step7?.[name.split('.')[1]]?.message as string

  return (
    <div className="pt-4 border-t border-[#E5E5E5] first:pt-0 first:border-0">
      <FormField label={label} name={name} required error={errorMsg}>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="true" {...register(name)} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
            <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="false" {...register(name)} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#2F4A00]" />
            <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
          </label>
        </div>
      </FormField>
    </div>
  )
}

export function Step7() {

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Antecedentes y Seguridad</h3>
        <p className="text-sm text-[#525252] mb-4">Responde honestamente a las siguientes preguntas de seguridad.</p>

        <RadioYesNo name="step7.committed_crime" label="¿Alguna vez has cometido, o has sido arrestado por, o acusado de, o condenado por cualquier delito penal en cualquier país/territorio?" />
        <RadioYesNo name="step7.arrested" label="¿Alguna vez has sido arrestado por la policía u otras autoridades de seguridad en cualquier país?" />
        <RadioYesNo name="step7.charged" label="¿Alguna vez has sido acusado formalmente de un delito?" />
        <RadioYesNo name="step7.convicted" label="¿Alguna vez has sido condenado por un delito penal?" />
        <RadioYesNo name="step7.violent_political_group" label="¿Alguna vez has sido miembro de, o has estado asociado con cualquier grupo político, social o estudiantil que haya usado, o abogado por, la violencia como medio para lograr sus fines políticos, religiosos o sociales?" />
        <RadioYesNo name="step7.witnessed_ill_treatment" label="¿Alguna vez has sido testigo de o has participado en maltrato a prisioneros o civiles, saqueos o profanación de lugares religiosos?" />
      </div>
    </div>
  )
}
