<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  CalendarIcon,
  Clock,
  Leaf,
  Flame,
  Rocket,
  Tag,
  AlignLeft,
  RefreshCw,
} from 'lucide-vue-next'
import { DateFormatter } from '@internationalized/date'
import type { Component } from 'vue'
import type { Task } from '@/types'
import * as icons from 'lucide-vue-next'

const IconMap: Record<string, Component> = icons as unknown as Record<string, Component>

defineProps<{
  open: boolean
  task: Task | null
}>()

defineEmits(['update:open'])

const df = new DateFormatter('es-ES', { dateStyle: 'long', timeStyle: 'short' })

function formatDueDate(val: string | Date) {
  const date = new Date(val)
  return df.format(date)
}

function getPriorityIcon(priority: string) {
  if (priority === 'LOW') return Leaf
  if (priority === 'HIGH') return Rocket
  return Flame
}

function getPriorityColor(priority: string) {
  if (priority === 'LOW')
    return 'text-green-500 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
  if (priority === 'HIGH')
    return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
  return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20'
}

function getPriorityLabel(priority: string) {
  if (priority === 'LOW') return 'Baja'
  if (priority === 'HIGH') return 'Alta'
  return 'Media'
}

function getRecurrenceLabel(recurrence: string) {
  const map: Record<string, string> = {
    NONE: 'Una vez',
    DAILY: 'Diariamente',
    WEEKLY: 'Semanalmente',
    MONTHLY: 'Mensualmente',
  }
  return map[recurrence] || 'Una vez'
}

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    TASK: 'Tarea',
    MEETING: 'Reunión',
    EVENT: 'Evento',
  }
  return map[type] || 'Tarea'
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent v-if="task" class="sm:max-w-125 border-border bg-background">
      <DialogHeader>
        <div class="flex items-start justify-between pr-4">
          <div class="space-y-3">
            <DialogTitle class="text-2xl font-bold leading-tight">{{ task.title }}</DialogTitle>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" class="font-normal">{{ getTypeLabel(task.type) }}</Badge>
              <div
                v-if="task.status === 'COMPLETED'"
                class="flex items-center text-green-500 font-medium"
              >
                Completada
              </div>
              <div v-else class="flex items-center text-orange-500 font-medium">Pendiente</div>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div class="grid gap-8 py-4">
        <div
          v-if="task.description"
          class="bg-muted/30 border border-border p-4 rounded-xl space-y-2"
        >
          <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <AlignLeft class="w-4 h-4" />
            Descripción
          </div>
          <p class="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {{ task.description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div
            v-if="task.dueDate"
            class="bg-muted/30 border border-border p-4 rounded-xl space-y-2"
          >
            <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <CalendarIcon class="w-4 h-4" />
              Fecha Límite
            </div>
            <div class="text-sm font-medium">
              {{ formatDueDate(task.dueDate) }}
            </div>
          </div>

          <div class="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
            <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Flame class="w-4 h-4" />
              Prioridad
            </div>
            <div
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border"
              :class="getPriorityColor(task.priority)"
            >
              <component :is="getPriorityIcon(task.priority)" class="w-3.5 h-3.5" />
              {{ getPriorityLabel(task.priority) }}
            </div>
          </div>

          <div
            v-if="task.estimatedTime"
            class="bg-muted/30 border border-border p-4 rounded-xl space-y-2"
          >
            <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock class="w-4 h-4" />
              Tiempo Estimado
            </div>
            <div class="text-sm font-medium">{{ task.estimatedTime }} min</div>
          </div>

          <div
            v-if="task.recurrence && task.recurrence !== 'NONE'"
            class="bg-muted/30 border border-border p-4 rounded-xl space-y-2"
          >
            <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <RefreshCw class="w-4 h-4" />
              Se repite
            </div>
            <div class="text-sm font-medium">
              {{ getRecurrenceLabel(task.recurrence) }}
            </div>
          </div>
        </div>

        <div
          v-if="task.tags && task.tags.length > 0"
          class="bg-muted/30 border border-border p-4 rounded-xl space-y-3"
        >
          <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Tag class="w-4 h-4" />
            Categorías
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="tag in task.tags"
              :key="tag.id"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
              :class="tag.color || 'bg-primary'"
            >
              <component :is="IconMap[tag.icon || 'Tag']" class="w-3.5 h-3.5" />
              {{ tag.name }}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
