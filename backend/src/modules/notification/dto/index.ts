import { type UnwrapSchema } from 'elysia'

export * from './requests'
export * from './responses'

import { NotificationHistoryQuery, NotificationSettingsUpdateBody } from './requests'
import {
  NotificationHistoryResponse,
  NotificationLogResponse,
  NotificationSettingsResponse,
  UnauthorizedResponse,
  UserNotFoundResponse,
} from './responses'

export const NotificationModel = {
  updateSettingsBody: NotificationSettingsUpdateBody,
  historyQuery: NotificationHistoryQuery,
  settingsResponse: NotificationSettingsResponse,
  logResponse: NotificationLogResponse,
  historyResponse: NotificationHistoryResponse,
  unauthorizedError: UnauthorizedResponse,
  userError: UserNotFoundResponse,
} as const

export type NotificationModel = {
  updateSettingsBody: UnwrapSchema<typeof NotificationSettingsUpdateBody>
  historyQuery: UnwrapSchema<typeof NotificationHistoryQuery>
  settingsResponse: UnwrapSchema<typeof NotificationSettingsResponse>
  logResponse: UnwrapSchema<typeof NotificationLogResponse>
  historyResponse: UnwrapSchema<typeof NotificationHistoryResponse>
  unauthorizedError: UnwrapSchema<typeof UnauthorizedResponse>
  userError: UnwrapSchema<typeof UserNotFoundResponse>
}
