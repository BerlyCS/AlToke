<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Clock, Tag, Briefcase, Home, Code, Heart, Star, Book, Coffee, Dumbbell, Music, AlignLeft } from 'lucide-vue-next'
import type { Component } from 'vue'

const props = defineProps<{
  currentDate: Date
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'open-task', task: Task): void
  (e: 'select-day', day: Date): void
}>()

const IconMap: Record<string, Component> = { Tag, Briefcase, Home, Code, Heart, Star, Book, Coffee, Dumbbell, Music, AlignLeft }

const dfDay = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric" })
const hours = Array.from({ length: 24 }, (_, i) => i)

const daysOfWeek = computed(() => {
  const curr = new Date(props.currentDate)
  const day = curr.getDay()
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1) // Start on Monday

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(curr)
    d.setDate(diff + i)
    days.push(d)
  }
  return days
})

function getTaskColor(task: Task) {
  if (task.tags && task.tags.length > 0) {
    const firstTag = task.tags[0];
    if (firstTag && firstTag.color) {
      const colorMap: Record<string, string> = {
        "bg-red-500": "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300",
        "bg-orange-500": "bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-300",
        "bg-yellow-500": "bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-300",
        "bg-green-500": "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300",
        "bg-blue-500": "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300",
        "bg-indigo-500": "bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300",
        "bg-purple-500": "bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300",
        "bg-pink-500": "bg-pink-500/20 border-pink-500 text-pink-700 dark:text-pink-300",
      };
      return colorMap[firstTag.color] || "bg-primary/20 border-primary text-primary";
    }
  }

  if (task.priority === "HIGH")
    return "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300";
  if (task.priority === "LOW")
    return "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300";
  return "bg-primary/20 border-primary text-primary";
}

function getTasksForDay(day: Date) {
  const targetDate = day.toDateString();

  const dayTasks = props.tasks.filter((task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate).toDateString() === targetDate;
  });

  // Sort tasks by time so later tasks are rendered on top of earlier tasks
  dayTasks.sort((a, b) => {
    return new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime();
  });

  const processed = dayTasks.map((task, index) => {
    const d = new Date(task.dueDate as string);
    const startMinutes = d.getHours() * 60 + d.getMinutes();

    // Scale factor: 1 minute = 2.5 pixels
    const scale = 2.5;

    return {
      ...task,
      top: startMinutes * scale,
      zIndex: 10 + index,
    };
  });

  return processed;
}

function formatTimeOnly(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(date);
}
</script>

<template>
  <Card class="flex-1 border-border shadow-xl rounded-3xl overflow-hidden flex flex-col min-h-0 bg-card/60 backdrop-blur-xl">
    <CardContent class="p-0 flex-1 flex flex-col min-h-0">
      <ScrollArea class="w-full h-full">
        <div class="min-w-[1000px] lg:min-w-[1200px] flex flex-col h-full bg-background/50">
          <!-- Days Header -->
          <div class="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border sticky top-0 z-40 bg-card/90 backdrop-blur-md shadow-sm">
            <div class="p-3"></div> <!-- Empty corner -->
            <div 
              v-for="(day, idx) in daysOfWeek" 
              :key="idx" 
              class="p-3 text-center border-l border-border/50 cursor-pointer hover:bg-muted/50 transition-colors group"
              @click="emit('select-day', day)"
            >
              <div class="text-sm font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">{{ dfDay.format(day).split(' ')[0] }}</div>
              <div 
                class="text-2xl font-black mt-1 w-10 h-10 mx-auto flex items-center justify-center rounded-full transition-all group-hover:scale-110"
                :class="day.toDateString() === new Date().toDateString() ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground'"
              >
                {{ day.getDate() }}
              </div>
            </div>
          </div>

          <!-- Time Grid -->
          <!-- We assume 1px = 2.5 minutes (scale = 2.5), so 24 hours = 3600px tall -->
          <div class="pt-6 pb-6">
            <div class="relative grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] h-[3600px]">
              
              <!-- Hour Labels (Column 0) -->
              <div class="relative border-r border-border bg-card/30">
                <div v-for="hour in hours" :key="hour" class="absolute w-full text-right pr-2 text-xs font-bold text-muted-foreground transform -translate-y-1/2" :style="`top: ${hour * 150}px`">
                  {{ hour.toString().padStart(2, '0') }}:00
                </div>
              </div>

              <!-- Day Columns -->
              <div v-for="(day, dIdx) in daysOfWeek" :key="dIdx" class="relative border-r border-border/50 last:border-r-0">
                <!-- Horizontal grid lines (1 hour = 150px) -->
                <div v-for="hour in hours" :key="hour" class="absolute w-full border-t border-border/30" :style="`top: ${hour * 150}px; height: 150px;`"></div>

                <!-- Tasks -->
                <div
                  v-for="task in getTasksForDay(day)"
                  :key="task.id"
                  class="absolute p-1 transition-all duration-300 hover:!z-50 hover:scale-[1.05] cursor-pointer group"
                  :style="`top: ${task.top}px; left: 2px; right: 4px; z-index: ${task.zIndex}`"
                  @click="emit('open-task', task)"
                >
                  <div 
                    class="w-full h-[90px] bg-background/95 backdrop-blur-sm rounded-xl border-l-[6px] p-2.5 overflow-hidden shadow-md group-hover:shadow-2xl group-hover:bg-background transition-all duration-300 grid grid-cols-[36px_1fr] gap-3 items-center"
                    :class="[getTaskColor(task), task.status === 'COMPLETED' ? 'opacity-60' : '']"
                  >
                    <!-- Big Icon -->
                    <div class="flex items-center justify-center h-full">
                      <component 
                        :is="IconMap[task.tags && task.tags.length > 0 ? task.tags[0]?.icon || 'Tag' : 'Tag']" 
                        class="w-7 h-7 opacity-80" 
                      />
                    </div>
                    
                    <!-- Content -->
                    <div class="flex flex-col justify-center min-w-0">
                      <div class="font-bold text-sm leading-tight line-clamp-2">{{ task.title }}</div>
                      <div class="text-[11px] font-bold opacity-75 flex items-center gap-1 mt-1">
                        <Clock class="w-3 h-3 shrink-0" />
                        {{ formatTimeOnly(new Date(task.dueDate as string)) }}
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
