import { t, type UnwrapSchema } from 'elysia'
import { dbModel } from '../../db/model'

const { tasks } = dbModel.insert

const DateType = t
  .Transform(t.Union([t.String(), t.Date()]))
  .Decode((v) => new Date(v))
  .Encode((v) => v.toISOString())

export const TaskModel = {
  createTaskBody: t.Object({
    title: tasks.title,
    description: t.Optional(tasks.description),
    type: t.Optional(tasks.type),
    priority: t.Optional(tasks.priority),
    estimatedTime: t.Optional(tasks.estimatedTime),
    startDate: t.Optional(DateType),
    dueDate: t.Optional(DateType),
    recurrence: t.Optional(tasks.recurrence),
    tagIds: t.Optional(t.Array(t.String())),
  }),
  updateTaskBody: t.Partial(
    t.Object({
      title: tasks.title,
      description: tasks.description,
      type: tasks.type,
      priority: tasks.priority,
      status: tasks.status,
      estimatedTime: tasks.estimatedTime,
      startDate: DateType,
      dueDate: DateType,
      recurrence: tasks.recurrence,
      deletedAt: DateType, // For restoring from trash
    }),
  ),
  taskResponse: t.Intersect([
    t.Object(dbModel.select.tasks as any),
    t.Object({ tags: t.Optional(t.Array(t.Object(dbModel.select.tags as any))) }),
  ]),
  tasksListResponse: t.Array(
    t.Intersect([
      t.Object(dbModel.select.tasks as any),
      t.Object({ tags: t.Optional(t.Array(t.Object(dbModel.select.tags as any))) }),
    ]),
  ),
  errorNotFound: t.Literal('Task not found'),
} as const

export type TaskModel = {
  [k in keyof typeof TaskModel]: UnwrapSchema<(typeof TaskModel)[k]>
}
