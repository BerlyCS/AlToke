export type NotificationChannel = 'EMAIL' | 'PUSH' | 'IN_APP' | 'SYSTEM'

export const notificationChannels = [
  'EMAIL',
  'PUSH',
  'IN_APP',
  'SYSTEM',
] as const satisfies readonly NotificationChannel[]

export const isNotificationChannel = (value: string): value is NotificationChannel =>
  notificationChannels.includes(value as NotificationChannel)

export interface NotificationSettings {
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  isMuted: boolean
  updatedAt: string
}

export interface NotificationLog {
  id: string
  userId: string
  channel: NotificationChannel
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface CreateNotificationInput {
  userId: string
  channel?: NotificationChannel
  type: string
  title: string
  message: string
}
