// Task Repository
import { and, asc, desc, eq, gte, lt, sql } from 'drizzle-orm'
import { db } from '../../../db'
import { tasks } from '../../../db/schema'
import type { Task } from '../domain'

const toTaskDomain = (task: typeof tasks.$inferSelect): Task => ({
  id: task.id,
  userId: task.userId,
  assignedBy: task.assignedBy ?? null,
  title: task.title,
  description: task.description ?? null,
  taskType: (task.taskType as Task['taskType']) ?? 'TASK',
  priority: (task.priority as Task['priority']) ?? 'MEDIUM',
  status: (task.status as Task['status']) ?? 'PENDING',
  estimatedTimeMinutes: task.estimatedTimeMinutes ?? 0,
  startTime: task.startTime ?? null,
  dueDate: task.dueDate ?? null,
  completionDate: task.completionDate ?? null,
  deletedAt: task.deletedAt ?? null,
  tags: Array.isArray(task.tags) ? (task.tags as string[]) : [],
  createdAt: task.createdAt,
})

const activityAt = sql<Date>`coalesce(${tasks.completionDate}, ${tasks.dueDate}, ${tasks.startTime})`

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
      .orderBy(desc(tasks.createdAt), desc(tasks.completionDate), desc(tasks.dueDate))
      .limit(limit)

    return rows.map(toTaskDomain)
  }

  static async findByUserId(userId: string): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt), desc(tasks.completionDate), desc(tasks.dueDate))

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
export {}
