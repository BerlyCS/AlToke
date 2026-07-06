export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  passwordHash: string | null
  role: UserRole
  nickname: string | null
  bio: string | null
  avatarUrl: string | null
  xp: number
  level: number
  currentStreak: number
  maxStreak: number
  lastActiveAt: Date | null
  createdAt: Date
}

export interface PrivacyConfig {
  userId: string
  showLevel: boolean
  showStreak: boolean
  showAchievements: boolean
}

export interface PublicUserProfile {
  id: string
  nickname: string | null
  bio: string | null
  avatarUrl: string | null
  xp: number
  level: number | null
  currentStreak: number | null
  maxStreak: number | null
  privacy?: {
    showLevel: boolean | null
    showStreak: boolean | null
    showAchievements: boolean | null
  }
}
