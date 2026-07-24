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

describe('gamificationService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
  })

  it('getLeaderboard returns leaderboard', async () => {
    const { gamificationService } = await import('@/services/gamification.service')
    const leaderboard = [{ userId: '1', nickname: 'Player1', rank: 1 }]
    mockApiResult.mockResolvedValue({ data: leaderboard, error: null, status: 200 })
    const result = await gamificationService.getLeaderboard(10)
    expect(result).toEqual(leaderboard)
  })

  it('getFriendsLeaderboard returns friends leaderboard', async () => {
    const { gamificationService } = await import('@/services/gamification.service')
    const leaderboard = [{ userId: '1', nickname: 'Friend1' }]
    mockApiResult.mockResolvedValue({ data: leaderboard, error: null, status: 200 })
    const result = await gamificationService.getFriendsLeaderboard()
    expect(result).toEqual(leaderboard)
  })

  it('getAchievements returns achievements', async () => {
    const { gamificationService } = await import('@/services/gamification.service')
    const achievements = [{ id: '1', title: 'First Task' }]
    mockApiResult.mockResolvedValue({ data: achievements, error: null, status: 200 })
    const result = await gamificationService.getAchievements()
    expect(result).toEqual(achievements)
  })

  it('getInventory returns inventory items', async () => {
    const { gamificationService } = await import('@/services/gamification.service')
    const items = [{ id: '1', name: 'XP Boost' }]
    mockApiResult.mockResolvedValue({ data: items, error: null, status: 200 })
    const result = await gamificationService.getInventory()
    expect(result).toEqual(items)
  })

  it('useItem returns use result', async () => {
    const { gamificationService } = await import('@/services/gamification.service')
    const result = { userId: '1', itemId: '1', remainingQuantity: 1, appliedEffect: '2x XP' }
    mockApiResult.mockResolvedValue({ data: result, error: null, status: 200 })
    const used = await gamificationService.useItem('1')
    expect(used).toEqual(result)
  })

  it('throws on error', async () => {
    const { gamificationService } = await import('@/services/gamification.service')
    mockApiResult.mockResolvedValue({ data: null, error: { value: 'Failed' }, status: 500 })
    await expect(gamificationService.getLeaderboard()).rejects.toThrow()
  })
})
