// Gamification Domain Entities
// Basic domain models derived from docs/classes/gamification_module.puml

export interface UserStats {
  userId: string
  currentLevel: number
  totalXp: number
  streakCount: number
  maxStreak: number
  streakFrozenUntil?: Date | null
  overdueHighPriorityCount: number
  lastActiveDate?: Date | null
}

export interface XPTransaction {
  id: string
  userId: string
  amount: number
  source: string
  date: Date
}

export interface Achievement {
  id: string
  code: string
  title: string
  description: string
  isSecret: boolean
  requiredXp?: number
}

export interface UserAchievement {
  userId: string
  achievementId: string
  unlockedAt: Date
}

export interface Item {
  id: string
  code: string
  name: string
  effect?: string
}

export interface Inventory {
  userId: string
  items: Item[]
}