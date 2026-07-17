import { t } from 'elysia'

export const ModerateProfileRequest = t.Object({
  nickname: t.Optional(t.String()),
  bio: t.Optional(t.String()),
  avatarUrl: t.Optional(t.String()),
  reason: t.String({ description: 'Reason for moderation' }),
})

export const AssignTaskRequest = t.Object({
  taskId: t.String({ description: 'UUID of the task' }),
  reason: t.Optional(t.String()),
})

export const UsersQueryRequest = t.Object({
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
})

export type ModerateProfileRequestType = typeof ModerateProfileRequest.static
export type AssignTaskRequestType = typeof AssignTaskRequest.static
export type UsersQueryRequestType = typeof UsersQueryRequest.static
