<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import { taskService } from '@/services/task.service'
import { useAuthStore } from '@/stores/auth'
import type { Task } from '@/types'
import CreateTaskDialog from '@/components/CreateTaskDialog.vue'
import ViewTaskDialog from '@/components/ViewTaskDialog.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowDown,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  Minus,
  Search,
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

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  'bg-red-500': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500' },
  'bg-orange-500': {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-500',
  },
  'bg-yellow-500': {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-500',
  },
  'bg-green-500': { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500' },
  'bg-blue-500': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500' },
  'bg-indigo-500': {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-500',
  },
  'bg-purple-500': {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-500',
  },
  'bg-pink-500': { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-500' },
}

function getTaskColors(task: Task) {
  const defaultColors = { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' }
  if (!task.tags || task.tags.length === 0) return defaultColors
  const color = task.tags?.[0]?.color
  return (color ? colorMap[color] : undefined) || defaultColors
}

const authStore = useAuthStore()
const router = useRouter()

const tasks = ref<Task[]>([])
const loading = ref(true)
const showCreateModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const selectedTask = ref<Task | null>(null)
const editingTask = ref<Task | null>(null)
const filterStatus = ref<'ALL' | 'PENDING' | 'COMPLETED'>('ALL')
const filterPriority = ref<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
const searchQuery = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchTasks(searchQuery.value)
  }, 700)
})

const filteredTasks = computed(() => {
  let result = tasks.value
  if (filterStatus.value !== 'ALL') {
    result = result.filter((t) => t.status === filterStatus.value)
  }
  if (filterPriority.value !== 'ALL') {
    result = result.filter((t) => t.priority === filterPriority.value)
  }
  return result
})

const pendingCount = computed(() => tasks.value.filter((t) => t.status === 'PENDING').length)
const completedCount = computed(() => tasks.value.filter((t) => t.status === 'COMPLETED').length)

onMounted(async () => {
  if (!authStore.token) {
    router.push('/')
    return
  }
  await fetchTasks()
})

