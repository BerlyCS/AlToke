import { ref } from 'vue'
import { taskService } from '@/services/task.service'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import {
  useGamification,
  unlockedAchievementsQueue,
  processAchievementsQueue,
} from '@/composables/useGamification'
import type { Task } from '@/types'

export function useTaskManager() {
  const authStore = useAuthStore()
  const { showReward } = useGamification()

  const tasks = ref<Task[]>([])
  const loading = ref(true)

  // Modals state
  const showCreateModal = ref(false)
  const showViewModal = ref(false)
  const showEditModal = ref(false)

  // Selected task state
  const selectedTask = ref<Task | null>(null)
  const editingTask = ref<Task | null>(null)

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

  function onTaskCreated(created: Task, onCreatedCallback?: () => void) {
    tasks.value.unshift(created)
    if (onCreatedCallback) onCreatedCallback()

    if (created.unlockedAchievements?.length) {
      unlockedAchievementsQueue.value.push(...created.unlockedAchievements)
      processAchievementsQueue()
    }
  }

  async function toggleTaskStatus(task: Task, isExpired: boolean = false) {
    if (isExpired) {
      toast.error('No se puede completar', { description: 'Esta tarea ya venció' })
      return
    }
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
      let updated: Task
      if (newStatus === 'COMPLETED') {
        const result = await taskService.completeTask(task.id)
        updated = { ...task, ...result }
        
        if (result.nextTask) {
          onTaskCreated(result.nextTask)
        }
        
        if (result.xpAwarded > 0) {
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
      onTaskUpdated(updated)
    } catch (e: any) {
      console.error(e)
      toast.error('Error al completar la tarea', { description: e?.message })
    }
  }

  async function deleteTask(id: string, onDeletedCallback?: () => void) {
    if (!confirm('¿Seguro que deseas enviar esta tarea a la papelera?')) return
    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
      if (onDeletedCallback) onDeletedCallback()
      toast.success('Tarea enviada a la papelera')
    } catch (e: any) {
      console.error(e)
      toast.error('Error al eliminar tarea', { description: e?.message })
    }
  }

  return {
    tasks,
    loading,
    showCreateModal,
    showViewModal,
    showEditModal,
    selectedTask,
    editingTask,
    openTask,
    editTask,
    onTaskCreated,
    onTaskUpdated,
    toggleTaskStatus,
    deleteTask,
  }
}
