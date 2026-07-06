<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { taskService } from '@/services/task.service'
import type { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  Circle,
  Trash2,
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
import ViewTaskDialog from '@/components/ViewTaskDialog.vue'

import CalendarWeekView from '@/components/calendar/CalendarWeekView.vue'
import CalendarDayView from '@/components/calendar/CalendarDayView.vue'
import CalendarMonthView from '@/components/calendar/CalendarMonthView.vue'

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

const currentDate = ref(new Date())
const viewMode = ref<'day' | 'week' | 'month'>('week')

const tasks = ref<Task[]>([])
const loading = ref(true)
const selectedTask = ref<Task | null>(null)
const showViewModal = ref(false)

const dfMonth = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const dfDay = new Intl.DateTimeFormat('es-ES', { weekday: 'long' })

const pendingDayTasks = computed(() => {
  const targetDate = currentDate.value.toDateString()
  const dayTasks = tasks.value.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate).toDateString() === targetDate && t.status !== 'COMPLETED',
  )

  dayTasks.sort((a, b) => {
    return new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime()
  })

  return dayTasks
})

function getTaskColors(task: Task) {
  if (task.tags && task.tags.length > 0) {
    const firstTag = task.tags[0]
    if (firstTag && firstTag.color) {
      const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        'bg-red-500': {
          bg: 'bg-red-500/10',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-500/20',
        },
        'bg-orange-500': {
          bg: 'bg-orange-500/10',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-500/20',
        },
        'bg-yellow-500': {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-600 dark:text-yellow-400',
          border: 'border-yellow-500/20',
        },
        'bg-green-500': {
          bg: 'bg-green-500/10',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-500/20',
        },
        'bg-blue-500': {
          bg: 'bg-blue-500/10',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-500/20',
        },
        'bg-indigo-500': {
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-600 dark:text-indigo-400',
          border: 'border-indigo-500/20',
        },
        'bg-purple-500': {
          bg: 'bg-purple-500/10',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-500/20',
        },
        'bg-pink-500': {
          bg: 'bg-pink-500/10',
          text: 'text-pink-600 dark:text-pink-400',
          border: 'border-pink-500/20',
        },
      }
      return (
        colorMap[firstTag.color] || {
          bg: 'bg-primary/10',
          text: 'text-primary',
          border: 'border-primary/20',
        }
      )
    }
  }
  return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' }
}

function formatTimeOnly(dateInput: string | Date) {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(dateInput),
  )
}

onMounted(async () => {
  await fetchTasks()
})

