import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'bun:test'
import { AdminService } from '../../../../src/modules/admin/services'
import { AdminRepository } from '../../../../src/modules/admin/repositories'
import { db } from '../../../../src/db'
import { sql } from 'drizzle-orm'

const databaseAvailable = await db
  .execute(sql`select 1`)
  .then(() => true)
  .catch(() => false)

describe.skipIf(!databaseAvailable)('AdminService', () => {
  let testUserId: string

  beforeAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE 'admin-test-service-%'`)

    const result = await db.execute(sql`
      INSERT INTO users (id, email, password_hash, nickname, bio, avatar_url, role, level, xp)
      VALUES (
        gen_random_uuid(),
        'admin-test-service-' || EXTRACT(EPOCH FROM NOW()) || '@test.com',
        'hash',
        'Test Service User',
        'Original bio',
        'https://example.com/original.png',
        'USER',
        5,
        1000
      )
      RETURNING id
    `)

    testUserId = result[0]?.id as string
  })

  afterAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE 'admin-test-service-%'`)
  })

  beforeEach(async () => {
    await db.execute(sql`
      UPDATE users
      SET role = 'USER', nickname = 'Test Service User', bio = 'Original bio', avatar_url = 'https://example.com/original.png'
      WHERE id = ${testUserId}
    `)
  })

  describe('banUser', () => {
    it('should ban a user successfully', async () => {
      const result = await AdminService.banUser(testUserId, {
        reason: 'Test ban reason',
      })
      expect(result.success).toBe(true)
      expect(result.userId).toBe(testUserId)
      expect(result.message).toContain('banned')

      const banned = await AdminRepository.getUserById(testUserId)
      expect(banned?.role).toBe('BANNED')
    })

    it('should throw error when user not found', async () => {
      try {
        await AdminService.banUser('00000000-0000-0000-0000-000000000000', {
          reason: 'Test',
        })
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User not found')
      }
    })

    it('should throw error when user already banned', async () => {
      await AdminService.banUser(testUserId, { reason: 'First ban' })
      try {
        await AdminService.banUser(testUserId, { reason: 'Second ban' })
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User is already banned')
      }
    })
  })

  describe('unbanUser', () => {
    it('should unban a user successfully', async () => {
      await AdminService.banUser(testUserId, { reason: 'Test ban' })

      const result = await AdminService.unbanUser(testUserId)
      expect(result.success).toBe(true)
      expect(result.userId).toBe(testUserId)
      expect(result.message).toContain('unbanned')

      const unbanned = await AdminRepository.getUserById(testUserId)
      expect(unbanned?.role).toBe('USER')
    })

    it('should throw error when user not found', async () => {
      try {
        await AdminService.unbanUser('00000000-0000-0000-0000-000000000000')
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User not found')
      }
    })
  })

  describe('moderateProfile', () => {
    it('should moderate user profile with only nickname', async () => {
      const result = await AdminService.moderateProfile(testUserId, {
        nickname: 'Moderated Name',
        reason: 'Test moderation',
      })
      expect(result.success).toBe(true)
      expect(result.userId).toBe(testUserId)

      const user = await AdminRepository.getUserById(testUserId)
      expect(user?.nickname).toBe('Moderated Name')
    })

    it('should update bio and avatarUrl', async () => {
      const result = await AdminService.moderateProfile(testUserId, {
        bio: 'Moderated bio',
        avatarUrl: 'https://example.com/moderated.png',
        reason: 'Test moderation',
      })
      expect(result.success).toBe(true)

      const user = await AdminRepository.getUserById(testUserId)
      expect(user?.bio).toBe('Moderated bio')
      expect(user?.avatarUrl).toBe('https://example.com/moderated.png')
    })

    it('should update multiple profile fields', async () => {
      const result = await AdminService.moderateProfile(testUserId, {
        nickname: 'Multi Update',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/multi.png',
        reason: 'Multiple field update',
      })
      expect(result.success).toBe(true)

      const user = await AdminRepository.getUserById(testUserId)
      expect(user?.nickname).toBe('Multi Update')
      expect(user?.bio).toBe('Updated bio')
      expect(user?.avatarUrl).toBe('https://example.com/multi.png')
    })

    it('should succeed with only a reason (no profile changes)', async () => {
      const result = await AdminService.moderateProfile(testUserId, {
        reason: 'No-op moderation',
      })
      expect(result.success).toBe(true)
      expect(result.userId).toBe(testUserId)
    })

    it('should throw error when user not found', async () => {
      try {
        await AdminService.moderateProfile('00000000-0000-0000-0000-000000000000', {
          reason: 'Test',
        })
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User not found')
      }
    })
  })

  describe('getUserSummary', () => {
    it('should return user summary', async () => {
      const summary = await AdminService.getUserSummary(testUserId)
      expect(summary.userId).toBe(testUserId)
      expect(summary.level).toBeDefined()
      expect(summary.xp).toBeDefined()
      expect(summary.createdAt).toBeDefined()
    })

    it('should include user nickname if available', async () => {
      await AdminService.moderateProfile(testUserId, {
        nickname: 'Summary Test',
        reason: 'Test',
      })
      const summary = await AdminService.getUserSummary(testUserId)
      expect(summary.nickname).toBe('Summary Test')
    })

    it('should throw error when user not found', async () => {
      try {
        await AdminService.getUserSummary('00000000-0000-0000-0000-000000000000')
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User not found')
      }
    })
  })

  describe('listUsers', () => {
    it('should return paginated list of users', async () => {
      const result = await AdminService.listUsers(10, 0)
      expect(result.users).toBeDefined()
      expect(Array.isArray(result.users)).toBe(true)
      expect(result.total).toBeDefined()
      expect(typeof result.total).toBe('number')
    })

    it('should respect limit and offset', async () => {
      const result = await AdminService.listUsers(1, 0)
      expect(result.users.length).toBeLessThanOrEqual(1)
      expect(result.limit).toBe(1)
      expect(result.offset).toBe(0)
    })

    it('should include user email and id in response', async () => {
      const result = await AdminService.listUsers(10, 0)
      if (result.users.length > 0) {
        expect(result.users[0].email).toBeDefined()
        expect(result.users[0].id).toBeDefined()
      }
    })

    it('should default to limit 10 and offset 0', async () => {
      const result = await AdminService.listUsers()
      expect(result.limit).toBe(10)
      expect(result.offset).toBe(0)
    })
  })

  describe('getSystemMetrics', () => {
    it('should return system metrics object', async () => {
      const metrics = await AdminService.getSystemMetrics()
      expect(metrics).toBeDefined()
      expect(metrics.totalUsers).toBeDefined()
      expect(metrics.activeUsersDaily).toBeDefined()
      expect(metrics.tasksCompletedToday).toBeDefined()
      expect(metrics.totalTasks).toBeDefined()
    })

    it('should return numeric values', async () => {
      const metrics = await AdminService.getSystemMetrics()
      expect(typeof metrics.totalUsers).toBe('number')
      expect(typeof metrics.activeUsersDaily).toBe('number')
      expect(typeof metrics.tasksCompletedToday).toBe('number')
      expect(typeof metrics.totalTasks).toBe('number')
    })

    it('should return non-negative numbers', async () => {
      const metrics = await AdminService.getSystemMetrics()
      expect(metrics.totalUsers).toBeGreaterThanOrEqual(0)
      expect(metrics.activeUsersDaily).toBeGreaterThanOrEqual(0)
      expect(metrics.tasksCompletedToday).toBeGreaterThanOrEqual(0)
      expect(metrics.totalTasks).toBeGreaterThanOrEqual(0)
    })

    it('should report at least the created test user in totalUsers', async () => {
      const metrics = await AdminService.getSystemMetrics()
      expect(metrics.totalUsers).toBeGreaterThanOrEqual(1)
    })
  })
})
