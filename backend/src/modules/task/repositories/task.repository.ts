// Task Repository
import { and, asc, desc, eq, gte, lt, sql } from 'drizzle-orm'
import { db } from '../../../db'
import { tasks } from '../../../db/schema'
import type { Priority, RecurrenceType, Task, TaskStatus, TaskType } from '../domain'

const toTaskDomain = (task: typeof tasks.$inferSelect): Task => ({
  id: task.id,
  userId: task.userId,
  title: task.title,
  description: task.description ?? '',
  type: (task.type as TaskType) ?? 'TASK',
  priority: (task.priority as Priority) ?? 'MEDIUM',
  status: (task.status as TaskStatus) ?? 'PENDING',
  estimatedTime: task.estimatedTime,
  startDate: task.startDate,
  dueDate: task.dueDate,
  completedAt: task.completedAt,
  recurrence: (task.recurrence as RecurrenceType) ?? 'NONE',
  deletedAt: task.deletedAt,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  tags: [],
})

const activityAt = sql<Date>`coalesce(${tasks.completedAt}, ${tasks.dueDate}, ${tasks.startDate})`

const startOfDay = (date: Date) => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const endOfDay = (date: Date) => {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

export abstract class TaskRepository {
  static async getRecentTasks(userId: string, limit = 10): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt), desc(tasks.completedAt), desc(tasks.dueDate))
      .limit(limit)

    return rows.map(toTaskDomain)
  }

  static async findByUserId(userId: string): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt), desc(tasks.completedAt), desc(tasks.dueDate))

    return rows.map(toTaskDomain)
  }

  static async findTasksForDate(userId: string, date: Date): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          sql`${activityAt} is not null`,
          gte(activityAt, startOfDay(date)),
          lt(activityAt, new Date(endOfDay(date).getTime() + 1)),
        ),
      )
      .orderBy(asc(tasks.createdAt))

    return rows.map(toTaskDomain)
  }
}
// Task Repository
