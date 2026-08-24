import { RepeatableTable } from './RepeatableTable'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sanitizePdfFile } from '@/lib/pdf-sanitize'
import { PassportConfirmModal } from '../components/PassportConfirmModal'

export function Step3() {
  const { register, formState: { errors }, watch, setValue } = useFormContext()
  const errs = (errors.step3 as any) || {}
  const data = watch('step3') || {}

  const [nidStatus, setNidStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle')
  const [nidError, setNidError] = useState('')
  const [nidData, setNidData] = useState<any>(null)

  const handleNidUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setNidStatus('error')
      setNidError('El archivo pesa más de 5MB. Sube una foto más ligera.')
      return
    }

    setNidStatus('uploading')
    setNidError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse-passport', { method: 'POST', body: formData })
      const result = await res.json()

      if (result.success) {
        setNidData(result)
        setNidStatus('success')
        
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `australia/nid_scan_${Date.now()}.${fileExt}`
        const fileToUpload = file.type === 'application/pdf' ? await sanitizePdfFile(file) : file
        const { data: uploadData } = await supabase.storage
          .from('visa-applications')
          .upload(fileName, fileToUpload, { upsert: true, contentType: fileToUpload.type })
        if (uploadData) {
          setValue('step3.doc_national_id_url', uploadData.path)
        }
      } else {
        setNidStatus('error')
        setNidError(result.error || 'No pudimos leer el documento. Puedes llenar los datos manualmente.')
      }
    } catch (e) {
      setNidStatus('error')
      setNidError('Error de red al intentar procesar el documento.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Identificación Adicional</h3>
        <p className="text-sm text-[#525252] mb-4">Documentos nacionales de identidad y nacimiento</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Ciudad/Pueblo de Nacimiento" name="step3.birth_town_city" required error={errs.birth_town_city?.message as string}>
            <input type="text" {...register('step3.birth_town_city')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Estado/Provincia de Nacimiento" name="step3.birth_state_province" required error={errs.birth_state_province?.message as string}>
            <input type="text" {...register('step3.birth_state_province')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="País de Nacimiento" name="step3.country_of_birth" required error={errs.country_of_birth?.message as string}>
            <input type="text" {...register('step3.country_of_birth')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
          </FormField>
          <FormField label="Estado Civil" name="step3.relationship_status" required error={errs.relationship_status?.message as string}>
            <select {...register('step3.relationship_status')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
              <option value="">Seleccionar</option>
              <option value="Single">Soltero/a</option>
              <option value="Married">Casado/a</option>
              <option value="De facto">De facto (Concubinato)</option>
              <option value="Divorced">Divorciado/a</option>
              <option value="Widowed">Viudo/a</option>
            </select>
          </FormField>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm">
          <h4 className="font-bold text-[#0A0A0A] mb-2">Documento de identidad (cédula, DNI o equivalente)</h4>
          <p className="text-sm text-[#525252] mb-4">Por favor sube una foto de tu documento para extraer los datos.</p>
          
          {nidStatus === 'uploading' ? (
            <div className="flex flex-col items-center p-6 border-2 border-dashed border-[#E5E5E5] rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00] mb-2" />
              <p className="text-sm font-bold">Extrayendo datos...</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-[#C8FF00] bg-[#F5F5F0] rounded-xl">
              <label className="cursor-pointer bg-[#C8FF00] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#B5E600] transition-colors">
                Subir archivo
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files && handleNidUpload(e.target.files[0])} />
              </label>
              <span className="text-xs text-[#525252]">Sube PDF o Imagen (Max 5MB)</span>
            </div>
          )}
          {nidError && <p className="text-xs text-red-500 mt-2">{nidError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E5E5E5]">
            <FormField label="Apellidos (ID)" name="step3.nid_family_name" error={errs.nid_family_name?.message as string}>
              <input type="text" {...register('step3.nid_family_name')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Nombres (ID)" name="step3.nid_given_names" error={errs.nid_given_names?.message as string}>
              <input type="text" {...register('step3.nid_given_names')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Número de Identificación" name="step3.nid_number" error={errs.nid_number?.message as string}>
              <input type="text" {...register('step3.nid_number')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="País de Emisión" name="step3.nid_country_of_issue" error={errs.nid_country_of_issue?.message as string}>
              <input type="text" {...register('step3.nid_country_of_issue')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Fecha de Emisión (Opcional)" name="step3.nid_issue_date" error={errs.nid_issue_date?.message as string}>
              <input type="date" {...register('step3.nid_issue_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
            <FormField label="Fecha de Expiración (Opcional)" name="step3.nid_expiry_date" error={errs.nid_expiry_date?.message as string}>
              <input type="date" {...register('step3.nid_expiry_date')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        </div>

        <FormField label="¿Has sido conocido por otros nombres?" name="step3.has_other_names" required error={errs.has_other_names?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.has_other_names')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.has_other_names')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        {data.has_other_names === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
             <FormField label="Detalles de otros nombres" name="step3.other_names_details" error={errs.other_names_details?.message as string}>
              <textarea {...register('step3.other_names_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        <FormField label="¿Eres ciudadano del país de tu pasaporte?" name="step3.citizen_of_passport_country" required error={errs.citizen_of_passport_country?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.citizen_of_passport_country')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.citizen_of_passport_country')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        
        <FormField label="¿Eres ciudadano de algún otro país?" name="step3.citizen_other_country" required error={errs.citizen_other_country?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.citizen_other_country')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.citizen_other_country')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        {data.citizen_other_country === 'true' && (
          
          <div className="mt-4">
            <RepeatableTable
              name="step3.other_citizenships"
              title="Otras ciudadanías"
              defaultItem={{ country: '', passport_number: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <FormField label="País" name={`step3.other_citizenships.${index}.country`} error={errs.other_citizenships?.[index]?.country?.message}>
                    <input type="text" {...register(`step3.other_citizenships.${index}.country`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                  <FormField label="Número de pasaporte (Opcional)" name={`step3.other_citizenships.${index}.passport_number`} error={errs.other_citizenships?.[index]?.passport_number?.message}>
                    <input type="text" {...register(`step3.other_citizenships.${index}.passport_number`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                </div>
              )}
            />
          </div>

        )}

        <FormField label="¿Has viajado a Australia antes?" name="step3.previous_travel_australia" required error={errs.previous_travel_australia?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.previous_travel_australia')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.previous_travel_australia')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        {data.previous_travel_australia === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
             <FormField label="Detalles del viaje" name="step3.previous_travel_details" error={errs.previous_travel_details?.message as string}>
              <textarea {...register('step3.previous_travel_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        <FormField label="¿Has aplicado a una visa australiana antes?" name="step3.previously_applied_australia_visa" required error={errs.previously_applied_australia_visa?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.previously_applied_australia_visa')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.previously_applied_australia_visa')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        {data.previously_applied_australia_visa === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
            <FormField label="¿Tienes un número de grant de visa previo?" name="step3.has_grant_number" required error={errs.has_grant_number?.message as string}>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.has_grant_number')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
                <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.has_grant_number')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
              </div>
            </FormField>
            {data.has_grant_number === 'true' && (
              <div className="mt-4">
                <FormField label="Grant Number" name="step3.grant_number" error={errs.grant_number?.message as string}>
                  <input type="text" {...register('step3.grant_number')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                </FormField>
              </div>
            )}
          </div>
        )}

        <FormField label="¿Tienes otro pasaporte, además del que ya registraste? (por ejemplo, de otra nacionalidad)" name="step3.other_travel_documents" required error={errs.other_travel_documents?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.other_travel_documents')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.other_travel_documents')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        {data.other_travel_documents === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
             <FormField label="Detalles (País, número de pasaporte)" name="step3.other_travel_documents_details" error={errs.other_travel_documents_details?.message as string}>
              <textarea {...register('step3.other_travel_documents_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        <FormField label="¿Tienes otro documento de identidad válido, además de tu cédula? (por ejemplo, pasaporte extranjero o documento de residencia)" name="step3.other_identity_documents" required error={errs.other_identity_documents?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.other_identity_documents')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.other_identity_documents')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        {data.other_identity_documents === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
             <FormField label="Detalles del documento" name="step3.other_identity_documents_details" error={errs.other_identity_documents_details?.message as string}>
              <textarea {...register('step3.other_identity_documents_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        <FormField label="¿Te has hecho un examen médico para una visa australiana en los últimos 12 meses?" name="step3.health_exam_last_12_months" required error={errs.health_exam_last_12_months?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.health_exam_last_12_months')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.health_exam_last_12_months')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        <FormField label="¿Tienes una Pacific Australia Card (PAC)?" name="step3.pacific_australia_card" required error={errs.pacific_australia_card?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.pacific_australia_card')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.pacific_australia_card')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        {data.pacific_australia_card === 'true' && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
            <FormField label="Número de la tarjeta (Opcional)" name="step3.pacific_australia_card_number" error={errs.pacific_australia_card_number?.message as string}>
              <input type="text" {...register('step3.pacific_australia_card_number')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

      </div>
      
      {nidData && (
        <PassportConfirmModal
          data={nidData.data}
          sources={nidData.sources || {}}
          onConfirm={(confirmed) => {
            if (confirmed.surname) setValue('step3.nid_family_name', confirmed.surname)
            if (confirmed.given_names) setValue('step3.nid_given_names', confirmed.given_names)
            if (confirmed.document_number) setValue('step3.nid_number', confirmed.document_number)
            if (confirmed.issuing_country) setValue('step3.nid_country_of_issue', confirmed.issuing_country)
            if (confirmed.date_of_issue) setValue('step3.nid_issue_date', confirmed.date_of_issue)
            if (confirmed.date_of_expiry) setValue('step3.nid_expiry_date', confirmed.date_of_expiry)
            setNidData(null)
          }}
          onClose={() => setNidData(null)}
        />
      )}
    </div>
  )
}
