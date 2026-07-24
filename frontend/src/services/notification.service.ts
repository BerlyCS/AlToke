import { api, ApiError } from './api'
import { useAuthStore } from '@/stores/auth'
import type { NotificationLog, NotificationSettings } from '@/types'

const getHeaders = () => {
  const token = useAuthStore().token
  return token ? { authorization: `Bearer ${token}` } : undefined
}

export interface NotificationSettingsUpdate {
  emailEnabled?: boolean
  pushEnabled?: boolean
  isMuted?: boolean
}

export const notificationService = {
  getSettings: async (): Promise<NotificationSettings> => {
    const { data, error, status } = await api.api.notifications.settings.get({
      headers: getHeaders(),
    })
    if (error)
      throw new ApiError(status, String(error.value) || 'Failed to get notification settings')
    return data as NotificationSettings
  },

  updateSettings: async (body: NotificationSettingsUpdate): Promise<NotificationSettings> => {
    const { data, error, status } = await api.api.notifications.settings.patch(body, {
      headers: getHeaders(),
    })
    if (error)
      throw new ApiError(status, String(error.value) || 'Failed to update notification settings')
    return data as NotificationSettings
  },

  getHistory: async (limit = 20, offset = 0): Promise<NotificationLog[]> => {
    const { data, error, status } = await api.api.notifications.history.get({
      query: { limit, offset },
      headers: getHeaders(),
    })
    if (error)
      throw new ApiError(status, String(error.value) || 'Failed to get notification history')
    return data as NotificationLog[]
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const { data, error, status } = await api.api
      .notifications({ id })
      .read.patch(null as unknown as Record<string, never>, { headers: getHeaders() })
    if (error)
      throw new ApiError(status, String(error.value) || 'Failed to mark notification as read')
    return (data as unknown as { success: boolean }).success
  },

  markAllAsRead: async (): Promise<boolean> => {
    const { data, error, status } = await api.api.notifications['read-all'].patch(
      null as unknown as Record<string, never>,
      { headers: getHeaders() },
    )
    if (error) throw new ApiError(status, String(error.value) || 'Failed to mark all as read')
    return (data as unknown as { success: boolean }).success
  },

  getUnreadCount: async (): Promise<number> => {
    const { data, error, status } = await api.api.notifications['unread-count'].get({
      headers: getHeaders(),
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to get unread count')
    return (data as unknown as { count: number }).count
  },
}
