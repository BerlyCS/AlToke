import { api, ApiError } from './api'
import { useAuthStore } from '@/stores/auth'
import type { Achievement, InventoryItem, LeaderboardEntry, UseItemResult } from '@/types'

const getHeaders = () => {
  const authStore = useAuthStore()
  return {
    authorization: authStore.token ? `Bearer ${authStore.token}` : '',
  }
}

export const gamificationService = {
  getLeaderboard: async (limit = 10): Promise<LeaderboardEntry[]> => {
    const { data, error, status } = await api.api.gamification.leaderboard.get({
      query: { limit },
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch leaderboard')
    return data as unknown as LeaderboardEntry[]
  },

  getFriendsLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const { data, error, status } = await api.api.gamification.leaderboard.friends.get({
      headers: getHeaders(),
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch friends leaderboard')
    return data as unknown as LeaderboardEntry[]
  },

  getAchievements: async (): Promise<Achievement[]> => {
    const { data, error, status } = await api.api.gamification.achievements.get({
      headers: getHeaders(),
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch achievements')
    return data as unknown as Achievement[]
  },

  getInventory: async (): Promise<InventoryItem[]> => {
    const { data, error, status } = await api.api.gamification.inventory.get({
      headers: getHeaders(),
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch inventory')
    return data as unknown as InventoryItem[]
  },

  useItem: async (itemId: string): Promise<UseItemResult> => {
    const { data, error, status } = await api.api.gamification.inventory.use.post(
      { itemId },
      { headers: getHeaders() },
    )
    if (error) throw new ApiError(status, String(error.value) || 'Failed to use item')
    return data as unknown as UseItemResult
  },
}
