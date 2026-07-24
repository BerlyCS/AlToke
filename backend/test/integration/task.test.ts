import { describe, expect, it, beforeAll } from 'bun:test'
import { api, createTestUserAndLogin, isDatabaseAvailable } from '../utils'

const databaseAvailable = await isDatabaseAvailable()

describe.skipIf(!databaseAvailable)('Task API', () => {
  let token = ''
  let taskId = ''

  beforeAll(async () => {
    const user = await createTestUserAndLogin()
    token = user.token
  })

  it('should create a task', async () => {
    const { data, error, status } = await api.api.tasks.post(
      {
        title: 'Test Task',
        description: 'Test Description',
        type: 'TASK',
        priority: 'HIGH',
      },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    )
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.title).toBe('Test Task')
    taskId = data!.id
  })

  it('should get all tasks', async () => {
    const { data, error, status } = await api.api.tasks.get({
      headers: { authorization: `Bearer ${token}` },
    })
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    expect(data!.length).toBeGreaterThan(0)
  })

  it('should update a task', async () => {
    const { data, error, status } = await api.api.tasks({ id: taskId }).patch(
      {
        status: 'COMPLETED',
      },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    )
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.status).toBe('COMPLETED')
  })

  it('should complete a task and return XP/gamification data', async () => {
    // 1. Create a new task to complete
    const { data: newTask } = await api.api.tasks.post(
      {
        title: 'Complete Me',
        type: 'TASK',
        priority: 'MEDIUM',
        estimatedTime: 15,
      },
      { headers: { authorization: `Bearer ${token}` } },
    )

    // 2. Complete it via the specific endpoint
    const { data, error, status } = await api.api
      .tasks({ id: newTask!.id })
      .complete.patch(undefined as any, { headers: { authorization: `Bearer ${token}` } })

    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.status).toBe('COMPLETED')
    expect(data?.xpAwarded).toBeDefined()
    expect(data?.newLevel).toBeDefined()
  })

  it('should soft delete a task', async () => {
    const { data, error, status } = await api.api.tasks({ id: taskId }).delete(undefined as any, {
      headers: { authorization: `Bearer ${token}` },
    })
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.deletedAt).not.toBeNull()
  })
})
