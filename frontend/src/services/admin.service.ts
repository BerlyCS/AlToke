import { api, ApiError } from './api'
import { useAuthStore } from '@/stores/auth'
import type { AdminMetrics } from '@/types'

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
  }
}
