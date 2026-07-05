import { api, ApiError } from './api'
import { useAuthStore } from '@/stores/auth'
import type { TaskOverloadPrediction, TaskSuggestion } from '@/types'

const getHeaders = () => {
  const authStore = useAuthStore()
  return {
    authorization: authStore.token ? `Bearer ${authStore.token}` : '',
  }
}

export const aiService = {
  getSuggestions: async (): Promise<{ suggestions: TaskSuggestion[] }> => {
    const { data, error, status } = await api.api.ai.suggestions.get({
      headers: getHeaders(),
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch AI suggestions')
    return data as unknown as { suggestions: TaskSuggestion[] }
  },

  sendFeedback: async (suggestionId: string, accepted: boolean): Promise<TaskSuggestion> => {
    const { data, error, status } = await api.api.ai
      .suggestions({ id: suggestionId })
      .feedback.post({ accepted }, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to send feedback')
    return data as unknown as TaskSuggestion
  },

  predictOverload: async (date: string): Promise<TaskOverloadPrediction> => {
    const { data, error, status } = await api.api.ai.overload.get({
      query: { date },
      headers: getHeaders(),
    })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to predict overload')
    return data as unknown as TaskOverloadPrediction
  },
}
