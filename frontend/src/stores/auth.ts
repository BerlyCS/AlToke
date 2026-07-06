import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, UserProfile } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const storedToken = localStorage.getItem('token')
  const storedProfile = localStorage.getItem('profile')

  const token = ref<string | null>(storedToken)
  const profile = ref<UserProfile | null>(storedProfile ? JSON.parse(storedProfile) : null)

  const user = ref<User | null>(null)

  const setAuth = (newUser: User, newProfile: UserProfile, newToken: string) => {
    user.value = newUser
    profile.value = newProfile
    token.value = newToken
    localStorage.setItem('profile', JSON.stringify(newProfile))
    localStorage.setItem('token', newToken)
  }

  const updateProfile = (newProfile: UserProfile) => {
    profile.value = newProfile
    localStorage.setItem('profile', JSON.stringify(newProfile))

    if (user.value) {
      user.value = {
        ...user.value,
        id: newProfile.id ?? user.value.id,
        email: newProfile.email ?? user.value.email,
      } as User
    }
  }

  const logout = () => {
    user.value = null
    profile.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('profile')
  }

  return { user, profile, token, setAuth, logout, updateProfile }
})
