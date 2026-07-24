import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiResult = vi.fn()
vi.mock('@/services/api', () => {
  const createProxy = (): any =>
    new Proxy(function () {}, {
      get(_, prop) {
        if (prop === 'then') return (r: any, j?: any) => Promise.resolve(mockApiResult()).then(r, j)
        return createProxy()
      },
      apply(_, __, args) {
        mockApiResult(...args)
        return createProxy()
      },
    })
  return {
    api: createProxy(),
    ApiError: class ApiError extends Error {
      status: number
      constructor(status: number, message: string) {
        super(message)
        this.status = status
      }
    },
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ token: 'test-token' }),
}))

describe('taskService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
  })

  it('getAllTasks returns tasks', async () => {
    const { taskService } = await import('@/services/task.service')
    const tasks = [{ id: '1', title: 'Test' }]
    mockApiResult.mockResolvedValue({ data: tasks, error: null, status: 200 })

    const result = await taskService.getAllTasks()
    expect(result).toEqual(tasks)
  })

  it('createTask returns created task', async () => {
    const { taskService } = await import('@/services/task.service')
    const task = { id: '1', title: 'New Task' }
    mockApiResult.mockResolvedValue({ data: task, error: null, status: 201 })

    const result = await taskService.createTask({ title: 'New Task' })
    expect(result).toEqual(task)
  })

  it('updateTask returns updated task', async () => {
    const { taskService } = await import('@/services/task.service')
    const task = { id: '1', title: 'Updated' }
    mockApiResult.mockResolvedValue({ data: task, error: null, status: 200 })

    const result = await taskService.updateTask('1', { title: 'Updated' })
    expect(result).toEqual(task)
  })

  it('deleteTask returns deleted task', async () => {
    const { taskService } = await import('@/services/task.service')
    const task = { id: '1', title: 'Deleted' }
    mockApiResult.mockResolvedValue({ data: task, error: null, status: 200 })

    const result = await taskService.deleteTask('1')
    expect(result).toEqual(task)
  })

  it('completeTask returns completion result', async () => {
    const { taskService } = await import('@/services/task.service')
    const result = { id: '1', status: 'COMPLETED', xpAwarded: 50 }
    mockApiResult.mockResolvedValue({ data: result, error: null, status: 200 })

    const completed = await taskService.completeTask('1')
    expect(completed).toEqual(result)
  })

  it('getTrashedTasks returns tasks', async () => {
    const { taskService } = await import('@/services/task.service')
    const tasks = [{ id: '1', title: 'Trashed' }]
    mockApiResult.mockResolvedValue({ data: tasks, error: null, status: 200 })

    const result = await taskService.getTrashedTasks()
    expect(result).toEqual(tasks)
  })

  it('restoreTask returns restored task', async () => {
    const { taskService } = await import('@/services/task.service')
    const task = { id: '1', title: 'Restored' }
    mockApiResult.mockResolvedValue({ data: task, error: null, status: 200 })

    const result = await taskService.restoreTask('1')
    expect(result).toEqual(task)
  })

  it('throws on error for getAllTasks', async () => {
    const { taskService } = await import('@/services/task.service')
    mockApiResult.mockResolvedValue({ data: null, error: { value: 'Failed' }, status: 500 })

    await expect(taskService.getAllTasks()).rejects.toThrow()
  })
})
