import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Achievement } from '@/types'

export const levelUpData = ref<{ open: boolean; newLevel: number; title?: string; xp?: number }>({
  open: false,
  newLevel: 0,
})

export const unlockedAchievementsQueue = ref<Achievement[]>([])
export const currentAchievement = ref<Achievement | null>(null)
export const isAchievementModalOpen = ref(false)

export const processAchievementsQueue = () => {
  if (
    unlockedAchievementsQueue.value.length > 0 &&
    !isAchievementModalOpen.value &&
    !levelUpData.value.open
  ) {
    currentAchievement.value = unlockedAchievementsQueue.value.shift() || null
    if (currentAchievement.value) {
      isAchievementModalOpen.value = true
    }
  }
}

export function useGamification() {
  const showReward = (
    xp: number,
    title: string,
    leveledUp: boolean,
    newLevel?: number,
    unlockedAchievements?: Achievement[],
  ) => {
    if (unlockedAchievements && unlockedAchievements.length > 0) {
      unlockedAchievementsQueue.value.push(...unlockedAchievements)
    }

    if (leveledUp && newLevel) {
      levelUpData.value = { open: true, newLevel, title, xp }
    } else {
      toast.success('¡Tarea Completada!', {
        description: `Completaste: "${title}"\n¡Ganaste +${xp} XP!`,
        duration: 4000,
      })
      processAchievementsQueue()
    }
  }

  return { showReward, processAchievementsQueue }
}
