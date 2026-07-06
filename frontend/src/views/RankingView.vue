<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Trophy, Zap, Flame, Users, Globe } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { gamificationService } from '@/services/gamification.service'
import { useAuthStore } from '@/stores/auth'
import type { LeaderboardEntry } from '@/types'

const authStore = useAuthStore()
const leaderboard = ref<LeaderboardEntry[]>([])
const loading = ref(true)

const currentMode = ref<'global' | 'friends'>('global')

onMounted(async () => {
  try {
    leaderboard.value = await gamificationService.getLeaderboard(50)
  } catch (error) {
    console.error('Failed to load leaderboard', error)
  } finally {
    loading.value = false
  }
})

// Current user stats
const userRank = computed(() => {
  const entry = leaderboard.value.find(u => u.userId === authStore.profile?.id)
  return entry ? entry.rank : '>50'
})

const currentUserEntry = computed(() => leaderboard.value.find(u => u.userId === authStore.profile?.id))

const userXp = computed(() => currentUserEntry.value?.totalXp ?? authStore.profile?.xp ?? 0)
const userLevel = computed(() => currentUserEntry.value?.currentLevel ?? authStore.profile?.level ?? 1)
const userStreak = computed(() => currentUserEntry.value?.streakCount ?? authStore.profile?.currentStreak ?? 0)

const currentLevelBaseXp = computed(() => userLevel.value === 1 ? 0 : Math.pow(userLevel.value, 2) * 25)
const nextLevelXp = computed(() => Math.pow(userLevel.value + 1, 2) * 25)
const userXpProgress = computed(() => {
  const current = userXp.value - currentLevelBaseXp.value;
  const target = nextLevelXp.value - currentLevelBaseXp.value;
  return Math.max(0, Math.min(100, (current / target) * 100));
})

const top3 = computed(() => leaderboard.value.slice(0, 3))

const secondPlace = computed(() => top3.value[1])
const firstPlace = computed(() => top3.value[0])
const thirdPlace = computed(() => top3.value[2])

</script>

