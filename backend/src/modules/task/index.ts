import { Elysia, status, t } from 'elysia'
import { authPlugin } from '../../shared/utils/auth-plugin'
import { TaskModel } from './model'
import { TaskService } from './service'

export const taskRoutes = new Elysia({ prefix: '/tasks' })
  .use(authPlugin)
  .get(
    '/',
    async ({ requireAuth, query: { search } }) => {
      const userId = requireAuth()
      return await TaskService.findAll(userId, search)
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
      }),
      response: TaskModel.tasksListResponse,
    },
  )
  .get(
    '/active',
    async ({ requireAuth, query: { limit, offset } }) => {
      const userId = requireAuth()
      return await TaskService.findActive(userId, limit, offset)
    },
    {
      query: t.Object({
        limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
        offset: t.Optional(t.Integer({ minimum: 0 })),
      }),
      response: TaskModel.activeTasksResponse,
    },
  )
  .post(
    '/',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await TaskService.create(userId, body)
    },
    {
      body: TaskModel.createTaskBody,
      response: TaskModel.taskResponse,
    },
  )
  .get(
    '/trash',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return await TaskService.findTrashed(userId)
    },
    {
      response: TaskModel.tasksListResponse,
    },
  )
  .get(
    '/:id',
    async ({ requireAuth, params }) => {
      const userId = requireAuth()
      const task = await TaskService.findById(userId, params.id)
      if (!task) throw status(404, 'Task not found' satisfies TaskModel['errorNotFound'])
      return task
    },
    {
      response: {
        200: TaskModel.taskResponse,
        404: TaskModel.errorNotFound,
      },
    },
  )
  .patch(
    '/:id',
    async ({ requireAuth, params, body }) => {
      const userId = requireAuth()
      const task = await TaskService.update(userId, params.id, body)
      if (!task) throw status(404, 'Task not found' satisfies TaskModel['errorNotFound'])
      return task
    },
    {
      body: TaskModel.updateTaskBody,
      response: {
        200: TaskModel.taskResponse,
        404: TaskModel.errorNotFound,
      },
    },
  )
  .delete(
    '/:id',
    async ({ requireAuth, params }) => {
      const userId = requireAuth()
      const task = await TaskService.softDelete(userId, params.id)
      if (!task) throw status(404, 'Task not found' satisfies TaskModel['errorNotFound'])
      return task
    },
    {
      response: {
        200: TaskModel.taskResponse,
        404: TaskModel.errorNotFound,
      },
    },
  )
  .patch(
    '/:id/complete',
    async ({ requireAuth, params }) => {
      const userId = requireAuth()
      const result = await TaskService.completeTask(userId, params.id)
      if (!result) throw status(404, 'Task not found' satisfies TaskModel['errorNotFound'])
      return result as any
    },
    {
      response: {
        200: TaskModel.completeTaskResponse,
        404: TaskModel.errorNotFound,
      },
    },
  )
  .patch(
    '/:id/restore',
    async ({ requireAuth, params }) => {
      const userId = requireAuth()
      const task = await TaskService.restore(userId, params.id)
      if (!task) throw status(404, 'Task not found' satisfies TaskModel['errorNotFound'])
      return task
    },
    {
      response: {
        200: TaskModel.taskResponse,
        404: TaskModel.errorNotFound,
      },
    },
  )

export * from './model'
export * from './service'
