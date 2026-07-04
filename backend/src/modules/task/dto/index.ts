import { type UnwrapSchema } from 'elysia'

export * from './requests'
export * from './responses'

import { CreateTaskBody, UpdateTaskBody, TaskFilterQuery, TaskParams } from './requests'
import {
  TaskResponse,
  TaskListResponse,
  TaskNotFoundResponse,
  UnauthorizedResponse,
} from './responses'

export const TaskModel = {
  createTaskBody: CreateTaskBody,
  updateTaskBody: UpdateTaskBody,
  taskFilterQuery: TaskFilterQuery,
  taskParams: TaskParams,
  taskResponse: TaskResponse,
  taskListResponse: TaskListResponse,
  taskError: TaskNotFoundResponse,
  unauthorizedError: UnauthorizedResponse,
} as const

export type TaskModel = {
  createTaskBody: UnwrapSchema<typeof CreateTaskBody>
  updateTaskBody: UnwrapSchema<typeof UpdateTaskBody>
  taskFilterQuery: UnwrapSchema<typeof TaskFilterQuery>
  taskParams: UnwrapSchema<typeof TaskParams>
  taskResponse: UnwrapSchema<typeof TaskResponse>
  taskListResponse: UnwrapSchema<typeof TaskListResponse>
  taskError: UnwrapSchema<typeof TaskNotFoundResponse>
  unauthorizedError: UnwrapSchema<typeof UnauthorizedResponse>
}