<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Tag, Briefcase, Home, Code, Heart, Star, Book, Coffee, Dumbbell, Music, AlignLeft } from 'lucide-vue-next'
import type { Component } from 'vue'

const IconMap: Record<string, Component> = { Tag, Briefcase, Home, Code, Heart, Star, Book, Coffee, Dumbbell, Music, AlignLeft }

const props = defineProps<{
  currentDate: Date
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'open-task', task: Task): void
  (e: 'select-day', day: Date): void
}>()

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const daysInMonth = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  
  // Fill previous month days
  let startOffset = firstDay.getDay() - 1 // Start on Monday
  if (startOffset === -1) startOffset = 6 // Sunday is 0 -> 6 days offset
  
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    })
  }
  
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    })
  }
  
  // Next month days to complete exactly 42 cells (6 weeks)
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    })
  }
  
  return days
})

function getTaskColor(task: Task) {
  if (task.tags && task.tags.length > 0) {
    const firstTag = task.tags[0];
    if (firstTag && firstTag.color) {
      const colorMap: Record<string, string> = {
        "bg-red-500": "bg-red-500/30 border-red-500 text-red-700 dark:text-red-300",
        "bg-orange-500": "bg-orange-500/30 border-orange-500 text-orange-700 dark:text-orange-300",
        "bg-yellow-500": "bg-yellow-500/30 border-yellow-500 text-yellow-700 dark:text-yellow-300",
        "bg-green-500": "bg-green-500/30 border-green-500 text-green-700 dark:text-green-300",
        "bg-blue-500": "bg-blue-500/30 border-blue-500 text-blue-700 dark:text-blue-300",
        "bg-indigo-500": "bg-indigo-500/30 border-indigo-500 text-indigo-700 dark:text-indigo-300",
        "bg-purple-500": "bg-purple-500/30 border-purple-500 text-purple-700 dark:text-purple-300",
        "bg-pink-500": "bg-pink-500/30 border-pink-500 text-pink-700 dark:text-pink-300",
      };
      return colorMap[firstTag.color] || "bg-primary/30 border-primary text-primary";
    }
  }

  if (task.priority === "HIGH") return "bg-red-500/30 border-red-500 text-red-700 dark:text-red-300";
  if (task.priority === "LOW") return "bg-green-500/30 border-green-500 text-green-700 dark:text-green-300";
  return "bg-primary/30 border-primary text-primary";
}

function getTasksForDay(day: Date) {
  const targetDate = day.toDateString();
  const dayTasks = props.tasks.filter((task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate).toDateString() === targetDate;
  });

  dayTasks.sort((a, b) => {
    return new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime();
  });

  return dayTasks;
}

function formatTimeOnly(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(date);
}
</script>

<template>
  <Card class="flex-1 border-border shadow-xl rounded-3xl overflow-hidden flex flex-col min-h-0 bg-card/60 backdrop-blur-xl">
    <CardContent class="p-0 flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <!-- Standard native horizontal scroll wrapper -->
      <div class="w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
        <!-- We use minmax(0, 1fr) to strictly prevent the rows from expanding beyond their equal share -->
        <div class="grid grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] h-full min-w-[800px]">
        
        <!-- Week Days Header -->
        <div 
          v-for="dayName in weekDays" 
          :key="dayName" 
          class="text-center font-black text-sm py-3 border-b border-border bg-card/80 text-muted-foreground uppercase tracking-wider"
        >
          {{ dayName }}
        </div>
        
        <!-- Month Cells -->
        <div 
          v-for="(day, idx) in daysInMonth" 
          :key="idx"
          class="border-b border-r border-border/50 flex flex-col transition-colors cursor-pointer group min-h-0 relative"
          :class="[
            day.isCurrentMonth ? 'bg-background/30 hover:bg-muted/30' : 'bg-muted/10 opacity-70 hover:bg-muted/20',
            (idx + 1) % 7 === 0 ? 'border-r-0' : '', // Remove right border for Sunday
            day.date.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''
          ]"
          @click="emit('select-day', day.date)"
        >
          <!-- Day Number -->
          <div class="flex justify-end p-2">
            <span 
              class="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-transform group-hover:scale-110"
              :class="day.date.toDateString() === new Date().toDateString() ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/80 group-hover:text-primary'"
            >
              {{ day.date.getDate() }}
            </span>
          </div>
          
          <!-- Tasks Container (Scrollable internally) -->
          <!-- We use min-h-0 to allow this flex child to shrink properly, and overflow-y-auto to scroll within its cell -->
          <div class="flex flex-col gap-1 overflow-y-auto min-h-0 flex-1 px-1.5 pb-2 custom-scrollbar">
            <div
              v-for="task in getTasksForDay(day.date)"
              :key="task.id"
              class="text-xs px-2 py-1.5 rounded-md border-l-4 cursor-pointer hover:opacity-80 transition-all hover:translate-x-0.5 flex flex-col shrink-0"
              :class="[getTaskColor(task), task.status === 'COMPLETED' ? 'opacity-40' : '']"
              @click.stop="emit('open-task', task)"
            >
              <div class="flex items-center justify-between gap-1 w-full min-w-0">
                <div class="flex items-center gap-1.5 min-w-0">
                  <component 
                    :is="IconMap[task.tags && task.tags.length > 0 ? task.tags[0]?.icon || 'Tag' : 'Tag']" 
                    class="w-3.5 h-3.5 shrink-0 opacity-80" 
                  />
                  <span class="font-bold truncate leading-tight">{{ task.title }}</span>
                </div>
                <span class="text-[9px] font-black opacity-60 shrink-0">{{ formatTimeOnly(new Date(task.dueDate as string)) }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
/* Very thin/subtle scrollbar for the tiny task containers */
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.6);
}
</style>
