import { and, eq, gte, isNull, lte, ne, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tasks } from '../../../db/schema'
import { NotificationRepository } from '../repositories'
import { NotificationService } from './notification.service'

type TaskRow = {
  id: string
  userId: string
  title: string
  dueDate: Date | null
  startDate: Date | null
  status: string
}

type NotifyAction = {
  userId: string
  type: string
  title: string
  message: string
}

export const checkDueTasks = async () => {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000)

  const rows: TaskRow[] = await db
    .select({
      id: tasks.id,
      userId: tasks.userId,
      title: tasks.title,
      dueDate: tasks.dueDate,
      startDate: tasks.startDate,
      status: tasks.status,
    })
    .from(tasks)
    .where(
      and(
        isNull(tasks.deletedAt),
        ne(tasks.status, 'COMPLETED'),
        or(
          and(gte(tasks.dueDate, oneMinuteAgo), lte(tasks.dueDate, fiveMinLater)),
          and(gte(tasks.startDate, oneMinuteAgo), lte(tasks.startDate, now)),
        ),
      ),
    )

  const actions: NotifyAction[] = []

  for (const task of rows) {
    const due = task.dueDate ? new Date(task.dueDate) : null
    const start = task.startDate ? new Date(task.startDate) : null

    if (due && due >= oneMinuteAgo && due <= now) {
      actions.push({
        userId: task.userId,
        type: `TASK_DUE:${task.id}`,
        title: 'Tarea Vencida',
        message: `La tarea "${task.title}" ha vencido`,
      })
    }

    if (due && due > now && due <= fiveMinLater) {
      actions.push({
        userId: task.userId,
        type: `TASK_DUE_SOON:${task.id}`,
        title: 'Tarea por Vencer',
        message: `"${task.title}" vence en menos de 5 minutos`,
      })
    }

    if (start && start >= oneMinuteAgo && start <= now) {
      actions.push({
        userId: task.userId,
        type: `TASK_TIME_REACHED:${task.id}`,
        title: 'Hora de la Tarea',
        message: `Es momento de iniciar: "${task.title}"`,
      })
    }
  }

  let count = 0

  for (const action of actions) {
    const exists = await NotificationRepository.findExistingByType(action.userId, action.type)
    if (exists) continue

    await NotificationService.recordNotification({
      userId: action.userId,
      channel: 'IN_APP',
      type: action.type,
      title: action.title,
      message: action.message,
    })
    count++
  }

  return count
}
