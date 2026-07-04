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
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED'
}

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface Task {
  id: string
  userId: string
  assignedBy?: string | null
  title: string
  description: string
  type: TaskType
  estimatedTimeMinutes: number
  startTime?: Date | null
  dueDate?: Date | null
  completionDate?: Date | null
  deletedAt?: Date | null
  priority: Priority
  status: TaskStatus
  tags: string[]
}

export interface Recurrence {
  id: string
  taskId: string
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek: number[]
  endDate?: Date | null
  nextOccurrence?: Date | null
}