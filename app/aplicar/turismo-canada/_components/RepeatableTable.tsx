import React from 'react'
import { useFieldArray, useFormContext, ArrayPath, FieldArray, FieldValues } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'

interface RepeatableTableProps {
  name: string
  title: string
  description?: string
  defaultItem: any
  renderItem: (index: number, remove: () => void) => React.ReactNode
  minItems?: number
}

export function RepeatableTable({ name, title, description, defaultItem, renderItem, minItems = 0 }: RepeatableTableProps) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never
  })

  return (
    <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-4">
      <div>
        <h3 className="text-lg font-medium text-[#0A0A0A]">{title}</h3>
        {description && <p className="text-sm text-[#525252] mt-1">{description}</p>}
      </div>

      <div className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="relative p-4 bg-white border border-[#E5E5E5] rounded-lg">
            {fields.length > minItems && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-medium text-[#DC2626]/80 hover:text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-2.5 py-1.5 rounded-md transition-colors z-10"
                title="Eliminar este registro"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            )}
            {renderItem(index, () => remove(index))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append(defaultItem)}
        className="flex items-center gap-2 text-[#C8FF00] hover:text-[#A8D900] font-medium px-4 py-2 border border-[#C8FF00]/30 rounded-lg bg-[#C8FF00]/5 transition-colors mt-2"
      >
        <Plus className="w-4 h-4" /> Agregar otro registro
      </button>
    </div>
  )
}
