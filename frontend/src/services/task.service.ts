import { api, ApiError } from './api'
import { useAuthStore } from '@/stores/auth'
import type { CompleteTaskResult, Task } from '@/types'

// Helper to get auth headers automatically
const getHeaders = () => {
  const authStore = useAuthStore()
  return {
    authorization: authStore.token ? `Bearer ${authStore.token}` : '',
  }
}

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    const { data, error, status } = await api.api.tasks.get({ headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch tasks')
    return data as unknown as Task[]
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error, status } = await api.api.tasks.post(task as any, {
      headers: getHeaders(),
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to create task')
    return data as unknown as Task
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const { data, error, status } = await api.api
      .tasks({ id })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .patch(updates as any, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to update task')
    return data as unknown as Task
  },

  deleteTask: async (id: string): Promise<Task> => {
    const { data, error, status } = await api.api
      .tasks({ id })
      .delete(null as unknown as Record<string, never>, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to delete task')
    return data as unknown as Task
  },

  completeTask: async (id: string): Promise<CompleteTaskResult> => {
    const { data, error, status } = await api.api
      .tasks({ id })
      .complete.patch(null as unknown as Record<string, never>, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to complete task')
    return data as unknown as CompleteTaskResult
  },

  getTrashedTasks: async (): Promise<Task[]> => {
    const { data, error, status } = await api.api.tasks.trash.get({ headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch trashed tasks')
    return data as unknown as Task[]
  },

  restoreTask: async (id: string): Promise<Task> => {
    const { data, error, status } = await api.api
      .tasks({ id })
      .restore.patch(null as unknown as Record<string, never>, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to restore task')
    return data as unknown as Task
  },
}
