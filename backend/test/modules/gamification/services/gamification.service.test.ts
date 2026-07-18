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
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ currentLevel: savedLevel }),
      )
    })
  })
})
  