import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { AdminService } from '../../../../../src/modules/admin/services'
import { AdminRepository } from '../../../../../src/modules/admin/repositories'
import type { InferSelectModel } from 'drizzle-orm'
import { users } from '../../../../../src/db/schema'

type UserRow = InferSelectModel<typeof users>

const makeUserRow = (overrides: Partial<UserRow> = {}): UserRow => ({
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hash',
  role: 'USER',
  nickname: 'TestUser',
  bio: 'Hello',
  avatarUrl: 'https://example.com/avatar.png',
  xp: 1000,
  level: 5,
  currentStreak: 0,
  maxStreak: 0,
  streakFrozenUntil: null,
  overdueHighPriorityCount: 0,
  lastActiveAt: new Date('2026-07-01'),
  createdAt: new Date('2026-01-01'),
  ...overrides,
})

describe('AdminService', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('banUser', () => {
    it('bans an existing user successfully', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(makeUserRow())
      spyOn(AdminRepository, 'isUserBanned').mockResolvedValue(false)
      const banSpy = spyOn(AdminRepository, 'banUser').mockResolvedValue(
        makeUserRow({ role: 'BANNED' }),
      )

      const result = await AdminService.banUser('user-1', { reason: 'Spam' })

      expect(result.success).toBe(true)
      expect(result.userId).toBe('user-1')
      expect(result.message).toContain('banned')
      expect(banSpy).toHaveBeenCalledWith('user-1', 'Spam')
    })

    it('throws when user does not exist', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(null as any)

      try {
        await AdminService.banUser('ghost', { reason: 'Test' })
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User not found')
      }
    })

    it('throws when user is already banned', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(makeUserRow({ role: 'BANNED' }))
      spyOn(AdminRepository, 'isUserBanned').mockResolvedValue(true)

      try {
        await AdminService.banUser('user-1', { reason: 'Double ban' })
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User is already banned')
      }
    })
  })

  describe('unbanUser', () => {
    it('unbans an existing user successfully', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(makeUserRow({ role: 'BANNED' }))
      const unbanSpy = spyOn(AdminRepository, 'unbanUser').mockResolvedValue(
        makeUserRow({ role: 'USER' }),
      )

      const result = await AdminService.unbanUser('user-1')

      expect(result.success).toBe(true)
      expect(result.userId).toBe('user-1')
      expect(result.message).toContain('unbanned')
      expect(unbanSpy).toHaveBeenCalledWith('user-1')
    })

    it('throws when user does not exist', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(null as any)

      try {
        await AdminService.unbanUser('ghost')
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User not found')
      }
    })
  })

  describe('moderateProfile', () => {
    it('updates nickname only', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(makeUserRow())
      const updateSpy = spyOn(AdminRepository, 'updateUserProfile').mockResolvedValue(
        makeUserRow({ nickname: 'Cleaned' }),
      )

      const result = await AdminService.moderateProfile('user-1', {
        nickname: 'Cleaned',
        reason: 'Inappropriate',
      })

      expect(result.success).toBe(true)
      expect(result.userId).toBe('user-1')
      expect(updateSpy).toHaveBeenCalledWith('user-1', { nickname: 'Cleaned' })
    })

    it('updates bio and avatarUrl', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(makeUserRow())
      const updateSpy = spyOn(AdminRepository, 'updateUserProfile').mockResolvedValue(makeUserRow())

      await AdminService.moderateProfile('user-1', {
        bio: 'New bio',
        avatarUrl: 'https://example.com/new.png',
        reason: 'Policy violation',
      })

      expect(updateSpy).toHaveBeenCalledWith('user-1', {
        bio: 'New bio',
        avatarUrl: 'https://example.com/new.png',
      })
    })

    it('updates multiple fields at once', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(makeUserRow())
      const updateSpy = spyOn(AdminRepository, 'updateUserProfile').mockResolvedValue(makeUserRow())

      await AdminService.moderateProfile('user-1', {
        nickname: 'X',
        bio: 'Y',
        avatarUrl: 'Z',
        reason: 'Full reset',
      })

      expect(updateSpy).toHaveBeenCalledWith('user-1', {
        nickname: 'X',
        bio: 'Y',
        avatarUrl: 'Z',
      })
    })

    it('sends empty updates when only reason is provided', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(makeUserRow())
      const updateSpy = spyOn(AdminRepository, 'updateUserProfile').mockResolvedValue(makeUserRow())

      const result = await AdminService.moderateProfile('user-1', {
        reason: 'Warning only',
      })

      expect(result.success).toBe(true)
      expect(updateSpy).toHaveBeenCalledWith('user-1', {})
    })

    it('throws when user does not exist', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(null as any)

      try {
        await AdminService.moderateProfile('ghost', { reason: 'Test' })
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User not found')
      }
    })
  })

  describe('getUserSummary', () => {
    it('returns user summary with date strings', async () => {
      const lastActive = new Date('2026-07-15T10:00:00.000Z')
      const created = new Date('2026-01-01T00:00:00.000Z')
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(
        makeUserRow({ lastActiveAt: lastActive, createdAt: created }),
      )

      const summary = await AdminService.getUserSummary('user-1')

      expect(summary.userId).toBe('user-1')
      expect(summary.nickname).toBe('TestUser')
      expect(summary.level).toBe(5)
      expect(summary.xp).toBe(1000)
      expect(summary.lastActiveAt).toBe(lastActive.toISOString())
      expect(summary.createdAt).toBe(created.toISOString())
    })

    it('handles null lastActiveAt', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(makeUserRow({ lastActiveAt: null }))

      const summary = await AdminService.getUserSummary('user-1')

      expect(summary.lastActiveAt).toBeUndefined()
    })

    it('throws when user does not exist', async () => {
      spyOn(AdminRepository, 'getUserById').mockResolvedValue(null as any)

      try {
        await AdminService.getUserSummary('ghost')
        expect.unreachable()
      } catch (error) {
        expect((error as Error).message).toBe('User not found')
      }
    })
  })

  describe('listUsers', () => {
    it('returns paginated users with metadata', async () => {
      const users = [
        makeUserRow({ id: 'u-1', email: 'a@test.com' }),
        makeUserRow({ id: 'u-2', email: 'b@test.com' }),
      ]
      spyOn(AdminRepository, 'getAllUsers').mockResolvedValue(users as any)
      spyOn(AdminRepository, 'getTotalUsersCount').mockResolvedValue(50)

      const result = await AdminService.listUsers(10, 0)

      expect(result.users).toHaveLength(2)
      expect(result.total).toBe(50)
      expect(result.limit).toBe(10)
      expect(result.offset).toBe(0)
      expect(result.users[0].id).toBe('u-1')
      expect(result.users[0].email).toBe('a@test.com')
    })

    it('maps user fields correctly (no passwordHash)', async () => {
      spyOn(AdminRepository, 'getAllUsers').mockResolvedValue([makeUserRow()] as any)
      spyOn(AdminRepository, 'getTotalUsersCount').mockResolvedValue(1)

      const result = await AdminService.listUsers()

      const user = result.users[0]
      expect(user.id).toBe('user-1')
      expect(user.email).toBe('test@example.com')
      expect(user.nickname).toBe('TestUser')
      expect(user.role).toBe('USER')
      expect(user.level).toBe(5)
      expect(user.xp).toBe(1000)
      expect(user.lastActiveAt).toBeDefined()
      expect(user.createdAt).toBeDefined()
      expect((user as any).passwordHash).toBeUndefined()
    })

    it('defaults to limit 10 and offset 0', async () => {
      const getAllSpy = spyOn(AdminRepository, 'getAllUsers').mockResolvedValue([])
      spyOn(AdminRepository, 'getTotalUsersCount').mockResolvedValue(0)

      await AdminService.listUsers()

      expect(getAllSpy).toHaveBeenCalledWith(10, 0)
    })

    it('returns empty list when no users', async () => {
      spyOn(AdminRepository, 'getAllUsers').mockResolvedValue([])
      spyOn(AdminRepository, 'getTotalUsersCount').mockResolvedValue(0)

      const result = await AdminService.listUsers(10, 0)

      expect(result.users).toEqual([])
      expect(result.total).toBe(0)
    })

    it('converts lastActiveAt to ISO string', async () => {
      const lastActive = new Date('2026-07-10T12:00:00.000Z')
      spyOn(AdminRepository, 'getAllUsers').mockResolvedValue([
        makeUserRow({ lastActiveAt: lastActive }),
      ] as any)
      spyOn(AdminRepository, 'getTotalUsersCount').mockResolvedValue(1)

      const result = await AdminService.listUsers()

      expect(result.users[0].lastActiveAt).toBe(lastActive.toISOString())
    })
  })

  describe('getSystemMetrics', () => {
    it('returns all metric fields', async () => {
      spyOn(AdminRepository, 'getTotalUsersCount').mockResolvedValue(100)
      spyOn(AdminRepository, 'getActiveDailyUsers').mockResolvedValue(25)
      spyOn(AdminRepository, 'getTasksCompletedToday').mockResolvedValue(12)
      spyOn(AdminRepository, 'getTotalTasksCount').mockResolvedValue(500)

      const metrics = await AdminService.getSystemMetrics()

      expect(metrics.totalUsers).toBe(100)
      expect(metrics.activeUsersDaily).toBe(25)
      expect(metrics.tasksCompletedToday).toBe(12)
      expect(metrics.totalTasks).toBe(500)
    })

    it('calls all four repository methods in parallel', async () => {
      const spies = [
        spyOn(AdminRepository, 'getTotalUsersCount').mockResolvedValue(0),
        spyOn(AdminRepository, 'getActiveDailyUsers').mockResolvedValue(0),
        spyOn(AdminRepository, 'getTasksCompletedToday').mockResolvedValue(0),
        spyOn(AdminRepository, 'getTotalTasksCount').mockResolvedValue(0),
      ]

      await AdminService.getSystemMetrics()

      for (const spy of spies) {
        expect(spy).toHaveBeenCalledTimes(1)
      }
    })

    it('returns zero values when repository returns zeros', async () => {
      spyOn(AdminRepository, 'getTotalUsersCount').mockResolvedValue(0)
      spyOn(AdminRepository, 'getActiveDailyUsers').mockResolvedValue(0)
      spyOn(AdminRepository, 'getTasksCompletedToday').mockResolvedValue(0)
      spyOn(AdminRepository, 'getTotalTasksCount').mockResolvedValue(0)

      const metrics = await AdminService.getSystemMetrics()

      expect(metrics.totalUsers).toBe(0)
      expect(metrics.activeUsersDaily).toBe(0)
      expect(metrics.tasksCompletedToday).toBe(0)
      expect(metrics.totalTasks).toBe(0)
    })
  })
})
