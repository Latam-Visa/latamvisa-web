import { useFormContext } from 'react-hook-form'
import { FormField } from '../../turismo-usa/_components/FormField'

export function Step1() {
  const { register, formState } = useFormContext()
  const errors = formState.errors as any

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Detalles principales de la aplicación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="¿Qué tipo de visa estás solicitando?" name="step1.apply_for" required error={errors.step1?.apply_for?.message as string}>
            <select {...register('step1.apply_for')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar tipo</option>
              <option value="Visitor Visa">Visa de Turista (Visitor Visa)</option>
              <option value="Transit Visa">Visa de Tránsito</option>
            </select>
          </FormField>

          <FormField label="Motivo principal del viaje" name="step1.visa_reason" required error={errors.step1?.visa_reason?.message as string}>
            <select {...register('step1.visa_reason')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors appearance-none">
              <option value="">Seleccionar motivo</option>
              <option value="Tourism">Turismo</option>
              <option value="Business">Negocios</option>
              <option value="Visit Family/Friends">Visitar familia o amigos</option>
              <option value="Short-term Studies">Estudios a corto plazo</option>
              <option value="Other">Otro</option>
            </select>
          </FormField>
        </div>

        <FormField label="¿Qué actividades planeas realizar en Canadá?" hint="Máximo 475 caracteres" name="step1.activities_in_canada" required error={errors.step1?.activities_in_canada?.message as string}>
          <textarea 
            {...register('step1.activities_in_canada')} 
            className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors min-h-[100px] resize-y" 
            placeholder="Describe brevemente tu itinerario..."
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Fecha estimada de entrada a Canadá" name="step1.entry_date" required error={errors.step1?.entry_date?.message as string}>
            <input type="date" {...register('step1.entry_date')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors [color-scheme:light]" />
          </FormField>

          <FormField label="Fecha estimada de salida de Canadá" name="step1.leave_date" required error={errors.step1?.leave_date?.message as string}>
            <input type="date" {...register('step1.leave_date')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors [color-scheme:light]" />
          </FormField>
        </div>

        <FormField label="Número UCI (Opcional)" hint="Universal Client Identifier. Si has aplicado a Canadá antes, lo encontrarás en cartas anteriores." name="step1.uci" error={errors.step1?.uci?.message as string}>
          <input {...register('step1.uci')} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] transition-colors" placeholder="Ej: 1111-2222" />
        </FormField>
        
        <div className="pt-4 border-t border-[#E5E5E5]">
          <FormField label="¿Estás completando esta aplicación en nombre de alguien más?" name="step1.applying_on_behalf" required error={errors.step1?.applying_on_behalf?.message as string}>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="true" {...register('step1.applying_on_behalf')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" value="false" {...register('step1.applying_on_behalf')} className="w-5 h-5 accent-[#C8FF00] bg-white border-[#E5E5E5] focus:ring-[#C8FF00]" />
                <span className="text-[#525252] group-hover:text-[#0A0A0A] transition-colors">No</span>
              </label>
            </div>
          </FormField>
        </div>
      </div>
    </div>
  )
}
