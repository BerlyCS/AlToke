<script setup lang="ts">
import { watch, computed } from 'vue'
import confetti from 'canvas-confetti'
import { useMediaQuery } from '@vueuse/core'
import { levelUpData } from '@/composables/useGamification'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Trophy, Star } from 'lucide-vue-next'

const isDesktop = useMediaQuery('(min-width: 768px)')

const isOpen = computed({
  get: () => levelUpData.value.open,
  set: (val) => levelUpData.value.open = val
})

watch(isOpen, (val) => {
  if (val) {
    fireConfetti()
  }
})

function fireConfetti() {
  const duration = 3 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100000 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }))
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }))
  }, 250)
}
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="isOpen">
    <DialogContent class="sm:max-w-[425px] flex flex-col items-center text-center p-8 border-yellow-500/30 bg-gradient-to-b from-card to-yellow-500/5">
      <DialogHeader class="items-center">
        <div class="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/30 mb-6 animate-bounce">
          <Trophy class="w-12 h-12 text-yellow-950" />
        </div>
        <DialogTitle class="text-3xl font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest drop-shadow-sm">¡Nuevo Nivel!</DialogTitle>
        <DialogDescription class="text-lg mt-3 font-medium text-muted-foreground">
          Has alcanzado el <span class="font-bold text-foreground">Nivel {{ levelUpData.newLevel }}</span>.
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex flex-col items-center mt-6 w-full">
        <div class="bg-card w-full rounded-2xl p-4 border shadow-sm flex items-center gap-4">
          <Star class="text-primary w-8 h-8 shrink-0" />
          <div class="flex flex-col text-left min-w-0 flex-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Última Tarea</span>
            <span class="font-bold truncate text-sm">{{ levelUpData.title }}</span>
          </div>
          <div class="flex flex-col text-right shrink-0">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ganancia</span>
            <span class="font-black text-green-500 text-lg">+{{ levelUpData.xp }} XP</span>
          </div>
        </div>
        <Button size="lg" class="w-full mt-6 font-bold text-lg rounded-xl h-12" @click="isOpen = false">
          ¡Excelente!
        </Button>
      </div>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="isOpen">
    <DrawerContent class="border-t-yellow-500/30 bg-gradient-to-b from-card to-yellow-500/5">
      <DrawerHeader class="items-center text-center pt-8">
        <div class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/30 mb-4 animate-bounce">
          <Trophy class="w-10 h-10 text-yellow-950" />
        </div>
        <DrawerTitle class="text-2xl font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest drop-shadow-sm">¡Nuevo Nivel!</DrawerTitle>
        <DrawerDescription class="text-base mt-2 font-medium text-muted-foreground">
          Has alcanzado el <span class="font-bold text-foreground">Nivel {{ levelUpData.newLevel }}</span>.
        </DrawerDescription>
      </DrawerHeader>
      
      <div class="px-6 pb-2">
        <div class="bg-card w-full rounded-2xl p-4 border shadow-sm flex items-center gap-3">
          <Star class="text-primary w-6 h-6 shrink-0" />
          <div class="flex flex-col text-left overflow-hidden min-w-0 flex-1">
            <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Última Tarea</span>
            <span class="font-bold text-sm truncate">{{ levelUpData.title }}</span>
          </div>
          <div class="flex flex-col text-right shrink-0">
            <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">XP</span>
            <span class="font-black text-green-500">+{{ levelUpData.xp }}</span>
          </div>
        </div>
      </div>
      <DrawerFooter class="px-6 pb-8">
        <DrawerClose as-child>
          <Button size="lg" class="w-full font-bold text-base rounded-xl h-12">
            ¡Excelente!
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
