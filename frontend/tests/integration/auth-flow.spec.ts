import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockProfile, mockAuthResponse } from '../fixtures'
import type { User } from '@/types'

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn<(...args: any[]) => any>(),
    register: vi.fn<(...args: any[]) => any>(),
    googleLogin: vi.fn<(...args: any[]) => any>(),
    requestPasswordReset: vi.fn<(...args: any[]) => any>(),
    resetPassword: vi.fn<(...args: any[]) => any>(),
  },
}))

vi.mock('@/services/user.service', () => ({
  userService: {
    getProfile: vi.fn<(...args: any[]) => any>(),
    updateProfile: vi.fn<(...args: any[]) => any>(),
    updatePrivacy: vi.fn<(...args: any[]) => any>(),
  },
}))

describe('Auth Integration Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('completes login flow: API call -> store update -> localStorage', async () => {
    const { authService } = await import('@/services/auth.service')
    const { userService } = await import('@/services/user.service')
    const store = useAuthStore()
    ;(authService.login as any).mockResolvedValue(mockAuthResponse)
    ;(userService.getProfile as any).mockResolvedValue(mockProfile)

    const loginResult = await authService.login({ email: 'test@test.com', password: 'pass123' })
    expect(loginResult.token).toBe('mock-jwt-token-abc123')

    localStorage.setItem('token', loginResult.token)
    const profile = await userService.getProfile()

    store.setAuth(loginResult.user as User, profile, loginResult.token)
    expect(store.token).toBe('mock-jwt-token-abc123')
    expect(store.profile?.nickname).toBe('TestUser')
    expect(localStorage.getItem('token')).toBe('mock-jwt-token-abc123')
  })

  it('completes logout flow: store clear -> localStorage clear', async () => {
    const store = useAuthStore()
    store.setAuth({ id: '1', email: 'test@test.com', nickname: 'Test' }, mockProfile, 'some-token')

    expect(store.token).toBe('some-token')
    store.logout()
    expect(store.token).toBeNull()
    expect(store.profile).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('completes registration flow', async () => {
    const { authService } = await import('@/services/auth.service')
    const { userService } = await import('@/services/user.service')
    const store = useAuthStore()
    ;(authService.register as any).mockResolvedValue(mockAuthResponse)
    ;(userService.getProfile as any).mockResolvedValue(mockProfile)

    const regResult = await authService.register({
      email: 'new@test.com',
      password: 'pass123',
      nickname: 'NewUser',
    })

    localStorage.setItem('token', regResult.token)
    const profile = await userService.getProfile()
    store.setAuth(regResult.user as User, profile, regResult.token)

    expect(store.token).toBeTruthy()
    expect(store.profile).toBeTruthy()
  })

  it('handles login failure gracefully', async () => {
    const { authService } = await import('@/services/auth.service')
    const store = useAuthStore()
    ;(authService.login as any).mockRejectedValue(new Error('Invalid credentials'))

    await expect(authService.login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials',
    )

    expect(store.token).toBeNull()
    expect(store.profile).toBeNull()
  })

  it('persists profile updates across sessions', async () => {
    const store = useAuthStore()
    store.setAuth({ id: '1', email: 'test@test.com', nickname: 'Test' }, mockProfile, 'token')

    store.updateProfile({ ...mockProfile, nickname: 'UpdatedName' })
    expect(store.profile?.nickname).toBe('UpdatedName')

    const stored = JSON.parse(localStorage.getItem('profile')!)
    expect(stored.nickname).toBe('UpdatedName')
  })

  it('addXP updates profile correctly after task completion', async () => {
    const store = useAuthStore()
    store.setAuth({ id: '1', email: 'test@test.com', nickname: 'Test' }, mockProfile, 'token')

    store.addXP(50, 6, 8)
    expect(store.profile!.xp).toBe(550)
    expect(store.profile!.level).toBe(6)
    expect(store.profile!.currentStreak).toBe(8)
  })
})
