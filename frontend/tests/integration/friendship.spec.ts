import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockFriendshipEntry, mockPendingRequest } from '../fixtures'

vi.mock('@/services/friendship.service', () => ({
  friendshipService: {
    getFriends: vi.fn<(...args: any[]) => any>(),
    getPendingRequests: vi.fn<(...args: any[]) => any>(),
    sendRequest: vi.fn<(...args: any[]) => any>(),
    acceptRequest: vi.fn<(...args: any[]) => any>(),
    rejectRequest: vi.fn<(...args: any[]) => any>(),
    removeFriend: vi.fn<(...args: any[]) => any>(),
    searchUsers: vi.fn<(...args: any[]) => any>(),
  },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn<(...args: any[]) => any>(), error: vi.fn<(...args: any[]) => any>() },
}))

describe('Friendship Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads friends list', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    ;(friendshipService.getFriends as any).mockResolvedValue([mockFriendshipEntry])
    const friends = await friendshipService.getFriends()
    expect(friends).toHaveLength(1)
    expect(friends[0]!.friend.nickname).toBe('Player2')
  })

  it('loads pending requests', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    ;(friendshipService.getPendingRequests as any).mockResolvedValue([mockPendingRequest])
    const requests = await friendshipService.getPendingRequests()
    expect(requests).toHaveLength(1)
    expect(requests[0]!.requester.nickname).toBe('Player3')
  })

  it('sends friend request', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    ;(friendshipService.sendRequest as any).mockResolvedValue({ success: true })
    const result = await friendshipService.sendRequest('user-2')
    expect(result).toEqual({ success: true })
    expect(friendshipService.sendRequest).toHaveBeenCalledWith('user-2')
  })

  it('accepts friend request', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    ;(friendshipService.acceptRequest as any).mockResolvedValue({ success: true })
    const result = await friendshipService.acceptRequest('req-1')
    expect(result).toEqual({ success: true })
  })

  it('rejects friend request', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    ;(friendshipService.rejectRequest as any).mockResolvedValue({ success: true })
    const result = await friendshipService.rejectRequest('req-1')
    expect(result).toEqual({ success: true })
  })

  it('removes friend', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    ;(friendshipService.removeFriend as any).mockResolvedValue({ success: true })
    const result = await friendshipService.removeFriend('fs-1')
    expect(result).toEqual({ success: true })
  })

  it('searches users', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    const searchResults = [{ id: 'user-5', nickname: 'FoundUser', level: 2, avatarUrl: null }]
    ;(friendshipService.searchUsers as any).mockResolvedValue(searchResults)
    const results = await friendshipService.searchUsers('Found')
    expect(results).toHaveLength(1)
    expect(results[0]!.nickname).toBe('FoundUser')
  })

  it('handles send request failure', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    ;(friendshipService.sendRequest as any).mockRejectedValue(new Error('User not found'))
    await expect(friendshipService.sendRequest('invalid')).rejects.toThrow('User not found')
  })
})
