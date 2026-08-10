"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { AdminTask, COLUMNS, PRIORITIES, TaskPriority, TaskStatus, priorityConfig } from './types'

interface TaskCardProps {
  task: AdminTask
  index: number
  onUpdate: (id: string, fields: Partial<AdminTask>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TaskCard({ task, index, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description || '',
    category: task.category,
    priority: task.priority as TaskPriority,
  })

  const handleSave = async () => {
    const title = draft.title.trim()
    if (!title) return
    setIsSaving(true)
    await onUpdate(task.id, {
      title,
      description: draft.description.trim() || null,
      category: draft.category.trim() || 'General',
      priority: draft.priority,
    })
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
    })
    setIsEditing(false)
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await onUpdate(task.id, { status: e.target.value as TaskStatus })
  }

  const handleDelete = async () => {
    if (confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.')) {
      setIsDeleting(true)
      await onDelete(task.id)
    }
  }

  const inputClass = "w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-sm hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-shadow"
    >
      {isEditing ? (
        <div className="flex flex-col gap-2.5">
          <input
            type="text"
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            className={`${inputClass} font-bold`}
            placeholder="Título"
          />
          <textarea
            value={draft.description}
            onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
            className={`${inputClass} resize-none`}
            rows={2}
            placeholder="Descripción (opcional)"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={draft.category}
              onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
              className={`${inputClass} flex-1`}
              placeholder="Categoría"
            />
            <select
              value={draft.priority}
              onChange={e => setDraft(d => ({ ...d, priority: e.target.value as TaskPriority }))}
              className={`${inputClass} w-28 shrink-0`}
            >
              {PRIORITIES.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm rounded-lg hover:bg-[#B5E600] transition-colors disabled:opacity-60"
            >
              <Check className="w-4 h-4" /> Guardar
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="min-h-[44px] px-4 flex items-center justify-center gap-1.5 bg-[#F5F5F0] text-[#525252] font-bold text-sm rounded-lg hover:bg-[#E5E5E5] transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-[#0A0A0A] leading-snug">{task.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                aria-label="Editar"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#6B6B6B] hover:bg-[#F5F5F0] hover:text-[#0A0A0A] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                aria-label="Eliminar"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#6B6B6B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-[#6B6B6B] leading-relaxed line-clamp-3">{task.description}</p>
          )}

          <div className="flex items-center flex-wrap gap-1.5">
            <span className="font-bold text-[10px] uppercase tracking-wider bg-[#F5F5F0] text-[#0A0A0A] px-2 py-1 rounded-md border border-[#E5E5E5]">
              {task.category}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${priorityConfig(task.priority).badgeClass}`}>
              {priorityConfig(task.priority).label}
            </span>
          </div>

          <select
            value={task.status}
            onChange={handleStatusChange}
            className="w-full min-h-[44px] bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 text-sm font-medium focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors"
          >
            {COLUMNS.map(col => (
              <option key={col.key} value={col.key}>{col.label}</option>
            ))}
          </select>
        </div>
      )}
    </motion.div>
  )
}
