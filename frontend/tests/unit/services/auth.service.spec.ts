import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthResponse } from '../../fixtures'

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

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
  })

  it('login returns auth response on success', async () => {
    const { authService } = await import('@/services/auth.service')
    mockApiResult.mockResolvedValue({ data: mockAuthResponse, error: null, status: 200 })

    const result = await authService.login({ email: 'test@test.com', password: 'pass123' })
    expect(result).toEqual(mockAuthResponse)
  })

  it('login throws ApiError on failure', async () => {
    const { authService } = await import('@/services/auth.service')
    mockApiResult.mockResolvedValue({
      data: null,
      error: { value: 'Invalid credentials' },
      status: 401,
    })

    await expect(authService.login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow()
  })

  it('register returns auth response on success', async () => {
    const { authService } = await import('@/services/auth.service')
    mockApiResult.mockResolvedValue({ data: mockAuthResponse, error: null, status: 200 })

    const result = await authService.register({
      email: 'new@test.com',
      password: 'pass123',
      nickname: 'NewUser',
    })
    expect(result).toEqual(mockAuthResponse)
  })

  it('register throws on error', async () => {
    const { authService } = await import('@/services/auth.service')
    mockApiResult.mockResolvedValue({
      data: null,
      error: { value: 'Email already exists' },
      status: 409,
    })

    await expect(
      authService.register({ email: 'existing@test.com', password: 'pass123' }),
    ).rejects.toThrow()
  })

  it('googleLogin returns auth response', async () => {
    const { authService } = await import('@/services/auth.service')
    mockApiResult.mockResolvedValue({ data: mockAuthResponse, error: null, status: 200 })

    const result = await authService.googleLogin('google-id-token')
    expect(result).toEqual(mockAuthResponse)
  })

  it('requestPasswordReset succeeds', async () => {
    const { authService } = await import('@/services/auth.service')
    mockApiResult.mockResolvedValue({
      data: { message: 'Email sent' },
      error: null,
      status: 200,
    })

    const result = await authService.requestPasswordReset('test@test.com')
    expect(result).toEqual({ message: 'Email sent' })
  })

  it('resetPassword succeeds', async () => {
    const { authService } = await import('@/services/auth.service')
    mockApiResult.mockResolvedValue({
      data: { message: 'Password updated' },
      error: null,
      status: 200,
    })

    const result = await authService.resetPassword('reset-token', 'new-pass')
    expect(result).toEqual({ message: 'Password updated' })
  })
})
