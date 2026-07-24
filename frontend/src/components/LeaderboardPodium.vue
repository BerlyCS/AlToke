<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import type { LeaderboardEntry } from '@/types'

defineProps<{
  firstPlace?: LeaderboardEntry
  secondPlace?: LeaderboardEntry
  thirdPlace?: LeaderboardEntry
}>()

defineEmits<{
  (e: 'clickUser', user: LeaderboardEntry): void
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-16 md:mt-28 max-w-4xl mx-auto">
    <!-- 2nd Place -->
    <div v-if="secondPlace" @click="$emit('clickUser', secondPlace)" class="cursor-pointer">
      <Card
        class="relative text-center shadow-md bg-gradient-to-t from-gray-50 to-card dark:from-gray-900/20 transform md:-translate-y-8 mt-6 md:mt-0 hover:shadow-xl hover:scale-[1.02] transition-all"
      >
        <CardContent class="pt-8 pb-6 px-4 flex flex-col items-center">
          <div class="relative mb-4">
            <img
              :src="
                secondPlace.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${secondPlace.nickname || 'User2'}`
              "
              class="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 bg-muted object-cover"
            />
            <div
              class="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-black flex items-center justify-center rounded-full text-base shadow-lg border-2 border-white dark:border-gray-800 z-10"
            >
              2
            </div>
          </div>
          <span class="font-bold text-lg line-clamp-1">{{
            secondPlace.nickname || 'Anónimo'
          }}</span>
          <span class="text-sm font-semibold text-muted-foreground mb-4"
            >Nivel {{ secondPlace.currentLevel }}</span
          >
          <div
            class="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 w-full"
          >
            <span class="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Total XP</span
            >
            <span class="block text-xl font-black text-foreground">{{
              secondPlace.totalXp
            }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
    <div v-else></div>

    <!-- 1st Place -->
    <div v-if="firstPlace" @click="$emit('clickUser', firstPlace)" class="cursor-pointer">
      <Card
        class="relative text-center shadow-xl border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-t from-yellow-50 to-card dark:from-yellow-950/20 transform md:-translate-y-16 mt-6 md:mt-0 hover:shadow-2xl hover:scale-[1.02] transition-all"
      >
        <CardContent class="pt-10 pb-8 px-4 flex flex-col items-center">
          <div class="relative mb-4">
            <div class="absolute -top-6 inset-x-0 flex justify-center text-yellow-500 z-10">
              <Trophy class="w-8 h-8" />
            </div>
            <img
              :src="
                firstPlace.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstPlace.nickname || 'User1'}`
              "
              class="w-28 h-28 rounded-full border-4 border-yellow-400 bg-muted object-cover shadow-lg shadow-yellow-500/20 relative z-0"
            />
            <div
              class="absolute top-0 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 font-black flex items-center justify-center rounded-full text-xl shadow-xl shadow-yellow-500/30 border-2 border-card animate-pulse z-20"
            >
              1
            </div>
          </div>
          <span class="font-black text-2xl line-clamp-1 text-foreground">{{
            firstPlace.nickname || 'Anónimo'
          }}</span>
          <span
            class="text-sm font-bold text-yellow-600 dark:text-yellow-500 mb-6 uppercase tracking-wider"
            >Nivel {{ firstPlace.currentLevel }}</span
          >
          <div
            class="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-950/40 px-5 py-3 rounded-xl border border-yellow-300 dark:border-yellow-700/50 w-full shadow-inner"
          >
            <span
              class="block text-xs font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-500 mb-1"
              >XP Lograda</span
            >
            <span class="block text-3xl font-black text-yellow-900 dark:text-yellow-400">{{
              firstPlace.totalXp
            }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
    <div v-else></div>

    <!-- 3rd Place -->
    <div v-if="thirdPlace" @click="$emit('clickUser', thirdPlace)" class="cursor-pointer">
      <Card
        class="relative text-center shadow-sm bg-gradient-to-t from-orange-50 to-card dark:from-orange-950/10 mt-6 md:mt-0 hover:shadow-lg hover:scale-[1.02] transition-all"
      >
        <CardContent class="pt-8 pb-6 px-4 flex flex-col items-center">
          <div class="relative mb-4">
            <img
              :src="
                thirdPlace.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${thirdPlace.nickname || 'User3'}`
              "
              class="w-20 h-20 rounded-full border-4 border-orange-300 dark:border-orange-700 bg-muted object-cover"
            />
            <div
              class="absolute -top-2 -right-2 w-8 h-8 bg-orange-300 dark:border-orange-700 text-orange-950 dark:text-orange-50 font-black flex items-center justify-center rounded-full text-base shadow-lg border-2 border-white dark:border-gray-800 z-10"
            >
              3
            </div>
          </div>
          <span class="font-bold text-lg line-clamp-1">{{
            thirdPlace.nickname || 'Anónimo'
          }}</span>
          <span class="text-sm font-semibold text-muted-foreground mb-4"
            >Nivel {{ thirdPlace.currentLevel }}</span
          >
          <div
            class="bg-orange-50 dark:bg-orange-950/30 px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-900/50 w-full"
          >
            <span class="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Total XP</span
            >
            <span class="block text-xl font-black text-foreground">{{
              thirdPlace.totalXp
            }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
    <div v-else></div>
  </div>
</template>
