import { t, type UnwrapSchema } from 'elysia'
import { Priority, TaskStatus, TaskType, RecurrenceFrequency } from './domain'

// 1. Esquemas Base
export const RecurrenceSchema = t.Object({
  frequency: t.Enum(RecurrenceFrequency),
  interval: t.Number(),
  daysOfWeek: t.Array(t.Number()),
  endDate: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
})

export const CreateTaskSchema = t.Object({
  title: t.String(),
  description: t.String(),
  type: t.Enum(TaskType),
  estimatedTimeMinutes: t.Number(),
  priority: t.Enum(Priority),
  tags: t.Array(t.String()),
  startTime: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  dueDate: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  assignedBy: t.Optional(t.Union([t.String({ format: 'uuid' }), t.Null()])),
  recurrence: t.Optional(RecurrenceSchema)
})

// Elysia permite heredar y hacer opcionales los campos fácilmente con t.Partial
export const UpdateTaskSchema = t.Partial(CreateTaskSchema)

export const TaskFilterSchema = t.Object({
  status: t.Optional(t.Enum(TaskStatus)),
  type: t.Optional(t.Enum(TaskType)),
  limit: t.Optional(t.Numeric()),
})

// Esquema de Respuesta para mantener coherencia con las respuestas (como LeaderboardEntryResponse)
export const TaskResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  assignedBy: t.Union([t.String(), t.Null()]),
  title: t.String(),
  description: t.String(),
  type: t.Enum(TaskType),
  estimatedTimeMinutes: t.Number(),
  startTime: t.Union([t.String(), t.Null()]),
  dueDate: t.Union([t.String(), t.Null()]),
  completionDate: t.Union([t.String(), t.Null()]),
  deletedAt: t.Union([t.String(), t.Null()]),
  priority: t.Enum(Priority),
  status: t.Enum(TaskStatus),
  tags: t.Array(t.String()),
})

export const TaskListResponse = t.Array(TaskResponse)

// 2. Extracción de Tipos (UnwrapSchema)
export type RecurrenceSchema = UnwrapSchema<typeof RecurrenceSchema>
export type CreateTaskSchema = UnwrapSchema<typeof CreateTaskSchema>
export type UpdateTaskSchema = UnwrapSchema<typeof UpdateTaskSchema>
export type TaskFilterSchema = UnwrapSchema<typeof TaskFilterSchema>
export type TaskResponse = UnwrapSchema<typeof TaskResponse>
export type TaskListResponse = UnwrapSchema<typeof TaskListResponse>

// 3. Agrupación en el Modelo del Módulo
export const TaskModel = {
  createTaskBody: CreateTaskSchema,
  updateTaskBody: UpdateTaskSchema,
  taskFilterQuery: TaskFilterSchema,
  taskResponse: TaskResponse,
  taskListResponse: TaskListResponse,
} as const

export type TaskModel = {
  createTaskBody: typeof CreateTaskSchema
  updateTaskBody: typeof UpdateTaskSchema
  taskFilterQuery: typeof TaskFilterSchema
  taskResponse: typeof TaskResponse
  taskListResponse: typeof TaskListResponse
}