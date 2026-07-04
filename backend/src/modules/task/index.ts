import { Elysia, status } from 'elysia'
import { authPlugin } from '../../shared/utils/auth-plugin'
import { TaskModel } from './model'
import { TaskService } from './service'

export const taskRoutes = new Elysia({ prefix: '/tasks' })
  .use(authPlugin)
  .get(
    '/',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return await TaskService.findAll(userId)
    },
    {
      response: TaskModel.tasksListResponse,
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

export * from './model'
export * from './service'
