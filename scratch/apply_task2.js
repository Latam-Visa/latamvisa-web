const fs = require('fs');
const path = require('path');

const stepsDir = path.join(__dirname, '../app/aplicar/turismo-australia/_components');

function write(filename, content) {
  fs.writeFileSync(path.join(stepsDir, filename), content);
}

// ---------------------------------------------------------
// STEP 3: Identificación Adicional (National ID Scan + Conditionals)
// ---------------------------------------------------------
write('Step3.tsx', `import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
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
        const fileName = \`australia/nid_scan_\${Date.now()}.\${fileExt}\`
        const { data: uploadData } = await supabase.storage
          .from('visa-applications')
          .upload(fileName, file, { upsert: true })
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
        {data.has_other_names === true && (
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
        {data.citizen_other_country === true && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
             <FormField label="Países de los que eres ciudadano" name="step3.other_citizenships_details" error={errs.other_citizenships_details?.message as string}>
              <textarea {...register('step3.other_citizenships_details')} placeholder="Ej: España (Pasaporte: ABC1234)" className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}

        <FormField label="¿Has viajado a Australia antes?" name="step3.previous_travel_australia" required error={errs.previous_travel_australia?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.previous_travel_australia')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.previous_travel_australia')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>
        {data.previous_travel_australia === true && (
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
        {data.previously_applied_australia_visa === true && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
            <FormField label="¿Tienes un número de grant de visa previo?" name="step3.has_grant_number" required error={errs.has_grant_number?.message as string}>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step3.has_grant_number')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
                <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step3.has_grant_number')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
              </div>
            </FormField>
            {data.has_grant_number === true && (
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
        {data.other_travel_documents === true && (
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
        {data.other_identity_documents === true && (
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
`);

