import { api, ApiError } from './api'
import type { ProfileUpdateBody, PrivacyUpdateBody } from '@/types'

export const userService = {
  getProfile: async () => {
    const { data, error, status } = await api.api.users.profile.get({
      headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (error) throw new ApiError(status, String(error.value) || 'Login failed')
    return data!
  },
  updateProfile: async (user: ProfileUpdateBody) => {
    const { data, error, status } = await api.api.users.profile.patch(user, {
      headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (error) throw new ApiError(status, String(error.value) || 'Login failed')
    return data!
  },
  updatePrivacy: async (privacy: PrivacyUpdateBody) => {
    const { data, error, status } = await api.api.users.profile.privacy.patch(privacy, {
      headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (error) throw new ApiError(status, String(error.value) || 'Login failed')
    return data!
  },
}
