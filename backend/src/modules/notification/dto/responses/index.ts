import { t, type UnwrapSchema } from 'elysia'

export const NotificationSettingsResponse = t.Object({
  userId: t.String(),
  emailEnabled: t.Boolean(),
  pushEnabled: t.Boolean(),
  isMuted: t.Boolean(),
  updatedAt: t.String(),
})

export const NotificationLogResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  channel: t.Union([
    t.Literal('EMAIL'),
    t.Literal('PUSH'),
    t.Literal('IN_APP'),
    t.Literal('SYSTEM'),
  ]),
  type: t.String(),
  title: t.String(),
  message: t.String(),
  createdAt: t.String(),
})

export const NotificationHistoryResponse = t.Array(NotificationLogResponse)
export const UnauthorizedResponse = t.Literal('Unauthorized')
export const UserNotFoundResponse = t.Literal('User not found')

export type NotificationSettingsResponse = UnwrapSchema<typeof NotificationSettingsResponse>
export type NotificationLogResponse = UnwrapSchema<typeof NotificationLogResponse>
export type NotificationHistoryResponse = UnwrapSchema<typeof NotificationHistoryResponse>
export type UnauthorizedResponse = UnwrapSchema<typeof UnauthorizedResponse>
export type UserNotFoundResponse = UnwrapSchema<typeof UserNotFoundResponse>
