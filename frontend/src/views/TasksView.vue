<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import { taskService } from '@/services/task.service'
import { tagService } from '@/services/tag.service'
import { toast } from 'vue-sonner'
import { aiService } from '@/services/ai.service'
import { useAuthStore } from '@/stores/auth'
import {
  useGamification,
  unlockedAchievementsQueue,
  processAchievementsQueue,
} from '@/composables/useGamification'
import { useTaskDeadline, type TaskWithDeadline } from '@/composables/useTaskDeadline'
import type { Task, Tag, TaskSuggestion } from '@/types'
import CreateTaskDialog from '@/components/CreateTaskDialog.vue'
import ViewTaskDialog from '@/components/ViewTaskDialog.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowDown,
  Plus,
  CheckCircle2,
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  ListTodo,
  Minus,
  Calendar,
  Filter,
  Search,
  Trash2,
  RefreshCw,
  Archive,
  Sparkles,
  Tag as TagIcon,
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
  Users,
} from 'lucide-vue-next'

const IconMap: Record<string, Component> = {
  Tag: TagIcon,
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

function getTaskColors(task: TaskWithDeadline) {
  if (task.deadlineStatus === 'expired') {
    return {
      bg: 'bg-red-900/20',
      border: 'border-red-500/40',
      text: 'text-red-400',
    }
  }
  const defaultColors = { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' }
  if (!task.tags || task.tags.length === 0) return defaultColors
  const color = task.tags?.[0]?.color
  return (color ? colorMap[color] : undefined) || defaultColors
}

function getDeadlineClass(task: TaskWithDeadline): string {
  if (task.deadlineStatus === 'expired') return 'opacity-60'
  if (task.deadlineStatus === 'dueSoon')
    return 'shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500/50'
  return ''
}

const authStore = useAuthStore()
const { showReward } = useGamification()
const router = useRouter()

const tasks = ref<Task[]>([])
const tags = ref<Tag[]>([])
const loading = ref(true)
const showCreateModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const selectedTask = ref<Task | null>(null)
const editingTask = ref<Task | null>(null)
const showTrash = ref(false)
const trashedTasks = ref<Task[]>([])
const filterStatus = ref<'ALL' | 'PENDING' | 'COMPLETED'>('ALL')
const filterPriority = ref<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
const filterType = ref<'ALL' | 'TASK' | 'MEETING' | 'EVENT'>('ALL')
const selectedTagIds = ref<Set<string>>(new Set())
const searchQuery = ref('')
const aiSuggestions = ref<TaskSuggestion[]>([])
const aiLoading = ref(false)
const aiError = ref('')
const showAiDialog = ref(false)
const totalActiveTasks = ref(0)
const pageSize = 50
const currentPage = ref(0)
const hasMore = computed(() => tasks.value.length < totalActiveTasks.value)

const { tasksWithDeadline, startWatching, stopWatching } = useTaskDeadline(tasks)

const filteredTasks = computed(() => {
  let result = tasksWithDeadline.value
  if (filterStatus.value !== 'ALL') {
    result = result.filter((t) => t.status === filterStatus.value)
  }
  if (filterPriority.value !== 'ALL') {
    result = result.filter((t) => t.priority === filterPriority.value)
  }
  if (filterType.value !== 'ALL') {
    result = result.filter((t) => t.type === filterType.value)
  }
  if (selectedTagIds.value.size > 0) {
    result = result.filter((t) => t.tags && t.tags.some((tag) => selectedTagIds.value.has(tag.id)))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)),
    )
  }
  return result
})

const pendingCount = computed(() => tasks.value.filter((t) => t.status === 'PENDING').length)
const completedCount = computed(() => tasks.value.filter((t) => t.status === 'COMPLETED').length)

