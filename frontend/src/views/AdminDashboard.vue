<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { AdminMetrics, PerformanceMetricsResponse, TaskMetricsResponse, TopUsersResponse } from '@/types'

import StatCard from '@/components/StatCard.vue'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Zap, 
  Users, 
  Activity, 
  Award,
  Target,
  ListChecks,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const metrics = ref<AdminMetrics>()
const taskMetrics = ref<TaskMetricsResponse>()
const topUsers = ref<TopUsersResponse>()
const perMetrics = ref<PerformanceMetricsResponse>()
const loading = ref(true)


onMounted(async () => {
  if (!authStore.token) {
    router.push('/')
    return
  }
  await fetchMetrics()
})

async function fetchMetrics() {
  try {
    loading.value = true
    metrics.value = await adminService.getMetrics()
    taskMetrics.value = await adminService.getTaskMetrics()
    topUsers.value = await adminService.getTopUsers()
    perMetrics.value = await adminService.getPerformanceMetrics()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function logout() {
  authStore.logout()
  router.push('/')
}

function getColor(type: string) {
  const badges = {
    'PENDING': 'bg-emerald-500 text-emerald-500',
    'COMPLETED': 'bg-yellow-500 text-purple-500',
  }
  return badges[type as keyof typeof badges] || 'bg-gray-500/10 text-gray-500'
}

function getLabel(type: string) {
  const badges = {
    'PENDING': 'Pendiente',
    'COMPLETED': 'Completado',
  }
  return badges[type as keyof typeof badges] || ''
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
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <div class="grid md:grid-cols-4 gap-6">
        <StatCard
          title="Usuarios Totales"
          :value="metrics?.totalUsers"
          :icon="Users"
          complement-info="+12 esta semana"
          bgColor="bg-blue-500/10"
          textColor="text-blue-500"
        />
        <StatCard
          title="Usuarios Activos Diarios"
          :value="metrics?.activeUsersDaily"
          :icon="Activity"
          complement-info="72% de usuarios activos"
          bgColor="bg-green-500/10"
          textColor="text-green-500"
        />
        <StatCard
          title="Tareas Completadas Hoy"
          :value="metrics?.tasksCompletedToday"
          :icon="CheckCircle"
          complement-info="Tasa de completitud: 63%"
          bgColor="bg-purple-500/10"
          textColor="text-purple-500"
        />
        <StatCard
          title="Total de Tareas"
          :value="metrics?.totalTasks"
          :icon="Zap"
          complement-info="+15.7% esta semana"
          bgColor="bg-yellow-500/10"
          textColor="text-yellow-500"
        />
      </div>


      <!-- Main Content Grid -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Top Usuarios -->
        <Card class="lg:col-span-2 rounded-2xl shadow-xl border-border bg-card p-6">
          <CardHeader>
            <CardTitle class="text-xl font-bold">Top Usuarios</CardTitle>
            <p class="text-sm text-muted-foreground">Los mejores en rendimiento</p>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="space-y-3">
              <div 
                v-for="(user, index) in topUsers?.users" 
                :key="user.id"
                class="flex items-center justify-between p-3 rounded-xl hover:bg-muted/5 transition border border-border/50"
              >
                <div class="flex items-center gap-3">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <div class="font-medium">{{ user.nickname }}</div>
                    <div class="flex items-center gap-3 text-xs text-muted-foreground">
                      <span class="flex items-center gap-1">
                        <CheckCircle class="w-3 h-3" />
                        Nivel {{ user.level }}
                      </span>
                      <span class="flex items-center gap-1">
                        <Zap class="w-3 h-3" />
                        {{ user.streak }} días
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-primary">{{ user.xp.toLocaleString() }}</div>
                  <div class="text-xs text-muted-foreground">XP</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Distribución de Tareas -->
        <Card class="rounded-2xl shadow-xl border-border bg-card p-7">
          <CardHeader>
            <CardTitle class="text-xl font-bold">Distribución de Tareas</CardTitle>
            <p class="text-sm text-muted-foreground">Estado actual de todas las tareas</p>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="space-y-4">
              <div 
                v-for="item in taskMetrics?.typeTask" 
                :key="item.type"
                class="flex items-center justify-between p-2 rounded-lg hover:bg-muted/5 transition"
              >
                <div class="flex items-center gap-3">
                  <div 
                    class="w-3 h-3 rounded-full"
                    :class="getColor(item.type)"
                  ></div>
                  <span class="text-sm font-medium">{{ getLabel(item.type) }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold">{{ item.count }}</span>
                </div>
              </div>
              
              <!-- Barras de progreso para distribución -->
              <div class="mt-4 space-y-2">
                <div 
                  v-for="item in taskMetrics?.typeTask" 
                  :key="item.type + '-bar'"
                  class="space-y-1"
                >
                  <div class="flex justify-between text-xs">
                    <span class="text-muted-foreground">{{ getLabel(item.type) }}</span>
                    <span>{{ Math.round((item.count / (taskMetrics?.totalTasks ?? 1)) * 100) }}%</span>
                  </div>
                  <div class="w-full bg-muted rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all"
                      :style="{ 
                        width: `${(item.count / (taskMetrics?.totalTasks ?? 1)) * 100}%`
                      }"
                      :class="getColor(item.type)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Segunda fila: Rendimiento y Top Usuarios -->
      <div class="grid gap-6">
        <!-- Métricas de Rendimiento -->
        <Card class="rounded-[35px] shadow-xl border-border bg-card p-6">
          <CardHeader>
            <CardTitle class="text-xl font-bold">Métricas de Rendimiento</CardTitle>
            <p class="text-sm text-muted-foreground">Indicadores clave de rendimiento</p>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="grid grid-cols-3 gap-4">
              <div class="p-4 bg-muted/10 rounded-xl">
                <div class="flex items-center gap-2 text-muted-foreground mb-2">
                  <Target class="w-4 h-4" />
                  <span class="text-sm">Tasa de Completitud</span>
                </div>
                <div class="text-2xl font-bold text-emerald-500">{{ perMetrics?.completionRate }}%</div>
                <div class="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div 
                    class="bg-emerald-500 h-1.5 rounded-full transition-all"
                    :style="{ width: `${perMetrics?.completionRate}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="p-4 bg-muted/10 rounded-xl">
                <div class="flex items-center gap-2 text-muted-foreground mb-2">
                  <ListChecks class="w-4 h-4" />
                  <span class="text-sm">Tareas por Usuario</span>
                </div>
                <div class="text-2xl font-bold text-primary">{{ (taskMetrics?.totalTasks ?? 0) / (topUsers?.totalUsers ?? 1)  }}</div>
                <div class="text-xs text-muted-foreground mt-1">Promedio general</div>
              </div>
              
              <div class="p-4 bg-muted/10 rounded-xl">
                <div class="flex items-center gap-2 text-muted-foreground mb-2">
                  <Award class="w-4 h-4" />
                  <span class="text-sm">XP Total</span>
                </div>
                <div class="text-2xl font-bold text-yellow-500">{{ perMetrics?.totalXp.toLocaleString() }}</div>
                <div class="text-xs text-muted-foreground mt-1">Experiencia acumulada</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </template>
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
