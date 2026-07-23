import { ref, computed, onUnmounted, watch, type Ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Task } from '@/types'

export type TaskDeadlineStatus = 'normal' | 'dueSoon' | 'expired'

export interface TaskWithDeadline extends Task {
  deadlineStatus: TaskDeadlineStatus
  minutesRemaining: number | null
}

const EXPIRED_ALERT_SHOWN_KEY = 'altoke_expired_alerts_shown'
const DUE_SOON_ALERT_SHOWN_KEY = 'altoke_due_soon_alerts_shown'

function getAlertsShown(key: string): Set<string> {
  try {
    const stored = localStorage.getItem(key)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function markAlertShown(key: string, taskId: string) {
  const shown = getAlertsShown(key)
  shown.add(taskId)
  localStorage.setItem(key, JSON.stringify([...shown]))
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

export const expiredTaskData = ref<{ open: boolean; taskTitle: string }>({
  open: false,
  taskTitle: '',
})

export const expiredTaskQueue = ref<string[]>([])

export function processExpiredTaskQueue() {
  if (expiredTaskQueue.value.length > 0 && !expiredTaskData.value.open) {
    const nextTitle = expiredTaskQueue.value.shift()
    if (nextTitle) {
      expiredTaskData.value = { open: true, taskTitle: nextTitle }
    }
  }
}

export function useTaskDeadline(tasks: Ref<Task[]>) {
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
    const expiredAlerts = getAlertsShown(EXPIRED_ALERT_SHOWN_KEY)
    const dueSoonAlerts = getAlertsShown(DUE_SOON_ALERT_SHOWN_KEY)

    for (const task of tasks.value) {
      if (!task.dueDate || task.status === 'COMPLETED') continue
      const due = new Date(task.dueDate)
      const diffMs = due.getTime() - now.getTime()
      const minutesRemaining = Math.floor(diffMs / 60000)

      if (minutesRemaining < 0 && !expiredAlerts.has(task.id)) {
        expiredTasks.value.add(task.id)
        expiredTaskQueue.value.push(task.title)
        processExpiredTaskQueue()
        markAlertShown(EXPIRED_ALERT_SHOWN_KEY, task.id)
      } else if (minutesRemaining >= 0 && minutesRemaining <= 5 && !dueSoonAlerts.has(task.id)) {
        toast('Tarea por vencer', {
          description: `La tarea "${task.title}" vence en ${minutesRemaining} min`,
          duration: 8000,
        })
        markAlertShown(DUE_SOON_ALERT_SHOWN_KEY, task.id)
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
    const shown = getAlertsShown(EXPIRED_ALERT_SHOWN_KEY)
    shown.delete(taskId)
    localStorage.setItem(EXPIRED_ALERT_SHOWN_KEY, JSON.stringify([...shown]))
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