onMounted(async () => {
  if (!authStore.token) {
    router.push('/login')
    return
  }
  await Promise.all([fetchTasks(), fetchTags()])
  startWatching()
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

async function fetchTags() {
  try {
    tags.value = await tagService.getAllTags()
  } catch (e) {
    console.error(e)
  }
}

function toggleTagFilter(id: string) {
  const next = new Set(selectedTagIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedTagIds.value = next
}

async function fetchTrashedTasks() {
  try {
    trashedTasks.value = await taskService.getTrashedTasks()
  } catch (e) {
    console.error(e)
  }
}

async function restoreTask(id: string) {
  try {
    await taskService.restoreTask(id)
    trashedTasks.value = trashedTasks.value.filter((t) => t.id !== id)
    await fetchTasks()
    toast.success('Tarea restaurada con éxito')
  } catch (e: any) {
    console.error(e)
    toast.error('Error al restaurar tarea', { description: e?.message })
  }
}

async function fetchAiSuggestions() {
  aiError.value = ''
  aiLoading.value = true
  try {
    const result = await aiService.getSuggestions()
    aiSuggestions.value = result.suggestions
    showAiDialog.value = true
  } catch (e) {
    aiError.value = 'No se pudieron obtener sugerencias'
    console.error(e)
  } finally {
    aiLoading.value = false
  }
}

async function acceptSuggestion(s: TaskSuggestion) {
  try {
    const created = await taskService.createTask({
      title: s.suggestedTitle,
      estimatedTime: 30,
      dueDate: s.suggestedTime,
    })
    tasks.value.unshift(created)
    aiSuggestions.value = aiSuggestions.value.filter((x) => x.id !== s.id)
  } catch (e) {
    console.error(e)
  }
}

async function toggleStatus(task: TaskWithDeadline) {
  if (task.deadlineStatus === 'expired') {
    toast.error('No se puede completar', { description: 'Esta tarea ya venció' })
    return
  }
  try {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    let updated: Task
    if (newStatus === 'COMPLETED') {
      const result = await taskService.completeTask(task.id)
      updated = { ...task, ...result }
      if (typeof result.xpAwarded === 'number') {
        authStore.addXP(result.xpAwarded, result.newLevel, result.newStreak)
        showReward(
          result.xpAwarded,
          task.title,
          result.leveledUp ?? false,
          result.newLevel,
          result.unlockedAchievements,
        )
      }
    } else {
      const result = await taskService.updateTask(task.id, { status: newStatus })
      updated = { ...task, ...result }
    }
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index !== -1) tasks.value[index] = updated
  } catch (e: any) {
    console.error(e)
    toast.error('Error al completar la tarea', { description: e?.message })
  }
}

async function deleteTask(id: string) {
  if (!confirm('¿Seguro que deseas enviar esta tarea a la papelera?')) return
  try {
    await taskService.deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
    toast.success('Tarea enviada a la papelera')
  } catch (e: any) {
    console.error(e)
    toast.error('Error al eliminar tarea', { description: e?.message })
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

function onTaskCreated(created: Task) {
  tasks.value.unshift(created)
  totalActiveTasks.value++
  if (created.unlockedAchievements?.length) {
    unlockedAchievementsQueue.value.push(...created.unlockedAchievements)
    processAchievementsQueue()
  }
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
        data-cy="create-task"
        class="h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg flex items-center gap-3 hover:scale-[1.02] transition duration-300"
        @click="showCreateModal = true"
      >
        <Plus class="w-5 h-5" />
        Nueva tarea
      </Button>
      <Button
        variant="outline"
        class="h-12 px-5 rounded-2xl font-bold border-border gap-2 relative overflow-hidden"
        :disabled="aiLoading"
        @click="fetchAiSuggestions()"
      >
        <div v-if="aiLoading" class="absolute inset-0 bg-primary/10">
          <div class="h-full bg-primary/20 animate-pulse" style="width: 60%"></div>
        </div>
        <span class="relative z-10 flex items-center gap-2">
          <Sparkles :class="aiLoading ? 'animate-spin' : ''" class="w-5 h-5 text-yellow-500" />
          {{ aiLoading ? 'Analizando...' : 'Sugerencias IA' }}
        </span>
      </Button>
    </div>

    <div class="flex items-center gap-2">
      <button
        data-cy="tasks-tab"
        class="px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2"
        :class="
          !showTrash
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="showTrash = false"
      >
        <ListTodo class="w-4 h-4" />
        Tareas
      </button>
      <button
        data-cy="trash-tab"
        class="px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2"
        :class="
          showTrash
            ? 'bg-destructive/20 text-destructive shadow-lg border border-destructive/30'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
        "
        @click="((showTrash = true), fetchTrashedTasks())"
      >
        <Archive class="w-4 h-4" />
        Papelera
      </button>
    </div>

    <template v-if="showTrash">
      <Card class="border-border bg-card/60 backdrop-blur-xl shadow-2xl">
        <CardContent class="grid gap-3 p-6">
          <div
            v-for="task in trashedTasks"
            :key="task.id"
            :data-cy="`trashed-task-${task.id}`"
            class="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5 transition-all min-w-0"
          >
            <div class="flex items-center gap-4 w-full min-w-0">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center bg-background shadow-sm shrink-0 text-destructive"
              >
                <Archive class="w-6 h-6" />
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <span
                  class="font-bold text-lg leading-tight truncate line-through text-muted-foreground"
                >
                  {{ task.title }}
                </span>
                <span class="text-xs text-muted-foreground font-medium mt-1">
                  Eliminada
                  {{ task.deletedAt ? new Date(task.deletedAt).toLocaleDateString() : '' }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 pl-2">
              <button
                :data-cy="`task-restore-${task.id}`"
                class="p-2 rounded-lg hover:bg-success/10 text-success/50 hover:text-success transition-colors shrink-0"
                @click="restoreTask(task.id)"
                title="Restaurar"
              >
                <RefreshCw class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div v-if="trashedTasks.length === 0" class="text-center py-16 text-muted-foreground">
            <Archive class="w-12 h-12 mx-auto text-destructive/50 mb-4"></Archive>
            <h3 class="text-xl font-bold text-foreground mb-2">Papelera vacía</h3>
            <p>Las tareas eliminadas aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    </template>

    <template v-else>
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

      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm text-muted-foreground font-semibold mr-1">Tipo:</span>
        <button
          class="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
          :class="
            filterType === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
          "
          @click="filterType = 'ALL'"
        >
          Todos
        </button>
        <button
          class="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
          :class="
            filterType === 'TASK'
              ? 'bg-blue-500/20 text-blue-500 shadow-lg border border-blue-500/30'
              : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
          "
          @click="filterType = 'TASK'"
        >
          <div class="flex items-center gap-1.5">
            <ListTodo class="w-3.5 h-3.5" />
            Tarea
          </div>
        </button>
        <button
          class="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
          :class="
            filterType === 'MEETING'
              ? 'bg-purple-500/20 text-purple-500 shadow-lg border border-purple-500/30'
              : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
          "
          @click="filterType = 'MEETING'"
        >
          <div class="flex items-center gap-1.5">
            <Users class="w-3.5 h-3.5" />
            Reunión
          </div>
        </button>
        <button
          class="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
          :class="
            filterType === 'EVENT'
              ? 'bg-green-500/20 text-green-500 shadow-lg border border-green-500/30'
              : 'bg-card text-muted-foreground hover:bg-card/80 border border-border'
          "
          @click="filterType = 'EVENT'"
        >
          <div class="flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5" />
            Evento
          </div>
        </button>
      </div>

      <div v-if="tags.length > 0" class="flex items-center gap-2 flex-wrap">
        <span class="text-sm text-muted-foreground font-semibold mr-1">
          <Filter class="w-3.5 h-3.5 inline mr-1" />
          Tags:
        </span>
        <button
          v-for="tag in tags"
          :key="tag.id"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border-2"
          :class="
            selectedTagIds.has(tag.id)
              ? `border-transparent text-white ${tag.color || 'bg-primary'}`
              : 'border-border bg-transparent text-muted-foreground hover:border-muted'
          "
          @click="toggleTagFilter(tag.id)"
        >
          <component :is="IconMap[tag.icon || 'Tag']" class="w-3.5 h-3.5" />
          {{ tag.name }}
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
            :data-cy="`task-row-${task.id}`"
            class="flex items-center justify-between p-4 rounded-xl border transition-all min-w-0"
            :class="[
              getTaskColors(task).bg,
              getTaskColors(task).border,
              getDeadlineClass(task),
              task.status === 'COMPLETED'
                ? 'opacity-50'
                : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
            ]"
            @click="openTask(task)"
          >
            <div class="flex items-center gap-4 w-full min-w-0">
              <button
                v-if="task.deadlineStatus !== 'expired'"
                :data-cy="`task-toggle-${task.id}`"
                @click.stop="toggleStatus(task)"
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
                  :class="{
                    'line-through text-muted-foreground': task.status === 'COMPLETED',
                    'text-red-400': task.deadlineStatus === 'expired',
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
                  <span
                    v-if="task.deadlineStatus === 'dueSoon'"
                    class="text-red-400 font-bold text-xs"
                  >
                    ¡Vence pronto!
                  </span>
                  <span
                    v-if="task.deadlineStatus === 'expired'"
                    class="text-red-500 font-bold text-xs"
                  >
                    Vencida
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
                @click.stop="deleteTask(task.id)"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div v-if="hasMore" class="flex justify-center pt-4">
            <Button variant="outline" class="rounded-xl font-bold border-border" @click="loadMore">
              Cargar más
            </Button>
          </div>

          <div v-if="filteredTasks.length === 0" class="text-center py-16 text-muted-foreground">
            <ListTodo class="w-12 h-12 mx-auto text-muted-foreground/50 mb-4"></ListTodo>
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
    </template>

    <CreateTaskDialog v-model:open="showCreateModal" :task="null" @created="onTaskCreated" />
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

    <Dialog v-model:open="showAiDialog">
      <DialogContent class="sm:max-w-lg border-border bg-background">
        <DialogHeader>
          <DialogTitle class="font-bold text-2xl flex items-center gap-2">
            <Sparkles class="w-6 h-6 text-yellow-500" />
            Sugerencias IA
          </DialogTitle>
          <DialogDescription> Basado en tu historial de tareas y hábitos </DialogDescription>
        </DialogHeader>
        <div v-if="aiLoading" class="flex justify-center py-8">
          <div
            class="w-8 h-8 border-4 border-white/10 border-l-primary rounded-full animate-spin"
          ></div>
        </div>
        <div v-else-if="aiError" class="text-center py-8 text-muted-foreground">
          <p>{{ aiError }}</p>
        </div>
        <div v-else-if="aiSuggestions.length === 0" class="text-center py-8 text-muted-foreground">
          <p>No hay sugerencias disponibles en este momento.</p>
        </div>
        <div v-else class="grid gap-4 py-4">
          <div
            v-for="s in aiSuggestions"
            :key="s.id"
            class="p-4 rounded-xl border border-border bg-card space-y-2"
          >
            <h4 class="font-bold text-lg">{{ s.suggestedTitle }}</h4>
            <p class="text-sm text-muted-foreground">{{ s.explanation }}</p>
            <div class="flex gap-2 pt-2">
              <Button size="sm" class="font-bold" @click="acceptSuggestion(s)"> Aceptar </Button>
              <Button
                size="sm"
                variant="ghost"
                @click="aiSuggestions = aiSuggestions.filter((x) => x.id !== s.id)"
              >
                Descartar
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showAiDialog = false">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
