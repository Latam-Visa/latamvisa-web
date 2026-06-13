import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'

export function Step5() {
  const { register, control, formState: { errors }, watch } = useFormContext()
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "step5.previous_visas"
  })

  const hasPrevious = watch('step5.previous_schengen_visas')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 5: Historial de Visas</h2>
        <p className="text-[#525252]">Detalles sobre visas Schengen anteriores e información biométrica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-3">¿Ha obtenido visas Schengen en los últimos tres años?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Sí" {...register('step5.previous_schengen_visas')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>Sí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="No" {...register('step5.previous_schengen_visas')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>No</span>
            </label>
          </div>
          {errors.step5?.previous_schengen_visas && <p className="text-red-500 text-sm mt-1">{(errors.step5.previous_schengen_visas as any).message}</p>}
        </div>

        {hasPrevious === 'Sí' && (
          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-bold text-[#0A0A0A]">Lista de visas obtenidas</label>
            {fields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAFAF7] p-4 rounded-xl border border-[#E5E5E5] relative">
                <div>
                  <label className="block text-xs font-bold text-[#0A0A0A] mb-1">Válida Desde</label>
                  <input type="date" {...register(`step5.previous_visas.${index}.date_from`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8FF00]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0A0A0A] mb-1">Válida Hasta</label>
                  <input type="date" {...register(`step5.previous_visas.${index}.date_to`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8FF00]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0A0A0A] mb-1">Sticker (Opcional)</label>
                  <input {...register(`step5.previous_visas.${index}.sticker_number`)} className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8FF00]" />
                </div>
                <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => append({ date_from: '', date_to: '', sticker_number: '' })} className="flex items-center gap-2 text-sm font-bold text-[#0A0A0A] border border-[#E5E5E5] rounded-xl px-4 py-2 hover:bg-[#FAFAF7] transition-colors">
              <Plus className="w-4 h-4" /> Añadir Visa
            </button>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-3">¿Se han tomado sus huellas dactilares anteriormente para solicitudes de visa Schengen?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Sí" {...register('step5.fingerprints_collected')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>Sí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="No" {...register('step5.fingerprints_collected')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>No</span>
            </label>
          </div>
          {errors.step5?.fingerprints_collected && <p className="text-red-500 text-sm mt-1">{(errors.step5.fingerprints_collected as any).message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#0A0A0A] mb-3">Permiso de entrada al país de destino final (si aplica)</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Sí" {...register('step5.final_destination_permit')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>Sí, lo tengo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="No" {...register('step5.final_destination_permit')} className="w-4 h-4 text-[#C8FF00] focus:ring-[#C8FF00]" />
              <span>No aplica (Schengen es el destino final)</span>
            </label>
          </div>
          {errors.step5?.final_destination_permit && <p className="text-red-500 text-sm mt-1">{(errors.step5.final_destination_permit as any).message}</p>}
        </div>
      </div>
    </div>
  )
}
