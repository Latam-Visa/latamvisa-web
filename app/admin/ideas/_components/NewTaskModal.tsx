"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { PRIORITIES, TaskPriority } from './types'

interface NewTaskModalProps {
  onCreate: (fields: { title: string; description?: string; category?: string; priority?: TaskPriority }) => Promise<void>
  onClose: () => void
}

export function NewTaskModal({ onCreate, onClose }: NewTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('media')
  const [isSaving, setIsSaving] = useState(false)
  const [titleError, setTitleError] = useState(false)

  const inputClass = "w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-[#0A0A0A] text-sm focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors"

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    setIsSaving(true)
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      priority,
    })
    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl my-auto max-h-[90vh] flex flex-col">
        <div className="shrink-0 mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-1">Nueva idea</h2>
            <p className="text-[#525252] text-sm">Agregá una idea o tarea al board</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#6B6B6B] hover:bg-[#F5F5F0] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#525252]">Título *</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(false) }}
              placeholder="¿Qué idea querés agregar?"
              className={`${inputClass} ${titleError ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : ''}`}
              autoFocus
            />
            {titleError && <span className="text-xs text-[#DC2626]">El título es obligatorio</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#525252]">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles opcionales"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#525252]">Categoría</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="General"
                className={inputClass}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#525252]">Prioridad</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className={inputClass}
              >
                {PRIORITIES.map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-6 mt-2 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full min-h-[44px] bg-[#C8FF00] text-[#2F4A00] font-bold py-3 rounded-lg hover:bg-[#B5E600] transition-colors shadow-sm disabled:opacity-60"
          >
            {isSaving ? 'Creando...' : 'Crear idea'}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-full min-h-[44px] bg-transparent text-[#525252] font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
