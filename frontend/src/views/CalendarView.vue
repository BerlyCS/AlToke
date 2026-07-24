<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { taskService } from '@/services/task.service'
import { useTaskManager } from '@/composables/useTaskManager'
import { useTaskDeadline, type TaskWithDeadline } from '@/composables/useTaskDeadline'
import { toast } from 'vue-sonner'
import type { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import ViewTaskDialog from '@/components/ViewTaskDialog.vue'
import TaskCard from '@/components/TaskCard.vue'

import CalendarWeekView from '@/components/calendar/CalendarWeekView.vue'
import CalendarDayView from '@/components/calendar/CalendarDayView.vue'
import CalendarMonthView from '@/components/calendar/CalendarMonthView.vue'

const {
  tasks,
  loading,
  showViewModal,
  selectedTask,
  openTask,
  onTaskUpdated,
  deleteTask,
  toggleTaskStatus
} = useTaskManager()



const currentDate = ref(new Date())
const viewMode = ref<'day' | 'week' | 'month'>('week')

const totalActiveTasks = ref(0)
const pageSize = 50
const currentPage = ref(0)
const hasMore = computed(() => tasks.value.length < totalActiveTasks.value)

const { tasksWithDeadline, startWatching, stopWatching } = useTaskDeadline(tasks)

const selectedTaskDeadlineStatus = computed(() => {
  if (!selectedTask.value) return undefined
  return tasksWithDeadline.value.find((t) => t.id === selectedTask.value?.id)?.deadlineStatus
})

const dfMonth = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const dfDay = new Intl.DateTimeFormat('es-ES', { weekday: 'long' })

const pendingDayTasks = computed(() => {
  const targetDate = currentDate.value.toDateString()
  const dayTasks = tasksWithDeadline.value.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate).toDateString() === targetDate && t.status !== 'COMPLETED',
  )

  dayTasks.sort((a, b) => {
    return new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime()
  })

  return dayTasks
})



onMounted(async () => {
  await fetchTasks()
  startWatching()
  window.addEventListener('altoke:refresh-tasks', fetchTasks)
})

onUnmounted(() => {
  window.removeEventListener('altoke:refresh-tasks', fetchTasks)
})

async function fetchTasks() {
  try {
    loading.value = true
    currentPage.value = 0
    const result = await taskService.getActiveTasks(pageSize, 0)
    tasks.value = result.tasks
    totalActiveTasks.value = result.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  try {
    currentPage.value++
    const offset = currentPage.value * pageSize
    const result = await taskService.getActiveTasks(pageSize, offset)
    tasks.value = [...tasks.value, ...result.tasks]
  } catch (e) {
    console.error(e)
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

function handleSelectDay(day: Date) {
  currentDate.value = day
  viewMode.value = 'day'
}

function toggleStatus(task: Task) {
  const taskWithDeadline = tasksWithDeadline.value.find((t) => t.id === task.id)
  toggleTaskStatus(task, taskWithDeadline?.deadlineStatus === 'expired')
}

function handleDeleteTask(id: string) {
  deleteTask(id, () => {
    showViewModal.value = false
  })
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-2rem)] w-full max-w-[1600px] mx-auto gap-4">
    <!-- Header Actions -->
    <div
      class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4 shrink-0 animate-fadeInUp"
      style="animation-delay: 0.1s; animation-fill-mode: both;"
    >
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
      <div class="flex-1 flex flex-col min-h-0 animate-fadeInUp" style="animation-delay: 0.2s; animation-fill-mode: both;">
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
          class="bg-primary text-primary-foreground border-primary shadow-xl rounded-3xl overflow-hidden shrink-0 relative animate-fadeInUp"
          style="animation-delay: 0.3s; animation-fill-mode: both;"
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
          class="flex-1 flex flex-col min-h-0 border-border shadow-xl rounded-3xl bg-card/60 backdrop-blur-xl animate-fadeInUp"
          style="animation-delay: 0.4s; animation-fill-mode: both;"
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

                <TaskCard
                  v-for="task in pendingDayTasks"
                  :key="task.id"
                  :task="task"
                  @click="openTask(task)"
                  @toggle-status="toggleTaskStatus"
                  @delete-task="deleteTask"
                />
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
      :deadline-status="selectedTaskDeadlineStatus"
      @delete-task="handleDeleteTask"
      @toggle-status="toggleStatus"
      @edit-task="() => {}"
    />
  </div>
</template>
