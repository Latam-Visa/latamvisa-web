import { useFormContext, useWatch } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step5() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  const occupationStatus = useWatch({ name: 'step5.occupation_status' })
  const tripFinancedByOther = useWatch({ name: 'step5.trip_financed_by_other' })

  const isWorking = occupationStatus === 'Employed' || occupationStatus === 'Self-employed'

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Situación Laboral y Económica</h3>

        <FormField label="Situación de Ocupación" name="step5.occupation_status" required error={errors.step5?.occupation_status?.message as string}>
          <select {...register('step5.occupation_status')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
            <option value="">Seleccionar situación</option>
            <option value="Employed">Empleado</option>
            <option value="Self-employed">Independiente / Emprendedor</option>
            <option value="Student">Estudiante</option>
            <option value="Unemployed">Desempleado</option>
            <option value="Retired">Jubilado</option>
          </select>
        </FormField>

        {isWorking && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nombre del Empleador o Empresa" name="step5.employer_name" required error={errors.step5?.employer_name?.message as string}>
                <input {...register('step5.employer_name')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
              <FormField label="Cargo" name="step5.job_title" required error={errors.step5?.job_title?.message as string}>
                <input {...register('step5.job_title')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
            </div>

            <FormField label="Dirección del Empleador" name="step5.employer_address" error={errors.step5?.employer_address?.message as string}>
              <input {...register('step5.employer_address')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Ingreso Mensual Libre" name="step5.monthly_income" required error={errors.step5?.monthly_income?.message as string}>
                <input type="number" {...register('step5.monthly_income')} placeholder="Monto" className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
              <FormField label="Moneda del Ingreso" name="step5.monthly_income_currency" required error={errors.step5?.monthly_income_currency?.message as string}>
                <select {...register('step5.monthly_income_currency')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
                  <option value="">Moneda</option>
                  <option value="USD">USD - Dólares</option>
                  <option value="EUR">EUR - Euros</option>
                  <option value="GBP">GBP - Libras</option>
                  <option value="COP">COP - Pesos Col</option>
                  <option value="MXN">MXN - Pesos Mex</option>
                  <option value="CLP">CLP - Pesos Chilenos</option>
                  <option value="ARS">ARS - Pesos Arg</option>
                  <option value="PEN">PEN - Soles</option>
                  <option value="OTHER">Otra</option>
                </select>
              </FormField>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="Fondos disponibles para este viaje (en GBP - Libras)" hint="Monto aproximado que tienes para tu viaje." name="step5.available_funds_gbp" required error={errors.step5?.available_funds_gbp?.message as string}>
            <input type="number" {...register('step5.available_funds_gbp')} placeholder="Monto en GBP" className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
          </FormField>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Alguien más está financiando tu viaje?" name="step5.trip_financed_by_other" required error={errors.step5?.trip_financed_by_other?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step5.trip_financed_by_other')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step5.trip_financed_by_other')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>

        {tripFinancedByOther === 'true' && (
          <FormField label="Detalles de quien financia" hint="Nombre, relación contigo y monto aproximado que aporta." name="step5.trip_financer_details" required error={errors.step5?.trip_financer_details?.message as string}>
            <textarea 
              {...register('step5.trip_financer_details')} 
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors min-h-[100px] resize-y" 
            />
          </FormField>
        )}
      </div>
    </div>
  )
}
