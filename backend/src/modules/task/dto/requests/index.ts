import { t } from 'elysia'
import { TaskType, Priority, TaskStatus, RecurrenceType } from '../../domain/entities'

export const CreateTaskBody = t.Object({
  title: t.String(),
  description: t.Optional(t.String()),
  type: t.Optional(t.Enum(TaskType)),
  priority: t.Optional(t.Enum(Priority)),
  estimatedTime: t.Optional(t.Union([t.Number(), t.Null()])),
  startDate: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  dueDate: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  recurrence: t.Optional(t.Enum(RecurrenceType)),
  tagIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
})

export const UpdateTaskBody = t.Partial(CreateTaskBody)

export const TaskFilterQuery = t.Object({
  status: t.Optional(t.Enum(TaskStatus)),
  type: t.Optional(t.Enum(TaskType)),
  limit: t.Optional(t.Numeric()),
})

export const TaskParams = t.Object({
  taskId: t.String({ format: 'uuid' }),
})