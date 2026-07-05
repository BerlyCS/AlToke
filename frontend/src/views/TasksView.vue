<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { taskService } from '@/services/task.service'
import type { Task } from '@/types'

import CreateTaskDialog from '@/components/CreateTaskDialog.vue'
import ViewTaskDialog from '@/components/ViewTaskDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, Circle, Trash2, Plus, Search, ArrowUpDown } from 'lucide-vue-next'

const tasks = ref<Task[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const sortOrder = ref('newest')
const showCreateModal = ref(false)
const showViewModal = ref(false)
const selectedTask = ref<Task | null>(null)

const filteredTasks = computed(() => {
  let result = tasks.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((t) => t.title.toLowerCase().includes(q))
  }

  if (statusFilter.value !== 'all') {
    result = result.filter((t) => t.status === statusFilter.value)
  }

  if (priorityFilter.value !== 'all') {
    result = result.filter((t) => t.priority === priorityFilter.value)
  }

  result = [...result].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
  })

  return result
})

const priorityColors: Record<string, string> = {
  HIGH: 'text-red-500',
  MEDIUM: 'text-yellow-500',
  LOW: 'text-green-500',
}

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  IN_PROGRESS: 'En progreso',
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

async function toggleComplete(task: Task) {
  if (task.status === 'COMPLETED') return
  try {
    // For now use updateTask — completeTask wiring comes next
    const updated = await taskService.updateTask(task.id, { status: 'COMPLETED' })
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index !== -1) tasks.value[index] = updated
  } catch (e) {
    console.error(e)
  }
}

async function deleteTask(id: string) {
  if (!confirm('¿Eliminar esta tarea?')) return
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

function handleTaskCreated(task: Task) {
  tasks.value.unshift(task)
  showCreateModal.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h2 class="text-3xl font-black">Mis tareas</h2>
      <Button
        class="h-11 px-6 rounded-2xl font-bold flex items-center gap-2"
        @click="showCreateModal = true"
      >
        <Plus class="w-5 h-5" /> Nueva tarea
      </Button>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Buscar tareas..." class="pl-9 h-11" />
      </div>
      <Select v-model="statusFilter">
        <SelectTrigger class="w-full sm:w-40 h-11">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="PENDING">Pendientes</SelectItem>
          <SelectItem value="COMPLETED">Completadas</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="priorityFilter">
        <SelectTrigger class="w-full sm:w-40 h-11">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="HIGH">Alta</SelectItem>
          <SelectItem value="MEDIUM">Media</SelectItem>
          <SelectItem value="LOW">Baja</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="sortOrder">
        <SelectTrigger class="w-full sm:w-40 h-11">
          <ArrowUpDown class="w-4 h-4 mr-2" />
          <SelectValue placeholder="Orden" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Más recientes</SelectItem>
          <SelectItem value="oldest">Más antiguas</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="loading" class="text-center py-12 text-muted-foreground">Cargando tareas...</div>

    <div v-else-if="filteredTasks.length === 0" class="text-center py-12 text-muted-foreground">
      No hay tareas que coincidan con los filtros.
    </div>

    <div v-else class="grid gap-3">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:shadow-md transition cursor-pointer"
        @click="openTask(task)"
      >
        <button @click.stop="toggleComplete(task)" class="shrink-0">
          <CheckCircle v-if="task.status === 'COMPLETED'" class="w-6 h-6 text-success-500" />
          <Circle v-else class="w-6 h-6 text-muted-foreground hover:text-primary transition" />
        </button>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span
              :class="[
                task.status === 'COMPLETED'
                  ? 'line-through text-muted-foreground'
                  : 'font-semibold',
              ]"
            >
              {{ task.title }}
            </span>
            <span
              v-if="task.priority"
              :class="['text-xs font-bold', priorityColors[task.priority] || '']"
            >
              {{ priorityLabels[task.priority] || task.priority }}
            </span>
            <span v-if="task.dueDate" class="text-xs text-muted-foreground ml-auto">
              {{ new Date(task.dueDate).toLocaleDateString() }}
            </span>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {{ statusLabels[task.status] || task.status }}
            </span>
            <span v-if="task.estimatedTime" class="text-xs text-muted-foreground">
              {{ task.estimatedTime }} min
            </span>
            <div v-if="task.tags?.length" class="flex gap-1">
              <span
                v-for="tag in task.tags.slice(0, 3)"
                :key="tag.id"
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: tag.color || '#888' }"
              />
              <span v-if="task.tags.length > 3" class="text-xs text-muted-foreground">
                +{{ task.tags.length - 3 }}
              </span>
            </div>
          </div>
        </div>

        <button
          @click.stop="deleteTask(task.id)"
          class="shrink-0 p-2 hover:bg-destructive/10 rounded-xl transition text-muted-foreground hover:text-destructive"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <CreateTaskDialog
      :open="showCreateModal"
      @update:open="showCreateModal = $event"
      @created="handleTaskCreated"
    />

    <ViewTaskDialog
      v-if="selectedTask"
      :open="showViewModal"
      :task="selectedTask"
      @update:open="showViewModal = false"
    />
  </div>
</template>
