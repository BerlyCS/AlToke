<script setup lang="ts">
import { computed } from 'vue'
import LevelUpModal from '@/components/LevelUpModal.vue'
import AchievementModal from '@/components/AchievementModal.vue'
import ExpiredTaskModal from '@/components/ExpiredTaskModal.vue'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
import { useColorMode } from '@vueuse/core'

const mode = useColorMode()
const toasterTheme = computed(() => {
  return mode.value === 'auto' ? 'system' : (mode.value as 'light' | 'dark' | 'system')
})
</script>

<template>
  <Toaster :theme="toasterTheme" position="bottom-right" rich-colors close-button />
  <LevelUpModal />
  <AchievementModal />
  <ExpiredTaskModal />
  <router-view />
</template>

<style scoped></style>
