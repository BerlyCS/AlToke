import { and, asc, desc, eq, gte, lt, sql, isNull, isNotNull, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tasks, taskTags } from '../../../db/schema'
import type { Task } from '../domain'

const toTaskDomain = (task: typeof tasks.$inferSelect): Task => ({
  id: task.id,
  userId: task.userId,
  assignedBy: null,
  title: task.title,
  description: task.description ?? null,
  taskType: (task.type as Task['taskType']) ?? 'TASK',
  priority: (task.priority as Task['priority']) ?? 'MEDIUM',
  status: (task.status as Task['status']) ?? 'PENDING',
  estimatedTimeMinutes: task.estimatedTime ?? 0,
  startTime: task.startDate ?? null,
  dueDate: task.dueDate ?? null,
  completionDate: task.completedAt ?? null,
  deletedAt: task.deletedAt ?? null,
  tags: [],
  createdAt: task.createdAt,
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
  static async createTask(data: typeof tasks.$inferInsert) {
    const [task] = await db.insert(tasks).values(data).returning()
    return task
  }

  static async addTaskTags(taskId: string, tagIds: string[]) {
    if (tagIds.length === 0) return
    const taskTagsData = tagIds.map((tagId) => ({ taskId, tagId }))
    await db.insert(taskTags).values(taskTagsData)
  }

  static async removeTaskTags(taskId: string) {
    await db.delete(taskTags).where(eq(taskTags.taskId, taskId))
  }

  static async countTasks(userId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.userId, userId))
    return Number(count)
  }

  static async countCompletedTasks(userId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, 'COMPLETED')))
    return Number(count)
  }

  static async countActiveTasks(userId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          isNull(tasks.deletedAt),
          or(eq(tasks.status, 'PENDING'), eq(tasks.status, 'IN_PROGRESS')),
        ),
      )
    return Number(count)
  }

  static async findActiveTasks(userId: string, limit: number, offset: number) {
    return await db.query.tasks.findMany({
      where: and(
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
        or(eq(tasks.status, 'PENDING'), eq(tasks.status, 'IN_PROGRESS')),
      ),
      with: {
        taskTags: {
          with: { tag: true },
        },
      },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit,
      offset,
    })
  }

  static async findAll(userId: string, search?: string) {
    return await db.query.tasks.findMany({
      where: and(
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
        search
          ? or(ilike(tasks.title, `%${search}%`), ilike(tasks.description, `%${search}%`))
          : undefined,
      ),
      with: {
        taskTags: {
          with: { tag: true },
        },
      },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })
  }

  static async findById(userId: string, taskId: string) {
    return await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
      with: {
        taskTags: {
          with: { tag: true },
        },
      },
    })
  }

  static async findTrashed(userId: string) {
    return await db.query.tasks.findMany({
      where: and(eq(tasks.userId, userId), isNotNull(tasks.deletedAt)),
      with: {
        taskTags: {
          with: { tag: true },
        },
      },
      orderBy: (t, { desc }) => [desc(t.deletedAt)],
    })
  }

  static async update(userId: string, taskId: string, data: Partial<typeof tasks.$inferInsert>) {
    const [task] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning()
    return task || null
  }

  static async softDelete(userId: string, taskId: string) {
    const [task] = await db
      .update(tasks)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning()
    return task || null
  }

  static async restore(userId: string, taskId: string) {
    const [task] = await db
      .update(tasks)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId), isNotNull(tasks.deletedAt)))
      .returning()
    return task || null
  }

  static async markCompleted(userId: string, taskId: string, completedAt: Date) {
    const [task] = await db
      .update(tasks)
      .set({ status: 'COMPLETED', completedAt, updatedAt: completedAt })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning()
    return task || null
  }

  static async permanentlyDeleteOld() {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const result = await db
      .delete(tasks)
      .where(and(isNotNull(tasks.deletedAt), lt(tasks.deletedAt, cutoff)))
      .returning({ id: tasks.id })
    return result.length
  }

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

