import { ref } from 'vue'
import { toast } from 'vue-sonner'

export const levelUpData = ref<{ open: boolean; newLevel: number; title?: string; xp?: number }>({
  open: false,
  newLevel: 0
})

export function useGamification() {
  const showReward = (xp: number, title: string, leveledUp: boolean, newLevel?: number) => {
    if (leveledUp && newLevel) {
      levelUpData.value = { open: true, newLevel, title, xp }
    } else {
      toast.success('¡Tarea Completada!', {
        description: `Completaste: "${title}"\n¡Ganaste +${xp} XP!`,
        duration: 4000,
      })
    }
  }

  return { showReward }
}
