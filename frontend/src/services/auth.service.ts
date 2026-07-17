import { api, ApiError } from './api'
import type { Credentials } from '@/types'

export interface User {
  id: string
  email: string
  nickname: string | null
  avatarUrl?: string | null
}

export const authService = {
  login: async (credentials: Credentials) => {
    const { data, error, status } = await api.api.auth.login.post(credentials)
    if (error) throw new ApiError(status, String(error.value) || 'Login failed')
    return data!
  },

  register: async (credentials: Credentials) => {
    const { data, error, status } = await api.api.auth.register.post(credentials)
    if (error) throw new ApiError(status, String(error.value) || 'Register failed')
    return data!
  },

  googleLogin: async (idToken: string) => {
    const { data, error, status } = await api.api.auth.google.post({ idToken })
    if (error) throw new ApiError(status, String(error.value) || 'Google login failed')
    return data!
  },

  requestPasswordReset: async (email: string) => {
    const { data, error, status } = await api.api.auth['forgot-password'].post({ email })
    if (error) throw new ApiError(status, String(error.value) || 'Could not send instructions')
    return data!
  },

  resetPassword: async (token: string, password: string) => {
    const { data, error, status } = await api.api.auth['reset-password'].post({ token, password })
    if (error) throw new ApiError(status, String(error.value) || 'Could not reset password')
    return data!
  },
}
