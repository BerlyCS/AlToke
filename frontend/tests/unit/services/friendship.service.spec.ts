import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiResult = vi.fn()
vi.mock('@/services/api', () => {
  const createProxy = (): any =>
    new Proxy(function () {}, {
      get(_, prop) {
        if (prop === 'then') return (r: any, j?: any) => Promise.resolve(mockApiResult()).then(r, j)
        return createProxy()
      },
      apply(_, __, args) {
        mockApiResult(...args)
        return createProxy()
      },
    })
  return {
    api: createProxy(),
    ApiError: class ApiError extends Error {
      status: number
      constructor(status: number, message: string) {
        super(message)
        this.status = status
      }
    },
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ token: 'test-token' }),
}))

describe('friendshipService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
  })

  it('getFriends returns friends list', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    const friends = [{ friendshipId: '1', friend: { id: '2', nickname: 'Friend' } }]
    mockApiResult.mockResolvedValue({ data: friends, error: null, status: 200 })
    const result = await friendshipService.getFriends()
    expect(result).toEqual(friends)
  })

  it('getPendingRequests returns pending requests', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    const requests = [{ id: '1', requesterId: '2' }]
    mockApiResult.mockResolvedValue({ data: requests, error: null, status: 200 })
    const result = await friendshipService.getPendingRequests()
    expect(result).toEqual(requests)
  })

  it('sendRequest succeeds', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    mockApiResult.mockResolvedValue({ data: { success: true }, error: null, status: 200 })
    const result = await friendshipService.sendRequest('user-2')
    expect(result).toEqual({ success: true })
  })

  it('acceptRequest succeeds', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    mockApiResult.mockResolvedValue({ data: { success: true }, error: null, status: 200 })
    const result = await friendshipService.acceptRequest('req-1')
    expect(result).toEqual({ success: true })
  })

  it('rejectRequest succeeds', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    mockApiResult.mockResolvedValue({ data: { success: true }, error: null, status: 200 })
    const result = await friendshipService.rejectRequest('req-1')
    expect(result).toEqual({ success: true })
  })

  it('removeFriend succeeds', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    mockApiResult.mockResolvedValue({ data: { success: true }, error: null, status: 200 })
    const result = await friendshipService.removeFriend('fs-1')
    expect(result).toEqual({ success: true })
  })

  it('searchUsers returns results', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    const users = [{ id: '1', nickname: 'Found' }]
    mockApiResult.mockResolvedValue({ data: users, error: null, status: 200 })
    const result = await friendshipService.searchUsers('Found')
    expect(result).toEqual(users)
  })

  it('throws on error', async () => {
    const { friendshipService } = await import('@/services/friendship.service')
    mockApiResult.mockResolvedValue({ data: null, error: { value: 'Failed' }, status: 500 })
    await expect(friendshipService.getFriends()).rejects.toThrow()
  })
})
