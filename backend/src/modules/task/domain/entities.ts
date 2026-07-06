// Task Domain Entities
export type TaskType = 'TASK' | 'MEETING' | 'EVENT'

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'DELETED'

export type Task = {
  id: string
  userId: string
  assignedBy: string | null
  title: string
  description: string | null
  taskType: TaskType
  priority: TaskPriority
  status: TaskStatus
  estimatedTimeMinutes: number
  startTime: Date | null
  dueDate: Date | null
  completionDate: Date | null
  deletedAt: Date | null
  tags: string[]
  createdAt: Date
}
