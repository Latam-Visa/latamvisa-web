import { useFormContext } from 'react-hook-form'
import { FormField } from './FormField'
import { PhotoUploader } from './PhotoUploader'

export function Step5VisaHistory() {
  const { register, watch, formState } = useFormContext()
  const errors = formState.errors as any
  
  const visaDeniedBefore = watch('step5VisaHistory.visaDeniedBefore')
  const hadPreviousUsaVisa = watch('step5VisaHistory.hadPreviousUsaVisa')

  return (
    <div className="space-y-6">
      <FormField 
        label="¿Te han negado una visa USA, denegado entrada al país, o retirado tu solicitud en un puerto de entrada?" 
        name="step5VisaHistory.visaDeniedBefore" 
        required 
        error={errors.step5VisaHistory?.visaDeniedBefore?.message as string}
      >
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="true" {...register('step5VisaHistory.visaDeniedBefore')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
            <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="false" {...register('step5VisaHistory.visaDeniedBefore')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
            <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
          </label>
        </div>
      </FormField>

      {visaDeniedBefore === 'true' && (
        <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
          <FormField 
            label="Explica cuántas veces y qué pasó" 
            name="step5VisaHistory.visaDeniedDetails" 
            required 
            hint="Sé honesto, esto es importante y quedará en tu registro."
            error={errors.step5VisaHistory?.visaDeniedDetails?.message as string}
          >
            <textarea
              {...register('step5VisaHistory.visaDeniedDetails')}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors min-h-[100px] resize-y"
              placeholder="Ej: En 2018 me negaron la visa de turismo por falta de lazos..."
            />
          </FormField>
        </div>
      )}

      <div className="pt-4 border-t border-[#E5E5E5]">
        <FormField 
          label="¿Has tenido visa USA antes?" 
          name="step5VisaHistory.hadPreviousUsaVisa" 
          required 
          error={errors.step5VisaHistory?.hadPreviousUsaVisa?.message as string}
        >
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="true" {...register('step5VisaHistory.hadPreviousUsaVisa')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value="false" {...register('step5VisaHistory.hadPreviousUsaVisa')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5] focus:ring-[#C8FF00]" />
              <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
            </label>
          </div>
        </FormField>
      </div>

      {hadPreviousUsaVisa === 'true' && (
        <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
          <h3 className="text-[#C8FF00] font-medium text-sm uppercase tracking-wider mb-2">Detalles de tu visa anterior</h3>
          
          <FormField 
            label="Fechas de entrada y salida a USA" 
            name="step5VisaHistory.previousVisaDetails" 
            required 
            hint="Ej: 03/2019 entrada - 09/2019 salida; 12/2021 entrada - 01/2022 salida"
            error={errors.step5VisaHistory?.previousVisaDetails?.message as string}
          >
            <textarea
              {...register('step5VisaHistory.previousVisaDetails')}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors min-h-[80px]"
            />
          </FormField>

          <FormField 
            label="Número de visa anterior" 
            name="step5VisaHistory.previousVisaNumber" 
            required 
            hint="Letras y números en rojo en la esquina inferior derecha de la visa"
            error={errors.step5VisaHistory?.previousVisaNumber?.message as string}
          >
            <input
              {...register('step5VisaHistory.previousVisaNumber')}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors uppercase"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Fecha de emisión" name="step5VisaHistory.previousVisaIssueDate" required error={errors.step5VisaHistory?.previousVisaIssueDate?.message as string}>
              <input type="date" {...register('step5VisaHistory.previousVisaIssueDate')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]" />
            </FormField>
            <FormField label="Fecha de expiración" name="step5VisaHistory.previousVisaExpiryDate" required error={errors.step5VisaHistory?.previousVisaExpiryDate?.message as string}>
              <input type="date" {...register('step5VisaHistory.previousVisaExpiryDate')} className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors [color-scheme:light]" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <FormField label="¿Tuviste licencia de conducir en USA?" name="step5VisaHistory.hadUsDriversLicense" required error={errors.step5VisaHistory?.hadUsDriversLicense?.message as string}>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer group"><input type="radio" value="true" {...register('step5VisaHistory.hadUsDriversLicense')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" /><span className="text-[#525252] group-hover:text-[#0A0A0A]">Sí</span></label>
                <label className="flex items-center gap-2 cursor-pointer group"><input type="radio" value="false" {...register('step5VisaHistory.hadUsDriversLicense')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" /><span className="text-[#525252] group-hover:text-[#0A0A0A]">No</span></label>
              </div>
            </FormField>
            
            <FormField label="¿Te tomaron huellas dactilares?" name="step5VisaHistory.fingerprintedBefore" required error={errors.step5VisaHistory?.fingerprintedBefore?.message as string}>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer group"><input type="radio" value="true" {...register('step5VisaHistory.fingerprintedBefore')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" /><span className="text-[#525252] group-hover:text-[#0A0A0A]">Sí</span></label>
                <label className="flex items-center gap-2 cursor-pointer group"><input type="radio" value="false" {...register('step5VisaHistory.fingerprintedBefore')} className="w-5 h-5 accent-[#C8FF00] bg-[#F5F5F0] border-[#E5E5E5]" /><span className="text-[#525252] group-hover:text-[#0A0A0A]">No</span></label>
              </div>
            </FormField>
          </div>

          <div className="pt-2">
            <PhotoUploader 
              name="step5VisaHistory.previousVisaPhotoFile" 
              label="Foto de la visa anterior (Opcional)" 
              hint="Sube una foto clara de tu visa anterior si la tienes."
            />
          </div>
        </div>
      )}
    </div>
  )
}
