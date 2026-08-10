export type TaskStatus = 'idea' | 'por_hacer' | 'en_progreso' | 'hecho'
export type TaskPriority = 'alta' | 'media' | 'baja'

export interface AdminTask {
  id: string
  title: string
  description: string | null
  category: string
  status: TaskStatus
  priority: TaskPriority
  position: number
  created_at: string
  updated_at: string
}

export const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'idea', label: 'Idea' },
  { key: 'por_hacer', label: 'Por hacer' },
  { key: 'en_progreso', label: 'En progreso' },
  { key: 'hecho', label: 'Hecho' },
]

export const PRIORITIES: { key: TaskPriority; label: string; badgeClass: string }[] = [
  { key: 'alta', label: 'Alta', badgeClass: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' },
  { key: 'media', label: 'Media', badgeClass: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' },
  { key: 'baja', label: 'Baja', badgeClass: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
]

export function priorityConfig(priority: TaskPriority) {
  return PRIORITIES.find(p => p.key === priority) || PRIORITIES[1]
}
