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

describe('adminService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
  })

  it('getMetrics returns admin metrics', async () => {
    const { adminService } = await import('@/services/admin.service')
    const metrics = {
      totalUsers: 100,
      activeUsersDaily: 50,
      tasksCompletedToday: 25,
      totalTasks: 500,
    }
    mockApiResult.mockResolvedValue({ data: metrics, error: null, status: 200 })
    const result = await adminService.getMetrics()
    expect(result).toEqual(metrics)
  })

  it('getUsers returns user list', async () => {
    const { adminService } = await import('@/services/admin.service')
    const users = { users: [], total: 0, limit: 10, offset: 0 }
    mockApiResult.mockResolvedValue({ data: users, error: null, status: 200 })
    const result = await adminService.getUsers()
    expect(result).toEqual(users)
  })

  it('banUser returns ban response', async () => {
    const { adminService } = await import('@/services/admin.service')
    const response = { success: true, message: 'Banned', userId: '1' }
    mockApiResult.mockResolvedValue({ data: response, error: null, status: 200 })
    const result = await adminService.banUser('1')
    expect(result).toEqual(response)
  })

  it('unBanUser returns unban response', async () => {
    const { adminService } = await import('@/services/admin.service')
    const response = { success: true, message: 'Unbanned', userId: '1' }
    mockApiResult.mockResolvedValue({ data: response, error: null, status: 200 })
    const result = await adminService.unBanUser('1')
    expect(result).toEqual(response)
  })

  it('getTaskMetrics returns task metrics', async () => {
    const { adminService } = await import('@/services/admin.service')
    const metrics = { typeTask: [], totalTasks: 0 }
    mockApiResult.mockResolvedValue({ data: metrics, error: null, status: 200 })
    const result = await adminService.getTaskMetrics()
    expect(result).toEqual(metrics)
  })

  it('getTopUsers returns top users', async () => {
    const { adminService } = await import('@/services/admin.service')
    const topUsers = { users: [], totalUsers: 0 }
    mockApiResult.mockResolvedValue({ data: topUsers, error: null, status: 200 })
    const result = await adminService.getTopUsers()
    expect(result).toEqual(topUsers)
  })

  it('getPerformanceMetrics returns performance metrics', async () => {
    const { adminService } = await import('@/services/admin.service')
    const perf = { completionRate: 65, totalXp: 15000 }
    mockApiResult.mockResolvedValue({ data: perf, error: null, status: 200 })
    const result = await adminService.getPerformanceMetrics()
    expect(result).toEqual(perf)
  })

  it('throws on error', async () => {
    const { adminService } = await import('@/services/admin.service')
    mockApiResult.mockResolvedValue({ data: null, error: { value: 'Failed' }, status: 500 })
    await expect(adminService.getMetrics()).rejects.toThrow()
  })
})
