import { t } from 'elysia'

export const UserDetailResponse = t.Object({
  id: t.String(),
  email: t.String(),
  nickname: t.Optional(t.String()),
  role: t.String(),
  level: t.Number(),
  xp: t.Number(),
  lastActiveAt: t.Optional(t.String()),
  createdAt: t.String(),
})

export const SystemMetricsResponse = t.Object({
  totalUsers: t.Number(),
  activeUsersDaily: t.Number(),
  tasksCompletedToday: t.Number(),
  totalTasks: t.Number(),
})

export const UserSummaryResponse = t.Object({
  userId: t.String(),
  nickname: t.Optional(t.String()),
  level: t.Number(),
  xp: t.Number(),
  lastActiveAt: t.Optional(t.String()),
  createdAt: t.String(),
})

export const ActivityLogResponse = t.Object({
  id: t.String(),
  adminId: t.String(),
  targetId: t.String(),
  targetType: t.String(),
  action: t.String(),
  createdAt: t.String(),
})

export const BanUserResponse = t.Object({
  success: t.Boolean(),
  message: t.String(),
  userId: t.String(),
})

export const ModerateProfileResponse = t.Object({
  success: t.Boolean(),
  message: t.String(),
  userId: t.String(),
})

export const AssignTaskResponse = t.Object({
  success: t.Boolean(),
  message: t.String(),
  taskId: t.String(),
  assignedToUserId: t.String(),
})

export const UsersResponse = t.Object({
  users: t.Array(UserDetailResponse),
  total: t.Number(),
  limit: t.Number(),
  offset: t.Number(),
})

export type UserDetailResponseType = typeof UserDetailResponse.static
export type SystemMetricsResponseType = typeof SystemMetricsResponse.static
export type UserSummaryResponseType = typeof UserSummaryResponse.static
export type ActivityLogResponseType = typeof ActivityLogResponse.static
export type UsersResponseType = typeof UsersResponse.static
