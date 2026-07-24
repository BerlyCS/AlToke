import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { TaskService } from '../../../../../src/modules/task/service'
import { TaskRepository } from '../../../../../src/modules/task/repositories/task.repository'
import { GamificationService } from '../../../../../src/modules/gamification/services'
import { NotificationService } from '../../../../../src/modules/notification/services'

const makeTask = (overrides: any = {}) => ({
  id: 'task-1',
  userId: 'user-1',
  title: 'Test Task',
  description: 'Desc',
  type: 'TASK',
  priority: 'HIGH',
  status: 'PENDING',
  estimatedTime: 30, // 30 mins
  recurrence: 'NONE',
  startDate: new Date('2026-07-01T10:00:00Z'),
  dueDate: new Date('2026-07-01T12:00:00Z'),
  completedAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  taskTags: [],
  ...overrides,
})

describe('TaskService', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('create', () => {
    it('creates a task and adds tags', async () => {
      const task = makeTask()
      spyOn(TaskRepository, 'createTask').mockResolvedValue(task as any)
      const addTagsSpy = spyOn(TaskRepository, 'addTaskTags').mockResolvedValue(undefined)
      spyOn(TaskRepository, 'countTasks').mockResolvedValue(2) // Not first task
      spyOn(TaskRepository, 'findById').mockResolvedValue(task as any)

      const result = await TaskService.create('user-1', {
        title: 'T',
        tagIds: ['tag-1', 'tag-2'],
      } as any)

      expect(addTagsSpy).toHaveBeenCalledWith('task-1', ['tag-1', 'tag-2'])
      expect(result.id).toBe('task-1')
      expect(result.unlockedAchievements).toEqual([])
    })

    it('triggers first_task_created achievement on first task', async () => {
      const task = makeTask()
      spyOn(TaskRepository, 'createTask').mockResolvedValue(task as any)
      spyOn(TaskRepository, 'countTasks').mockResolvedValue(1) // First task!
      const achievementSpy = spyOn(GamificationService, 'triggerAchievement').mockResolvedValue({ id: 'ach-1' } as any)
      spyOn(TaskRepository, 'findById').mockResolvedValue(task as any)

      const result = await TaskService.create('user-1', { title: 'T' } as any)

      expect(achievementSpy).toHaveBeenCalledWith('user-1', 'first_task_created')
      expect(result.unlockedAchievements.length).toBe(1)
    })
  })

  describe('completeTask', () => {
    it('returns null if task not found', async () => {
      spyOn(TaskRepository, 'findById').mockResolvedValue(null as any)
      const result = await TaskService.completeTask('user-1', 'task-x')
      expect(result).toBeNull()
    })

    it('returns task directly if already completed', async () => {
      const dbTask = makeTask({ status: 'COMPLETED', taskTags: [] })
      spyOn(TaskRepository, 'findById').mockResolvedValue(dbTask as any)
      
      const result = await TaskService.completeTask('user-1', 'task-1')
      const { taskTags, ...rest } = dbTask
      expect(result).toEqual({ ...rest, tags: [] })
    })

    it('calculates XP correctly and creates daily recurrence', async () => {
      const dbTask = makeTask({
        recurrence: 'DAILY',
        estimatedTime: 30,
        taskTags: [{ tag: { id: 'tag-1' } }],
        dueDate: new Date(Date.now() + 1000000000), // Far in the future
      })
      spyOn(TaskRepository, 'findById').mockResolvedValue(dbTask as any)
      spyOn(TaskRepository, 'markCompleted').mockResolvedValue({ ...dbTask, status: 'COMPLETED' } as any)
      
      const createTaskSpy = spyOn(TaskRepository, 'createTask').mockResolvedValue({ id: 'new-task' } as any)
      const addTagsSpy = spyOn(TaskRepository, 'addTaskTags').mockResolvedValue(undefined)
      
      const xpSpy = spyOn(GamificationService, 'addXP').mockResolvedValue({
        gainedXp: 70, // XP_BASE(10) + 30 * XP_PER_MINUTE(2)
        totalXp: 70,
        leveledUp: false,
        currentLevel: 1,
        streakCount: 2,
        unlockedAchievements: [],
      })
      
      spyOn(TaskRepository, 'countCompletedTasks').mockResolvedValue(5) // Not a milestone
      const notifSpy = spyOn(NotificationService, 'recordNotification').mockResolvedValue(undefined as any)

      const result = await TaskService.completeTask('user-1', 'task-1')

      // Verify Recurrence Creation
      expect(createTaskSpy).toHaveBeenCalled()
      const newRecurrenceCall = createTaskSpy.mock.calls[0][0] as any
      expect(newRecurrenceCall.recurrence).toBe('DAILY')
      expect(newRecurrenceCall.status).toBe('PENDING')
      
      // Original start was July 1st, so next should be July 2nd
      expect(newRecurrenceCall.startDate.getDate()).toBe(2)
      
      // Verify tags carried over
      expect(addTagsSpy).toHaveBeenCalledWith('new-task', ['tag-1'])

      // Verify XP Calculation
      // 30 mins * 2 + 10 = 70 XP
      expect(xpSpy).toHaveBeenCalledWith('user-1', 70, 'HIGH', true)

      // Verify Notification
      expect(notifSpy).toHaveBeenCalled()

      // Verify Result
      const successResult = result as any
      expect(successResult.xpAwarded).toBe(70)
      expect(successResult.newStreak).toBe(2)
    })

    it('awards milestone achievements on exactly 10, 50, 100 completions', async () => {
      const task = makeTask()
      spyOn(TaskRepository, 'findById').mockResolvedValue(task as any)
      spyOn(TaskRepository, 'markCompleted').mockResolvedValue({ ...task, status: 'COMPLETED' } as any)
      spyOn(GamificationService, 'addXP').mockResolvedValue({
        gainedXp: 10, totalXp: 10, leveledUp: false, currentLevel: 1, streakCount: 1, unlockedAchievements: [],
      })
      spyOn(NotificationService, 'recordNotification').mockResolvedValue(undefined as any)
      
      // Mock exactly 10 tasks completed
      spyOn(TaskRepository, 'countCompletedTasks').mockResolvedValue(10)
      const achSpy = spyOn(GamificationService, 'triggerAchievement').mockResolvedValue({ id: 'ach-10' } as any)

      const result = await TaskService.completeTask('user-1', 'task-1')

      expect(achSpy).toHaveBeenCalledWith('user-1', 'tasks_10')
      const successResult = result as any
      expect(successResult.unlockedAchievements.length).toBe(1)
    })
  })
})
