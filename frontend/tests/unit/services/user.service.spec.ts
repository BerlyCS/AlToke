import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn<(...args: any[]) => any>(), error: vi.fn<(...args: any[]) => any>() },
}))

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

describe('userService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
    localStorage.setItem('token', 'test-token')
  })

  it('getProfile returns profile', async () => {
    const { userService } = await import('@/services/user.service')
    const profile = { id: '1', nickname: 'Test' }
    mockApiResult.mockResolvedValue({ data: profile, error: null, status: 200 })

    const result = await userService.getProfile()
    expect(result).toEqual(profile)
  })

  it('getProfile throws on error', async () => {
    const { userService } = await import('@/services/user.service')
    mockApiResult.mockResolvedValue({ data: null, error: { value: 'Unauthorized' }, status: 401 })

    await expect(userService.getProfile()).rejects.toThrow('Unauthorized')
  })

  it('updateProfile returns updated profile', async () => {
    const { userService } = await import('@/services/user.service')
    const profile = { id: '1', nickname: 'Updated' }
    mockApiResult.mockResolvedValue({ data: profile, error: null, status: 200 })

    const result = await userService.updateProfile({ nickname: 'Updated' })
    expect(result).toEqual(profile)
  })

  it('updatePrivacy returns updated profile', async () => {
    const { userService } = await import('@/services/user.service')
    const profile = { id: '1', privacy: { showLevel: false } }
    mockApiResult.mockResolvedValue({ data: profile, error: null, status: 200 })

    const result = await userService.updatePrivacy({ showLevel: false })
    expect(result).toEqual(profile)
  })
})
