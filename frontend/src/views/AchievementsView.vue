<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Trophy } from 'lucide-vue-next'
import { Progress } from '@/components/ui/progress'
import AchievementCard from '@/components/AchievementCard.vue'
import { gamificationService } from '@/services/gamification.service'
import type { Achievement } from '@/types'

const achievements = ref<Achievement[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    achievements.value = await gamificationService.getAchievements()
  } catch (error) {
    console.error('Error fetching achievements:', error)
  } finally {
    loading.value = false
  }
})

const unlockedAchievements = computed(() => achievements.value.filter((a) => !!a.unlockedAt))
const lockedAchievements = computed(() => achievements.value.filter((a) => !a.unlockedAt))

const progressValue = computed(() => {
  if (achievements.value.length === 0) return 0
  return Math.round((unlockedAchievements.value.length / achievements.value.length) * 100)
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto space-y-8">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
      <div>
        <div class="flex items-center gap-2 text-primary font-semibold">
          <Trophy class="w-5 h-5 text-yellow-500" />
          <span>Tus recompensas</span>
        </div>
        <h1 class="text-5xl font-black tracking-tight mt-2">Logros</h1>
        <p class="text-muted-foreground mt-2 text-lg">
          Completa tareas, mantén tu racha y sube de nivel para desbloquearlos todos.
        </p>
      </div>

      <div class="w-full lg:w-72 bg-card border rounded-2xl p-4 shadow-sm">
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold text-sm">Progreso total</span>
          <span class="font-black text-primary"
            >{{ unlockedAchievements.length }} / {{ achievements.length }}</span
          >
        </div>
        <Progress :model-value="progressValue" class="h-3" />
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="h-40 bg-muted/30 animate-pulse rounded-3xl"></div>
    </div>

    <div v-else class="space-y-12">
      <!-- Unlocked -->
      <section v-if="unlockedAchievements.length > 0">
        <h2 class="text-2xl font-black mb-6 flex items-center gap-2">
          Desbloqueados
          <span class="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">{{
            unlockedAchievements.length
          }}</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AchievementCard v-for="ach in unlockedAchievements" :key="ach.id" :achievement="ach" />
        </div>
      </section>

      <section v-if="lockedAchievements.length > 0">
        <h2 class="text-2xl font-black mb-6 text-muted-foreground flex items-center gap-2">
          Por descubrir
          <span class="bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full">{{
            lockedAchievements.length
          }}</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AchievementCard v-for="ach in lockedAchievements" :key="ach.id" :achievement="ach" />
        </div>
      </section>
    </div>
  </div>
</template>
