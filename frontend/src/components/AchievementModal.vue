<script setup lang="ts">
import { Trophy, X } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  isAchievementModalOpen,
  currentAchievement,
  processAchievementsQueue,
} from '@/composables/useGamification'

function handleClose() {
  isAchievementModalOpen.value = false
  setTimeout(() => {
    processAchievementsQueue()
  }, 300)
}
</script>

<template>
  <Dialog :open="isAchievementModalOpen" @update:open="(val) => !val && handleClose()">
    <DialogContent
      class="sm:max-w-md bg-card border-none shadow-2xl p-0 overflow-visible"
      :show-close-button="false"
    >
      <!-- Banner -->
      <div
        class="h-32 bg-gradient-to-br from-yellow-400 to-orange-500 relative flex items-center justify-center rounded-t-xl overflow-hidden"
      >
        <div
          class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"
        ></div>
        <div class="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            class="text-white hover:bg-white/20 rounded-full z-10 relative"
            @click="handleClose"
          >
            <X class="w-5 h-5" />
          </Button>
        </div>
      </div>

      <!-- Trophy Icon (Outside of overflow-hidden banner) -->
      <div class="absolute top-32 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div
          class="w-24 h-24 bg-card rounded-full border-4 border-card shadow-lg flex items-center justify-center relative"
        >
          <div class="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
          <Trophy class="w-12 h-12 text-yellow-500 relative z-10" />
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 pt-14 pb-8 text-center flex flex-col items-center">
        <h2 class="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-2">
          ¡Logro Desbloqueado!
        </h2>
        <h3 class="text-3xl font-black mb-3">{{ currentAchievement?.title }}</h3>
        <p class="text-muted-foreground text-lg mb-8">
          {{ currentAchievement?.description }}
        </p>

        <Button
          class="w-full h-12 rounded-xl text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:opacity-90 transition-opacity"
          @click="handleClose"
        >
          ¡Genial!
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
