<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar.vue'
import ModeToggle from '@/components/ModeToggle.vue'
import NotificationsDrawer from '@/components/NotificationsDrawer.vue'
import { AlertTriangle } from 'lucide-vue-next'
import { taskService } from '@/services/task.service'
import type { Task } from '@/types'

const tasks = ref<Task[]>([])
let pollInterval: ReturnType<typeof setInterval> | null = null

const fetchTasks = async () => {
  try {
    tasks.value = await taskService.getAllTasks()
  } catch (e) {
    console.error('Failed to load tasks for layout check', e)
  }
}

const hasUrgentTask = computed(() => {
  const now = new Date().getTime()
  return tasks.value.some((task) => {
    if (task.status === 'COMPLETED' || task.status === 'FAILED') return false
    if (!task.dueDate) return false
    const due = new Date(task.dueDate).getTime()
    const diffMins = (due - now) / 60000
    // Vence en menos de 30 minutos (y aún no ha vencido)
    return diffMins > 0 && diffMins <= 30
  })
})

onMounted(() => {
  fetchTasks()
  window.addEventListener('altoke:refresh-tasks', fetchTasks)
  pollInterval = setInterval(fetchTasks, 60000)
})

onUnmounted(() => {
  window.removeEventListener('altoke:refresh-tasks', fetchTasks)
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    
    <SidebarInset class="relative !bg-transparent">
      <!-- Efecto global rojizo cuando hay tareas a punto de vencer -->
      <div
        class="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out"
        :class="
          hasUrgentTask 
            ? 'opacity-100 bg-linear-to-b from-destructive/20 via-transparent to-transparent' 
            : 'opacity-0'
        "
      ></div>

      <header
        class="flex justify-between h-14 shrink-0 items-center border-b bg-background/95 backdrop-blur px-4 sticky top-0 z-50 transition-colors duration-500 relative"
        :class="hasUrgentTask ? 'border-destructive/30' : ''"
      >
        <div class="flex items-center gap-2">
          <SidebarTrigger class="-ml-1" />
          
          <!-- Mensaje de Alerta en el Header -->
          <Transition
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-300 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-4 opacity-0"
          >
            <div
              v-if="hasUrgentTask"
              class="ml-2 flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm animate-pulse"
            >
              <AlertTriangle class="w-4 h-4" />
              <span class="hidden sm:inline">Tienes una tarea que está a punto de vencer</span>
              <span class="sm:hidden">Tarea por vencer</span>
            </div>
          </Transition>
        </div>

        <div class="flex items-center gap-1">
          <NotificationsDrawer />
          <ModeToggle />
        </div>
      </header>
      
      <main class="flex flex-1 flex-col p-4 md:p-6 lg:p-8 bg-transparent overflow-x-hidden relative z-10">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
