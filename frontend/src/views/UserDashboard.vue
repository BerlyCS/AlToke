<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { taskService } from '@/services/task.service'
import { gamificationService } from '@/services/gamification.service'
import { useAuthStore } from '@/stores/auth'
import { useTaskManager } from '@/composables/useTaskManager'
import { useTaskDeadline } from '@/composables/useTaskDeadline'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import type { Task, LeaderboardEntry } from '@/types'

import CreateTaskDialog from '@/components/CreateTaskDialog.vue'
import ViewTaskDialog from '@/components/ViewTaskDialog.vue'
import UpcomingTasks from '@/components/UpcomingTasks.vue'
import StatCard from '@/components/StatCard.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Zap,
  Trophy,
  Flame,
  Plus,
  Target,
  Users,
  ArrowRight,
  Award,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const {
  tasks,
  loading,
  showCreateModal,
  showViewModal,
  showEditModal,
  selectedTask,
  editingTask,
  openTask,
  editTask,
  onTaskCreated: baseOnTaskCreated,
  onTaskUpdated,
  toggleTaskStatus,
  deleteTask
} = useTaskManager()
const totalActiveTasks = ref(0)

const { tasksWithDeadline, startWatching, stopWatching } = useTaskDeadline(tasks)

const selectedTaskDeadlineStatus = computed(() => {
  if (!selectedTask.value) return undefined
  return tasksWithDeadline.value.find((t) => t.id === selectedTask.value?.id)?.deadlineStatus
})

const completedTasksCount = computed(() => {
  return tasks.value.filter((t) => t.status === 'COMPLETED').length
})

const leaderboard = ref<LeaderboardEntry[]>([])

const globalRanking = computed(() => {
  const entry = leaderboard.value.find((u) => u.userId === authStore.profile?.id)
  return entry ? entry.rank : 0
})

const rankingInfo = computed(() => {
  const entry = leaderboard.value.find((u) => u.userId === authStore.profile?.id)
  return entry ? `#${entry.rank} esta semana` : 'Fuera del top 50'
})

const currentStreak = computed(() => authStore.profile?.currentStreak ?? 0)

onMounted(async () => {
  if (!authStore.token) {
    router.push('/')
    return
  }
  await Promise.all([fetchTasks(), loadLeaderboard()])
  startWatching()
  window.addEventListener('altoke:refresh-tasks', fetchTasks)
})

onUnmounted(() => {
  window.removeEventListener('altoke:refresh-tasks', fetchTasks)
})

async function loadLeaderboard() {
  try {
    leaderboard.value = await gamificationService.getLeaderboard(50)
  } catch (error) {
    console.error('Failed to load leaderboard', error)
  }
}

