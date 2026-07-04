import { and, asc, desc, eq, isNotNull, isNull, lt } from 'drizzle-orm'
import { db } from '../../../db'
import { tasks } from '../../../db/schema'
import type { Task, Tag } from '../domain/entities'

// --- Mapper ---
const toTask = (row: typeof tasks.$inferSelect, taskTagsArray: Tag[] = []): Task => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  description: row.description ?? '',
  type: row.type as Task['type'],
  priority: row.priority as Task['priority'],
  status: row.status as Task['status'],
  estimatedTime: row.estimatedTime ?? null,
  startDate: row.startDate ?? null,
  dueDate: row.dueDate ?? null,
  completedAt: row.completedAt ?? null,
  recurrence: row.recurrence as Task['recurrence'],
  deletedAt: row.deletedAt ?? null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  tags: taskTagsArray,
})

// --- Repository ---
export class TaskRepository {
  async save(task: Task): Promise<void> {
    await db.insert(tasks).values({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      status: task.status,
      estimatedTime: task.estimatedTime,
      startDate: task.startDate,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      recurrence: task.recurrence,
      deletedAt: task.deletedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  }

  async update(task: Task): Promise<void> {
    await db
      .update(tasks)
      .set({
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        status: task.status,
        estimatedTime: task.estimatedTime,
        startDate: task.startDate,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        recurrence: task.recurrence,
        deletedAt: task.deletedAt,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, task.id))
  }

  async findById(id: string): Promise<Task | null> {
    const [row] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1)

    return row ? toTask(row) : null
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          isNull(tasks.deletedAt)
        )
      )
      .orderBy(asc(tasks.dueDate))

    return rows.map((row: typeof tasks.$inferSelect) => toTask(row))
  }

  async findTrashedTasks(userId: string): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          isNotNull(tasks.deletedAt)
        )
      )
      .orderBy(desc(tasks.deletedAt))

    return rows.map((row: typeof tasks.$inferSelect) => toTask(row))
  }

  async findExpiredTrash(beforeDate: Date): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(
        and(
          isNotNull(tasks.deletedAt),
          lt(tasks.deletedAt, beforeDate)
        )
      )

    return rows.map((row: typeof tasks.$inferSelect) => toTask(row))
  }
}