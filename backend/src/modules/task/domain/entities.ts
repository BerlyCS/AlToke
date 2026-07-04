export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum TaskType {
  TASK = 'TASK',
  MEETING = 'MEETING',
  EVENT = 'EVENT'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

// Entidad Tag para la relación
export interface Tag {
  id: string
  userId: string
  name: string
  color: string | null
  icon: string | null
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  type: TaskType
  priority: Priority
  status: TaskStatus
  estimatedTime: number | null // en minutos
  startDate: Date | null
  dueDate: Date | null
  completedAt: Date | null
  recurrence: RecurrenceType
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  // Representación del join con tags
  tags?: Tag[]
}