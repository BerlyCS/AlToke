import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  useGamification,
  levelUpData,
  unlockedAchievementsQueue,
  currentAchievement,
  isAchievementModalOpen,
  processAchievementsQueue,
} from '@/composables/useGamification'
import { mockAchievement, mockLockedAchievement } from '../../fixtures'

describe('useGamification composable', () => {
  beforeEach(() => {
    levelUpData.value = { open: false, newLevel: 0 }
    unlockedAchievementsQueue.value = []
    currentAchievement.value = null
    isAchievementModalOpen.value = false
    vi.clearAllMocks()
  })

  it('returns showReward function', () => {
    const { showReward } = useGamification()
    expect(typeof showReward).toBe('function')
  })

  it('showReward with level up sets levelUpData', () => {
    const { showReward } = useGamification()
    showReward(50, 'Test Task', true, 6)
    expect(levelUpData.value.open).toBe(true)
    expect(levelUpData.value.newLevel).toBe(6)
    expect(levelUpData.value.title).toBe('Test Task')
    expect(levelUpData.value.xp).toBe(50)
  })

  it('showReward without level up shows toast', async () => {
    const { toast } = await import('vue-sonner') as any
    const { showReward } = useGamification()
    showReward(50, 'Test Task', false)
    expect(toast.success).toHaveBeenCalledWith('¡Tarea Completada!', expect.any(Object))
  })

  it('showReward queues achievements', () => {
    const { showReward } = useGamification()
    const achievements = [{ ...mockAchievement }]
    showReward(50, 'Task', false, undefined, achievements)
    expect(unlockedAchievementsQueue.value.length).toBe(0)
  })

  it('processAchievementsQueue processes from queue', () => {
    unlockedAchievementsQueue.value = [{ ...mockAchievement }]
    isAchievementModalOpen.value = false
    levelUpData.value = { open: false, newLevel: 0 }
    processAchievementsQueue()
    expect(currentAchievement.value).toEqual(mockAchievement)
    expect(isAchievementModalOpen.value).toBe(true)
  })

  it('processAchievementsQueue does nothing when modal is open', () => {
    unlockedAchievementsQueue.value = [{ ...mockAchievement }]
    isAchievementModalOpen.value = true
    processAchievementsQueue()
    expect(currentAchievement.value).toBeNull()
  })

  it('processAchievementsQueue does nothing when level up modal is open', () => {
    unlockedAchievementsQueue.value = [{ ...mockAchievement }]
    isAchievementModalOpen.value = false
    levelUpData.value = { open: true, newLevel: 5 }
    processAchievementsQueue()
    expect(currentAchievement.value).toBeNull()
  })

  it('processAchievementsQueue does nothing when queue is empty', () => {
    unlockedAchievementsQueue.value = []
    processAchievementsQueue()
    expect(currentAchievement.value).toBeNull()
  })

  it('showReward with leveled up and achievements queues them', () => {
    const { showReward } = useGamification()
    const achievements = [{ ...mockAchievement }]
    showReward(50, 'Task', true, 6, achievements)
    expect(unlockedAchievementsQueue.value.length).toBe(1)
    expect(levelUpData.value.open).toBe(true)
  })
})
