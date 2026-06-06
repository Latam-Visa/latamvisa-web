import { useFormContext, useWatch } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { RepeatableTable } from './RepeatableTable'
import COUNTRIES from '@/lib/constants/countries.json'

export function Step8() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  const maritalStatus = useWatch({ name: 'step8.marital_status' })
  const hasChildren = useWatch({ name: 'step8.has_children' })

  const hasPartner = ['Married', 'Common Law', 'Casado(a)', 'Unión libre'].includes(maritalStatus)

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Estado Civil y Pareja</h3>

        <FormField label="Estado Civil Actual" name="step8.marital_status" required error={errors.step8?.marital_status?.message as string}>
          <select {...register('step8.marital_status')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
            <option value="">Seleccionar</option>
            <option value="Single">Soltero(a)</option>
            <option value="Married">Casado(a)</option>
            <option value="Common Law">Unión Libre (Common Law)</option>
            <option value="Divorced">Divorciado(a)</option>
            <option value="Widowed">Viudo(a)</option>
            <option value="Separated">Separado(a)</option>
          </select>
        </FormField>

        {hasPartner && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nombres de tu pareja" name="step8.spouse_first_name" required error={errors.step8?.spouse_first_name?.message as string}>
                <input {...register('step8.spouse_first_name')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
              <FormField label="Apellidos de tu pareja" name="step8.spouse_last_name" required error={errors.step8?.spouse_last_name?.message as string}>
                <input {...register('step8.spouse_last_name')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Fecha de nacimiento" name="step8.spouse_date_of_birth" required error={errors.step8?.spouse_date_of_birth?.message as string}>
                <input type="date" {...register('step8.spouse_date_of_birth')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] [color-scheme:light] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
              </FormField>
              <FormField label="Nacionalidad" name="step8.spouse_nationality" required error={errors.step8?.spouse_nationality?.message as string}>
                <select {...register('step8.spouse_nationality')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
                  <option value="">Seleccionar país</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="¿Tu pareja viajará contigo al Reino Unido?" name="step8.spouse_traveling" required error={errors.step8?.spouse_traveling?.message as string}>
              <select {...register('step8.spouse_traveling')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
                <option value="">Seleccionar</option>
                <option value="Yes">Sí</option>
                <option value="No">No</option>
              </select>
            </FormField>
          </>
        )}
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Hijos (Menores y Mayores de Edad)</h3>

        <FormField label="¿Tienes hijos?" name="step8.has_children" required error={errors.step8?.has_children?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step8.has_children')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step8.has_children')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {hasChildren === 'true' && (
          <RepeatableTable
            name="step8.children"
            title="Detalles de tus hijos"
            defaultItem={{ name: '', date_of_birth: '', traveling: '' }}
            minItems={1}
            renderItem={(index) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Nombre completo" name={`step8.children.${index}.name`} required error={errors.step8?.children?.[index]?.name?.message as string}>
                  <input {...register(`step8.children.${index}.name`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
                </FormField>
                <FormField label="Fecha nacimiento" name={`step8.children.${index}.date_of_birth`} required error={errors.step8?.children?.[index]?.date_of_birth?.message as string}>
                  <input type="date" {...register(`step8.children.${index}.date_of_birth`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] [color-scheme:light] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00]" />
                </FormField>
                <FormField label="¿Viaja contigo?" name={`step8.children.${index}.traveling`} required error={errors.step8?.children?.[index]?.traveling?.message as string}>
                  <select {...register(`step8.children.${index}.traveling`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] appearance-none">
                    <option value="">Seleccionar</option>
                    <option value="Yes">Sí</option>
                    <option value="No">No</option>
                  </select>
                </FormField>
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}
