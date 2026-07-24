import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiResult = vi.fn<(...args: any[]) => any>()
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

describe('notificationService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
  })

  it('getSettings returns notification settings', async () => {
    const { notificationService } = await import('@/services/notification.service')
    const settings = {
      userId: '1',
      emailEnabled: true,
      pushEnabled: false,
      isMuted: false,
      updatedAt: new Date().toISOString(),
    }
    mockApiResult.mockResolvedValue({ data: settings, error: null, status: 200 })
    const result = await notificationService.getSettings()
    expect(result).toEqual(settings)
  })

  it('updateSettings returns updated settings', async () => {
    const { notificationService } = await import('@/services/notification.service')
    const settings = {
      userId: '1',
      emailEnabled: true,
      pushEnabled: true,
      isMuted: false,
      updatedAt: new Date().toISOString(),
    }
    mockApiResult.mockResolvedValue({ data: settings, error: null, status: 200 })
    const result = await notificationService.updateSettings({ pushEnabled: true })
    expect(result).toEqual(settings)
  })

  it('getHistory returns notification logs', async () => {
    const { notificationService } = await import('@/services/notification.service')
    const logs = [{ id: '1', title: 'Test' }]
    mockApiResult.mockResolvedValue({ data: logs, error: null, status: 200 })
    const result = await notificationService.getHistory(20, 0)
    expect(result).toEqual(logs)
  })

  it('throws on error', async () => {
    const { notificationService } = await import('@/services/notification.service')
    mockApiResult.mockResolvedValue({ data: null, error: { value: 'Failed' }, status: 500 })
    await expect(notificationService.getSettings()).rejects.toThrow('Failed')
  })
})
