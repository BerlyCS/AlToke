import { api, ApiError } from './api'
import { useAuthStore } from '@/stores/auth'

const getHeaders = () => {
  const token = useAuthStore().token
  return token ? { authorization: `Bearer ${token}` } : undefined
}

export interface FriendProfile {
  id: string
  nickname: string | null
  avatarUrl: string | null
  level: number
  xp?: number
  currentStreak?: number
}

export interface FriendshipEntry {
  friendshipId: string
  friend: FriendProfile
}

export interface PendingRequest {
  id: string
  requesterId: string
  addresseeId: string
  status: string
  createdAt: string | Date
  requester: FriendProfile
}

export const friendshipService = {
  getFriends: async (): Promise<FriendshipEntry[]> => {
    const { data, error, status } = await api.api.friendships[''].get({ headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to get friends')
    return data as FriendshipEntry[]
  },

  getPendingRequests: async (): Promise<PendingRequest[]> => {
    const { data, error, status } = await api.api.friendships.pending.get({ headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to get pending requests')
    return data as PendingRequest[]
  },

  sendRequest: async (addresseeId: string) => {
    const { data, error, status } = await api.api.friendships.request.post(
      { addresseeId },
      { headers: getHeaders() },
    )
    if (error) throw new ApiError(status, String(error.value) || 'Failed to send friend request')
    return data
  },

  acceptRequest: async (friendshipId: string) => {
    const { data, error, status } = await api.api.friendships.accept.post(
      { friendshipId },
      { headers: getHeaders() },
    )
    if (error) throw new ApiError(status, String(error.value) || 'Failed to accept friend request')
    return data
  },

  rejectRequest: async (friendshipId: string) => {
    const { data, error, status } = await api.api.friendships.reject.post(
      { friendshipId },
      { headers: getHeaders() },
    )
    if (error) throw new ApiError(status, String(error.value) || 'Failed to reject friend request')
    return data
  },

  removeFriend: async (friendshipId: string) => {
    const { data, error, status } = await api.api
      .friendships({ id: friendshipId })
      .delete(undefined, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to remove friend')
    return data
  },

  searchUsers: async (query: string): Promise<FriendProfile[]> => {
    const { data, error, status } = await api.api.friendships.search.get({
      query: { query },
      headers: getHeaders(),
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to search users')
    return data as FriendProfile[]
  },
}
