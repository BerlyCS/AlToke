import { t, type UnwrapSchema } from 'elysia'
import { Priority, TaskStatus, TaskType, RecurrenceType } from './domain'

// 1. Esquemas Base
export const TagSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String(),
  color: t.Union([t.String(), t.Null()]),
  icon: t.Union([t.String(), t.Null()]),
})

export const CreateTaskSchema = t.Object({
  title: t.String(),
  description: t.Optional(t.String()),
  type: t.Optional(t.Enum(TaskType)),
  priority: t.Optional(t.Enum(Priority)),
  estimatedTime: t.Optional(t.Union([t.Number(), t.Null()])),
  startDate: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  dueDate: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  recurrence: t.Optional(t.Enum(RecurrenceType)),
  // En lugar de objetos completos, la API podría recibir IDs de tags al crear
  tagIds: t.Optional(t.Array(t.String({ format: 'uuid' }))), 
})

export const UpdateTaskSchema = t.Partial(CreateTaskSchema)

export const TaskFilterSchema = t.Object({
  status: t.Optional(t.Enum(TaskStatus)),
  type: t.Optional(t.Enum(TaskType)),
  limit: t.Optional(t.Numeric()),
})

// Esquema de Respuesta
export const TaskResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  title: t.String(),
  description: t.Union([t.String(), t.Null()]),
  type: t.Enum(TaskType),
  priority: t.Enum(Priority),
  status: t.Enum(TaskStatus),
  estimatedTime: t.Union([t.Number(), t.Null()]),
  startDate: t.Union([t.String(), t.Null()]),
  dueDate: t.Union([t.String(), t.Null()]),
  completedAt: t.Union([t.String(), t.Null()]),
  recurrence: t.Enum(RecurrenceType),
  deletedAt: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
  tags: t.Array(TagSchema) // Incluimos los tags resueltos
})

export const TaskListResponse = t.Array(TaskResponse)

// 2. Extracción de Tipos
export type CreateTaskBody = UnwrapSchema<typeof CreateTaskSchema>
export type UpdateTaskBody = UnwrapSchema<typeof UpdateTaskSchema>
export type TaskFilterQuery = UnwrapSchema<typeof TaskFilterSchema>
export type TaskResponse = UnwrapSchema<typeof TaskResponse>
export type TaskListResponse = UnwrapSchema<typeof TaskListResponse>
export type TagResponse = UnwrapSchema<typeof TagSchema>

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