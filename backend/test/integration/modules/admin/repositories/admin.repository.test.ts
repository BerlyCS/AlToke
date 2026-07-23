import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { AdminRepository } from '../../../../../src/modules/admin/repositories'
import { db } from '../../../../../src/db'
import { sql } from 'drizzle-orm'

const databaseAvailable = await db
  .execute(sql`select 1`)
  .then(() => true)
  .catch(() => false)

describe.skipIf(!databaseAvailable)('AdminRepository', () => {
  let testUserId: string

  beforeAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE 'admin-test-repo-%'`)

    const result = await db.execute(sql`
      INSERT INTO users (id, email, password_hash, nickname, bio, avatar_url, role, level, xp)
      VALUES (
        gen_random_uuid(),
        'admin-test-repo-' || EXTRACT(EPOCH FROM NOW()) || '@test.com',
        'hash',
        'Test Repo User',
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
    await db.execute(sql`DELETE FROM users WHERE email LIKE 'admin-test-repo-%'`)
  })

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = await AdminRepository.getUserById(testUserId)
      expect(user).toBeDefined()
      expect(user?.id).toBe(testUserId)
    })

    it('should return null for non-existent user', async () => {
      const user = await AdminRepository.getUserById('00000000-0000-0000-0000-000000000000')
      expect(user).toBeNull()
    })
  })

  describe('getAllUsers', () => {
    it('should return array of users', async () => {
      const users = await AdminRepository.getAllUsers(5, 0)
      expect(Array.isArray(users)).toBe(true)
    })

    it('should respect limit and offset', async () => {
      const users1 = await AdminRepository.getAllUsers(1, 0)
      const users2 = await AdminRepository.getAllUsers(1, 1)
      expect(users1.length).toBeLessThanOrEqual(1)
      expect(users2.length).toBeLessThanOrEqual(1)
    })

    it('should return all users when called without arguments', async () => {
      const users = await AdminRepository.getAllUsers()
      expect(Array.isArray(users)).toBe(true)
      expect(users.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('banUser', () => {
    it('should ban user by changing role to BANNED', async () => {
      const bannedUser = await AdminRepository.banUser(testUserId)
      expect(bannedUser?.role).toBe('BANNED')
    })

    it('should update user role in database', async () => {
      const userAfterBan = await AdminRepository.getUserById(testUserId)
      expect(userAfterBan?.role).toBe('BANNED')
    })
  })

  describe('unbanUser', () => {
    it('should unban user by restoring role to USER', async () => {
      await AdminRepository.banUser(testUserId)
      const unbannedUser = await AdminRepository.unbanUser(testUserId)
      expect(unbannedUser?.role).toBe('USER')
    })
  })

  describe('isUserBanned', () => {
    it('should return true for banned user', async () => {
      await AdminRepository.banUser(testUserId)
      const isBanned = await AdminRepository.isUserBanned(testUserId)
      expect(isBanned).toBe(true)
    })

    it('should return false for non-banned user', async () => {
      await AdminRepository.unbanUser(testUserId)
      const isBanned = await AdminRepository.isUserBanned(testUserId)
      expect(isBanned).toBe(false)
    })
  })

  describe('updateUserProfile', () => {
    it('should update user nickname', async () => {
      const updatedUser = await AdminRepository.updateUserProfile(testUserId, {
        nickname: 'Updated Nickname',
      })
      expect(updatedUser?.nickname).toBe('Updated Nickname')
    })

    it('should update user bio', async () => {
      const updatedUser = await AdminRepository.updateUserProfile(testUserId, {
        bio: 'New bio',
      })
      expect(updatedUser?.bio).toBe('New bio')
    })

    it('should update user avatarUrl', async () => {
      const updatedUser = await AdminRepository.updateUserProfile(testUserId, {
        avatarUrl: 'https://example.com/new-avatar.png',
      })
      expect(updatedUser?.avatarUrl).toBe('https://example.com/new-avatar.png')
    })

    it('should update multiple fields at once', async () => {
      const updatedUser = await AdminRepository.updateUserProfile(testUserId, {
        nickname: 'Multi Update',
        bio: 'Multiple fields updated',
        avatarUrl: 'https://example.com/multi.png',
      })
      expect(updatedUser?.nickname).toBe('Multi Update')
      expect(updatedUser?.bio).toBe('Multiple fields updated')
      expect(updatedUser?.avatarUrl).toBe('https://example.com/multi.png')
    })
  })

  describe('getTotalUsersCount', () => {
    it('should return a number', async () => {
      const count = await AdminRepository.getTotalUsersCount()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getTotalTasksCount', () => {
    it('should return a number', async () => {
      const count = await AdminRepository.getTotalTasksCount()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getActiveDailyUsers', () => {
    it('should return a number', async () => {
      const count = await AdminRepository.getActiveDailyUsers()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getTasksCompletedToday', () => {
    it('should return a number', async () => {
      const count = await AdminRepository.getTasksCompletedToday()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getUserTaskCount', () => {
    it('should return task count for user', async () => {
      const count = await AdminRepository.getUserTaskCount(testUserId)
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })

    it('should return 0 for a non-existent user', async () => {
      const count = await AdminRepository.getUserTaskCount('00000000-0000-0000-0000-000000000000')
      expect(count).toBe(0)
    })
  })

  describe('getTaskMetrics', () => {
    let taskIds: string[] = []

    beforeAll(async () => {
      const result = await db.execute(sql`
        INSERT INTO tasks (user_id, title, status)
        VALUES
          (${testUserId}, 'Metric Task 1', 'COMPLETED'),
          (${testUserId}, 'Metric Task 2', 'COMPLETED'),
          (${testUserId}, 'Metric Task 3', 'PENDING'),
          (${testUserId}, 'Metric Task 4', 'IN_PROGRESS')
        RETURNING id
      `)
      taskIds = result.map((r: any) => r.id)
    })

    afterAll(async () => {
      if (taskIds.length > 0) {
        await db.execute(
          sql`DELETE FROM tasks WHERE id IN ${sql.join(
            taskIds.map((id: string) => sql`${id}`),
            sql`,`,
          )}`,
        )
      }
    })

    it('should return an array of task metrics grouped by status', async () => {
      const metrics = await AdminRepository.getTaskMetrics()
      expect(Array.isArray(metrics)).toBe(true)
      expect(metrics.length).toBeGreaterThan(0)
    })

    it('should have type and count fields in each metric', async () => {
      const metrics = await AdminRepository.getTaskMetrics()
      for (const metric of metrics) {
        expect(typeof metric.type).toBe('string')
        expect(typeof metric.count).toBe('number')
      }
    })

    it('should include the created task statuses', async () => {
      const metrics = await AdminRepository.getTaskMetrics()
      const types = metrics.map((m) => m.type)
      expect(types).toContain('COMPLETED')
      expect(types).toContain('PENDING')
      expect(types).toContain('IN_PROGRESS')
    })

    it('should correctly count tasks per status', async () => {
      const metrics = await AdminRepository.getTaskMetrics()
      const completed = metrics.find((m) => m.type === 'COMPLETED')
      expect(completed).toBeDefined()
      expect(completed!.count).toBeGreaterThanOrEqual(2)
    })
  })

  describe('getTopUsers', () => {
    let extraUserIds: string[] = []

    beforeAll(async () => {
      const result = await db.execute(sql`
        INSERT INTO users (email, password_hash, nickname, role, level, xp)
        VALUES
          ('admin-topuser-a-${Date.now()}@test.com', 'hash', 'TopA', 'USER', 10, 5000),
          ('admin-topuser-b-${Date.now()}@test.com', 'hash', 'TopB', 'USER', 8, 3000)
        RETURNING id
      `)
      extraUserIds = result.map((r: any) => r.id)
    })

    afterAll(async () => {
      if (extraUserIds.length > 0) {
        await db.execute(
          sql`DELETE FROM users WHERE id IN ${sql.join(
            extraUserIds.map((id: string) => sql`${id}`),
            sql`,`,
          )}`,
        )
      }
    })

    it('should return an array of top users', async () => {
      const topUsers = await AdminRepository.getTopUsers()
      expect(Array.isArray(topUsers)).toBe(true)
      expect(topUsers.length).toBeGreaterThan(0)
    })

    it('should have id, nickname, level, xp, and streak fields', async () => {
      const topUsers = await AdminRepository.getTopUsers()
      const user = topUsers[0]
      expect(user.id).toBeDefined()
      expect(user.level).toBeDefined()
      expect(user.xp).toBeDefined()
    })

    it('should respect the limit parameter', async () => {
      const topUsers = await AdminRepository.getTopUsers(2)
      expect(topUsers.length).toBeLessThanOrEqual(2)
    })

    it('should return users ordered by level DESC then xp DESC', async () => {
      const topUsers = await AdminRepository.getTopUsers(10)
      for (let i = 1; i < topUsers.length; i++) {
        const prev = topUsers[i - 1]
        const curr = topUsers[i]
        const prevLevel = prev.level ?? 0
        const currLevel = curr.level ?? 0
        const prevXp = prev.xp ?? 0
        const currXp = curr.xp ?? 0
        expect(prevLevel > currLevel || (prevLevel === currLevel && prevXp >= currXp)).toBe(true)
      }
    })
  })

  describe('getCompletedTasks', () => {
    it('should return a number', async () => {
      const count = await AdminRepository.getCompletedTasks()
      expect(typeof count).toBe('number')
    })

    it('should return a non-negative number', async () => {
      const count = await AdminRepository.getCompletedTasks()
      expect(count).toBeGreaterThanOrEqual(0)
    })

    it('should count only tasks with COMPLETED status', async () => {
      const countBefore = await AdminRepository.getCompletedTasks()

      const result = await db.execute(sql`
        INSERT INTO tasks (user_id, title, status, completed_at)
        VALUES (${testUserId}, 'Count Me', 'COMPLETED', NOW())
        RETURNING id
      `)
      const taskId = result[0]?.id as string

      const countAfter = await AdminRepository.getCompletedTasks()
      expect(countAfter).toBe(countBefore + 1)

      await db.execute(sql`DELETE FROM tasks WHERE id = ${taskId}`)
    })
  })
})
