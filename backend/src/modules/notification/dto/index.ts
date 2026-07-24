import { type UnwrapSchema } from 'elysia'

export * from './requests'
export * from './responses'

import {
  MarkReadParams,
  NotificationHistoryQuery,
  NotificationSettingsUpdateBody,
} from './requests'
import {
  MarkReadResponse,
  NotificationHistoryResponse,
  NotificationLogResponse,
  NotificationSettingsResponse,
  UnauthorizedResponse,
  UnreadCountResponse,
  UserNotFoundResponse,
} from './responses'

export const NotificationModel = {
  updateSettingsBody: NotificationSettingsUpdateBody,
  historyQuery: NotificationHistoryQuery,
  markReadParams: MarkReadParams,
  settingsResponse: NotificationSettingsResponse,
  logResponse: NotificationLogResponse,
  historyResponse: NotificationHistoryResponse,
  markReadResponse: MarkReadResponse,
  unreadCountResponse: UnreadCountResponse,
  unauthorizedError: UnauthorizedResponse,
  userError: UserNotFoundResponse,
} as const

export type NotificationModel = {
  updateSettingsBody: UnwrapSchema<typeof NotificationSettingsUpdateBody>
  historyQuery: UnwrapSchema<typeof NotificationHistoryQuery>
  markReadParams: UnwrapSchema<typeof MarkReadParams>
  settingsResponse: UnwrapSchema<typeof NotificationSettingsResponse>
  logResponse: UnwrapSchema<typeof NotificationLogResponse>
  historyResponse: UnwrapSchema<typeof NotificationHistoryResponse>
  markReadResponse: UnwrapSchema<typeof MarkReadResponse>
  unreadCountResponse: UnwrapSchema<typeof UnreadCountResponse>
  unauthorizedError: UnwrapSchema<typeof UnauthorizedResponse>
  userError: UnwrapSchema<typeof UserNotFoundResponse>
}
