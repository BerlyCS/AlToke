import { eq, and, isNull, isNotNull, ilike, or, lt, sql } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, taskTags } from '../../db/schema'
import { GamificationService } from '../gamification/services'
import { NotificationService } from '../notification/services'
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

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.userId, userId))

    let newAchievement = null
    if (Number(count) === 1) {
      newAchievement = await GamificationService.triggerAchievement(userId, 'first_task_created')
    }

    const createdTask = await this.findById(userId, task!.id)
    return {
      ...createdTask,
      unlockedAchievements: newAchievement ? [newAchievement] : [],
    }
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
    const { tagIds, ...taskData } = data

    const [task] = await db
      .update(tasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning()

    if (!task) return null

    if (tagIds) {
      await db.delete(taskTags).where(eq(taskTags.taskId, taskId))
      if (tagIds.length > 0) {
        const taskTagsData = tagIds.map((tagId: string) => ({
          taskId: task.id,
          tagId,
        }))
        await db.insert(taskTags).values(taskTagsData)
      }
    }

    return await this.findById(userId, task.id)
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

    // Handle recurrence
    if (task.recurrence && task.recurrence !== 'NONE') {
      const nextStartDate = task.startDate ? new Date(task.startDate) : new Date()
      const nextDueDate = task.dueDate ? new Date(task.dueDate) : new Date()

      switch (task.recurrence) {
        case 'DAILY':
          nextStartDate.setDate(nextStartDate.getDate() + 1)
          nextDueDate.setDate(nextDueDate.getDate() + 1)
          break
        case 'WEEKLY':
          nextStartDate.setDate(nextStartDate.getDate() + 7)
          nextDueDate.setDate(nextDueDate.getDate() + 7)
          break
        case 'MONTHLY':
          nextStartDate.setMonth(nextStartDate.getMonth() + 1)
          nextDueDate.setMonth(nextDueDate.getMonth() + 1)
          break
        case 'YEARLY':
          nextStartDate.setFullYear(nextStartDate.getFullYear() + 1)
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
          break
      }

      const [newTask] = await db
        .insert(tasks)
        .values({
          userId: task.userId,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: 'PENDING',
          estimatedTime: task.estimatedTime,
          recurrence: task.recurrence,
          startDate: nextStartDate,
          dueDate: nextDueDate,
        })
        .returning()

      if (newTask && task.tags && task.tags.length > 0) {
        const taskTagsData = task.tags.map((tag) => ({
          taskId: newTask.id,
          tagId: tag.id,
        }))
        await db.insert(taskTags).values(taskTagsData)
      }
    }

    const xpResult = await GamificationService.addXP(
      userId,
      xpAmount,
      task.priority,
      completedOnTime,
    )

    // Check task count achievements
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, 'COMPLETED')))

    const taskAchs = []
    const numCount = Number(count)
    if (numCount === 1)
      taskAchs.push(await GamificationService.triggerAchievement(userId, 'first_task_completed'))
    if (numCount === 10)
      taskAchs.push(await GamificationService.triggerAchievement(userId, 'tasks_10'))
    if (numCount === 50)
      taskAchs.push(await GamificationService.triggerAchievement(userId, 'tasks_50'))
    if (numCount === 100)
      taskAchs.push(await GamificationService.triggerAchievement(userId, 'tasks_100'))

    const unlockedAchievements = [...xpResult.unlockedAchievements, ...taskAchs.filter(Boolean)]

    NotificationService.recordNotification({
      userId,
      type: 'TASK_COMPLETED',
      title: 'Tarea Completada',
      message: `Completaste: "${task.title}"`,
    }).catch(() => {})

    return {
      ...updated,
      tags: task.tags,
      xpAwarded: xpResult.gainedXp,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.currentLevel,
      newStreak: xpResult.streakCount,
      unlockedAchievements,
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
