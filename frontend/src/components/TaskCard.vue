<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import type { TaskWithDeadline } from '@/composables/useTaskDeadline'
import {
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  Trash2,
  Tag,
  Briefcase,
  Home,
  Code,
  Heart,
  Star,
  Book,
  Coffee,
  Dumbbell,
  Music,
  AlignLeft,
} from 'lucide-vue-next'

const IconMap: Record<string, Component> = {
  Tag,
  Briefcase,
  Home,
  Code,
  Heart,
  Star,
  Book,
  Coffee,
  Dumbbell,
  Music,
  AlignLeft,
}

const props = defineProps<{
  task: TaskWithDeadline
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'toggleStatus', task: TaskWithDeadline): void
  (e: 'deleteTask', id: string): void
}>()

function formatTime(val: string | Date) {
  const d = new Date(val)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const taskColors = computed(() => {
  const { task } = props
  if (task.deadlineStatus === 'expired' || task.status === 'FAILED') {
    return {
      bg: 'bg-red-900/20',
      border: 'border-red-500/40',
      text: 'text-red-400',
    }
  }
  const priorityColors: Record<string, { bg: string; border: string; text: string }> = {
    HIGH: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500' },
    MEDIUM: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500' },
    LOW: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500' },
  }
  return (
    priorityColors[task.priority] || {
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      text: 'text-primary',
    }
  )
})

const deadlineClass = computed(() => {
  const { task } = props
  if (task.deadlineStatus === 'expired' || task.status === 'FAILED') return 'opacity-60'
  if (task.deadlineStatus === 'dueSoon')
    return 'shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500/50'
  return ''
})
</script>

<template>
  <div
    class="flex items-center justify-between p-4 rounded-xl border transition-all min-w-0"
    :class="[
      taskColors.bg,
      taskColors.border,
      deadlineClass,
      task.status === 'COMPLETED' || task.status === 'FAILED'
        ? 'opacity-50'
        : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
    ]"
    @click="emit('click')"
  >
    <div class="flex items-center gap-4 w-full min-w-0">
      <button
        v-if="task.deadlineStatus !== 'expired' && task.status !== 'FAILED'"
        :data-cy="`task-toggle-${task.id}`"
        @click.stop="emit('toggleStatus', task)"
        class="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
      >
        <CheckCircle2 v-if="task.status === 'COMPLETED'" class="w-6 h-6 text-green-500" />
        <Circle v-else class="w-6 h-6 text-muted-foreground" />
      </button>
      <div v-else class="p-1 shrink-0">
        <XCircle class="w-6 h-6 text-red-500" />
      </div>

      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center bg-background shadow-sm shrink-0"
        :class="taskColors.text"
      >
        <component
          :is="IconMap[task.tags && task.tags.length > 0 ? task.tags[0]?.icon || 'Tag' : 'Tag']"
          class="w-6 h-6"
        />
      </div>

      <div class="flex flex-col flex-1 min-w-0">
        <span
          class="font-bold text-lg leading-tight truncate"
          :class="{
            'line-through text-muted-foreground': task.status === 'COMPLETED',
            'line-through text-red-500': task.status === 'FAILED',
            'text-red-400': task.deadlineStatus === 'expired' && task.status !== 'FAILED',
          }"
        >
          {{ task.title }}
        </span>
        <div
          class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-medium mt-1"
        >
          <span class="flex items-center gap-1.5" v-if="task.dueDate">
            <Clock class="w-4 h-4" />
            {{ formatTime(task.dueDate) }}
          </span>
          <span v-if="task.deadlineStatus === 'dueSoon'" class="text-red-400 font-bold text-xs">
            ¡Vence pronto!
          </span>
          <span v-if="task.deadlineStatus === 'expired'" class="text-red-500 font-bold text-xs">
            Vencido
          </span>
          <span v-if="task.estimatedTime" class="flex items-center gap-1.5">
            • {{ task.estimatedTime }} min
          </span>
          <span v-if="task.dueDate" class="flex items-center gap-1.5">
            •
            {{
              new Date(task.dueDate).toLocaleDateString([], {
                day: 'numeric',
                month: 'short',
              })
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 pl-2">
      <button
        :data-cy="`task-delete-${task.id}`"
        class="p-2 rounded-lg hover:bg-destructive/10 text-destructive/50 hover:text-destructive transition-colors shrink-0"
        @click.stop="emit('deleteTask', task.id)"
      >
        <Trash2 class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
