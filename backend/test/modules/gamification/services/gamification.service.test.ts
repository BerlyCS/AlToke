import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { GamificationService } from '../../../../src/modules/gamification/services'
import { GamificationRepository } from '../../../../src/modules/gamification/repositories'
import { FriendshipRepository } from '../../../../src/modules/friendship/repositories/friendship.repository'
import type { UserStats, Achievement } from '../../../../src/modules/gamification/domain/entities'

const repo = (GamificationService as unknown as { repo: GamificationRepository }).repo

const makeUserStats = (overrides: Partial<UserStats> = {}): UserStats => ({
  userId: 'user-1',
  currentLevel: 1,
  totalXp: 0,
  streakCount: 0,
  maxStreak: 0,
  streakFrozenUntil: null,
  overdueHighPriorityCount: 0,
  lastActiveDate: null,
  ...overrides,
})

const makeAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
  id: 'ach-1',
  code: 'xp_5',
  title: 'XP Rookie',
  description: 'Reach level 5',
  isSecret: false,
  requiredXp: 500,
  ...overrides,
})

describe('GamificationService', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('addXP', () => {
    it('returns 0 gained XP when task was not completed on time', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())

      const result = await GamificationService.addXP('user-1', 50, 'HIGH', false)

      expect(result.gainedXp).toBe(0)
      expect(result.leveledUp).toBe(false)
      expect(result.totalXp).toBe(0)
    })

    it('returns 0 gained XP when xpAmount is zero', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())

      const result = await GamificationService.addXP('user-1', 0, 'HIGH', true)

      expect(result.gainedXp).toBe(0)
      expect(result.totalXp).toBe(0)
    })

    it('returns 0 gained XP when xpAmount is negative', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())

      const result = await GamificationService.addXP('user-1', -10, 'HIGH', true)

      expect(result.gainedXp).toBe(0)
    })

    it('returns 0 gained XP with zeroed stats when user does not exist and task not completed on time', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)

      const result = await GamificationService.addXP('missing-user', 50, 'HIGH', false)

      expect(result.gainedXp).toBe(0)
      expect(result.totalXp).toBe(0)
      expect(result.currentLevel).toBe(1)
      expect(result.streakCount).toBe(0)
    })

    it('throws 404 when user does not exist and task completed on time', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)

      try {
        await GamificationService.addXP('missing-user', 50, 'HIGH', true)
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })

    it('awards XP with LOW priority multiplier (1x)', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(0)
      const saveTxSpy = spyOn(repo, 'saveXPTransaction').mockResolvedValue()
      spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.addXP('user-1', 100, 'LOW', true)

      expect(result.gainedXp).toBe(100)
      expect(result.totalXp).toBe(100)
      expect(saveTxSpy).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 100, source: 'task:low' }),
      )
    })

    it('awards XP with MEDIUM priority multiplier (1.15x)', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(0)
      const saveTxSpy = spyOn(repo, 'saveXPTransaction').mockResolvedValue()
      spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.addXP('user-1', 100, 'MEDIUM', true)

      expect(result.gainedXp).toBe(Math.round(100 * 1.15))
      expect(result.totalXp).toBe(Math.round(100 * 1.15))
      expect(saveTxSpy).toHaveBeenCalledWith(
        expect.objectContaining({ amount: Math.round(100 * 1.15), source: 'task:medium' }),
      )
    })

    it('awards XP with HIGH priority multiplier (1.35x)', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(0)
      spyOn(repo, 'saveXPTransaction').mockResolvedValue()
      spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.addXP('user-1', 100, 'HIGH', true)

      expect(result.gainedXp).toBe(Math.round(100 * 1.35))
      expect(result.totalXp).toBe(Math.round(100 * 1.35))
    })

    it('awards XP with URGENT priority multiplier (1.6x)', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(0)
      spyOn(repo, 'saveXPTransaction').mockResolvedValue()
      spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.addXP('user-1', 100, 'URGENT', true)

      expect(result.gainedXp).toBe(Math.round(100 * 1.6))
      expect(result.totalXp).toBe(Math.round(100 * 1.6))
    })

    it('caps XP to daily limit of 500', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(480)
      spyOn(repo, 'saveXPTransaction').mockResolvedValue()
      spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.addXP('user-1', 50, 'HIGH', true)

      expect(result.gainedXp).toBe(20)
      expect(result.totalXp).toBe(20)
    })

    it('returns 0 gained XP when daily cap is already reached', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats({ totalXp: 500 }))
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(500)

      const result = await GamificationService.addXP('user-1', 50, 'HIGH', true)

      expect(result.gainedXp).toBe(0)
      expect(result.totalXp).toBe(500)
    })

    it('detects level up', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ currentLevel: 1, totalXp: 99 }),
      )
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(0)
      spyOn(repo, 'saveXPTransaction').mockResolvedValue()
      spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.addXP('user-1', 1, 'LOW', true)

      expect(result.leveledUp).toBe(true)
      expect(result.currentLevel).toBeGreaterThan(1)
    })

    it('does not level up when XP is insufficient', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ currentLevel: 1, totalXp: 0 }),
      )
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(0)
      spyOn(repo, 'saveXPTransaction').mockResolvedValue()
      spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.addXP('user-1', 1, 'LOW', true)

      expect(result.leveledUp).toBe(false)
      expect(result.currentLevel).toBe(1)
    })

    it('returns current stats from user when not completed on time', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ totalXp: 200, currentLevel: 2, streakCount: 5 }),
      )

      const result = await GamificationService.addXP('user-1', 50, 'HIGH', false)

      expect(result.totalXp).toBe(200)
      expect(result.currentLevel).toBe(2)
      expect(result.streakCount).toBe(5)
    })
  })

  describe('checkDailyXPLimit', () => {
    it('returns full amount when under daily cap', async () => {
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(100)

      const result = await GamificationService.checkDailyXPLimit('user-1', 200)

      expect(result).toBe(200)
    })

    it('returns remaining when request exceeds daily cap', async () => {
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(450)

      const result = await GamificationService.checkDailyXPLimit('user-1', 100)

      expect(result).toBe(50)
    })

    it('returns 0 when daily cap is already reached', async () => {
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(500)

      const result = await GamificationService.checkDailyXPLimit('user-1', 50)

      expect(result).toBe(0)
    })

    it('returns 0 when daily cap is exceeded', async () => {
      spyOn(repo, 'getDailyXPTotal').mockResolvedValue(550)

      const result = await GamificationService.checkDailyXPLimit('user-1', 50)

      expect(result).toBe(0)
    })
  })

  describe('recalculateLevel', () => {
    it('throws 404 when user does not exist', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)

      try {
        await GamificationService.recalculateLevel('missing-user')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('User not found')
      }
    })

    it('recalculates and saves the correct level', async () => {
      const user = makeUserStats({ totalXp: 100 })
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(user)
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      await GamificationService.recalculateLevel('user-1')

      const savedLevel = Math.max(1, Math.floor(Math.sqrt(100 / 25)))
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ currentLevel: savedLevel }))
    })
  })

  describe('verifyStreak', () => {
    it('throws 404 when user does not exist', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)

      try {
        await GamificationService.verifyStreak('missing-user', new Date())
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
      }
    })

    it('sets streak to 1 on first activity', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats({ lastActiveDate: null }))
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.verifyStreak('user-1', new Date())

      expect(result).toBe(1)
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ streakCount: 1 }))
    })

    it('keeps streak unchanged on same day', async () => {
      const today = new Date()
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ streakCount: 5, lastActiveDate: today }),
      )
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.verifyStreak('user-1', new Date())

      expect(result).toBe(5)
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ streakCount: 5 }))
    })

    it('increments streak by 1 on next day', async () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      twoDaysAgo.setHours(10, 0, 0, 0)
      const yesterdayMidnight = new Date()
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
      yesterdayMidnight.setHours(0, 0, 0, 0)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ streakCount: 3, lastActiveDate: twoDaysAgo }),
      )
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.verifyStreak('user-1', yesterdayMidnight)

      expect(result).toBe(4)
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ streakCount: 4 }))
    })

    it('resets streak to 1 when gap exceeds 1 day without freeze', async () => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ streakCount: 10, lastActiveDate: fiveDaysAgo, streakFrozenUntil: null }),
      )
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      const now = new Date()
      const result = await GamificationService.verifyStreak('user-1', now)

      expect(result).toBe(1)
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ streakCount: 1 }))
    })

    it('preserves streak within freeze period', async () => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      const future = new Date()
      future.setDate(future.getDate() + 2)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({
          streakCount: 7,
          lastActiveDate: fiveDaysAgo,
          streakFrozenUntil: future,
        }),
      )
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      const now = new Date()
      const result = await GamificationService.verifyStreak('user-1', now)

      expect(result).toBe(7)
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ streakCount: 7 }))
    })

    it('updates maxStreak when current streak exceeds it', async () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      twoDaysAgo.setHours(10, 0, 0, 0)
      const yesterdayMidnight = new Date()
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
      yesterdayMidnight.setHours(0, 0, 0, 0)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ streakCount: 9, maxStreak: 9, lastActiveDate: twoDaysAgo }),
      )
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      await GamificationService.verifyStreak('user-1', yesterdayMidnight)

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ maxStreak: 10 }))
    })

    it('does not update maxStreak when current streak is lower', async () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      twoDaysAgo.setHours(10, 0, 0, 0)
      const yesterdayMidnight = new Date()
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
      yesterdayMidnight.setHours(0, 0, 0, 0)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ streakCount: 2, maxStreak: 10, lastActiveDate: twoDaysAgo }),
      )
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      await GamificationService.verifyStreak('user-1', yesterdayMidnight)

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ maxStreak: 10 }))
    })

    it('updates lastActiveDate to the completion date', async () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      const yesterdayMidnight = new Date()
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
      yesterdayMidnight.setHours(0, 0, 0, 0)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ streakCount: 1, lastActiveDate: twoDaysAgo }),
      )
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      await GamificationService.verifyStreak('user-1', yesterdayMidnight)

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ lastActiveDate: yesterdayMidnight }),
      )
    })
  })

  describe('checkOverdueHighPriorityTasks', () => {
    it('throws 404 when user does not exist', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)

      try {
        await GamificationService.checkOverdueHighPriorityTasks('missing-user')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
      }
    })

    it('saves the overdue count from repository', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      spyOn(repo, 'countOverdueHighPriorityTasks').mockResolvedValue(3)
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      await GamificationService.checkOverdueHighPriorityTasks('user-1')

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ overdueHighPriorityCount: 3 }))
    })
  })

  describe('resetStreak', () => {
    it('throws 404 when user does not exist', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)

      try {
        await GamificationService.resetStreak('missing-user')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
      }
    })

    it('resets streak count to 0 and clears freeze', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ streakCount: 10, streakFrozenUntil: new Date() }),
      )
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      await GamificationService.resetStreak('user-1')

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ streakCount: 0, streakFrozenUntil: null }),
      )
    })
  })

  describe('freezeStreak', () => {
    it('throws 404 when user does not exist', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)

      try {
        await GamificationService.freezeStreak('missing-user', 'item-1')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
      }
    })

    it('throws 404 when item does not exist', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      spyOn(repo, 'findItemById').mockResolvedValue(null as any)

      try {
        await GamificationService.freezeStreak('user-1', 'missing-item')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('Item not found')
      }
    })

    it('sets streakFrozenUntil to next day', async () => {
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      spyOn(repo, 'findItemById').mockResolvedValue({
        id: 'item-1',
        code: 'freeze',
        name: 'Freeze',
        itemType: 'CONSUMABLE',
        effect: null,
        assetUrl: null,
      } as any)
      const saveSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      await GamificationService.freezeStreak('user-1', 'item-1')

      const savedStats = saveSpy.mock.calls[0][0] as unknown as UserStats
      const frozenUntil = savedStats.streakFrozenUntil as Date
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      expect(frozenUntil.getTime()).toBe(tomorrow.getTime())
    })
  })

  describe('triggerAchievement', () => {
    it('returns null when achievement code does not exist', async () => {
      spyOn(repo, 'findAchievementByCode').mockResolvedValue(null)

      const result = await GamificationService.triggerAchievement('user-1', 'nonexistent')

      expect(result).toBeNull()
    })

    it('throws 404 when user does not exist', async () => {
      spyOn(repo, 'findAchievementByCode').mockResolvedValue(makeAchievement())
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)

      try {
        await GamificationService.triggerAchievement('missing-user', 'xp_5')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
      }
    })

    it('returns null when user has insufficient XP', async () => {
      spyOn(repo, 'findAchievementByCode').mockResolvedValue(makeAchievement({ requiredXp: 500 }))
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats({ totalXp: 100 }))

      const result = await GamificationService.triggerAchievement('user-1', 'xp_5')

      expect(result).toBeNull()
    })

    it('returns null when achievement is already unlocked', async () => {
      spyOn(repo, 'findAchievementByCode').mockResolvedValue(makeAchievement({ requiredXp: 100 }))
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats({ totalXp: 200 }))
      spyOn(repo, 'unlockAchievement').mockResolvedValue(false)

      const result = await GamificationService.triggerAchievement('user-1', 'xp_5')

      expect(result).toBeNull()
    })

    it('returns achievement when newly unlocked', async () => {
      const ach = makeAchievement({ requiredXp: 100 })
      spyOn(repo, 'findAchievementByCode').mockResolvedValue(ach)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats({ totalXp: 200 }))
      spyOn(repo, 'unlockAchievement').mockResolvedValue(true)

      const result = await GamificationService.triggerAchievement('user-1', 'xp_5')

      expect(result).toEqual(ach)
    })

    it('calls unlockAchievement with correct ids', async () => {
      const ach = makeAchievement({ id: 'ach-42', requiredXp: 0 })
      spyOn(repo, 'findAchievementByCode').mockResolvedValue(ach)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats({ totalXp: 10 }))
      const unlockSpy = spyOn(repo, 'unlockAchievement').mockResolvedValue(true)

      await GamificationService.triggerAchievement('user-1', 'xp_5')

      expect(unlockSpy).toHaveBeenCalledWith('user-1', 'ach-42')
    })
  })

  describe('getGlobalLeaderboard', () => {
    it('delegates to repository with default limit of 10', async () => {
      const leaderboard = [
        {
          userId: 'u1',
          rank: 1,
          totalXp: 500,
          nickname: null,
          avatarUrl: null,
          currentLevel: 1,
          streakCount: 0,
          maxStreak: 0,
        },
      ]
      const spy = spyOn(repo, 'getTopUsersByXp').mockResolvedValue(leaderboard as never)

      const result = await GamificationService.getGlobalLeaderboard()

      expect(spy).toHaveBeenCalledWith(10)
      expect(result).toEqual(leaderboard)
    })

    it('passes custom limit to repository', async () => {
      const spy = spyOn(repo, 'getTopUsersByXp').mockResolvedValue([])

      await GamificationService.getGlobalLeaderboard(5)

      expect(spy).toHaveBeenCalledWith(5)
    })
  })

  describe('getFriendsLeaderboard', () => {
    it('combines friends and current user, sorted by XP descending', async () => {
      spyOn(FriendshipRepository, 'getFriends').mockResolvedValue([
        {
          friendshipId: 'f1',
          friend: {
            id: 'friend-1',
            nickname: 'Alice',
            avatarUrl: null,
            level: 3,
            xp: 300,
            currentStreak: 2,
          },
        },
      ] as never)
      spyOn(repo, 'findStatsByUserId')
        .mockResolvedValueOnce(
          makeUserStats({
            userId: 'user-1',
            totalXp: 500,
            currentLevel: 4,
            streakCount: 5,
            maxStreak: 7,
          }),
        )
        .mockResolvedValueOnce(makeUserStats())
      spyOn(repo, 'findUserById').mockResolvedValue({
        id: 'user-1',
        nickname: 'Bob',
        avatarUrl: null,
      } as never)

      const result = await GamificationService.getFriendsLeaderboard('user-1')

      expect(result).toHaveLength(2)
      expect(result[0].userId).toBe('user-1')
      expect(result[0].rank).toBe(1)
      expect(result[0].totalXp).toBe(500)
      expect(result[1].userId).toBe('friend-1')
      expect(result[1].rank).toBe(2)
    })

    it('returns only current user when no friends', async () => {
      spyOn(FriendshipRepository, 'getFriends').mockResolvedValue([] as never)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(
        makeUserStats({ userId: 'user-1', totalXp: 100 }),
      )
      spyOn(repo, 'findUserById').mockResolvedValue({ id: 'user-1', nickname: 'Bob' } as never)

      const result = await GamificationService.getFriendsLeaderboard('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].userId).toBe('user-1')
      expect(result[0].rank).toBe(1)
    })

    it('handles missing current user stats gracefully', async () => {
      spyOn(FriendshipRepository, 'getFriends').mockResolvedValue([
        {
          friendshipId: 'f1',
          friend: {
            id: 'friend-1',
            nickname: 'Alice',
            avatarUrl: null,
            level: 2,
            xp: 200,
            currentStreak: 1,
          },
        },
      ] as never)
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(null)
      spyOn(repo, 'findUserById').mockResolvedValue(null as any)

      const result = await GamificationService.getFriendsLeaderboard('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].userId).toBe('friend-1')
    })
  })

  describe('getAllAchievements', () => {
    it('returns all achievements with unlockedAt for unlocked ones', async () => {
      const ach1 = makeAchievement({ id: 'ach-1', code: 'first_login' })
      const ach2 = makeAchievement({ id: 'ach-2', code: 'tasks_10', title: 'Task Master' })
      spyOn(repo, 'listAchievements').mockResolvedValue([ach1, ach2])
      spyOn(repo, 'findUnlockedAchievements').mockResolvedValue([
        {
          achievement: ach1,
          unlockedAt: new Date('2026-01-15T10:00:00.000Z'),
        },
      ])

      const result = await GamificationService.getAllAchievements('user-1')

      expect(result).toHaveLength(2)
      expect(result[0].unlockedAt).toBe('2026-01-15T10:00:00.000Z')
      expect(result[1].unlockedAt).toBeUndefined()
    })

    it('returns empty array when no achievements exist', async () => {
      spyOn(repo, 'listAchievements').mockResolvedValue([])
      spyOn(repo, 'findUnlockedAchievements').mockResolvedValue([])

      const result = await GamificationService.getAllAchievements('user-1')

      expect(result).toEqual([])
    })
  })

  describe('getInventory', () => {
    it('returns items from inventory', async () => {
      const items = [
        {
          id: 'item-1',
          code: 'freeze_potion',
          name: 'Freeze Potion',
          itemType: 'CONSUMABLE',
          effect: 'FREEZE_STREAK',
          assetUrl: null,
          quantity: 2,
          isEquipped: false,
        },
      ]
      spyOn(repo, 'findInventoryByUserId').mockResolvedValue({ userId: 'user-1', items })

      const result = await GamificationService.getInventory('user-1')

      expect(result).toEqual(items)
    })

    it('returns empty array when user has no inventory', async () => {
      spyOn(repo, 'findInventoryByUserId').mockResolvedValue(null)

      const result = await GamificationService.getInventory('user-1')

      expect(result).toEqual([])
    })
  })

  describe('useItem', () => {
    it('throws 404 when item does not exist', async () => {
      spyOn(repo, 'findItemById').mockResolvedValue(null as any)

      try {
        await GamificationService.useItem('user-1', 'missing-item')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('Item not found')
      }
    })

    it('throws 404 when item is not in inventory', async () => {
      spyOn(repo, 'findItemById').mockResolvedValue({
        id: 'item-1',
        code: 'test',
        name: 'Test',
        itemType: 'CONSUMABLE',
        effect: null,
        assetUrl: null,
      } as any)
      spyOn(repo, 'consumeInventoryItem').mockResolvedValue(null)

      try {
        await GamificationService.useItem('user-1', 'item-1')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('Item not found in inventory')
      }
    })

    it('consumes a regular item without triggering freeze', async () => {
      spyOn(repo, 'findItemById').mockResolvedValue({
        id: 'item-1',
        code: 'boost',
        name: 'Boost',
        itemType: 'CONSUMABLE',
        effect: 'BOOST_XP',
        assetUrl: null,
      } as any)
      const consumeSpy = spyOn(repo, 'consumeInventoryItem').mockResolvedValue({
        userId: 'user-1',
        itemId: 'item-1',
        remainingQuantity: 1,
        appliedEffect: 'BOOST_XP',
      })

      const result = await GamificationService.useItem('user-1', 'item-1')

      expect(result.remainingQuantity).toBe(1)
      expect(result.appliedEffect).toBe('BOOST_XP')
      expect(consumeSpy).toHaveBeenCalledWith('user-1', 'item-1')
    })

    it('consumes a FREEZE item and triggers streak freeze', async () => {
      spyOn(repo, 'findItemById')
        .mockResolvedValueOnce({
          id: 'item-1',
          code: 'freeze',
          name: 'Freeze',
          itemType: 'CONSUMABLE',
          effect: 'FREEZE_STREAK',
          assetUrl: null,
        } as any)
        .mockResolvedValueOnce({
          id: 'item-1',
          code: 'freeze',
          name: 'Freeze',
          itemType: 'CONSUMABLE',
          effect: 'FREEZE_STREAK',
          assetUrl: null,
        } as any)
      spyOn(repo, 'consumeInventoryItem').mockResolvedValue({
        userId: 'user-1',
        itemId: 'item-1',
        remainingQuantity: 0,
        appliedEffect: 'FREEZE_STREAK',
      })
      spyOn(repo, 'findStatsByUserId').mockResolvedValue(makeUserStats())
      const saveStatsSpy = spyOn(repo, 'saveStats').mockResolvedValue()

      const result = await GamificationService.useItem('user-1', 'item-1')

      expect(result.appliedEffect).toBe('FREEZE_STREAK')
      expect(saveStatsSpy).toHaveBeenCalled()
    })
  })
})
