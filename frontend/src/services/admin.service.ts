import { api, ApiError } from './api'
import { useAuthStore } from '@/stores/auth'
import type { AdminMetrics, BanUserResponse, TaskMetricsResponse, TopUsersResponse, UsersList } from '@/types'

// Helper to get auth headers automatically
const getHeaders = () => {
  const authStore = useAuthStore()
  return {
    authorization: authStore.token ? `Bearer ${authStore.token}` : '',
  }
}

export const adminService = {
  getMetrics: async (): Promise<AdminMetrics> => {
    const { data, error, status } = await api.api.admin.metrics.get({ headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch metrics')
    return data as AdminMetrics
  },

  getUsers: async (limit = 10, offset = 0): Promise<UsersList> => {
    const { data, error, status } = await api.api.admin.users.get({
      headers: getHeaders(),
      query: { limit, offset },
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch users list')
    return data as unknown as UsersList
  },

  banUser: async (userId: string): Promise<BanUserResponse> => {
    const { data, error, status } = await api.api
          .admin.users({ userId })
          .ban.post({ headers: getHeaders() }, userId)
    if (error) throw new ApiError(status, String(error.value) || 'Failed to ban user')
    return data as unknown as BanUserResponse
  },

  unBanUser: async (userId: string): Promise<BanUserResponse> => {
    const { data, error, status } = await api.api
          .admin.users({ userId })
          .unban.post({ headers: getHeaders() }, userId)
    if (error) throw new ApiError(status, String(error.value) || 'Failed to unban user')
    return data as unknown as BanUserResponse
  },

  getTaskMetrics: async (): Promise<TaskMetricsResponse> => {
    const { data, error, status } = await api.api.admin.taskMetrics.get({ headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch task metrics')
    return data as TaskMetricsResponse
  },

  getTopUsers: async (): Promise<TopUsersResponse> => {
    const { data, error, status } = await api.api.admin.topUsers.get({
      headers: getHeaders()
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch top users')
    return data as TopUsersResponse
  }
}
