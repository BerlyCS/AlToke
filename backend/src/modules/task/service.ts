import { eq, and, isNull, isNotNull, ilike, or, lt } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, taskTags } from '../../db/schema'
import { GamificationService } from '../gamification/services'
import type { TaskModel } from './model'

const XP_BASE = 10
const XP_PER_MINUTE = 2

export abstract class TaskService {
  static async create(userId: string, data: TaskModel['createTaskBody']) {
    const {
      tagIds,
      title,
      description,
      type,
      priority,
      estimatedTime,
      startDate,
      dueDate,
      recurrence,
    } = data

    const [task] = await db
      .insert(tasks)
      .values({
        userId,
        title,
        description,
        type,
        priority,
        estimatedTime,
        startDate,
        dueDate,
        recurrence,
      })
      .returning()

    if (task && tagIds && tagIds.length > 0) {
      const taskTagsData = tagIds.map((tagId: string) => ({
        taskId: task.id,
        tagId: tagId,
      }))
      await db.insert(taskTags).values(taskTagsData)
    }

    return await this.findById(userId, task!.id)
  }

  static async findAll(userId: string, search?: string) {
    const tasksData = await db.query.tasks.findMany({
      where: and(
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
        search
          ? or(ilike(tasks.title, `%${search}%`), ilike(tasks.description, `%${search}%`))
          : undefined,
      ),
      with: {
        taskTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    })

    return tasksData.map((task) => {
      const { taskTags, ...rest } = task
      return {
        ...rest,
        tags: taskTags.map((tt) => tt.tag),
      }
    })
  }

  static async findById(userId: string, taskId: string) {
    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
      with: {
        taskTags: {
          with: {
            tag: true,
          },
        },
      },
    })

    if (!task) return null

    const { taskTags, ...rest } = task
    return {
      ...rest,
      tags: taskTags.map((tt) => tt.tag),
    }
  }

  static async update(userId: string, taskId: string, data: TaskModel['updateTaskBody']) {
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

  static async completeTask(userId: string, taskId: string) {
    const task = await this.findById(userId, taskId)
    if (!task) return null

    if (task.status === 'COMPLETED') return task

    const now = new Date()
    const completedOnTime = !task.dueDate || now <= new Date(task.dueDate)
    const estimatedMinutes = task.estimatedTime ?? 0
    const xpAmount = XP_BASE + estimatedMinutes * XP_PER_MINUTE

    const [updated] = await db
      .update(tasks)
      .set({ status: 'COMPLETED', completedAt: now, updatedAt: now })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning()

    const xpResult = await GamificationService.addXP(
      userId,
      xpAmount,
      task.priority,
      completedOnTime,
    )

    return {
      ...updated,
      tags: task.tags,
      xpAwarded: xpResult.gainedXp,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.currentLevel,
    }
  }

  static async findTrashed(userId: string) {
    const tasksData = await db.query.tasks.findMany({
      where: and(eq(tasks.userId, userId), isNotNull(tasks.deletedAt)),
      with: {
        taskTags: {
          with: { tag: true },
        },
      },
      orderBy: (tasks, { desc }) => [desc(tasks.deletedAt)],
    })

    return tasksData.map((task) => {
      const { taskTags, ...rest } = task
      return { ...rest, tags: taskTags.map((tt) => tt.tag) }
    })
  }

  static async restore(userId: string, taskId: string) {
    const [task] = await db
      .update(tasks)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId), isNotNull(tasks.deletedAt)))
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
}
