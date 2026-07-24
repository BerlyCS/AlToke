<script setup lang="ts">
import { Flame } from 'lucide-vue-next'
import type { LeaderboardEntry } from '@/types'

defineProps<{
  user: LeaderboardEntry
  isCurrentUser: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <tr
    @click="$emit('click')"
    :class="[
      'hover:bg-muted/50 transition-colors cursor-pointer group',
      isCurrentUser ? 'bg-primary/5 hover:bg-primary/10' : '',
    ]"
  >
    <td
      class="px-6 py-4 text-center font-black text-muted-foreground group-hover:text-foreground transition-colors"
    >
      #{{ user.rank }}
    </td>
    <td class="px-6 py-4">
      <div class="flex items-center gap-4">
        <img
          :src="
            user.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname || user.userId}`
          "
          class="w-10 h-10 rounded-full bg-muted object-cover"
        />
        <div>
          <div class="font-bold flex items-center gap-2">
            {{ user.nickname || 'Anónimo' }}
            <span
              v-if="isCurrentUser"
              class="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Tú</span
            >
          </div>
          <div class="text-xs font-semibold text-muted-foreground">
            Nivel {{ user.currentLevel }}
          </div>
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
</template>