// ---------------------------------------------------------
// STEP 4: Remove Oficina del Departamento
// ---------------------------------------------------------
let step4Content = fs.readFileSync(path.join(stepsDir, 'Step4.tsx'), 'utf8');
step4Content = step4Content.replace(/<FormField label={\`Oficina del Departamento\`}[^>]*>[\s\S]*?<\/FormField>/g, '');
write('Step4.tsx', step4Content);

// ---------------------------------------------------------
// STEP 5: Travel Companions - Conditional
// ---------------------------------------------------------
let step5Content = fs.readFileSync(path.join(stepsDir, 'Step5.tsx'), 'utf8');
if(!step5Content.includes('travelling_companions_details')) {
  step5Content = step5Content.replace(/<\/div>\s*<\/div>\s*\)\s*\}/, `
        {data.travelling_with_others === true && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
             <FormField label="Nombres y relación de las personas con las que viajas" name="step5.travelling_companions_details" error={errs.travelling_companions_details?.message as string}>
              <textarea {...register('step5.travelling_companions_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
            </FormField>
          </div>
        )}
      </div>
    </div>
  )
}
  `);
  write('Step5.tsx', step5Content);
}

// ---------------------------------------------------------
// STEP 6: Fix Title & Content Mismatch + Conditional Fields
// ---------------------------------------------------------
write('Step6.tsx', `import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step6() {
  const { register, formState: { errors }, watch } = useFormContext()
  const errs = (errors.step6 as any) || {}
  const data = watch('step6') || {}

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Familiares que no viajan contigo</h3>
        <p className="text-sm text-[#525252] mb-4">Familiares cercanos que NO viajarán contigo a Australia</p>
        
        <FormField label="¿Tienes familiares cercanos que NO viajarán contigo a Australia?" name="step6.has_non_accompanying_family" required error={errs.has_non_accompanying_family?.message as string}>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="true" {...register('step6.has_non_accompanying_family')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">Sí</span></label>
            <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" value="false" {...register('step6.has_non_accompanying_family')} className="w-5 h-5 accent-[#C8FF00]" /><span className="text-[#525252]">No</span></label>
          </div>
        </FormField>

        {data.has_non_accompanying_family === true && (
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl mt-4">
             <FormField label="Nombres, parentesco y datos de esos familiares" name="step6.non_accompanying_family_details" error={errs.non_accompanying_family_details?.message as string}>
              <textarea {...register('step6.non_accompanying_family_details')} placeholder="Ej: Mi padre Juan Pérez, nacido el 01/01/1970" className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          </div>
        )}
      </div>
    </div>
  )
}
`);

// ---------------------------------------------------------
// STEP 10: Health - Conditional
// ---------------------------------------------------------
let step10Content = fs.readFileSync(path.join(stepsDir, 'Step10.tsx'), 'utf8');
if(!step10Content.includes('health_details')) {
  // wait, the script already generated health_details as visible. I should make it conditional
}
step10Content = step10Content.replace(/<FormField label={\`Si respondiste "Sí"[^>]*>[\s\S]*?<\/FormField>/g, '');
step10Content = step10Content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}/, `
          {(data.health_declarations?.tuberculosis === true || data.health_declarations?.has_tb === true) && (
            <FormField label="Proporciona detalles de las condiciones de salud afirmativas" name="step10.health_details" error={errs.health_details?.message as string}>
              <textarea {...register('step10.health_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          )}
        </div>
      </div>
    </div>
  )
}
`);
write('Step10.tsx', step10Content);

// ---------------------------------------------------------
// STEP 11: Character - Conditional
// ---------------------------------------------------------
let step11Content = fs.readFileSync(path.join(stepsDir, 'Step11.tsx'), 'utf8');
step11Content = step11Content.replace(/<FormField label={\`Si respondiste "Sí"[^>]*>[\s\S]*?<\/FormField>/g, '');
step11Content = step11Content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}/, `
          {data.character_declarations?.convicted === true && (
            <FormField label="Proporciona detalles del arresto o condena" name="step11.character_details" error={errs.character_details?.message as string}>
              <textarea {...register('step11.character_details')} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00] min-h-[100px]" />
            </FormField>
          )}
        </div>
      </div>
    </div>
  )
}
`);
write('Step11.tsx', step11Content);

// ---------------------------------------------------------
// STEP 14: Documents Multi-upload
// ---------------------------------------------------------
write('Step14.tsx', `import { useFormContext } from 'react-hook-form'
import { FileUpload } from '../../turismo-usa/_components/FileUpload'

export function Step14() {
  const { formState: { errors }, watch, setValue } = useFormContext()
  const errs = (errors.step14 as any) || {}
  const data = watch('step14') || {}

  const handleFileUpload = (fieldName: string, urls: string[]) => {
    setValue(fieldName, urls, { shouldValidate: true })
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Documentos de Soporte</h3>
        <p className="text-sm text-[#525252] mb-4">Evidencia para respaldar tu aplicación</p>

        <div className="space-y-8">
          
          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5]">
            <h4 className="font-bold text-[#0A0A0A] mb-2">Grupo 1: Arraigo (tus vínculos con tu país)</h4>
            <div className="space-y-4">
              <FileUpload label="Carta explicando con quién vives / situación de vivienda" name="step14.doc_housing_letter" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_housing_letter', urls)} />
              <FileUpload label="Certificado laboral o prueba de trabajo estable / independiente" name="step14.doc_work_cert" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_work_cert', urls)} />
              <FileUpload label="Prueba de estudios (si aplica)" name="step14.doc_studies" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_studies', urls)} />
              <FileUpload label="Certificados de propiedad (tradición y libertad / catastral)" name="step14.doc_properties" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_properties', urls)} />
              <FileUpload label="Tarjeta de propiedad de vehículo (si aplica)" name="step14.doc_vehicle" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_vehicle', urls)} />
              <FileUpload label="Registros civiles de vínculos familiares (hijos, hermanos, padres)" name="step14.doc_civil_registries" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_civil_registries', urls)} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5]">
            <h4 className="font-bold text-[#0A0A0A] mb-2">Grupo 2: Evidencia de fondos y/o financiación</h4>
            <div className="space-y-4">
              <h5 className="font-semibold text-sm text-[#525252] mt-4">Del Aplicante:</h5>
              <FileUpload label="Extractos bancarios (últimos 3–6 meses)" name="step14.doc_bank_statements" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_bank_statements', urls)} />
              <FileUpload label="Prueba de pensión o ingresos (si aplica)" name="step14.doc_pension" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_pension', urls)} />
              
              <h5 className="font-semibold text-sm text-[#525252] mt-6 pt-4 border-t border-[#E5E5E5]">Si un patrocinador en Australia cubre el viaje:</h5>
              <FileUpload label="Carta de invitación / compromiso del patrocinador" name="step14.doc_sponsor_letter" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_sponsor_letter', urls)} />
              <FileUpload label="Prueba de dirección del patrocinador" name="step14.doc_sponsor_address" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_sponsor_address', urls)} />
              <FileUpload label="Evidencia de relación con el patrocinador" name="step14.doc_sponsor_relationship" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_sponsor_relationship', urls)} />
              <FileUpload label="Payslips del patrocinador (últimos 3 meses)" name="step14.doc_sponsor_payslips" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_sponsor_payslips', urls)} />
              <FileUpload label="Carta laboral / contrato del patrocinador" name="step14.doc_sponsor_employment" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_sponsor_employment', urls)} />
              <FileUpload label="Extractos bancarios del patrocinador (3 meses)" name="step14.doc_sponsor_bank" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_sponsor_bank', urls)} />
              <FileUpload label="Prueba de hospedaje" name="step14.doc_sponsor_accommodation" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_sponsor_accommodation', urls)} />
              <FileUpload label="Plan general de actividades / itinerario" name="step14.doc_itinerary" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_itinerary', urls)} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5]">
            <h4 className="font-bold text-[#0A0A0A] mb-2">Grupo 3: Evidencia de viajes anteriores</h4>
            <div className="space-y-4">
              <FileUpload label="Todas las páginas del pasaporte con sellos y visas" name="step14.doc_passport_stamps" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_passport_stamps', urls)} />
              <FileUpload label="Visas anteriores relevantes (ej. visa de EE. UU.)" name="step14.doc_previous_visas" bucket="visa-applications" folder="australia" multiple onUpload={(urls) => handleFileUpload('step14.doc_previous_visas', urls)} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
`);
console.log('Script done.');
