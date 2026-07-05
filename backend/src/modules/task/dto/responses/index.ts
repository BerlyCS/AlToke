import { t } from 'elysia'
import { TaskType, Priority, TaskStatus, RecurrenceType } from '../../domain/entities'

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
  tags: t.Array(
    t.Object({
      id: t.String({ format: 'uuid' }),
      name: t.String(),
      color: t.Union([t.String(), t.Null()]),
      icon: t.Union([t.String(), t.Null()]),
    }),
  ),
})

export const TaskListResponse = t.Array(TaskResponse)

export const TaskNotFoundResponse = t.Literal('Task not found')
export const UnauthorizedResponse = t.Literal('Unauthorized')
