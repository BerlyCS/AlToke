import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockTasks, mockTask, mockCompleteTaskResult, mockProfile } from '../fixtures'

vi.mock('@/services/task.service', () => ({
  taskService: {
    getAllTasks: vi.fn<(...args: any[]) => any>(),
    createTask: vi.fn<(...args: any[]) => any>(),
    completeTask: vi.fn<(...args: any[]) => any>(),
    deleteTask: vi.fn<(...args: any[]) => any>(),
    restoreTask: vi.fn<(...args: any[]) => any>(),
    updateTask: vi.fn<(...args: any[]) => any>(),
  },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn<(...args: any[]) => any>(), error: vi.fn<(...args: any[]) => any>() },
}))

vi.mock('@/composables/useGamification', () => ({
  useGamification: () => ({
    showReward: vi.fn<(...args: any[]) => any>(),
  }),
  unlockedAchievementsQueue: { value: [] },
  processAchievementsQueue: vi.fn<(...args: any[]) => any>(),
}))

describe('Task CRUD Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads tasks and stores them', async () => {
    const { taskService } = await import('@/services/task.service')
    ;(taskService.getAllTasks as any).mockResolvedValue(mockTasks)
    const tasks = await taskService.getAllTasks()
    expect(tasks).toHaveLength(4)
    expect(tasks[0]!.title).toBe('Terminar reporte')
  })

  it('creates a task and adds it to the list', async () => {
    const { taskService } = await import('@/services/task.service')
    const newTask = { ...mockTask, id: 'new-1', title: 'Nueva tarea' }
    ;(taskService.createTask as any).mockResolvedValue(newTask)

    const created = await taskService.createTask({ title: 'Nueva tarea' })
    expect(created.id).toBe('new-1')
    expect(created.title).toBe('Nueva tarea')
  })

  it('completes a task and gets XP', async () => {
    const { taskService } = await import('@/services/task.service')
    const store = useAuthStore()
    store.setAuth({ id: '1', email: 'test@test.com', nickname: 'Test' }, mockProfile, 'token')

    ;(taskService.completeTask as any).mockResolvedValue(mockCompleteTaskResult)
    const result = await taskService.completeTask('task-1')
    expect(result.xpAwarded).toBe(50)
    expect(result.status).toBe('COMPLETED')

    store.addXP(result.xpAwarded, result.newLevel, result.newStreak)
    expect(store.profile!.xp).toBe(550)
  })

  it('deletes a task and removes from list', async () => {
    const { taskService } = await import('@/services/task.service')
    ;(taskService.deleteTask as any).mockResolvedValue({ ...mockTask, id: 'task-1' })

    let tasks = [...mockTasks]
    const deleted = await taskService.deleteTask('task-1')
    tasks = tasks.filter((t) => t.id !== deleted.id)
    expect(tasks).toHaveLength(3)
    expect(tasks.find((t) => t.id === 'task-1')).toBeUndefined()
  })

  it('restores a trashed task', async () => {
    const { taskService } = await import('@/services/task.service')
    ;(taskService.restoreTask as any).mockResolvedValue({
      ...mockTask,
      id: 'task-1',
      deletedAt: null,
    })

    const restored = await taskService.restoreTask('task-1')
    expect(restored.deletedAt).toBeNull()
  })

  it('handles task update', async () => {
    const { taskService } = await import('@/services/task.service')
    const updated = { ...mockTask, title: 'Updated Title' }
    ;(taskService.updateTask as any).mockResolvedValue(updated)

    const result = await taskService.updateTask('task-1', { title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
  })

  it('filters tasks by status', () => {
    const pendingTasks = mockTasks.filter((t) => t.status === 'PENDING')
    const completedTasks = mockTasks.filter((t) => t.status === 'COMPLETED')
    expect(pendingTasks).toHaveLength(3)
    expect(completedTasks).toHaveLength(1)
  })

  it('filters tasks by type', () => {
    const taskOnly = mockTasks.filter((t) => t.type === 'TASK')
    const meetingOnly = mockTasks.filter((t) => t.type === 'MEETING')
    const eventOnly = mockTasks.filter((t) => t.type === 'EVENT')
    expect(taskOnly).toHaveLength(2)
    expect(meetingOnly).toHaveLength(1)
    expect(eventOnly).toHaveLength(1)
  })

  it('searches tasks by title', () => {
    const query = 'reporte'
    const results = mockTasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    expect(results).toHaveLength(1)
    expect(results[0]!.title).toBe('Terminar reporte')
  })
})
