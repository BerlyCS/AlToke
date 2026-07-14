import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { UserRepository } from '../../../../src/modules/user/repositories'
import { db } from '../../../../src/db'
import { sql } from 'drizzle-orm'

const databaseAvailable = await db
  .execute(sql`select 1`)
  .then(() => true)
  .catch(() => false)

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000'
const TEST_EMAIL_PREFIX = 'user-repo-test-'

describe.skipIf(!databaseAvailable)('UserRepository', () => {
  let testUserId: string
  let testEmail: string

  beforeAll(async () => {
    await db.execute(sql`DELETE FROM privacy_settings WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE ${TEST_EMAIL_PREFIX + '%'}
    )`)
    await db.execute(sql`DELETE FROM users WHERE email LIKE ${TEST_EMAIL_PREFIX + '%'}`)

    const result = await db.execute(sql`
      INSERT INTO users (id, email, password_hash, nickname, bio, avatar_url, role, level, xp)
      VALUES (
        gen_random_uuid(),
        ${TEST_EMAIL_PREFIX + Date.now() + '@test.com'},
        'hash',
        'Repo Test User',
        'Original bio',
        'https://example.com/original.png',
        'USER',
        3,
        500
      )
      RETURNING id, email
    `)

    testUserId = result[0]?.id as string
    testEmail = result[0]?.email as string
  })

  afterAll(async () => {
    await db.execute(sql`DELETE FROM privacy_settings WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE ${TEST_EMAIL_PREFIX + '%'}
    )`)
    await db.execute(sql`DELETE FROM users WHERE email LIKE ${TEST_EMAIL_PREFIX + '%'}`)
  })

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = await UserRepository.findById(testUserId)
      expect(user).toBeDefined()
      expect(user?.id).toBe(testUserId)
      expect(user?.email).toBe(testEmail)
    })

    it('should return null for non-existent user', async () => {
      const user = await UserRepository.findById(NON_EXISTENT_ID)
      expect(user).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = await UserRepository.findByEmail(testEmail)
      expect(user).toBeDefined()
      expect(user?.id).toBe(testUserId)
    })

    it('should return null for non-existent email', async () => {
      const user = await UserRepository.findByEmail('does-not-exist@example.com')
      expect(user).toBeNull()
    })
  })

  describe('save', () => {
    it('should create a new user', async () => {
      const email = `${TEST_EMAIL_PREFIX}save-${Date.now()}@test.com`
      const saved = await UserRepository.save({
        email,
        passwordHash: 'hash',
        role: 'USER',
        nickname: 'Saved User',
        bio: '',
        avatarUrl: '',
        level: 1,
        xp: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastActiveAt: new Date(),
      })

      expect(saved).toBeDefined()
      expect(saved.id).toBeDefined()
      expect(saved.email).toBe(email)
      expect(saved.nickname).toBe('Saved User')

      await db.execute(sql`DELETE FROM users WHERE email = ${email}`)
    })
  })

  describe('update', () => {
    it('should update the full user record', async () => {
      const before = await UserRepository.findById(testUserId)
      const updated = await UserRepository.update({
        ...before!,
        nickname: 'Updated Repo User',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/updated.png',
        xp: 999,
        level: 7,
      })

      expect(updated?.nickname).toBe('Updated Repo User')
      expect(updated?.bio).toBe('Updated bio')
      expect(updated?.avatarUrl).toBe('https://example.com/updated.png')
      expect(updated?.xp).toBe(999)
      expect(updated?.level).toBe(7)
    })
  })

  describe('updateProfile', () => {
    it('should update nickname', async () => {
      const updated = await UserRepository.updateProfile(testUserId, {
        nickname: 'Profile Nickname',
      })
      expect(updated?.nickname).toBe('Profile Nickname')
    })

    it('should update bio', async () => {
      const updated = await UserRepository.updateProfile(testUserId, { bio: 'Profile bio' })
      expect(updated?.bio).toBe('Profile bio')
    })

    it('should update avatarUrl', async () => {
      const updated = await UserRepository.updateProfile(testUserId, {
        avatarUrl: 'https://example.com/avatar.png',
      })
      expect(updated?.avatarUrl).toBe('https://example.com/avatar.png')
    })

    it('should update multiple fields at once', async () => {
      const updated = await UserRepository.updateProfile(testUserId, {
        nickname: 'Multi Update',
        bio: 'Multiple fields',
        avatarUrl: 'https://example.com/multi.png',
      })
      expect(updated?.nickname).toBe('Multi Update')
      expect(updated?.bio).toBe('Multiple fields')
      expect(updated?.avatarUrl).toBe('https://example.com/multi.png')
    })

    it('should return null for non-existent user', async () => {
      const updated = await UserRepository.updateProfile(NON_EXISTENT_ID, {
        nickname: 'Ghost',
      })
      expect(updated).toBeNull()
    })
  })

  describe('findPrivacySettings', () => {
    it('should return null when no privacy settings exist', async () => {
      const privacy = await UserRepository.findPrivacySettings(testUserId)
      expect(privacy).toBeNull()
    })

    it('should return privacy settings after creation', async () => {
      await UserRepository.updatePrivacySettings(testUserId, { showLevel: false })
      const privacy = await UserRepository.findPrivacySettings(testUserId)
      expect(privacy).toBeDefined()
      expect(privacy?.userId).toBe(testUserId)
      expect(privacy?.showLevel).toBe(false)
    })
  })

  describe('updatePrivacySettings', () => {
    it('should create privacy settings when none exist', async () => {
      const privacy = await UserRepository.updatePrivacySettings(testUserId, {
        showStreak: false,
        showAchievements: false,
      })
      expect(privacy?.userId).toBe(testUserId)
      expect(privacy?.showStreak).toBe(false)
      expect(privacy?.showAchievements).toBe(false)
    })

    it('should upsert (update) existing privacy settings', async () => {
      const privacy = await UserRepository.updatePrivacySettings(testUserId, {
        showStreak: true,
        showLevel: true,
      })
      expect(privacy?.showStreak).toBe(true)
      expect(privacy?.showLevel).toBe(true)
    })
  })
})
