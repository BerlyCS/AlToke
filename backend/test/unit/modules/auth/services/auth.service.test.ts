import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { AuthService } from '../../../../../src/modules/auth/service'
import { AuthRepository } from '../../../../../src/modules/auth/repositories'
import { GamificationService } from '../../../../../src/modules/gamification/services'
import { EmailService } from '../../../../../src/modules/email/email.service'
import { OAuth2Client } from 'google-auth-library'
import type { InferSelectModel } from 'drizzle-orm'
import { users } from '../../../../../src/db/schema'

type UserRow = InferSelectModel<typeof users>

const makeUserRow = (overrides: Partial<UserRow> = {}): UserRow => ({
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: null,
  role: 'USER',
  nickname: 'TestUser',
  bio: null,
  avatarUrl: 'https://example.com/avatar.png',
  xp: 0,
  level: 1,
  currentStreak: 0,
  maxStreak: 0,
  streakFrozenUntil: null,
  overdueHighPriorityCount: 0,
  lastActiveAt: new Date('2026-07-01'),
  createdAt: new Date('2026-01-01'),
  ...overrides,
})

const VALID_HASH =
  '$argon2id$v=19$m=65536,t=2,p=1$I59FqsLYqE4TKSx7ycnyTkL/akMY2Mqx9VKXB/gh8do$U4+Km8cxRw/QZZSBgM4fUn+p0OAv4zDeSVO00OrccZc'

