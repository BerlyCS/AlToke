<script setup lang="ts">
import { computed } from 'vue'
import type { TaskWithDeadline } from '@/composables/useTaskDeadline'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import TaskCard from '@/components/TaskCard.vue'

const props = defineProps<{
  tasks: TaskWithDeadline[]
}>()

const emit = defineEmits<{
  (e: 'toggleStatus', task: TaskWithDeadline): void
  (e: 'deleteTask', id: string): void
  (e: 'openTask', task: TaskWithDeadline): void
}>()

const todayTasks = computed(() => {
  const now = new Date()
  const endOfWindow = new Date(now)
  endOfWindow.setDate(now.getDate() + 7)

  return props.tasks
    .filter((task) => {
      if (!task.dueDate) return false
      if (task.status === 'COMPLETED' || task.status === 'FAILED') return false
      const d = new Date(task.dueDate)
      return d >= now && d < endOfWindow
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
})
</script>

<template>
  <Card class="border-border bg-card/60 backdrop-blur-xl shadow-2xl">
    <CardHeader class="pb-4">
      <CardTitle class="text-2xl font-bold flex items-center gap-2">
        Próximas tareas
        <span class="bg-primary/20 text-primary text-sm px-2.5 py-0.5 rounded-full">{{
          todayTasks.length
        }}</span>
      </CardTitle>
      <CardDescription class="text-base text-muted-foreground"
        >Organiza tu día y mantén tu racha</CardDescription
      >
    </CardHeader>
    <CardContent class="grid gap-3">
      <TaskCard
        v-for="task in todayTasks"
        :key="task.id"
        :task="task"
        @click="emit('openTask', task)"
        @toggle-status="emit('toggleStatus', $event)"
        @delete-task="emit('deleteTask', $event)"
      />

      <div v-if="todayTasks.length === 0" class="text-center py-8 text-muted-foreground">
        <p>No tienes tareas próximas pendientes.</p>
      </div>
    </CardContent>
  </Card>
</template>
