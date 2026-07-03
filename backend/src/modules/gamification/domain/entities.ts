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
  requiredXp: number
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
  itemType: string
  effect?: string | null
  assetUrl?: string | null
}

export interface Inventory {
  userId: string
  items: InventoryItem[]
}

export interface InventoryItem extends Item {
  quantity: number
  isEquipped: boolean
  effect: string | null
}

export interface UnlockedAchievement {
  achievement: Achievement
  unlockedAt: Date
}

export interface LeaderboardEntry {
  userId: string
  nickname: string | null
  avatarUrl: string | null
  currentLevel: number
  totalXp: number
  streakCount: number
  maxStreak: number
  rank: number
}

export interface UseItemResult {
  userId: string
  itemId: string
  remainingQuantity: number
  appliedEffect: string | null
}