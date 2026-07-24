<script setup lang="ts">
import { computed } from 'vue'
import type { TaskWithDeadline } from '@/composables/useTaskDeadline'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import TaskCard from '@/components/TaskCard.vue'
import { Clock, Sun, Calendar, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  tasks: TaskWithDeadline[]
}>()

const emit = defineEmits<{
  (e: 'toggleStatus', task: TaskWithDeadline): void
  (e: 'deleteTask', id: string): void
  (e: 'openTask', task: TaskWithDeadline): void
}>()

const expiringTasks = computed(() => {
  const now = new Date()
  return props.tasks
    .filter((task) => {
      if (!task.dueDate) return false
      if (task.status === 'COMPLETED' || task.status === 'FAILED') return false
      const d = new Date(task.dueDate)
      const diff = d.getTime() - now.getTime()
      return diff >= 0 && diff <= 4 * 60 * 60 * 1000 // Menos de 4 horas
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
})

const todayTasks = computed(() => {
  const now = new Date()
  return props.tasks
    .filter((task) => {
      if (!task.dueDate) return false
      if (task.status === 'COMPLETED' || task.status === 'FAILED') return false
      const d = new Date(task.dueDate)
      const diff = d.getTime() - now.getTime()
      const isToday = d.toDateString() === now.toDateString()
      const isExpiring = diff >= 0 && diff <= 4 * 60 * 60 * 1000
      return isToday && diff >= 0 && !isExpiring
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
})

const generalTasks = computed(() => {
  const now = new Date()
  const endOfWindow = new Date(now)
  endOfWindow.setDate(now.getDate() + 7)
  return props.tasks
    .filter((task) => {
      if (!task.dueDate) return false
      if (task.status === 'COMPLETED' || task.status === 'FAILED') return false
      const d = new Date(task.dueDate)
      const isToday = d.toDateString() === now.toDateString()
      const diff = d.getTime() - now.getTime()
      return !isToday && diff > 0 && d < endOfWindow
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
})

const totalUpcomingCount = computed(
  () => expiringTasks.value.length + todayTasks.value.length + generalTasks.value.length
)
</script>

<template>
  <Card class="border-border bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
    <CardHeader class="pb-4 bg-linear-to-r from-card to-card/50 border-b border-border/50">
      <CardTitle class="text-2xl font-bold flex items-center gap-2">
        Mis tareas
        <span class="bg-primary/20 text-primary text-sm px-2.5 py-0.5 rounded-full font-semibold">{{
          totalUpcomingCount
        }}</span>
      </CardTitle>
      <CardDescription class="text-base text-muted-foreground"
        >Organiza tu día y mantén tu racha</CardDescription
      >
    </CardHeader>
    
    <CardContent class="grid gap-8 pt-6">
      
      <!-- Sección: Próximas a vencer -->
      <div v-if="expiringTasks.length > 0" class="space-y-4">
        <div class="flex items-center gap-2 text-destructive font-bold text-sm tracking-wide uppercase">
          <AlertCircle class="w-4 h-4" />
          <span>Próximas a vencer</span>
        </div>
        <TransitionGroup name="task-list" tag="div" class="grid gap-3 relative">
          <TaskCard
            v-for="task in expiringTasks"
            :key="task.id"
            :task="task"
            :data-cy="`task-row-${task.id}`"
            @click="emit('openTask', task)"
            @toggle-status="emit('toggleStatus', $event)"
            @delete-task="emit('deleteTask', $event)"
          />
        </TransitionGroup>
      </div>

      <!-- Sección: Para hoy -->
      <div v-if="todayTasks.length > 0" class="space-y-4">
        <div class="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
          <Sun class="w-4 h-4" />
          <span>Para hoy</span>
        </div>
        <TransitionGroup name="task-list" tag="div" class="grid gap-3 relative">
          <TaskCard
            v-for="task in todayTasks"
            :key="task.id"
            :task="task"
            :data-cy="`task-row-${task.id}`"
            @click="emit('openTask', task)"
            @toggle-status="emit('toggleStatus', $event)"
            @delete-task="emit('deleteTask', $event)"
          />
        </TransitionGroup>
      </div>

      <!-- Sección: Próximas (General) -->
      <div v-if="generalTasks.length > 0" class="space-y-4">
        <div class="flex items-center gap-2 text-muted-foreground font-bold text-sm tracking-wide uppercase">
          <Calendar class="w-4 h-4" />
          <span>Próximos días</span>
        </div>
        <TransitionGroup name="task-list" tag="div" class="grid gap-3 relative">
          <TaskCard
            v-for="task in generalTasks"
            :key="task.id"
            :task="task"
            :data-cy="`task-row-${task.id}`"
            @click="emit('openTask', task)"
            @toggle-status="emit('toggleStatus', $event)"
            @delete-task="emit('deleteTask', $event)"
          />
        </TransitionGroup>
      </div>

      <!-- Empty State -->
      <div v-if="totalUpcomingCount === 0" class="text-center py-10">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock class="w-8 h-8 text-primary/50" />
        </div>
        <h4 class="text-lg font-medium text-foreground">¡Todo al día!</h4>
        <p class="text-muted-foreground mt-1">No tienes tareas próximas pendientes.</p>
      </div>
      
    </CardContent>
  </Card>
</template>