async function fetchTasks() {
  try {
    loading.value = true
    tasks.value = await taskService.getAllTasks()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function nextDateRange() {
  const next = new Date(currentDate.value)
  if (viewMode.value === 'week') next.setDate(next.getDate() + 7)
  else if (viewMode.value === 'day') next.setDate(next.getDate() + 1)
  else if (viewMode.value === 'month') next.setMonth(next.getMonth() + 1)
  currentDate.value = next
}

function prevDateRange() {
  const prev = new Date(currentDate.value)
  if (viewMode.value === 'week') prev.setDate(prev.getDate() - 7)
  else if (viewMode.value === 'day') prev.setDate(prev.getDate() - 1)
  else if (viewMode.value === 'month') prev.setMonth(prev.getMonth() - 1)
  currentDate.value = prev
}

function goToToday() {
  currentDate.value = new Date()
}

function openTask(task: Task) {
  selectedTask.value = task
  showViewModal.value = true
}

function handleSelectDay(day: Date) {
  currentDate.value = day
  viewMode.value = 'day'
}

async function toggleStatus(task: Task) {
  try {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    const updated = await taskService.updateTask(task.id, { status: newStatus })
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index !== -1) tasks.value[index] = updated
  } catch (e) {
    console.error(e)
  }
}

async function deleteTask(id: string) {
  if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return
  try {
    await taskService.deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
    showViewModal.value = false
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-2rem)] w-full max-w-[1600px] mx-auto gap-4">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-4">
      <div class="text-center lg:text-left w-full lg:w-auto">
        <h2 class="text-3xl font-black capitalize">{{ dfMonth.format(currentDate) }}</h2>
        <p class="text-muted-foreground font-semibold">Organiza tu tiempo de manera visual</p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
        <!-- View Mode Switcher -->
        <div class="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
          <Button
            :variant="viewMode === 'day' ? 'default' : 'ghost'"
            class="rounded-lg h-9 px-4 font-bold"
            @click="viewMode = 'day'"
          >
            Día
          </Button>
          <Button
            :variant="viewMode === 'week' ? 'default' : 'ghost'"
            class="rounded-lg h-9 px-4 font-bold"
            @click="viewMode = 'week'"
          >
            Semana
          </Button>
          <Button
            :variant="viewMode === 'month' ? 'default' : 'ghost'"
            class="rounded-lg h-9 px-4 font-bold"
            @click="viewMode = 'month'"
          >
            Mes
          </Button>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="outline" class="font-bold rounded-xl h-10" @click="goToToday"
            >Hoy</Button
          >
          <div
            class="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-sm"
          >
            <Button variant="ghost" size="icon" class="rounded-lg h-8 w-8" @click="prevDateRange">
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" class="rounded-lg h-8 w-8" @click="nextDateRange">
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
      <!-- Calendar Area -->
      <div class="flex-1 flex flex-col min-h-0">
        <CalendarDayView
          v-if="viewMode === 'day'"
          :current-date="currentDate"
          :tasks="tasks"
          @open-task="openTask"
        />
        <CalendarWeekView
          v-else-if="viewMode === 'week'"
          :current-date="currentDate"
          :tasks="tasks"
          @open-task="openTask"
          @select-day="handleSelectDay"
        />
        <CalendarMonthView
          v-else-if="viewMode === 'month'"
          :current-date="currentDate"
          :tasks="tasks"
          @open-task="openTask"
          @select-day="handleSelectDay"
        />
      </div>

      <!-- Right Sidebar Area -->
      <div class="w-full xl:w-70 flex flex-col gap-4 min-h-0 shrink-0">
        <!-- Summary Card -->
        <Card
          class="bg-primary text-primary-foreground border-primary shadow-xl rounded-3xl overflow-hidden shrink-0 relative"
        >
          <div class="absolute -right-4 -bottom-4 opacity-20 pointer-events-none">
            <CalendarCheck class="w-36 h-36" />
          </div>
          <CardContent class="p-6 relative z-10 flex flex-col items-start gap-1">
            <p class="font-bold text-primary-foreground/90 uppercase tracking-wider text-sm">
              {{
                currentDate.toDateString() === new Date().toDateString()
                  ? 'Hoy tienes'
                  : 'El ' + dfDay.format(currentDate) + ' tienes'
              }}
            </p>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-6xl font-black tracking-tighter">{{ pendingDayTasks.length }}</span>
              <span class="text-xl font-bold leading-tight">tareas<br />pendientes</span>
            </div>
          </CardContent>
        </Card>

        <!-- Upcoming Tasks Card -->
        <Card
          class="flex-1 flex flex-col min-h-0 border-border shadow-xl rounded-3xl bg-card/60 backdrop-blur-xl"
        >
          <CardHeader class="pb-4 shrink-0 border-b border-border/50">
            <CardTitle class="text-xl font-black flex items-center justify-between">
              Próximas tareas
              <span class="bg-primary/20 text-primary text-sm px-2.5 py-0.5 rounded-full">{{
                pendingDayTasks.length
              }}</span>
            </CardTitle>
          </CardHeader>

          <CardContent class="p-0 flex-1 flex flex-col min-h-0">
            <ScrollArea class="h-full">
              <div class="p-4 flex flex-col gap-3">
                <div
                  v-if="pendingDayTasks.length === 0"
                  class="text-center text-muted-foreground p-8 flex flex-col items-center gap-2"
                >
                  <CheckCircle2 class="w-12 h-12 opacity-20" />
                  <p class="font-bold">No hay tareas pendientes</p>
                  <p class="text-sm opacity-80">Para esta fecha</p>
                </div>

                <div
                  v-for="task in pendingDayTasks"
                  :key="task.id"
                  class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md min-w-0"
                  :class="[getTaskColors(task).bg, getTaskColors(task).border]"
                  @click="openTask(task)"
                >
                  <div class="flex items-center gap-3 w-full min-w-0">
                    <button
                      @click.stop="toggleStatus(task)"
                      class="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
                    >
                      <Circle class="w-6 h-6 text-muted-foreground" />
                    </button>

                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center bg-background shadow-sm shrink-0"
                      :class="getTaskColors(task).text"
                    >
                      <component
                        :is="
                          IconMap[
                            task.tags && task.tags.length > 0 ? task.tags[0]?.icon || 'Tag' : 'Tag'
                          ]
                        "
                        class="w-5 h-5"
                      />
                    </div>

                    <div class="flex flex-col flex-1 min-w-0">
                      <span class="font-bold text-base leading-tight truncate">
                        {{ task.title }}
                      </span>
                      <div
                        class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground font-medium mt-1"
                      >
                        <span class="flex items-center gap-1" v-if="task.dueDate">
                          <Clock class="w-3.5 h-3.5" />
                          {{ formatTimeOnly(task.dueDate) }}
                        </span>
                        <span v-if="task.estimatedTime" class="flex items-center gap-1">
                          • {{ task.estimatedTime }} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center pl-1">
                    <button
                      class="p-2 rounded-lg hover:bg-destructive/10 text-destructive/50 hover:text-destructive transition-colors shrink-0"
                      @click.stop="deleteTask(task.id)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>

          <div class="p-4 border-t border-border/50 shrink-0 bg-muted/20">
            <RouterLink to="/tasks" class="flex items-center justify-center w-full">
              <Button class="w-full rounded-xl font-bold group" variant="default" size="lg">
                Ver todas mis tareas
                <ArrowRight class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </RouterLink>
          </div>
        </Card>
      </div>
    </div>

    <!-- Task Dialog reused for all views -->
    <ViewTaskDialog
      v-model:open="showViewModal"
      :task="selectedTask"
      @delete-task="deleteTask"
      @toggle-status="toggleStatus"
      @edit-task="() => {}"
    />
  </div>
</template>
