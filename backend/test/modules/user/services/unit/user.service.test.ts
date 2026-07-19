import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { UserService } from '../../../../../src/modules/user/services'
import { UserRepository } from '../../../../../src/modules/user/repositories'
import type { User, PrivacyConfig } from '../../../../../src/modules/user/domain'

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hash',
  role: 'USER',
  nickname: 'TestUser',
  bio: 'Hello',
  avatarUrl: 'https://example.com/avatar.png',
  xp: 500,
  level: 3,
  currentStreak: 5,
  maxStreak: 10,
  lastActiveAt: null,
  createdAt: new Date('2026-01-01'),
  ...overrides,
})

const makePrivacy = (overrides: Partial<PrivacyConfig> = {}): PrivacyConfig => ({
  userId: 'user-1',
  showLevel: true,
  showStreak: true,
  showAchievements: true,
  ...overrides,
})

describe('UserService', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('getProfile', () => {
    it('returns self profile with email and privacy settings', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(makePrivacy())

      const profile = await UserService.getProfile('user-1')

      expect(profile.id).toBe('user-1')
      expect(profile.email).toBe('test@example.com')
      expect(profile.nickname).toBe('TestUser')
      expect(profile.bio).toBe('Hello')
      expect(profile.avatarUrl).toBe('https://example.com/avatar.png')
      expect(profile.xp).toBe(500)
      expect(profile.level).toBe(3)
      expect(profile.currentStreak).toBe(5)
      expect(profile.maxStreak).toBe(10)
      expect(profile.privacy).toEqual({
        showLevel: true,
        showStreak: true,
        showAchievements: true,
      })
    })

    it('returns undefined privacy when user has no privacy settings', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(null)

      const profile = await UserService.getProfile('user-1')

      expect(profile.privacy).toBeUndefined()
    })

    it('throws 404 when user does not exist', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(null)

      try {
        await UserService.getProfile('nonexistent')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })
  })

  describe('updateProfile', () => {
    it('updates nickname and returns updated profile', async () => {
      const updatedUser = makeUser({ nickname: 'NewNick' })
      spyOn(UserRepository, 'updateProfile').mockResolvedValue(updatedUser)
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(null)

      const profile = await UserService.updateProfile('user-1', { nickname: 'NewNick' })

      expect(profile.nickname).toBe('NewNick')
      expect(profile.email).toBe('test@example.com')
    })

    it('updates bio and avatarUrl', async () => {
      const updatedUser = makeUser({ bio: 'New bio', avatarUrl: 'https://example.com/new.png' })
      spyOn(UserRepository, 'updateProfile').mockResolvedValue(updatedUser)
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(null)

      const profile = await UserService.updateProfile('user-1', {
        bio: 'New bio',
        avatarUrl: 'https://example.com/new.png',
      })

      expect(profile.bio).toBe('New bio')
      expect(profile.avatarUrl).toBe('https://example.com/new.png')
    })

    it('throws 404 when user does not exist', async () => {
      spyOn(UserRepository, 'updateProfile').mockResolvedValue(null)

      try {
        await UserService.updateProfile('nonexistent', { nickname: 'Ghost' })
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })

    it('calls updateProfile with correct parameters', async () => {
      const updateSpy = spyOn(UserRepository, 'updateProfile').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(null)

      await UserService.updateProfile('user-1', { nickname: 'X', bio: 'Y' })

      expect(updateSpy).toHaveBeenCalledWith('user-1', { nickname: 'X', bio: 'Y' })
    })
  })

  describe('updatePrivacySettings', () => {
    it('updates privacy settings and returns profile', async () => {
      const newPrivacy = makePrivacy({ showLevel: false, showStreak: false })
      spyOn(UserRepository, 'updatePrivacySettings').mockResolvedValue(newPrivacy)
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())

      const profile = await UserService.updatePrivacySettings('user-1', {
        showLevel: false,
        showStreak: false,
      })

      expect(profile.privacy?.showLevel).toBe(false)
      expect(profile.privacy?.showStreak).toBe(false)
      expect(profile.privacy?.showAchievements).toBe(true)
    })

    it('throws 404 when privacy update returns null', async () => {
      spyOn(UserRepository, 'updatePrivacySettings').mockResolvedValue(null)

      try {
        await UserService.updatePrivacySettings('nonexistent', { showLevel: true })
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })

    it('throws 404 when user does not exist after privacy update', async () => {
      spyOn(UserRepository, 'updatePrivacySettings').mockResolvedValue(makePrivacy())
      spyOn(UserRepository, 'findById').mockResolvedValue(null)

      try {
        await UserService.updatePrivacySettings('user-1', { showLevel: true })
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })

    it('calls updatePrivacySettings with correct config', async () => {
      const updateSpy = spyOn(UserRepository, 'updatePrivacySettings').mockResolvedValue(
        makePrivacy(),
      )
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())

      await UserService.updatePrivacySettings('user-1', {
        showAchievements: false,
      })

      expect(updateSpy).toHaveBeenCalledWith('user-1', { showAchievements: false })
    })
  })

  describe('getPublicProfile', () => {
    it('returns public profile without email', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(null)

      const profile = await UserService.getPublicProfile('user-1')

      expect(profile.id).toBe('user-1')
      expect(profile.nickname).toBe('TestUser')
      expect(profile.bio).toBe('Hello')
      expect(profile.avatarUrl).toBe('https://example.com/avatar.png')
      expect(profile.xp).toBe(500)
      expect((profile as any).email).toBeUndefined()
    })

    it('shows level and streak by default when no privacy settings', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(null)

      const profile = await UserService.getPublicProfile('user-1')

      expect(profile.level).toBe(3)
      expect(profile.currentStreak).toBe(5)
      expect(profile.maxStreak).toBe(10)
    })

    it('hides level when showLevel is false', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(makePrivacy({ showLevel: false }))

      const profile = await UserService.getPublicProfile('user-1')

      expect(profile.level).toBeNull()
    })

    it('hides streak when showStreak is false', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(
        makePrivacy({ showStreak: false }),
      )

      const profile = await UserService.getPublicProfile('user-1')

      expect(profile.currentStreak).toBeNull()
      expect(profile.maxStreak).toBeNull()
    })

    it('shows level and streak when privacy settings are all true', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(
        makePrivacy({ showLevel: true, showStreak: true }),
      )

      const profile = await UserService.getPublicProfile('user-1')

      expect(profile.level).toBe(3)
      expect(profile.currentStreak).toBe(5)
      expect(profile.maxStreak).toBe(10)
    })

    it('includes privacy settings in profile', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(makeUser())
      spyOn(UserRepository, 'findPrivacySettings').mockResolvedValue(makePrivacy())

      const profile = await UserService.getPublicProfile('user-1')

      expect(profile.privacy).toEqual({
        showLevel: true,
        showStreak: true,
        showAchievements: true,
      })
    })

    it('throws 404 when user does not exist', async () => {
      spyOn(UserRepository, 'findById').mockResolvedValue(null)

      try {
        await UserService.getPublicProfile('nonexistent')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })
  })
})