async function fetchTasks(search?: string) {
  try {
    loading.value = true
    tasks.value = await taskService.getAllTasks(search)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
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
  if (!confirm('¿Seguro que deseas enviar esta tarea a la papelera?')) return
  try {
    await taskService.deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  } catch (e) {
    console.error(e)
  }
}

function openTask(task: Task) {
  selectedTask.value = task
  showViewModal.value = true
}

function editTask(task: Task) {
  editingTask.value = task
  showEditModal.value = true
}

function onTaskUpdated(updated: Task) {
  const index = tasks.value.findIndex((t) => t.id === updated.id)
  if (index !== -1) tasks.value[index] = updated
}

function formatTime(val: string | Date) {
  const d = new Date(val)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex flex-col gap-8 w-full max-w-7xl mx-auto">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div class="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full h-10 w-10"
          @click="router.push('/dashboard')"
        >
          <ArrowLeft class="w-5 h-5" />
        </Button>
        <div>
          <p class="text-muted-foreground font-semibold">Gestión de tareas</p>
          <h2 class="text-4xl font-black mt-1">Mis tareas</h2>
        </div>
      </div>

      <Button
        class="h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg flex items-center gap-3 hover:scale-[1.02] transition duration-300"
        @click="showCreateModal = true"
      >
        <Plus class="w-5 h-5" />
        Nueva tarea
      </Button>
    </div>

    <div class="flex items-center gap-3 flex-wrap">
      <button
        class="px-5 py-2.5 rounded-xl font-bold transition-all duration-200"
        :class="
          filterStatus === 'ALL'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="filterStatus = 'ALL'"
      >
        <div class="flex items-center gap-2">
          <ListTodo class="w-4 h-4" />
          Todas ({{ tasks.length }})
        </div>
      </button>
      <button
        class="px-5 py-2.5 rounded-xl font-bold transition-all duration-200"
        :class="
          filterStatus === 'PENDING'
            ? 'bg-warning/20 text-yellow-500 shadow-lg border border-yellow-500/30'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="filterStatus = 'PENDING'"
      >
        <div class="flex items-center gap-2">
          <Clock class="w-4 h-4" />
          Pendientes ({{ pendingCount }})
        </div>
      </button>
      <button
        class="px-5 py-2.5 rounded-xl font-bold transition-all duration-200"
        :class="
          filterStatus === 'COMPLETED'
            ? 'bg-success/20 text-green-500 shadow-lg border border-green-500/30'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="filterStatus = 'COMPLETED'"
      >
        <div class="flex items-center gap-2">
          <CheckCircle class="w-4 h-4" />
          Completadas ({{ completedCount }})
        </div>
      </button>
    </div>

    <div class="flex items-center gap-3 flex-wrap">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar tareas..."
          class="h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-64"
        />
      </div>
      <div class="w-px h-6 bg-border"></div>
      <span class="text-sm text-muted-foreground font-semibold mr-1">Prioridad:</span>
      <button
        class="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
        :class="
          filterPriority === 'ALL'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="filterPriority = 'ALL'"
      >
        Todas
      </button>
      <button
        class="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
        :class="
          filterPriority === 'HIGH'
            ? 'bg-red-500/20 text-red-500 shadow-lg border border-red-500/30'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="filterPriority = 'HIGH'"
      >
        <div class="flex items-center gap-1.5">
          <AlertTriangle class="w-3.5 h-3.5" />
          Alta
        </div>
      </button>
      <button
        class="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
        :class="
          filterPriority === 'MEDIUM'
            ? 'bg-yellow-500/20 text-yellow-500 shadow-lg border border-yellow-500/30'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="filterPriority = 'MEDIUM'"
      >
        <div class="flex items-center gap-1.5">
          <Minus class="w-3.5 h-3.5" />
          Media
        </div>
      </button>
      <button
        class="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
        :class="
          filterPriority === 'LOW'
            ? 'bg-green-500/20 text-green-500 shadow-lg border border-green-500/30'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="filterPriority = 'LOW'"
      >
        <div class="flex items-center gap-1.5">
          <ArrowDown class="w-3.5 h-3.5" />
          Baja
        </div>
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="w-10 h-10 border-4 border-white/10 border-l-primary rounded-full animate-spin"
      ></div>
    </div>

    <Card v-else class="border-border bg-card/60 backdrop-blur-xl shadow-2xl">
      <CardContent class="grid gap-3 p-6">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md min-w-0"
          :class="[
            getTaskColors(task).bg,
            getTaskColors(task).border,
            task.status === 'COMPLETED' ? 'opacity-50' : '',
          ]"
          @click="openTask(task)"
        >
          <div class="flex items-center gap-4 w-full min-w-0">
            <button
              @click.stop="toggleStatus(task)"
              class="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <CheckCircle2 v-if="task.status === 'COMPLETED'" class="w-6 h-6 text-green-500" />
              <Circle v-else class="w-6 h-6 text-muted-foreground" />
            </button>

            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center bg-background shadow-sm shrink-0"
              :class="getTaskColors(task).text"
            >
              <component
                :is="
                  IconMap[task.tags && task.tags.length > 0 ? task.tags[0]?.icon || 'Tag' : 'Tag']
                "
                class="w-6 h-6"
              />
            </div>

            <div class="flex flex-col flex-1 min-w-0">
              <span
                class="font-bold text-lg leading-tight truncate"
                :class="{ 'line-through text-muted-foreground': task.status === 'COMPLETED' }"
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
              class="p-2 rounded-lg hover:bg-destructive/10 text-destructive/50 hover:text-destructive transition-colors shrink-0"
              @click.stop="deleteTask(task.id)"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-if="filteredTasks.length === 0" class="text-center py-16 text-muted-foreground">
          <div class="text-5xl mb-4 opacity-50">📋</div>
          <h3 class="text-xl font-bold text-foreground mb-2">
            {{
              filterStatus === 'ALL'
                ? 'No hay tareas'
                : filterStatus === 'PENDING'
                  ? 'No hay tareas pendientes'
                  : 'No hay tareas completadas'
            }}
          </h3>
          <p class="mb-6">Crea una nueva tarea para empezar</p>
          <Button @click="showCreateModal = true">
            <Plus class="w-4 h-4 mr-2" />
            Crear tarea
          </Button>
        </div>
      </CardContent>
    </Card>

    <CreateTaskDialog
      v-model:open="showCreateModal"
      :task="null"
      @created="(t) => tasks.unshift(t)"
    />
    <CreateTaskDialog
      v-model:open="showEditModal"
      :task="editingTask"
      @updated="onTaskUpdated"
      @update:open="showEditModal = false"
    />
    <ViewTaskDialog
      v-model:open="showViewModal"
      :task="selectedTask"
      @delete-task="deleteTask"
      @toggle-status="toggleStatus"
      @edit-task="editTask"
    />
  </div>
</template>
