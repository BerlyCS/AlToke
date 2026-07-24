import { GamificationService } from '../gamification/services'
import { NotificationService } from '../notification/services'
import { UserRepository } from '../user/repositories/user.repository'
import type { TaskModel } from './model'
import { TaskRepository } from './repositories/task.repository'

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

    const task = await TaskRepository.createTask({
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

    if (task && tagIds && tagIds.length > 0) {
      await TaskRepository.addTaskTags(task.id, tagIds as string[])
    }

    const count = await TaskRepository.countTasks(userId)
    let newAchievement = null
    if (count === 1) {
      newAchievement = await GamificationService.triggerAchievement(userId, 'first_task_created')
    }

    const createdTask = await this.findById(userId, task!.id)
    return {
      ...createdTask,
      unlockedAchievements: newAchievement ? [newAchievement] : [],
    }
  }

  static async findAll(userId: string, search?: string) {
    await this.rollForwardExpiredRecurringTasks()
    const tasksData = await TaskRepository.findAll(userId, search)

    return tasksData.map((task) => {
      const { taskTags, ...rest } = task
      return {
        ...rest,
        tags: taskTags.map((tt) => tt.tag),
      }
    })
  }

  static async findActive(userId: string, limit: number = 50, offset: number = 0) {
    await this.rollForwardExpiredRecurringTasks()
    const total = await TaskRepository.countActiveTasks(userId)
    const tasksData = await TaskRepository.findActiveTasks(userId, limit, offset)

    return {
      tasks: tasksData.map((task) => {
        const { taskTags, ...rest } = task
        return {
          ...rest,
          tags: taskTags.map((tt) => tt.tag),
        }
      }),
      total,
      limit,
      offset,
    }
  }

  static async findById(userId: string, taskId: string) {
    const task = await TaskRepository.findById(userId, taskId)
    if (!task) return null

    const { taskTags, ...rest } = task
    return {
      ...rest,
      tags: taskTags.map((tt) => tt.tag),
    }
  }

  static async update(userId: string, taskId: string, data: TaskModel['updateTaskBody']) {
    const { tagIds, ...taskData } = data

    const task = await TaskRepository.update(userId, taskId, taskData)
    if (!task) return null

    if (tagIds) {
      await TaskRepository.removeTaskTags(taskId)
      if (tagIds.length > 0) {
        await TaskRepository.addTaskTags(taskId, tagIds as string[])
      }
    }

    return await this.findById(userId, taskId)
  }

  static async softDelete(userId: string, taskId: string) {
    return await TaskRepository.softDelete(userId, taskId)
  }

  static async completeTask(userId: string, taskId: string) {
    const task = await this.findById(userId, taskId)
    if (!task) return null

    if (task.status === 'COMPLETED') return task

    const now = new Date()
    const alreadyCompletedBefore = task.completedAt !== null

    const updated = await TaskRepository.markCompleted(userId, taskId, now)
    if (!updated) return null

    // Handle recurrence
    let nextTaskResponse = null
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

      const newTask = await TaskRepository.createTask({
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

      if (newTask && task.tags && task.tags.length > 0) {
        await TaskRepository.addTaskTags(
          newTask.id,
          task.tags.map((t) => t.id),
        )
      }

      if (newTask) {
        const fullNewTask = await this.findById(userId, newTask.id)
        if (fullNewTask) {
          nextTaskResponse = fullNewTask
        }
      }
    }

    NotificationService.recordNotification({
      userId,
      type: 'TASK_COMPLETED',
      title: 'Tarea Completada',
      message: `Completaste: "${task.title}"`,
    }).catch(() => {})

    // XP and achievements are only awarded the first time the task is completed
    if (alreadyCompletedBefore) {
      const user = await UserRepository.findById(userId)
      return {
        ...updated,
        tags: task.tags,
        xpAwarded: 0,
        leveledUp: false,
        newLevel: user?.level ?? 1,
        newStreak: user?.currentStreak ?? 0,
        unlockedAchievements: [],
        nextTask: nextTaskResponse,
      }
    }

    const completedOnTime = !task.dueDate || now <= new Date(task.dueDate)
    const estimatedMinutes = task.estimatedTime ?? 0
    const xpAmount = XP_BASE + estimatedMinutes * XP_PER_MINUTE

    const xpResult = await GamificationService.addXP(
      userId,
      xpAmount,
      task.priority,
      completedOnTime,
    )

    // Check task count achievements
    const count = await TaskRepository.countCompletedTasks(userId)
    const taskAchs = []

    if (count === 1)
      taskAchs.push(await GamificationService.triggerAchievement(userId, 'first_task_completed'))
    if (count === 10)
      taskAchs.push(await GamificationService.triggerAchievement(userId, 'tasks_10'))
    if (count === 50)
      taskAchs.push(await GamificationService.triggerAchievement(userId, 'tasks_50'))
    if (count === 100)
      taskAchs.push(await GamificationService.triggerAchievement(userId, 'tasks_100'))

    const unlockedAchievements = [...xpResult.unlockedAchievements, ...taskAchs.filter(Boolean)]

    return {
      ...updated,
      tags: task.tags,
      xpAwarded: xpResult.gainedXp,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.currentLevel,
      newStreak: xpResult.streakCount,
      unlockedAchievements,
      nextTask: nextTaskResponse,
    }
  }

  static async findTrashed(userId: string) {
    const tasksData = await TaskRepository.findTrashed(userId)

    return tasksData.map((task) => {
      const { taskTags, ...rest } = task
      return { ...rest, tags: taskTags.map((tt) => tt.tag) }
    })
  }

  static async restore(userId: string, taskId: string) {
    return await TaskRepository.restore(userId, taskId)
  }

  static async permanentlyDeleteOld() {
    return await TaskRepository.permanentlyDeleteOld()
  }

  static async rollForwardExpiredRecurringTasks() {
    const now = new Date()
    const { db } = await import('../../db')
    const { tasks } = await import('../../db/schema')
    const { and, lt, ne, isNull } = await import('drizzle-orm')

    const expiredRecurring = await db.query.tasks.findMany({
      where: and(
        lt(tasks.dueDate, now),
        ne(tasks.status, 'COMPLETED'),
        ne(tasks.status, 'FAILED'),
        ne(tasks.recurrence, 'NONE'),
        isNull(tasks.deletedAt)
      )
    })

    let count = 0
    for (const task of expiredRecurring) {
      if (!task.recurrence || task.recurrence === 'NONE') continue

      const nextStartDate = task.startDate ? new Date(task.startDate) : new Date()
      const nextDueDate = task.dueDate ? new Date(task.dueDate) : new Date()

      while (nextDueDate < now) {
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
      }

      await db.update(tasks).set({
        status: 'FAILED',
        updatedAt: new Date()
      }).where(and(eq(tasks.id, task.id), eq(tasks.userId, task.userId)))

      const [newTask] = await db.insert(tasks).values({
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
      }).returning()

      const fullOldTask = await this.findById(task.userId, task.id)
      if (fullOldTask && fullOldTask.tags && fullOldTask.tags.length > 0) {
        const taskTagsData = fullOldTask.tags.map(t => ({
          taskId: newTask.id,
          tagId: t.id
        }))
        await db.insert(taskTags).values(taskTagsData)
      }

      count++
    }
    
    return count
  }
}
