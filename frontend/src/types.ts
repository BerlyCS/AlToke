export interface Tag {
  id: string
  name: string
  color: string
  icon: string
}

export interface Task {
  id: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  estimatedTime?: number
  dueDate?: string | Date
  recurrence?: string
  tags?: Tag[]
  unlockedAchievements?: Achievement[]
  deletedAt?: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

export interface User {
  id: string
  email: string
  nickname?: string
  avatarUrl?: string
}

export interface Privacy {
  showLevel: boolean
  showStreak: boolean
  showAchievements: boolean
}

export interface UserProfile {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
  nickname: string
  bio?: string | null
  avatarUrl?: string | null
  xp: number
  level: number
  currentStreak: number
  maxStreak: number
  privacy?: Privacy
}

export interface ProfileUpdateBody {
  nickname?: string
  bio?: string
  avatarUrl?: string
}

export interface PrivacyUpdateBody {
  showLevel?: boolean
  showStreak?: boolean
  showAchievements?: boolean
}

export interface Credentials {
  email: string
  password: string
  nickname?: string
}

export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface TaskSuggestion {
  id: string
  userId: string
  suggestedTitle: string
  suggestedTime: string
  explanation: string
  status: SuggestionStatus
  createdAt: string
}

export interface TaskOverloadPrediction {
  isOverloaded: boolean
  riskLevel: 'low' | 'medium' | 'high'
  explanation: string
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

export interface Achievement {
  id: string
  code: string
  title: string
  description: string
  isSecret: boolean
  requiredXp: number
  unlockedAt?: string
}

export interface InventoryItem {
  id: string
  code: string
  name: string
  itemType: string
  effect: string | null
  assetUrl: string | null
  quantity: number
  isEquipped: boolean
}

export interface UseItemResult {
  userId: string
  itemId: string
  remainingQuantity: number
  appliedEffect: string | null
}

export interface CompleteTaskResult extends Task {
  xpAwarded: number
  leveledUp: boolean
  newLevel: number
  newStreak: number
  unlockedAchievements?: Achievement[]
}

export type NotificationChannel = 'EMAIL' | 'PUSH' | 'IN_APP' | 'SYSTEM'

export interface NotificationSettings {
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  isMuted: boolean
  updatedAt: string
}

export interface NotificationLog {
  id: string
  userId: string
  channel: NotificationChannel
  type: string
  title: string
  message: string
  createdAt: string
}

export interface AdminMetrics {
  totalUsers: number
  activeUsersDaily: number
  tasksCompletedToday: number
  totalTasks: number
}

