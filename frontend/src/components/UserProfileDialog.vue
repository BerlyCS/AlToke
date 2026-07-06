<script setup lang="ts">
import { Trophy, Flame, Zap, UserPlus, Send, X, Check } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { LeaderboardEntry } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { friendshipService } from '@/services/friendship.service'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps<{
  user: LeaderboardEntry
}>()

const authStore = useAuthStore()
const isCurrentUser = computed(() => authStore.profile?.id === props.user.userId)

const requestSent = ref(false)
const isSending = ref(false)

const handleSendRequest = async () => {
  if (isCurrentUser.value) return
  isSending.value = true
  try {
    await friendshipService.sendRequest(props.user.userId)
    toast.success('Solicitud enviada a ' + (props.user.nickname || 'Usuario'))
    requestSent.value = true
  } catch (e: any) {
    toast.error(e.message || 'No se pudo enviar la solicitud')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <Dialog>
    <DialogTrigger asChild>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md bg-card border-none shadow-2xl p-0 overflow-hidden">
      <!-- Profile Header / Banner -->
      <div class="h-32 bg-gradient-to-br from-primary/80 to-primary relative">
        <div class="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <img
            :src="
              user.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname || 'Anónimo'}`
            "
            alt="Avatar"
            class="w-24 h-24 rounded-full border-4 border-card bg-muted shadow-md object-cover"
          />
        </div>
      </div>

      <div class="px-6 pt-14 pb-8 text-center flex flex-col items-center">
        <h2 class="text-2xl font-black mb-1">{{ user.nickname || 'Jugador' }}</h2>
        <span class="text-sm font-semibold text-muted-foreground flex items-center gap-1 mb-6">
          <Zap class="w-4 h-4 text-yellow-500" /> Nivel {{ user.currentLevel }}
        </span>

        <div class="grid grid-cols-3 gap-4 w-full mb-8">
          <div class="flex flex-col items-center bg-muted/40 rounded-xl p-3">
            <Trophy class="w-6 h-6 text-yellow-500 mb-1" />
            <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider"
              >Rank</span
            >
            <span class="font-black text-lg">#{{ user.rank }}</span>
          </div>
          <div class="flex flex-col items-center bg-muted/40 rounded-xl p-3">
            <Zap class="w-6 h-6 text-primary mb-1" />
            <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider">XP</span>
            <span class="font-black text-lg">{{ user.totalXp }}</span>
          </div>
          <div class="flex flex-col items-center bg-muted/40 rounded-xl p-3">
            <Flame class="w-6 h-6 text-orange-500 mb-1" />
            <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider"
              >Racha</span
            >
            <span class="font-black text-lg">{{ user.streakCount }}</span>
          </div>
        </div>

        <div v-if="!isCurrentUser" class="w-full">
          <Button
            v-if="!requestSent"
            class="w-full font-bold gap-2"
            @click="handleSendRequest"
            :disabled="isSending"
          >
            <UserPlus class="w-5 h-5" />
            Añadir Amigo
          </Button>
          <Button v-else disabled variant="secondary" class="w-full font-bold gap-2">
            <Check class="w-5 h-5 text-green-500" />
            Solicitud Enviada
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