<template>
  <div class="h-full flex flex-col p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-10 pb-20">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black tracking-tight flex items-center gap-3">
          Ranking <Trophy class="w-8 h-8 text-yellow-500" />
        </h1>
        <p class="text-muted-foreground mt-2 text-lg">Completa tareas, gana xp, y escala posiciones</p>
      </div>
      <div class="flex gap-2">
        <Button 
          :variant="currentMode === 'friends' ? 'default' : 'outline'" 
          @click="currentMode = 'friends'"
          class="font-bold rounded-full px-6"
        >
          <Users class="w-4 h-4 mr-2" />
          Amigos
        </Button>
        <Button 
          :variant="currentMode === 'global' ? 'default' : 'outline'" 
          @click="currentMode = 'global'"
          class="font-bold rounded-full px-6"
        >
          <Globe class="w-4 h-4 mr-2" />
          Temporada actual
        </Button>
      </div>
    </div>

    <!-- 3 Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1 (Tu Posición) -->
      <Card class="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20 relative overflow-hidden">
        <div class="absolute right-0 top-0 opacity-10 scale-150 translate-x-4 -translate-y-4">
          <Trophy class="w-32 h-32" />
        </div>
        <CardContent class="p-6 flex flex-col h-full relative z-10">
          <div class="flex justify-between items-start mb-6">
            <div>
              <span class="text-sm font-bold uppercase tracking-wider opacity-90">Tu posición</span>
              <div class="text-5xl font-black mt-1">#{{ userRank }}</div>
            </div>
            <Trophy class="w-8 h-8 text-yellow-300 drop-shadow-md" />
          </div>
          <div class="mt-auto space-y-4">
            <div>
              <div class="flex justify-between text-xs font-bold opacity-90 mb-2">
                <span>XP Total</span>
                <span>{{ userXp }} / {{ nextLevelXp }}</span>
              </div>
              <Progress :model-value="userXpProgress" class="h-2.5 bg-primary-foreground/20 [&>div]:bg-white" />
            </div>
            <div class="flex items-center gap-3 pt-2">
              <img :src="authStore.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authStore.profile?.nickname || 'Jugador'}`" alt="Avatar" class="w-10 h-10 rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/10" />
              <div class="flex flex-col">
                <span class="font-bold text-sm">{{ authStore.profile?.nickname || 'Jugador' }}</span>
                <span class="text-xs font-semibold opacity-90">Nivel {{ userLevel }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Card 2 (Nivel Actual) -->
      <Card class="shadow-sm hover:shadow-md transition-shadow">
        <CardContent class="p-6 flex flex-col h-full">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-sm font-bold text-muted-foreground uppercase tracking-wider">Nivel actual</span>
              <div class="text-5xl font-black mt-1">{{ userLevel }}</div>
            </div>
            <div class="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Zap class="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div class="mt-auto pt-6">
            <div class="flex justify-between text-xs font-bold text-muted-foreground mb-2">
              <span>Progreso al prox nivel</span>
              <span>{{ userXpProgress.toFixed(0) }}%</span>
            </div>
            <Progress :model-value="userXpProgress" class="h-2.5" />
          </div>
        </CardContent>
      </Card>

      <!-- Card 3 (Racha Actual) -->
      <Card class="shadow-sm hover:shadow-md transition-shadow border-orange-200 dark:border-orange-900/30">
        <CardContent class="p-6 flex flex-col h-full bg-gradient-to-br from-card to-orange-50 dark:to-orange-950/10">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Racha actual</span>
              <div class="text-5xl font-black mt-1 text-foreground flex items-baseline gap-2">
                {{ userStreak }} <span class="text-lg text-muted-foreground font-semibold">días</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Flame class="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div class="mt-auto pt-6">
             <p class="text-sm font-medium text-muted-foreground leading-snug">¡Completa tareas todos los días para no perder tu racha y ganar multiplicadores!</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Top Jugadores -->
    <div class="mt-8 space-y-8" v-if="currentMode === 'global'">
      <div class="text-center">
        <h2 class="text-3xl font-black tracking-tight">Top Jugadores</h2>
        <p class="text-muted-foreground mt-2">Los usuarios más productivos de la semana</p>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
         <div class="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>

      <!-- Podium Layout -->
      <div v-else-if="leaderboard.length >= 1" class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-12 max-w-4xl mx-auto">
        <!-- 2nd Place -->
        <Card v-if="secondPlace" class="relative text-center shadow-md bg-gradient-to-t from-gray-50 to-card dark:from-gray-900/20 transform md:-translate-y-8 mt-6 md:mt-0">
          <CardContent class="pt-8 pb-6 px-4 flex flex-col items-center">
            <div class="relative mb-4">
              <img :src="secondPlace.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${secondPlace.nickname || 'User2'}`" class="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 bg-muted object-cover" />
              <div class="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-black flex items-center justify-center rounded-full text-base shadow-lg border-2 border-white dark:border-gray-800 z-10">2</div>
            </div>
            <span class="font-bold text-lg line-clamp-1">{{ secondPlace.nickname || 'Anónimo' }}</span>
            <span class="text-sm font-semibold text-muted-foreground mb-4">Nivel {{ secondPlace.currentLevel }}</span>
            <div class="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 w-full">
              <span class="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Total XP</span>
              <span class="block text-xl font-black text-foreground">{{ secondPlace.totalXp }}</span>
            </div>
          </CardContent>
        </Card>
        <div v-else></div>

        <!-- 1st Place -->
        <Card v-if="firstPlace" class="relative text-center shadow-xl shadow-yellow-500/10 bg-gradient-to-t from-yellow-50 to-card dark:from-yellow-950/20 border-yellow-200 dark:border-yellow-900/50 z-10 transform scale-105 mt-6 md:mt-0">
          <CardContent class="pt-10 pb-8 px-4 flex flex-col items-center">
            <div class="relative mb-4">
              <div class="absolute -top-6 inset-x-0 flex justify-center text-yellow-500 z-10"><Trophy class="w-8 h-8" /></div>
              <img :src="firstPlace.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstPlace.nickname || 'User1'}`" class="w-28 h-28 rounded-full border-4 border-yellow-400 bg-muted object-cover shadow-lg shadow-yellow-500/20 relative z-0" />
              <div class="absolute top-0 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 font-black flex items-center justify-center rounded-full text-xl shadow-xl shadow-yellow-500/30 border-2 border-card animate-pulse z-20">1</div>
            </div>
            <span class="font-black text-2xl line-clamp-1 text-foreground">{{ firstPlace.nickname || 'Anónimo' }}</span>
            <span class="text-sm font-bold text-yellow-600 dark:text-yellow-500 mb-6 uppercase tracking-wider">Nivel {{ firstPlace.currentLevel }}</span>
            <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-950/40 px-5 py-3 rounded-xl border border-yellow-300 dark:border-yellow-700/50 w-full shadow-inner">
              <span class="block text-xs font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-500 mb-1">XP Lograda</span>
              <span class="block text-3xl font-black text-yellow-900 dark:text-yellow-400">{{ firstPlace.totalXp }}</span>
            </div>
          </CardContent>
        </Card>
        <div v-else></div>

        <!-- 3rd Place -->
        <Card v-if="thirdPlace" class="relative text-center shadow-md bg-gradient-to-t from-orange-50 to-card dark:from-orange-950/10 transform md:-translate-y-8 border-orange-100 dark:border-orange-900/30 mt-6 md:mt-0">
          <CardContent class="pt-8 pb-6 px-4 flex flex-col items-center">
            <div class="relative mb-4">
              <img :src="thirdPlace.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thirdPlace.nickname || 'User3'}`" class="w-20 h-20 rounded-full border-4 border-orange-300 dark:border-orange-700 bg-muted object-cover" />
              <div class="absolute -top-2 -right-2 w-8 h-8 bg-orange-300 dark:bg-orange-700 text-orange-950 dark:text-orange-50 font-black flex items-center justify-center rounded-full text-base shadow-lg border-2 border-white dark:border-gray-800 z-10">3</div>
            </div>
            <span class="font-bold text-lg line-clamp-1">{{ thirdPlace.nickname || 'Anónimo' }}</span>
            <span class="text-sm font-semibold text-muted-foreground mb-4">Nivel {{ thirdPlace.currentLevel }}</span>
            <div class="bg-orange-50 dark:bg-orange-950/30 px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-900/50 w-full">
              <span class="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Total XP</span>
              <span class="block text-xl font-black text-foreground">{{ thirdPlace.totalXp }}</span>
            </div>
          </CardContent>
        </Card>
        <div v-else></div>
      </div>

      <!-- Tabla de Posiciones -->
      <Card class="rounded-2xl overflow-hidden border shadow-sm mt-12 max-w-5xl mx-auto">
        <CardHeader class="bg-muted/50 border-b pb-4">
          <CardTitle>Tabla de posiciones</CardTitle>
          <CardDescription>Clasificación completa de todos los jugadores</CardDescription>
        </CardHeader>
        <CardContent class="p-0">
          <div class="max-h-[500px] overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-card z-10 border-b shadow-sm">
                <tr>
                  <th class="px-6 py-4 text-xs font-bold uppercase text-muted-foreground w-20 text-center">Rango</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Jugador</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase text-muted-foreground w-32 text-center">Racha</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase text-muted-foreground text-right">XP</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr 
                  v-for="user in leaderboard" 
                  :key="user.userId"
                  :class="[
                    'hover:bg-muted/50 transition-colors',
                    user.userId === authStore.profile?.id ? 'bg-primary/5 hover:bg-primary/10' : ''
                  ]"
                >
                  <td class="px-6 py-4 text-center font-black text-muted-foreground">#{{ user.rank }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                      <img :src="user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname || user.userId}`" class="w-10 h-10 rounded-full bg-muted object-cover" />
                      <div>
                        <div class="font-bold flex items-center gap-2">
                          {{ user.nickname || 'Anónimo' }}
                          <span v-if="user.userId === authStore.profile?.id" class="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">Tú</span>
                        </div>
                        <div class="text-xs font-semibold text-muted-foreground">Nivel {{ user.currentLevel }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-1 text-orange-500 font-bold">
                      <Flame class="w-4 h-4" /> {{ user.streakCount }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="font-black text-lg">{{ user.totalXp }}</span>
                  </td>
                </tr>
                <tr v-if="leaderboard.length === 0 && !loading">
                  <td colspan="4" class="px-6 py-12 text-center text-muted-foreground">
                    Aún no hay usuarios en el ranking.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <!-- Amigos Placeholder -->
    <div v-else class="mt-12 flex flex-col items-center justify-center py-20 text-center">
      <Users class="w-20 h-20 text-muted mb-6" />
      <h2 class="text-3xl font-black">Ranking de Amigos</h2>
      <p class="text-muted-foreground mt-2 max-w-md">Próximamente podrás competir exclusivamente con tus amigos agregados y ver quién es el más productivo.</p>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for table */
.max-h-\\[500px\\]::-webkit-scrollbar {
  width: 8px;
}
.max-h-\\[500px\\]::-webkit-scrollbar-track {
  background: transparent;
}
.max-h-\\[500px\\]::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 9999px;
}
.max-h-\\[500px\\]::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
