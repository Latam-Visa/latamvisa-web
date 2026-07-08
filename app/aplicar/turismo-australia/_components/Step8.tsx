import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step8() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step8 as any) || {}
  const data = watch('step8') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Empleo</h3>
        <p className="text-sm text-[#525252] mb-4">Tu situación laboral actual</p>
        
        
        <FormField label="Estado de Empleo Actual" name="step8.employment_status" required error={errs.employment_status?.message as string}>
          <select {...register('step8.employment_status')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
            <option value="">Seleccionar</option>
            <option value="Employed">Empleado</option>
            <option value="Self-employed">Independiente / Emprendedor</option>
            <option value="Student">Estudiante</option>
            <option value="Retired">Retirado / Jubilado</option>
            <option value="Unemployed">Desempleado</option>
            <option value="Other">Otro</option>
          </select>
        </FormField>
        
        {['Employed', 'Self-employed'].includes(data.employment_status) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-[#E5E5E5] rounded-xl shadow-sm mt-4">
            <FormField label={`Nombre del Empleador o Empresa`} name="step8.employer_name"  error={errs.employer_name?.message as string}>
          <input type="text" {...register('step8.employer_name')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
            <FormField label={`Ocupación / Cargo`} name="step8.occupation"  error={errs.occupation?.message as string}>
          <input type="text" {...register('step8.occupation')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
            <FormField label={`Dirección del Empleador`} name="step8.employer_address"  error={errs.employer_address?.message as string}>
          <input type="text" {...register('step8.employer_address')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
            <FormField label={`Teléfono Laboral`} name="step8.work_phone"  error={errs.work_phone?.message as string}>
          <input type="text" {...register('step8.work_phone')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
            <FormField label={`Ingreso Mensual (Opcional)`} name="step8.monthly_income"  error={errs.monthly_income?.message as string}>
          <input type="text" {...register('step8.monthly_income')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
        </FormField>
          </div>
        )}

      </div>
    </div>
  )
}