async function fetchTasks() {
  try {
    loading.value = true
    const result = await taskService.getAllTasks()
    tasks.value = result
    totalActiveTasks.value = result.filter(t => t.status !== 'COMPLETED' && t.status !== 'FAILED').length
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function toggleStatus(task: Task) {
  const taskWithDeadline = tasksWithDeadline.value.find((t) => t.id === task.id)
  toggleTaskStatus(task, taskWithDeadline?.deadlineStatus === 'expired')
}

function logout() {
  stopWatching()
  authStore.logout()
  router.push('/')
}

function onTaskCreated(created: Task) {
  baseOnTaskCreated(created, () => totalActiveTasks.value++)
}
</script>

<template>
  <div class="flex flex-col gap-8 w-full max-w-7xl mx-auto">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div>
        <p class="text-muted-foreground font-semibold">Bienvenido de nuevo</p>
        <h2 class="text-4xl font-black mt-2">
          Hola, {{ authStore.profile?.nickname || 'Jugador' }}
        </h2>
      </div>

      <div class="flex gap-4">
        <Button
          variant="outline"
          class="h-12 px-6 rounded-2xl bg-card border-border font-bold flex items-center gap-3 hover:shadow-md transition text-muted-foreground"
          @click="logout"
        >
          Salir
        </Button>

        <Button
          class="h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg flex items-center gap-3 hover:scale-[1.02] transition duration-300"
          @click="showCreateModal = true"
        >
          <Plus class="w-5 h-5" />
          Nueva tarea
        </Button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <div class="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Tareas completadas"
          :value="completedTasksCount"
          :icon="CheckCircle"
          complement-info="+12% esta semana"
          bgColor="bg-primary/10"
          textColor="text-primary"
        />
        <StatCard
          title="XP Ganada"
          :value="authStore.profile?.xp || 0"
          :icon="Zap"
          complement-info="Nivel actual"
          bgColor="bg-warning/10"
          textColor="text-yellow-500"
        />
        <StatCard
          title="Ranking Global"
          :value="globalRanking"
          :icon="Trophy"
          :complement-info="rankingInfo"
          bgColor="bg-success/10"
          textColor="text-green-500"
        />
      </div>

      <div class="grid xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 min-w-0">
          <UpcomingTasks
            :tasks="tasksWithDeadline"
            @toggle-status="toggleStatus"
            @delete-task="deleteTask"
            @open-task="openTask"
          />
          <div class="mt-4 flex flex-col items-center gap-3">

            <Button
              variant="outline"
              class="rounded-2xl h-12 px-8 font-bold border-border gap-2"
              @click="router.push('/tasks')"
            >
              Ver todas las tareas
              <ArrowRight class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div class="space-y-6">
          <Card
            class="rounded-3xl border-0 bg-primary text-primary-foreground shadow-2xl overflow-hidden"
          >
            <CardContent class="p-8 bg-linear-to-br from-primary to-primary/80">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-primary-foreground/80 font-semibold">Racha actual</p>
                  <h3 class="text-6xl font-black mt-2">{{ currentStreak }}</h3>
                </div>
                <div
                  class="w-20 h-20 rounded-[28px] bg-primary-foreground/20 flex items-center justify-center"
                >
                  <Flame class="w-10 h-10 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Quick Actions -->
          <Card class="rounded-[35px] shadow-xl border-border bg-card">
            <CardContent class="p-8">
              <h3 class="text-2xl font-black">Acciones rápidas</h3>
              <div class="grid grid-cols-2 gap-4 mt-6">
                <button
                  class="h-28 rounded-3xl bg-primary/10 hover:scale-[1.03] transition flex flex-col items-center justify-center gap-3"
                  @click="showCreateModal = true"
                >
                  <Plus class="text-primary" />
                  <span class="font-bold text-primary">Crear tarea</span>
                </button>

                <button
                  class="h-28 rounded-3xl bg-pink-500/10 hover:scale-[1.03] transition flex flex-col items-center justify-center gap-3"
                  @click="router.push('/amigos')"
                >
                  <Users class="text-pink-500" />
                  <span class="font-bold text-pink-500">Amigos</span>
                </button>

                <button
                  class="h-28 rounded-3xl bg-yellow-500/10 hover:scale-[1.03] transition flex flex-col items-center justify-center gap-3"
                  @click="router.push('/ranking')"
                >
                  <Trophy class="text-yellow-500" />
                  <span class="font-bold text-yellow-500">Ranking</span>
                </button>

                <button
                  class="h-28 rounded-3xl bg-green-500/10 hover:scale-[1.03] transition flex flex-col items-center justify-center gap-3"
                  @click="router.push('/logros')"
                >
                  <Award class="text-green-500" />
                  <span class="font-bold text-green-500">Logros</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
      :deadline-status="selectedTaskDeadlineStatus"
      @delete-task="deleteTask"
      @toggle-status="toggleStatus"
      @edit-task="editTask"
    />
  </div>
</template>

<style scoped>
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Premium Aesthetic Variables */
:root {
  --bg-main: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.7);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --danger: #ef4444;
  --success: #10b981;

  --priority-low: #3b82f6;
  --priority-medium: #f59e0b;
  --priority-high: #ef4444;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.task-card.is-completed {
  opacity: 0.6;
  background: rgba(16, 185, 129, 0.05);
}

.task-card.is-completed .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.priority {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority.low {
  background: rgba(59, 130, 246, 0.1);
  color: var(--priority-low);
}
.priority.medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--priority-medium);
}
.priority.high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--priority-high);
}

.task-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.task-desc {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: white;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Spinner */
.loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
