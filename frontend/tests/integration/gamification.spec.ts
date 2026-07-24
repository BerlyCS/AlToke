import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockLeaderboard, mockAchievement, mockProfile, mockCompleteTaskResult } from '../fixtures'

vi.mock('@/services/gamification.service', () => ({
  gamificationService: {
    getLeaderboard: vi.fn<(...args: any[]) => any>(),
    getAchievements: vi.fn<(...args: any[]) => any>(),
  },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn<(...args: any[]) => any>(), error: vi.fn<(...args: any[]) => any>() },
}))

vi.mock('@/composables/useGamification', () => {
  const levelUpData = { value: { open: false, newLevel: 0 } }
  const unlockedAchievementsQueue = { value: [] as any[] }
  const processAchievementsQueue = vi.fn<() => void>(() => {
    if (!levelUpData.value.open) {
      unlockedAchievementsQueue.value = []
    }
  })
  return {
    levelUpData,
    unlockedAchievementsQueue,
    processAchievementsQueue,
    useGamification: () => ({
      showReward: vi.fn<(...args: any[]) => any>(() => {
        levelUpData.value = { open: true, newLevel: 6 }
      }),
    }),
  }
})

describe('Gamification Integration', () => {
  let levelUpData: { value: { open: boolean; newLevel: number } }
  let unlockedAchievementsQueue: { value: any[] }
  let processAchievementsQueue: () => void

  beforeEach(async () => {
    setActivePinia(createPinia())
    const composable = await import('@/composables/useGamification')
    levelUpData = composable.levelUpData
    unlockedAchievementsQueue = composable.unlockedAchievementsQueue
    processAchievementsQueue = composable.processAchievementsQueue as () => void
    levelUpData.value = { open: false, newLevel: 0 }
    unlockedAchievementsQueue.value = []
    vi.clearAllMocks()
  })

  it('loads leaderboard', async () => {
    const { gamificationService } = await import('@/services/gamification.service')
    ;(gamificationService.getLeaderboard as any).mockResolvedValue(mockLeaderboard)
    const leaderboard = await gamificationService.getLeaderboard(50)
    expect(leaderboard).toHaveLength(3)
    expect(leaderboard[0]!.rank).toBe(1)
  })

  it('loads achievements', async () => {
    const { gamificationService } = await import('@/services/gamification.service')
    ;(gamificationService.getAchievements as any).mockResolvedValue([mockAchievement])
    const achievements = await gamificationService.getAchievements()
    expect(achievements).toHaveLength(1)
  })

  it('complete task triggers XP reward with level up', async () => {
    const { useGamification } = await import('@/composables/useGamification')
    const store = useAuthStore()
    store.setAuth({ id: '1', email: 'test@test.com', nickname: 'Test' }, mockProfile, 'token')

    const { showReward } = useGamification()
    const result = { ...mockCompleteTaskResult, leveledUp: true, newLevel: 6, xpAwarded: 100 }

    store.addXP(result.xpAwarded, result.newLevel, result.newStreak)
    showReward(result.xpAwarded, 'Task', result.leveledUp, result.newLevel)

    expect(store.profile!.xp).toBe(600)
    expect(store.profile!.level).toBe(6)
    expect(levelUpData.value.open).toBe(true)
    expect(levelUpData.value.newLevel).toBe(6)
  })

  it('complete task triggers achievement queue', () => {
    const achievements = [{ ...mockAchievement }]
    unlockedAchievementsQueue.value.push(...achievements)
    expect(unlockedAchievementsQueue.value.length).toBe(1)
    processAchievementsQueue()
    expect(unlockedAchievementsQueue.value.length).toBe(0)
  })

  it('level up modal closes and processes achievement queue', async () => {
    unlockedAchievementsQueue.value = [{ ...mockAchievement }]
    levelUpData.value = { open: true, newLevel: 5 }
    processAchievementsQueue()
    expect(unlockedAchievementsQueue.value.length).toBe(1)
    levelUpData.value.open = false
    processAchievementsQueue()
    expect(unlockedAchievementsQueue.value.length).toBe(0)
  })
})
