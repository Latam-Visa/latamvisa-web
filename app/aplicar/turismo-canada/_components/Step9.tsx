import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { ALL_COUNTRIES } from '@/lib/constants/countries'
import { RepeatableTable } from './RepeatableTable'

export function Step9() {
  const { register, formState, watch, setValue } = useFormContext()
  const errors = formState.errors as any

  const maritalStatus = watch('step9.marital_status')
  const hasChildren = watch('step9.has_children')

  const isMarriedOrCommonLaw = ['Married', 'Common Law', 'Casado(a)', 'Unión libre'].includes(maritalStatus)

  useEffect(() => {
    if (!isMarriedOrCommonLaw) {
      setValue('step9.marriage_date', '')
      setValue('step9.spouse_surname', '')
      setValue('step9.spouse_given_name', '')
      setValue('step9.spouse_date_of_birth', '')
      setValue('step9.spouse_birth_country', '')
      setValue('step9.spouse_occupation', '')
      setValue('step9.spouse_address_same', '')
      setValue('step9.spouse_accompany', '')
    }
  }, [isMarriedOrCommonLaw, setValue])

  useEffect(() => {
    if (hasChildren === 'false') {
      setValue('step9.children', [])
    }
  }, [hasChildren, setValue])

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Estado Civil</h3>
        
        <FormField label="Estado Civil Actual" name="step9.marital_status" required error={errors.step9?.marital_status?.message as string}>
          <select {...register('step9.marital_status')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
            <option value="">Seleccionar estado</option>
            <option value="Single">Soltero(a)</option>
            <option value="Married">Casado(a)</option>
            <option value="Common Law">Unión Libre</option>
            <option value="Divorced">Divorciado(a)</option>
            <option value="Separated">Separado(a)</option>
            <option value="Widowed">Viudo(a)</option>
            <option value="Annulled Marriage">Matrimonio Anulado</option>
          </select>
        </FormField>

        {isMarriedOrCommonLaw && (
          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] space-y-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-medium text-[#0A0A0A]">Información del Cónyuge / Pareja</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Fecha de matrimonio / inicio de unión" name="step9.marriage_date" required error={errors.step9?.marriage_date?.message as string}>
                <input type="date" {...register('step9.marriage_date')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
              </FormField>
              <FormField label="Apellidos de tu pareja" name="step9.spouse_surname" required error={errors.step9?.spouse_surname?.message as string}>
                <input {...register('step9.spouse_surname')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
              </FormField>
              <FormField label="Nombres de tu pareja" name="step9.spouse_given_name" error={errors.step9?.spouse_given_name?.message as string}>
                <input {...register('step9.spouse_given_name')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
              </FormField>
              <FormField label="Fecha de nacimiento" name="step9.spouse_date_of_birth" required error={errors.step9?.spouse_date_of_birth?.message as string}>
                <input type="date" {...register('step9.spouse_date_of_birth')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
              </FormField>
              <FormField label="País de nacimiento" name="step9.spouse_birth_country" required error={errors.step9?.spouse_birth_country?.message as string}>
                <select {...register('step9.spouse_birth_country')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                  <option value="">Seleccionar país</option>
                  {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Ocupación actual" name="step9.spouse_occupation" required error={errors.step9?.spouse_occupation?.message as string}>
                <input {...register('step9.spouse_occupation')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#E5E5E5] pt-4 mt-4">
              <FormField label="¿Vive en la misma dirección que tú?" name="step9.spouse_address_same" required error={errors.step9?.spouse_address_same?.message as string}>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" value="true" {...register('step9.spouse_address_same')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
                    <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" value="false" {...register('step9.spouse_address_same')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
                    <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
                  </label>
                </div>
              </FormField>
              <FormField label="¿Viajará contigo a Canadá?" name="step9.spouse_accompany" required error={errors.step9?.spouse_accompany?.message as string}>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" value="true" {...register('step9.spouse_accompany')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
                    <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" value="false" {...register('step9.spouse_accompany')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
                    <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
                  </label>
                </div>
              </FormField>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Hijos</h3>
        <FormField label="¿Tienes hijos?" name="step9.has_children" required error={errors.step9?.has_children?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step9.has_children')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step9.has_children')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>

        {hasChildren === 'true' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <RepeatableTable
              name="step9.children"
              title="Información de Hijos"
              defaultItem={{ last_name: '', first_name: '', dob: '', relationship: 'Child', birth_country: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Apellidos" name={`step9.children.${index}.last_name`} required error={(errors.step9?.children as any)?.[index]?.last_name?.message as string}>
                    <input {...register(`step9.children.${index}.last_name`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Nombres" name={`step9.children.${index}.first_name`} required error={(errors.step9?.children as any)?.[index]?.first_name?.message as string}>
                    <input {...register(`step9.children.${index}.first_name`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
                  </FormField>
                  <FormField label="Fecha de nacimiento" name={`step9.children.${index}.dob`} required error={(errors.step9?.children as any)?.[index]?.dob?.message as string}>
                    <input type="date" {...register(`step9.children.${index}.dob`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
                  </FormField>
                  <FormField label="Relación" name={`step9.children.${index}.relationship`} required error={(errors.step9?.children as any)?.[index]?.relationship?.message as string}>
                    <select {...register(`step9.children.${index}.relationship`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                      <option value="Child">Hijo / Hija</option>
                      <option value="Stepchild">Hijastro / Hijastra</option>
                      <option value="Adopted Child">Hijo Adoptivo</option>
                    </select>
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="País de nacimiento" name={`step9.children.${index}.birth_country`} required error={(errors.step9?.children as any)?.[index]?.birth_country?.message as string}>
                      <select {...register(`step9.children.${index}.birth_country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
                        <option value="">Seleccionar país</option>
                        {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                      </select>
                    </FormField>
                  </div>
                </div>
              )}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <RepeatableTable
          name="step9.parents"
          title="Información de los Padres"
          description="Debes proporcionar la información de tus padres (incluso si han fallecido)."
          defaultItem={{ surname: '', given_name: '', relationship: 'Mother', dob: '', birth_country: '', occupation: '', address_same: '', country: '', street: '', city: '', accompany: '' }}
          minItems={1}
          renderItem={(index) => <ParentRow index={index} />}
        />
      </div>
    </div>
  )
}

function ParentRow({ index }: { index: number }) {
  const { register, formState, watch, setValue } = useFormContext()
  const errors = formState.errors as any
  const parentAddressSame = watch(`step9.parents.${index}.address_same`)
  
  useEffect(() => {
    if (parentAddressSame === 'true') {
      setValue(`step9.parents.${index}.country`, '')
      setValue(`step9.parents.${index}.street`, '')
      setValue(`step9.parents.${index}.city`, '')
    }
  }, [parentAddressSame, index, setValue])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Parentesco" name={`step9.parents.${index}.relationship`} required error={(errors.step9?.parents as any)?.[index]?.relationship?.message as string}>
        <select {...register(`step9.parents.${index}.relationship`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
          <option value="">Seleccionar...</option>
          <option value="Mother">Madre</option>
          <option value="Father">Padre</option>
          <option value="Stepmother">Madrastra</option>
          <option value="Stepfather">Padrastro</option>
        </select>
      </FormField>
      <div className="hidden md:block"></div>
      
      <FormField label="Apellidos" name={`step9.parents.${index}.surname`} required error={(errors.step9?.parents as any)?.[index]?.surname?.message as string}>
        <input {...register(`step9.parents.${index}.surname`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
      </FormField>
      <FormField label="Nombres" name={`step9.parents.${index}.given_name`} required error={(errors.step9?.parents as any)?.[index]?.given_name?.message as string}>
        <input {...register(`step9.parents.${index}.given_name`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
      </FormField>
      
      <FormField label="Fecha de nacimiento" name={`step9.parents.${index}.dob`} required error={(errors.step9?.parents as any)?.[index]?.dob?.message as string}>
        <input type="date" {...register(`step9.parents.${index}.dob`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:light]" />
      </FormField>
      <FormField label="País de nacimiento" name={`step9.parents.${index}.birth_country`} required error={(errors.step9?.parents as any)?.[index]?.birth_country?.message as string}>
        <select {...register(`step9.parents.${index}.birth_country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
          <option value="">Seleccionar país</option>
          {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </select>
      </FormField>
      
      <div className="md:col-span-2">
        <FormField label="Ocupación" hint="Si falleció, escribe 'Deceased'" name={`step9.parents.${index}.occupation`} required error={(errors.step9?.parents as any)?.[index]?.occupation?.message as string}>
          <input {...register(`step9.parents.${index}.occupation`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
        </FormField>
      </div>

      <div className="md:col-span-2 pt-2 border-t border-[#E5E5E5]">
        <FormField label="¿Vive en tu misma dirección actual?" name={`step9.parents.${index}.address_same`} required error={(errors.step9?.parents as any)?.[index]?.address_same?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register(`step9.parents.${index}.address_same`)} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register(`step9.parents.${index}.address_same`)} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No (o falleció)</span>
            </label>
          </div>
        </FormField>
      </div>

      {parentAddressSame === 'false' && (
        <>
          <FormField label="País de residencia" name={`step9.parents.${index}.country`} required error={(errors.step9?.parents as any)?.[index]?.country?.message as string}>
            <select {...register(`step9.parents.${index}.country`)} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar país</option>
              <option value="Deceased">Fallecido / Deceased</option>
              {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Ciudad" name={`step9.parents.${index}.city`} required error={(errors.step9?.parents as any)?.[index]?.city?.message as string}>
            <input {...register(`step9.parents.${index}.city`)} placeholder="O escribe 'Fallecido'" className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Dirección exacta" name={`step9.parents.${index}.street`} required error={(errors.step9?.parents as any)?.[index]?.street?.message as string}>
              <input {...register(`step9.parents.${index}.street`)} placeholder="O escribe 'Fallecido'" className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] transition-colors" />
            </FormField>
          </div>
        </>
      )}

      <div className="md:col-span-2 pt-2 border-t border-[#E5E5E5]">
        <FormField label="¿Viajará contigo a Canadá?" name={`step9.parents.${index}.accompany`} required error={(errors.step9?.parents as any)?.[index]?.accompany?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register(`step9.parents.${index}.accompany`)} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register(`step9.parents.${index}.accompany`)} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>
      </div>
    </div>
  )
}

