import { ref, computed, onUnmounted, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { Task } from '@/types'

export type TaskDeadlineStatus = 'normal' | 'dueSoon' | 'expired'

export interface TaskWithDeadline extends Task {
  deadlineStatus: TaskDeadlineStatus
  minutesRemaining: number | null
}

const EXPIRED_ALERT_SHOWN_KEY = 'altoke_expired_alerts_shown'

function getExpiredAlertsShown(): Set<string> {
  try {
    const stored = localStorage.getItem(EXPIRED_ALERT_SHOWN_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function markExpiredAlertShown(taskId: string) {
  const shown = getExpiredAlertsShown()
  shown.add(taskId)
  localStorage.setItem(EXPIRED_ALERT_SHOWN_KEY, JSON.stringify([...shown]))
}

function clearExpiredAlertShown(taskId: string) {
  const shown = getExpiredAlertsShown()
  shown.delete(taskId)
  localStorage.setItem(EXPIRED_ALERT_SHOWN_KEY, JSON.stringify([...shown]))
}

function calculateDeadlineStatus(task: Task): {
  status: TaskDeadlineStatus
  minutesRemaining: number | null
} {
  if (!task.dueDate || task.status === 'COMPLETED') {
    return { status: 'normal', minutesRemaining: null }
  }

  const now = new Date()
  const due = new Date(task.dueDate)
  const diffMs = due.getTime() - now.getTime()
  const minutesRemaining = Math.floor(diffMs / 60000)

  if (minutesRemaining < 0) {
    return { status: 'expired', minutesRemaining }
  }
  if (minutesRemaining <= 5) {
    return { status: 'dueSoon', minutesRemaining }
  }
  return { status: 'normal', minutesRemaining }
}

export function useTaskDeadline(tasks: ReturnType<typeof import('vue').ref<Task[]>>) {
  const tickInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const expiredTasks = ref<Set<string>>(new Set())

  const tasksWithDeadline = computed<TaskWithDeadline[]>(() => {
    return tasks.value.map((task) => {
      const { status, minutesRemaining } = calculateDeadlineStatus(task)
      return {
        ...task,
        deadlineStatus: status,
        minutesRemaining,
      }
    })
  })

  function checkForNewExpiredTasks() {
    const now = new Date()
    const alertsShown = getExpiredAlertsShown()

    for (const task of tasks.value) {
      if (!task.dueDate || task.status === 'COMPLETED') continue
      const due = new Date(task.dueDate)
      if (due.getTime() <= now.getTime() && !alertsShown.has(task.id)) {
        expiredTasks.value.add(task.id)
        toast.error('Tarea vencida', {
          description: `La tarea "${task.title}" ha vencido`,
          duration: 8000,
        })
        markExpiredAlertShown(task.id)
      }
    }
  }

  function startWatching() {
    checkForNewExpiredTasks()
    tickInterval.value = setInterval(checkForNewExpiredTasks, 10000)
  }

  function stopWatching() {
    if (tickInterval.value) {
      clearInterval(tickInterval.value)
      tickInterval.value = null
    }
  }

  function isExpired(taskId: string): boolean {
    return expiredTasks.value.has(taskId)
  }

  function clearExpiredState(taskId: string) {
    expiredTasks.value.delete(taskId)
    clearExpiredAlertShown(taskId)
  }

  watch(
    tasks,
    () => {
      checkForNewExpiredTasks()
    },
    { deep: true },
  )

  onUnmounted(() => {
    stopWatching()
  })

  return {
    tasksWithDeadline,
    startWatching,
    stopWatching,
    isExpired,
    clearExpiredState,
    calculateDeadlineStatus,
  }
}
