<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Clock,
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
import type { Component } from 'vue'

const props = defineProps<{
  currentDate: Date
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'open-task', task: Task): void
}>()

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

const dfDay = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
const hours = Array.from({ length: 24 }, (_, i) => i)

function getTaskColor(task: Task) {
  if (task.tags && task.tags.length > 0) {
    const firstTag = task.tags[0]
    if (firstTag && firstTag.color) {
      const colorMap: Record<string, string> = {
        'bg-red-500': 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300',
        'bg-orange-500': 'bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-300',
        'bg-yellow-500': 'bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-300',
        'bg-green-500': 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300',
        'bg-blue-500': 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300',
        'bg-indigo-500': 'bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300',
        'bg-purple-500': 'bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300',
        'bg-pink-500': 'bg-pink-500/20 border-pink-500 text-pink-700 dark:text-pink-300',
      }
      return colorMap[firstTag.color] || 'bg-primary/20 border-primary text-primary'
    }
  }

  if (task.priority === 'HIGH') return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300'
  if (task.priority === 'LOW')
    return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
  return 'bg-primary/20 border-primary text-primary'
}

const dayTasksProcessed = computed(() => {
  const targetDate = props.currentDate.toDateString()

  const dayTasks = props.tasks.filter((task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate).toDateString() === targetDate
  })

  // Sort by time first
  dayTasks.sort((a, b) => {
    return new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime()
  })

  const scale = 2.5

  const processed = dayTasks.map((task) => {
    const d = new Date(task.dueDate as string)
    const startMinutes = d.getHours() * 60 + d.getMinutes()

    // In day view, we use duration
    const actualDuration = task.estimatedTime || 60
    const visualDuration = Math.max(actualDuration, 30) // min 30 minutes visually
    const maxAllowedMinutes = 1440 - startMinutes
    const duration = Math.min(visualDuration, maxAllowedMinutes)

    return {
      ...task,
      top: startMinutes * scale,
      height: duration * scale,
      width: 100,
      left: 0,
      zIndex: 10,
    }
  })

  // Basic overlapping logic to place them side by side
  // This is a simple cluster algorithm
  for (let i = 0; i < processed.length; i++) {
    const overlapping = []
    for (let j = 0; j < processed.length; j++) {
      const t1 = processed[i]
      const t2 = processed[j]
      if (!t1 || !t2) continue
      // Check overlap
      if (t1.top < t2.top + t2.height && t1.top + t1.height > t2.top) {
        overlapping.push(j)
      }
    }

    if (overlapping.length > 1) {
      const widthPerTask = 100 / overlapping.length
      overlapping.forEach((idx, overlapIndex) => {
        const p = processed[idx]
        if (p) {
          p.width = widthPerTask
          p.left = overlapIndex * widthPerTask
        }
      })
    }
  }

  // Restore Z-index just in case, though they are side by side now
  processed.forEach((p, idx) => {
    p.zIndex = 10 + idx
  })

  return processed
})

function formatTimeOnly(date: Date) {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(date)
}
</script>

<template>
  <Card
    class="flex-1 border-border shadow-xl rounded-3xl overflow-hidden flex flex-col min-h-0 bg-card/60 backdrop-blur-xl"
  >
    <CardContent class="p-0 flex-1 flex flex-col min-h-0">
      <ScrollArea class="w-full h-full">
        <div class="min-w-[600px] flex flex-col h-full bg-background/50">
          <!-- Day Header -->
          <div
            class="grid grid-cols-[60px_1fr] border-b border-border sticky top-0 z-40 bg-card/90 backdrop-blur-md shadow-sm"
          >
            <div class="p-3"></div>
            <!-- Empty corner -->
            <div
              class="p-4 text-center border-l border-border/50 flex flex-col items-center justify-center"
            >
              <div class="text-lg font-black uppercase text-primary mb-1">
                {{ dfDay.format(currentDate) }}
              </div>
            </div>
          </div>

          <!-- Time Grid -->
          <!-- We assume 1px = 2.5 minutes (scale = 2.5), so 24 hours = 3600px tall -->
          <div class="pt-6 pb-6">
            <div class="relative grid grid-cols-[60px_1fr] h-[3600px]">
              <!-- Hour Labels (Column 0) -->
              <div class="relative border-r border-border bg-card/30">
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="absolute w-full text-right pr-2 text-xs font-bold text-muted-foreground transform -translate-y-1/2"
                  :style="`top: ${hour * 150}px`"
                >
                  {{ hour.toString().padStart(2, '0') }}:00
                </div>
              </div>

              <!-- Single Day Column -->
              <div class="relative border-border/50">
                <!-- Horizontal grid lines (1 hour = 150px) -->
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="absolute w-full border-t border-border/30"
                  :style="`top: ${hour * 150}px; height: 150px;`"
                ></div>

                <!-- Tasks -->
                <div
                  v-for="task in dayTasksProcessed"
                  :key="task.id"
                  class="absolute p-1 transition-all duration-300 hover:!z-50 hover:scale-[1.02] cursor-pointer group"
                  :style="`top: ${task.top}px; height: ${task.height}px; left: ${task.left}%; width: ${task.width}%; z-index: ${task.zIndex}`"
                  @click="emit('open-task', task)"
                >
                  <div
                    class="w-full h-full bg-background/95 backdrop-blur-sm rounded-xl border-l-[6px] p-2.5 overflow-hidden shadow-md group-hover:shadow-2xl group-hover:bg-background transition-all duration-300 grid grid-cols-[36px_1fr] gap-3 items-start"
                    :class="[getTaskColor(task), task.status === 'COMPLETED' ? 'opacity-60' : '']"
                  >
                    <!-- Big Icon -->
                    <div class="flex items-start justify-center h-full pt-1">
                      <component
                        :is="
                          IconMap[
                            task.tags && task.tags.length > 0 ? task.tags[0]?.icon || 'Tag' : 'Tag'
                          ]
                        "
                        class="w-7 h-7 opacity-80"
                      />
                    </div>

                    <!-- Content -->
                    <div class="flex flex-col justify-start min-w-0 h-full">
                      <div class="font-bold text-sm leading-tight line-clamp-2">
                        {{ task.title }}
                      </div>
                      <div class="text-[11px] font-bold opacity-75 flex items-center gap-1 mt-1">
                        <Clock class="w-3 h-3 shrink-0" />
                        {{ formatTimeOnly(new Date(task.dueDate as string)) }}
                        <span v-if="task.estimatedTime" class="ml-1 opacity-70"
                          >({{ task.estimatedTime }}m)</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </CardContent>
  </Card>
</template>
