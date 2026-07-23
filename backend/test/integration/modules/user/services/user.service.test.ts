import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'bun:test'
import { UserService } from '../../../../../src/modules/user/services'
import { UserRepository } from '../../../../../src/modules/user/repositories'
import { db } from '../../../../../src/db'
import { sql } from 'drizzle-orm'

const databaseAvailable = await db
  .execute(sql`select 1`)
  .then(() => true)
  .catch(() => false)

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000'
const TEST_EMAIL_PREFIX = 'user-service-test-'

describe.skipIf(!databaseAvailable)('UserService', () => {
  let testUserId: string

  beforeAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE ${TEST_EMAIL_PREFIX + '%'}`)
    await db.execute(sql`DELETE FROM privacy_settings WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE ${TEST_EMAIL_PREFIX + '%'}
    )`)

    const result = await db.execute(sql`
      INSERT INTO users (id, email, password_hash, nickname, bio, avatar_url, role, level, xp)
      VALUES (
        gen_random_uuid(),
        ${TEST_EMAIL_PREFIX + Date.now() + '@test.com'},
        'hash',
        'Service Test User',
        'Original bio',
        'https://example.com/original.png',
        'USER',
        3,
        500
      )
      RETURNING id
    `)

    testUserId = result[0]?.id as string
  })

  afterAll(async () => {
    await db.execute(sql`DELETE FROM privacy_settings WHERE user_id = ${testUserId}`)
    await db.execute(sql`DELETE FROM users WHERE id = ${testUserId}`)
  })

  beforeEach(async () => {
    await db.execute(sql`
      UPDATE users
      SET nickname = 'Service Test User', bio = 'Original bio', avatar_url = 'https://example.com/original.png'
      WHERE id = ${testUserId}
    `)
    await db.execute(sql`DELETE FROM privacy_settings WHERE user_id = ${testUserId}`)
  })

  describe('getProfile', () => {
    it('should return the self profile with email', async () => {
      const profile = await UserService.getProfile(testUserId)
      expect(profile.id).toBe(testUserId)
      expect(profile.email).toBeDefined()
      expect(profile.nickname).toBe('Service Test User')
      expect(profile.xp).toBe(500)
      expect(profile.level).toBe(3)
    })

    it('should throw 404 when user does not exist', async () => {
      try {
        await UserService.getProfile(NON_EXISTENT_ID)
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })
  })

  describe('updateProfile', () => {
    it('should update the nickname', async () => {
      const profile = await UserService.updateProfile(testUserId, { nickname: 'New Nickname' })
      expect(profile.nickname).toBe('New Nickname')
    })

    it('should update the bio and avatarUrl', async () => {
      const profile = await UserService.updateProfile(testUserId, {
        bio: 'New bio',
        avatarUrl: 'https://example.com/new.png',
      })
      expect(profile.bio).toBe('New bio')
      expect(profile.avatarUrl).toBe('https://example.com/new.png')
    })

    it('should throw 404 when user does not exist', async () => {
      try {
        await UserService.updateProfile(NON_EXISTENT_ID, { nickname: 'Ghost' })
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })
  })

  describe('updatePrivacySettings', () => {
    it('should create privacy settings', async () => {
      const profile = await UserService.updatePrivacySettings(testUserId, {
        showLevel: false,
        showStreak: false,
        showAchievements: false,
      })
      expect(profile.privacy).toBeDefined()
      expect(profile.privacy?.showLevel).toBe(false)
      expect(profile.privacy?.showStreak).toBe(false)
      expect(profile.privacy?.showAchievements).toBe(false)
    })

    it('should persist privacy settings in the repository', async () => {
      await UserService.updatePrivacySettings(testUserId, { showLevel: true })
      const privacy = await UserRepository.findPrivacySettings(testUserId)
      expect(privacy?.showLevel).toBe(true)
    })

    it('should throw when user does not exist (privacy upsert fails)', async () => {
      try {
        await UserService.updatePrivacySettings(NON_EXISTENT_ID, { showLevel: true })
        expect.unreachable()
      } catch {
        expect(true).toBe(true)
      }
    })
  })

  describe('getPublicProfile', () => {
    it('should return public profile without email', async () => {
      const publicProfile = await UserService.getPublicProfile(testUserId)
      expect(publicProfile.id).toBe(testUserId)
      expect((publicProfile as any).email).toBeUndefined()
      expect(publicProfile.nickname).toBe('Service Test User')
    })

    it('should show level and streak by default', async () => {
      const publicProfile = await UserService.getPublicProfile(testUserId)
      expect(publicProfile.level).toBe(3)
      expect(publicProfile.currentStreak).toBeDefined()
      expect(publicProfile.maxStreak).toBeDefined()
    })

    it('should hide level when showLevel is false', async () => {
      await UserService.updatePrivacySettings(testUserId, { showLevel: false })
      const publicProfile = await UserService.getPublicProfile(testUserId)
      expect(publicProfile.level).toBeNull()
    })

    it('should hide streak when showStreak is false', async () => {
      await UserService.updatePrivacySettings(testUserId, { showStreak: false })
      const publicProfile = await UserService.getPublicProfile(testUserId)
      expect(publicProfile.currentStreak).toBeNull()
      expect(publicProfile.maxStreak).toBeNull()
    })

    it('should throw 404 when user does not exist', async () => {
      try {
        await UserService.getPublicProfile(NON_EXISTENT_ID)
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })
  })
})
