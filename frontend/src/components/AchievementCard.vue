<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Lock, Zap, Flame, CheckCircle, Gift } from 'lucide-vue-next'
import type { Achievement } from '@/types'

const props = defineProps<{
  achievement: Achievement
}>()

const isUnlocked = computed(() => !!props.achievement.unlockedAt)

const getIconForCode = (code: string) => {
  if (code.startsWith('streak')) return Flame
  if (code.startsWith('task')) return CheckCircle
  if (code.startsWith('first')) return Gift
  return Zap
}

const getBgForCode = (code: string) => {
  if (code.startsWith('streak')) return 'bg-orange-500 text-white'
  if (code.startsWith('task')) return 'bg-emerald-500 text-white'
  if (code.startsWith('first')) return 'bg-purple-500 text-white'
  return 'bg-blue-500 text-white'
}
</script>

<template>
  <Card
    v-if="isUnlocked"
    class="overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-card to-primary/5 hover:shadow-xl hover:scale-105 transition-all duration-300 relative group"
  >
    <div
      class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity"
    ></div>
    <CardContent class="p-6 flex flex-col items-center text-center h-full">
      <div
        :class="[
          'w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-background',
          getBgForCode(achievement.code),
        ]"
      >
        <component :is="getIconForCode(achievement.code)" class="w-8 h-8" />
      </div>
      <h3 class="font-black text-lg mb-2 leading-tight">{{ achievement.title }}</h3>
      <p class="text-sm text-muted-foreground font-medium">{{ achievement.description }}</p>
      <div class="mt-auto pt-6 text-[11px] font-bold uppercase tracking-wider text-primary">
        Desbloqueado el {{ new Date(achievement.unlockedAt!).toLocaleDateString() }}
      </div>
    </CardContent>
  </Card>

  <Card v-else class="overflow-hidden border border-border/50 bg-muted/20 opacity-80">
    <CardContent class="p-6 flex flex-col items-center text-center h-full grayscale">
      <div
        class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 ring-4 ring-background"
      >
        <Lock class="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 class="font-black text-lg mb-2 text-muted-foreground">
        {{ achievement.isSecret ? 'Logro Secreto' : achievement.title }}
      </h3>
      <p class="text-sm text-muted-foreground/70 font-medium">
        {{
          achievement.isSecret
            ? 'Sigue jugando para descubrir cómo desbloquear este logro.'
            : achievement.description
        }}
      </p>
      <div
        class="mt-auto pt-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50"
      >
        Bloqueado
      </div>
    </CardContent>
  </Card>
</template>