describe('AuthService', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('register', () => {
    it('throws when email already exists', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(makeUserRow())

      try {
        await AuthService.register({ email: 'test@example.com', password: 'password123' })
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('registers a new user successfully', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(null as any)
      spyOn(AuthRepository, 'createUser').mockResolvedValue(
        makeUserRow({
          id: 'new-user',
          email: 'new@example.com',
          nickname: 'NewUser',
        }),
      )
      const privacySpy = spyOn(AuthRepository, 'createPrivacySettings').mockResolvedValue(undefined)
      spyOn(GamificationService, 'triggerAchievement').mockResolvedValue(null as any)

      const result = await AuthService.register({
        email: 'new@example.com',
        password: 'password123',
        nickname: 'NewUser',
      })

      expect(result.id).toBe('new-user')
      expect(result.email).toBe('new@example.com')
      expect(result.nickname).toBe('NewUser')
      expect(privacySpy).toHaveBeenCalledWith('new-user')
    })

    it('triggers first_login achievement after registration', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(null as any)
      spyOn(AuthRepository, 'createUser').mockResolvedValue(
        makeUserRow({ id: 'new-user', email: 'new@example.com' }),
      )
      spyOn(AuthRepository, 'createPrivacySettings').mockResolvedValue(undefined)
      const achievementSpy = spyOn(GamificationService, 'triggerAchievement').mockResolvedValue(
        null as any,
      )

      await AuthService.register({ email: 'new@example.com', password: 'password123' })

      expect(achievementSpy).toHaveBeenCalledWith('new-user', 'first_login')
    })
  })

  describe('login', () => {
    it('throws when user not found', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(null as any)

      try {
        await AuthService.login({ email: 'nonexistent@example.com', password: 'password123' })
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('throws when user has no passwordHash', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(makeUserRow())

      try {
        await AuthService.login({ email: 'test@example.com', password: 'password123' })
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('throws when password is invalid', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(
        makeUserRow({ passwordHash: VALID_HASH }),
      )

      try {
        await AuthService.login({ email: 'test@example.com', password: 'wrongpassword' })
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('returns user data on successful login', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(
        makeUserRow({
          id: 'user-1',
          email: 'test@example.com',
          passwordHash: VALID_HASH,
          nickname: 'TestUser',
          avatarUrl: 'https://example.com/avatar.png',
        }),
      )

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'testpass123',
      })

      expect(result.id).toBe('user-1')
      expect(result.email).toBe('test@example.com')
      expect(result.nickname).toBe('TestUser')
    })
  })

  describe('googleLogin', () => {
    it('returns existing user data when user exists', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(
        makeUserRow({
          id: 'user-1',
          email: 'google@example.com',
          nickname: 'GoogleUser',
          avatarUrl: 'https://example.com/google.png',
        }),
      )

      ;(spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => ({
          email: 'google@example.com',
          name: 'GoogleUser',
          picture: 'https://example.com/google.png',
        }),
      })

      const result = await AuthService.googleLogin({ idToken: 'valid-token' })

      expect(result.id).toBe('user-1')
      expect(result.email).toBe('google@example.com')
    })

    it('creates new user when user does not exist', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(null as any)
      spyOn(AuthRepository, 'createUser').mockResolvedValue(
        makeUserRow({
          id: 'google-user',
          email: 'google@example.com',
          nickname: 'GoogleUser',
          avatarUrl: 'https://example.com/google.png',
        }),
      )
      spyOn(AuthRepository, 'createPrivacySettings').mockResolvedValue(undefined)

      ;(spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => ({
          email: 'google@example.com',
          name: 'GoogleUser',
          picture: 'https://example.com/google.png',
        }),
      })

      const result = await AuthService.googleLogin({ idToken: 'valid-token' })

      expect(result.id).toBe('google-user')
      expect(result.email).toBe('google@example.com')
      expect(result.nickname).toBe('GoogleUser')
    })

    it('throws when Google token is invalid', async () => {
      ;(spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockRejectedValue(
        new Error('Invalid token'),
      )

      try {
        await AuthService.googleLogin({ idToken: 'invalid-token' })
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('throws when Google payload has no email', async () => {
      ;(spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => ({ email: null }),
      })

      try {
        await AuthService.googleLogin({ idToken: 'valid-token' })
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('requestPasswordReset', () => {
    it('returns generic message when user not found', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(null as any)

      const result = await AuthService.requestPasswordReset({ email: 'nonexistent@example.com' })

      expect(result.message).toBe('If an account exists, we sent password instructions.')
    })

    it('returns generic message after successful request', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(
        makeUserRow({ id: 'user-1', email: 'test@example.com' }),
      )
      spyOn(AuthRepository, 'findRecentResetToken').mockResolvedValue(null as any)
      spyOn(AuthRepository, 'transaction').mockImplementation(async (fn) => fn(null as any))
      spyOn(AuthRepository, 'invalidateOldResetTokens').mockResolvedValue(undefined)
      spyOn(AuthRepository, 'createResetToken').mockResolvedValue(undefined)
      const emailSpy = spyOn(EmailService, 'sendPasswordReset').mockResolvedValue(undefined)

      const result = await AuthService.requestPasswordReset({ email: 'test@example.com' })

      expect(result.message).toBe('If an account exists, we sent password instructions.')
      expect(emailSpy).toHaveBeenCalled()
    })

    it('skips when recent request exists (cooldown)', async () => {
      spyOn(AuthRepository, 'findUserByEmail').mockResolvedValue(
        makeUserRow({ id: 'user-1', email: 'test@example.com' }),
      )
      spyOn(AuthRepository, 'findRecentResetToken').mockResolvedValue({ id: 'recent-token-id' })
      const emailSpy = spyOn(EmailService, 'sendPasswordReset').mockResolvedValue(undefined)

      const result = await AuthService.requestPasswordReset({ email: 'test@example.com' })

      expect(result.message).toBe('If an account exists, we sent password instructions.')
      expect(emailSpy).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('throws when token is invalid', async () => {
      spyOn(AuthRepository, 'transaction').mockImplementation(async (fn) => fn(null as any))
      spyOn(AuthRepository, 'useResetToken').mockResolvedValue(null as any)

      try {
        await AuthService.resetPassword({
          token: 'a'.repeat(43),
          password: 'newpassword123',
        })
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('returns success message on valid token', async () => {
      spyOn(AuthRepository, 'transaction').mockImplementation(async (fn) => fn(null as any))
      spyOn(AuthRepository, 'useResetToken').mockResolvedValue({ userId: 'user-1' })
      spyOn(AuthRepository, 'updateUserPassword').mockResolvedValue(undefined)
      spyOn(AuthRepository, 'invalidateRemainingResetTokens').mockResolvedValue(undefined)

      const result = await AuthService.resetPassword({
        token: 'a'.repeat(43),
        password: 'newpassword123',
      })

      expect(result.message).toBe('Password updated successfully.')
    })
  })
})
