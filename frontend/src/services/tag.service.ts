import { api, ApiError } from './api'
import { useAuthStore } from '@/stores/auth'
import type { Tag } from '@/types'

const getHeaders = () => {
  const authStore = useAuthStore()
  return {
    authorization: authStore.token ? `Bearer ${authStore.token}` : '',
  }
}

export const tagService = {
  getAllTags: async (): Promise<Tag[]> => {
    const { data, error, status } = await api.api.tags.get({ headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to fetch tags')
    return data as unknown as Tag[]
  },

  createTag: async (tag: Partial<Tag>): Promise<Tag> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error, status } = await api.api.tags.post(tag as any, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to create tag')
    return data as unknown as Tag
  },

  updateTag: async (id: string, updates: Partial<Tag>): Promise<Tag> => {
    const { data, error, status } = await api.api
      .tags({ id })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .patch(updates as any, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to update tag')
    return data as unknown as Tag
  },

  deleteTag: async (id: string): Promise<Tag> => {
    const { data, error, status } = await api.api
      .tags({ id })
      .delete(null as unknown as Record<string, never>, { headers: getHeaders() })
    if (error) throw new ApiError(status, String(error.value) || 'Failed to delete tag')
    return data as unknown as Tag
  },
}
