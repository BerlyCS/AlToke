import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, taskTags } from '../../db/schema'
import type { TaskModel } from './model'

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

  static async findAll(userId: string) {
    const tasksData = await db.query.tasks.findMany({
      where: and(eq(tasks.userId, userId), isNull(tasks.deletedAt)),
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
}
