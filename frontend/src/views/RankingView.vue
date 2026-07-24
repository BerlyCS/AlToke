<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Trophy, Zap, Flame, Users, Globe } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { gamificationService } from '@/services/gamification.service'
import { useAuthStore } from '@/stores/auth'
import type { LeaderboardEntry } from '@/types'
import UserProfileDialog from '@/components/UserProfileDialog.vue'
import LeaderboardPodium from '@/components/LeaderboardPodium.vue'
import LeaderboardRow from '@/components/LeaderboardRow.vue'
import { watch } from 'vue'

const authStore = useAuthStore()
const leaderboard = ref<LeaderboardEntry[]>([])
const loading = ref(true)

const currentMode = ref<'global' | 'friends'>('global')
const selectedUser = ref<LeaderboardEntry | null>(null)
const isProfileOpen = ref(false)

const openProfile = (user: LeaderboardEntry) => {
  selectedUser.value = user
  isProfileOpen.value = true
}

onMounted(async () => {
  await loadLeaderboard()
})

const loadLeaderboard = async () => {
  loading.value = true
  try {
    if (currentMode.value === 'global') {
      leaderboard.value = await gamificationService.getLeaderboard(50)
    } else {
      leaderboard.value = await gamificationService.getFriendsLeaderboard()
    }
  } catch (error) {
    console.error('Failed to load leaderboard', error)
  } finally {
    loading.value = false
  }
}

watch(currentMode, () => {
  loadLeaderboard()
})

// Current user stats
const userRank = computed(() => {
  const entry = leaderboard.value.find((u) => u.userId === authStore.profile?.id)
  return entry ? entry.rank : '>50'
})

const currentUserEntry = computed(() =>
  leaderboard.value.find((u) => u.userId === authStore.profile?.id),
)

const userXp = computed(() => currentUserEntry.value?.totalXp ?? authStore.profile?.xp ?? 0)
const userLevel = computed(
  () => currentUserEntry.value?.currentLevel ?? authStore.profile?.level ?? 1,
)
const userStreak = computed(
  () => currentUserEntry.value?.streakCount ?? authStore.profile?.currentStreak ?? 0,
)

const currentLevelBaseXp = computed(() =>
  userLevel.value === 1 ? 0 : Math.pow(userLevel.value, 2) * 25,
)
const nextLevelXp = computed(() => Math.pow(userLevel.value + 1, 2) * 25)
const userXpProgress = computed(() => {
  const current = userXp.value - currentLevelBaseXp.value
  const target = nextLevelXp.value - currentLevelBaseXp.value
  return Math.max(0, Math.min(100, (current / target) * 100))
})

const top3 = computed(() => leaderboard.value.slice(0, 3))

const secondPlace = computed(() => top3.value[1])
const firstPlace = computed(() => top3.value[0])
const thirdPlace = computed(() => top3.value[2])
</script>

<template>
  <div
    class="h-full flex flex-col p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-10 pb-20"
  >
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black tracking-tight flex items-center gap-3">
          Ranking <Trophy class="w-8 h-8 text-yellow-500" />
        </h1>
        <p class="text-muted-foreground mt-2 text-lg">
          Completa tareas, gana xp, y escala posiciones
        </p>
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
      <Card
        class="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20 relative overflow-hidden"
      >
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
              <Progress
                :model-value="userXpProgress"
                class="h-2.5 bg-primary-foreground/20 [&>div]:bg-white"
              />
            </div>
            <div class="flex items-center gap-3 pt-2">
              <img
                :src="
                  authStore.profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${authStore.profile?.nickname || 'Jugador'}`
                "
                alt="Avatar"
                class="w-10 h-10 rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/10"
              />
              <div class="flex flex-col">
                <span class="font-bold text-sm">{{
                  authStore.profile?.nickname || 'Jugador'
                }}</span>
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
              <span class="text-sm font-bold text-muted-foreground uppercase tracking-wider"
                >Nivel actual</span
              >
              <div class="text-5xl font-black mt-1">{{ userLevel }}</div>
            </div>
            <div
              class="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"
            >
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
      <Card
        class="shadow-sm hover:shadow-md transition-shadow border-orange-200 dark:border-orange-900/30"
      >
        <CardContent
          class="p-6 flex flex-col h-full bg-gradient-to-br from-card to-orange-50 dark:to-orange-950/10"
        >
          <div class="flex justify-between items-start">
            <div>
              <span
                class="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider"
                >Racha actual</span
              >
              <div class="text-5xl font-black mt-1 text-foreground flex items-baseline gap-2">
                {{ userStreak }}
                <span class="text-lg text-muted-foreground font-semibold">días</span>
              </div>
            </div>
            <div
              class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center"
            >
              <Flame class="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div class="mt-auto pt-6">
            <p class="text-sm font-medium text-muted-foreground leading-snug">
              ¡Completa tareas todos los días para no perder tu racha y ganar multiplicadores!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Top Jugadores -->
    <div class="mt-8 space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-black tracking-tight">Top Jugadores</h2>
        <p class="text-muted-foreground mt-2">Los usuarios más productivos de la semana</p>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <div
          class="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"
        ></div>
      </div>

      <!-- Podium Layout -->
      <LeaderboardPodium
        v-else-if="leaderboard.length >= 1"
        :first-place="firstPlace"
        :second-place="secondPlace"
        :third-place="thirdPlace"
        @click-user="openProfile"
      />

      <!-- Tabla de Posiciones -->
      <Card class="rounded-2xl overflow-hidden border shadow-sm mt-12 max-w-5xl mx-auto">
        <CardHeader class="bg-muted/50 border-b pb-4">
          <CardTitle>Tabla de posiciones</CardTitle>
          <CardDescription>Clasificación completa de todos los jugadores</CardDescription>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto table-container overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-card z-10 border-b shadow-sm">
                <tr>
                  <th
                    class="px-6 py-4 text-xs font-bold uppercase text-muted-foreground w-20 text-center"
                  >
                    Rango
                  </th>
                  <th class="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">
                    Jugador
                  </th>
                  <th
                    class="px-6 py-4 text-xs font-bold uppercase text-muted-foreground w-32 text-center"
                  >
                    Racha
                  </th>
                  <th
                    class="px-6 py-4 text-xs font-bold uppercase text-muted-foreground text-right"
                  >
                    XP
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <LeaderboardRow
                  v-for="user in leaderboard"
                  :key="user.userId"
                  :user="user"
                  :is-current-user="user.userId === authStore.profile?.id"
                  @click="openProfile(user)"
                />
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

    <UserProfileDialog v-if="selectedUser" :user="selectedUser" v-model:open="isProfileOpen">
      <!-- Empty trigger since we control it manually -->
      <span class="hidden"></span>
    </UserProfileDialog>
  </div>
</template>

<style scoped>
/* Custom scrollbar for table */
.table-container {
  max-height: 500px;
}
.table-container::-webkit-scrollbar {
  width: 8px;
}
.table-container::-webkit-scrollbar-track {
  background: transparent;
}
.table-container::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted));
  border-radius: 20px;
}
.table-container::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--muted-foreground) / 0.5);
}
</style>
