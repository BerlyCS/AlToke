import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockProfile, mockUser } from '../../fixtures'

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('initializes with no token or profile', () => {
    const store = useAuthStore()
    expect(store.token).toBeNull()
    expect(store.profile).toBeNull()
    expect(store.user).toBeNull()
  })

  it('initializes from localStorage', () => {
    localStorage.setItem('token', 'saved-token')
    localStorage.setItem('profile', JSON.stringify(mockProfile))
    setActivePinia(createPinia())
    const store = useAuthStore()
    expect(store.token).toBe('saved-token')
    expect(store.profile).toEqual(mockProfile)
  })

  it('setAuth sets user, profile and token', () => {
    const store = useAuthStore()
    store.setAuth(mockUser, mockProfile, 'new-token')
    expect(store.user).toEqual(mockUser)
    expect(store.profile).toEqual(mockProfile)
    expect(store.token).toBe('new-token')
  })

  it('setAuth persists to localStorage', () => {
    const store = useAuthStore()
    store.setAuth(mockUser, mockProfile, 'persist-token')
    expect(localStorage.getItem('token')).toBe('persist-token')
    expect(JSON.parse(localStorage.getItem('profile')!)).toEqual(mockProfile)
  })

  it('logout clears everything', () => {
    const store = useAuthStore()
    store.setAuth(mockUser, mockProfile, 'token')
    store.logout()
    expect(store.token).toBeNull()
    expect(store.profile).toBeNull()
    expect(store.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('profile')).toBeNull()
  })

  it('updateProfile updates profile in store and localStorage', () => {
    const store = useAuthStore()
    store.setAuth(mockUser, mockProfile, 'token')
    const newProfile = { ...mockProfile, nickname: 'NewName' }
    store.updateProfile(newProfile)
    expect(store.profile?.nickname).toBe('NewName')
    expect(JSON.parse(localStorage.getItem('profile')!).nickname).toBe('NewName')
  })

  it('updateProfile updates user when user exists', () => {
    const store = useAuthStore()
    store.setAuth(mockUser, mockProfile, 'token')
    const newProfile = { ...mockProfile, id: 'new-id', email: 'new@test.com' }
    store.updateProfile(newProfile)
    expect(store.user?.id).toBe('new-id')
    expect(store.user?.email).toBe('new@test.com')
  })

  it('updateProfile does not fail when user is null', () => {
    const store = useAuthStore()
    store.profile = { ...mockProfile }
    const newProfile = { ...mockProfile, nickname: 'Updated' }
    expect(() => store.updateProfile(newProfile)).not.toThrow()
  })

  it('addXP increases xp', () => {
    const store = useAuthStore()
    store.profile = { ...mockProfile }
    store.addXP(100)
    expect(store.profile!.xp).toBe(600)
  })

  it('addXP updates level when provided', () => {
    const store = useAuthStore()
    store.profile = { ...mockProfile }
    store.addXP(50, 6)
    expect(store.profile!.level).toBe(6)
  })

  it('addXP updates streak when provided', () => {
    const store = useAuthStore()
    store.profile = { ...mockProfile }
    store.addXP(50, undefined, 10)
    expect(store.profile!.currentStreak).toBe(10)
  })

  it('addXP updates maxStreak when new streak is higher', () => {
    const store = useAuthStore()
    store.profile = { ...mockProfile, maxStreak: 14 }
    store.addXP(50, undefined, 20)
    expect(store.profile!.maxStreak).toBe(20)
  })

  it('addXP does not lower maxStreak', () => {
    const store = useAuthStore()
    store.profile = { ...mockProfile, maxStreak: 14 }
    store.addXP(50, undefined, 5)
    expect(store.profile!.maxStreak).toBe(14)
  })

  it('addXP persists changes to localStorage', () => {
    const store = useAuthStore()
    store.setAuth(mockUser, mockProfile, 'token')
    store.addXP(100, 6, 8)
    const stored = JSON.parse(localStorage.getItem('profile')!)
    expect(stored.xp).toBe(600)
    expect(stored.level).toBe(6)
    expect(stored.currentStreak).toBe(8)
  })

  it('addXP does nothing when profile is null', () => {
    const store = useAuthStore()
    expect(() => store.addXP(100)).not.toThrow()
  })
})
