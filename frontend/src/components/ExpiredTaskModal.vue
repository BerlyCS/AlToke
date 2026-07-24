<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { expiredTaskData, processExpiredTaskQueue } from '@/composables/useTaskDeadline'

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
import { XCircle, Clock } from 'lucide-vue-next'

const isDesktop = useMediaQuery('(min-width: 768px)')

const isOpen = computed({
  get: () => expiredTaskData.value.open,
  set: (val) => {
    expiredTaskData.value.open = val
    if (!val) {
      setTimeout(() => {
        processExpiredTaskQueue()
        window.dispatchEvent(new CustomEvent('altoke:refresh-tasks'))
      }, 300)
    }
  },
})
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="isOpen">
    <DialogContent
      class="sm:max-w-[425px] flex flex-col items-center text-center p-8 border-red-500/30 bg-gradient-to-b from-card to-red-500/5 expired-shake"
    >
      <DialogHeader class="items-center">
        <div
          class="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 mb-6 expired-pulse"
        >
          <XCircle class="w-12 h-12 text-red-950" />
        </div>
        <DialogTitle
          class="text-3xl font-black text-red-600 dark:text-red-500 uppercase tracking-widest drop-shadow-sm"
          >¡Tarea Vencida!</DialogTitle
        >
        <DialogDescription class="text-lg mt-3 font-medium text-muted-foreground">
          La tarea ha pasado su fecha límite.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col items-center mt-6 w-full">
        <div class="bg-card w-full rounded-2xl p-4 border shadow-sm flex items-center gap-4">
          <Clock class="text-red-500 w-8 h-8 shrink-0" />
          <div class="flex flex-col text-left min-w-0 flex-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >Tarea</span
            >
            <span class="font-bold truncate text-sm">{{ expiredTaskData.taskTitle }}</span>
          </div>
        </div>
        <Button
          size="lg"
          class="w-full mt-6 font-bold text-lg rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white"
          @click="isOpen = false"
        >
          ¡Entendido!
        </Button>
      </div>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="isOpen">
    <DrawerContent class="border-t-red-500/30 bg-gradient-to-b from-card to-red-500/5">
      <DrawerHeader class="items-center text-center pt-8">
        <div
          class="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 mb-4 expired-pulse"
        >
          <XCircle class="w-10 h-10 text-red-950" />
        </div>
        <DrawerTitle
          class="text-2xl font-black text-red-600 dark:text-red-500 uppercase tracking-widest drop-shadow-sm"
          >¡Tarea Vencida!</DrawerTitle
        >
        <DrawerDescription class="text-base mt-2 font-medium text-muted-foreground">
          La tarea ha pasado su fecha límite.
        </DrawerDescription>
      </DrawerHeader>

      <div class="px-6 pb-2">
        <div class="bg-card w-full rounded-2xl p-4 border shadow-sm flex items-center gap-3">
          <Clock class="text-red-500 w-6 h-6 shrink-0" />
          <div class="flex flex-col text-left overflow-hidden min-w-0 flex-1">
            <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
              >Tarea</span
            >
            <span class="font-bold text-sm truncate">{{ expiredTaskData.taskTitle }}</span>
          </div>
        </div>
      </div>
      <DrawerFooter class="px-6 pb-8">
        <DrawerClose as-child>
          <Button
            size="lg"
            class="w-full font-bold text-base rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white"
          >
            ¡Entendido!
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<style>
@keyframes expired-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px);
  }
}

@keyframes expired-pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.expired-shake {
  animation: expired-shake 0.5s ease-in-out;
}

.expired-pulse {
  animation: expired-pulse-ring 1.2s ease-out infinite;
}
</style>
