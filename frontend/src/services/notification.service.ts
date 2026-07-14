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
}
