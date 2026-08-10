"use client"

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { NewTaskModal } from './NewTaskModal'
import { AdminTask, COLUMNS, PRIORITIES, TaskPriority } from './types'

export function TasksBoardClient({ initialTasks }: { initialTasks: AdminTask[] }) {
  const [tasks, setTasks] = useState<AdminTask[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [priorityFilter, setPriorityFilter] = useState<'todas' | TaskPriority>('todas')

  const categories = useMemo(() => {
    const set = new Set(tasks.map(t => t.category))
    return Array.from(set).sort()
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (categoryFilter !== 'todas' && t.category !== categoryFilter) return false
      if (priorityFilter !== 'todas' && t.priority !== priorityFilter) return false
      return true
    })
  }, [tasks, categoryFilter, priorityFilter])

  const handleCreate = async (fields: { title: string; description?: string; category?: string; priority?: TaskPriority }) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Error al crear la idea')
        return
      }
      setTasks(prev => [...prev, json.task])
      setIsModalOpen(false)
    } catch {
      alert('Error de red al crear la idea')
    }
  }

  const handleUpdate = async (id: string, fields: Partial<AdminTask>) => {
    const previous = tasks
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...fields } : t)))
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const json = await res.json()
      if (!res.ok) {
        setTasks(previous)
        alert(json.error || 'Error al actualizar la tarea')
        return
      }
      setTasks(prev => prev.map(t => (t.id === id ? json.task : t)))
    } catch {
      setTasks(previous)
      alert('Error de red al actualizar la tarea')
    }
  }

  const handleUpdateStatus = async (id: string, status: AdminTask['status']) => {
    const targetCount = tasks.filter(t => t.status === status).length
    await handleUpdate(id, { status, position: targetCount })
  }

  const handleDelete = async (id: string) => {
    const previous = tasks
    setTasks(prev => prev.filter(t => t.id !== id))
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        setTasks(previous)
        alert(json.error || 'Error al eliminar la tarea')
      }
    } catch {
      setTasks(previous)
      alert('Error de red al eliminar la tarea')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="min-h-[44px] bg-white border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 text-sm font-medium focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
        >
          <option value="todas">Todas las categorías</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as 'todas' | TaskPriority)}
          className="min-h-[44px] bg-white border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 text-sm font-medium focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
        >
          <option value="todas">Todas las prioridades</option>
          {PRIORITIES.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>

        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto min-h-[44px] flex items-center gap-2 bg-[#C8FF00] text-[#2F4A00] font-bold text-sm px-4 rounded-lg hover:bg-[#B5E600] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nueva idea
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-4 md:overflow-visible md:snap-none">
        {COLUMNS.map(col => {
          const columnTasks = filteredTasks
            .filter(t => t.status === col.key)
            .sort((a, b) => a.position - b.position)

          return (
            <div
              key={col.key}
              className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 shrink-0 md:shrink snap-center flex flex-col gap-3 bg-[#F5F5F0]/60 rounded-2xl p-3"
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-sm text-[#0A0A0A] font-[PPMonumentExtended]">{col.label}</h3>
                <span className="text-xs font-bold text-[#6B6B6B] bg-white border border-[#E5E5E5] rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {columnTasks.length === 0 && (
                  <div className="text-xs text-[#8A8A8A] text-center py-6 border border-dashed border-[#E5E5E5] rounded-xl">
                    Sin tareas
                  </div>
                )}
                {columnTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onUpdate={(id, fields) =>
                      fields.status && fields.status !== task.status
                        ? handleUpdateStatus(id, fields.status)
                        : handleUpdate(id, fields)
                    }
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <NewTaskModal onCreate={handleCreate} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
