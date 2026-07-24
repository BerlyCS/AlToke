import { t, type UnwrapSchema } from 'elysia'

export const NotificationSettingsUpdateBody = t.Object({
  emailEnabled: t.Optional(t.Boolean()),
  pushEnabled: t.Optional(t.Boolean()),
  isMuted: t.Optional(t.Boolean()),
})

export const NotificationHistoryQuery = t.Object({
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Integer({ minimum: 0 })),
})

export const MarkReadParams = t.Object({
  id: t.String({ format: 'uuid' }),
})

export type NotificationSettingsUpdateBody = UnwrapSchema<typeof NotificationSettingsUpdateBody>
export type NotificationHistoryQuery = UnwrapSchema<typeof NotificationHistoryQuery>
export type MarkReadParams = UnwrapSchema<typeof MarkReadParams>
