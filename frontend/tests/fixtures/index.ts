import type {
  Task,
  Tag,
  User,
  UserProfile,
  Achievement,
  LeaderboardEntry,
  InventoryItem,
  NotificationLog,
  NotificationSettings,
  AdminMetrics,
  UsersList,
  UserSummary,
  TaskSuggestion,
  TaskOverloadPrediction,
  CompleteTaskResult,
  TaskMetricsResponse,
  TopUsersResponse,
  PerformanceMetricsResponse,
  BanUserResponse,
} from '@/types'
import type { FriendshipEntry, PendingRequest } from '@/services/friendship.service'

export const mockTag: Tag = {
  id: 'tag-1',
  name: 'Trabajo',
  color: 'bg-blue-500',
  icon: 'Briefcase',
}

export const mockTag2: Tag = {
  id: 'tag-2',
  name: 'Personal',
  color: 'bg-pink-500',
  icon: 'Heart',
}

export const mockTask: Task = {
  id: 'task-1',
  title: 'Terminar reporte',
  description: 'Completar el reporte mensual de ventas',
  type: 'TASK',
  status: 'PENDING',
  priority: 'HIGH',
  estimatedTime: 30,
  dueDate: new Date(Date.now() + 86400000).toISOString(),
  recurrence: 'NONE',
  tags: [mockTag],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockCompletedTask: Task = {
  ...mockTask,
  id: 'task-2',
  title: 'Tarea completada',
  status: 'COMPLETED',
}

export const mockMeetingTask: Task = {
  ...mockTask,
  id: 'task-3',
  title: 'Reunión de equipo',
  type: 'MEETING',
  priority: 'MEDIUM',
}

export const mockEventTask: Task = {
  ...mockTask,
  id: 'task-4',
  title: 'Evento de networking',
  type: 'EVENT',
  priority: 'LOW',
}

export const mockTasks: Task[] = [mockTask, mockCompletedTask, mockMeetingTask, mockEventTask]

export const mockUser: User = {
  id: 'user-1',
  email: 'test@altoke.com',
  nickname: 'TestUser',
  avatarUrl: 'https://example.com/avatar.png',
}

export const mockProfile: UserProfile = {
  id: 'user-1',
  email: 'test@altoke.com',
  role: 'USER',
  nickname: 'TestUser',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.png',
  xp: 500,
  level: 5,
  currentStreak: 7,
  maxStreak: 14,
  privacy: {
    showLevel: true,
    showStreak: true,
    showAchievements: true,
  },
}

export const mockAdminProfile: UserProfile = {
  ...mockProfile,
  id: 'admin-1',
  email: 'admin@altoke.com',
  nickname: 'AdminUser',
  role: 'ADMIN',
}

export const mockAchievement: Achievement = {
  id: 'ach-1',
  code: 'task-first',
  title: 'Primera Tarea',
  description: 'Completaste tu primera tarea',
  isSecret: false,
  requiredXp: 0,
  unlockedAt: new Date().toISOString(),
}

export const mockLockedAchievement: Achievement = {
  id: 'ach-2',
  code: 'streak-30',
  title: 'Racha de 30 días',
  description: 'Mantén una racha de 30 días',
  isSecret: false,
  requiredXp: 1000,
}

export const mockSecretAchievement: Achievement = {
  id: 'ach-3',
  code: 'secret-mystery',
  title: 'Misterio',
  description: '???',
  isSecret: true,
  requiredXp: 5000,
}

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    userId: 'user-1',
    nickname: 'TestUser',
    avatarUrl: 'https://example.com/avatar.png',
    currentLevel: 5,
    totalXp: 500,
    streakCount: 7,
    maxStreak: 14,
    rank: 1,
  },
  {
    userId: 'user-2',
    nickname: 'Player2',
    avatarUrl: null,
    currentLevel: 3,
    totalXp: 300,
    streakCount: 3,
    maxStreak: 10,
    rank: 2,
  },
  {
    userId: 'user-3',
    nickname: 'Player3',
    avatarUrl: null,
    currentLevel: 2,
    totalXp: 150,
    streakCount: 1,
    maxStreak: 5,
    rank: 3,
  },
]

export const mockInventoryItem: InventoryItem = {
  id: 'inv-1',
  code: 'xp-boost',
  name: 'XP Boost',
  itemType: 'CONSUMABLE',
  effect: '2x XP for 1 hour',
  assetUrl: null,
  quantity: 2,
  isEquipped: false,
}

export const mockNotificationLog: NotificationLog = {
  id: 'notif-1',
  userId: 'user-1',
  channel: 'IN_APP',
  type: 'TASK_DUE:Tarea vencida',
  title: 'Tarea vencida',
  message: 'Tu tarea "Reporte" venció hace 1 hora',
  isRead: false,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
}

export const mockNotificationSettings: NotificationSettings = {
  userId: 'user-1',
  emailEnabled: true,
  pushEnabled: false,
  isMuted: false,
  updatedAt: new Date().toISOString(),
}

export const mockAdminMetrics: AdminMetrics = {
  totalUsers: 100,
  activeUsersDaily: 50,
  tasksCompletedToday: 25,
  totalTasks: 500,
}

export const mockUserSummary: UserSummary = {
  id: 'user-2',
  email: 'user2@altoke.com',
  avatarUrl: null,
  nickname: 'UserTwo',
  bio: 'Hello',
  role: 'USER',
  level: 3,
  xp: 300,
  lastActiveAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
}

export const mockUsersList: UsersList = {
  users: [mockUserSummary],
  total: 1,
  limit: 10,
  offset: 0,
}

export const mockBanResponse: BanUserResponse = {
  success: true,
  message: 'User banned',
  userId: 'user-2',
}

export const mockTaskSuggestion: TaskSuggestion = {
  id: 'sug-1',
  userId: 'user-1',
  suggestedTitle: 'Organizar escritorio',
  suggestedTime: new Date(Date.now() + 86400000).toISOString(),
  explanation: 'Basado en tu historial de organización',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
}

export const mockOverloadPrediction: TaskOverloadPrediction = {
  isOverloaded: true,
  riskLevel: 'high',
  explanation: 'Tienes demasiadas tareas para hoy',
}

export const mockCompleteTaskResult: CompleteTaskResult = {
  ...mockTask,
  id: 'task-1',
  status: 'COMPLETED',
  xpAwarded: 50,
  leveledUp: false,
  newLevel: 5,
  newStreak: 8,
}

export const mockTaskMetrics: TaskMetricsResponse = {
  typeTask: [
    { type: 'PENDING', count: 10 },
    { type: 'COMPLETED', count: 15 },
  ],
  totalTasks: 25,
}

export const mockTopUsers: TopUsersResponse = {
  users: [
    { id: 'user-1', nickname: 'TestUser', level: 5, xp: 500, streak: 7 },
    { id: 'user-2', nickname: 'Player2', level: 3, xp: 300, streak: 3 },
  ],
  totalUsers: 100,
}

export const mockPerformanceMetrics: PerformanceMetricsResponse = {
  completionRate: 65,
  totalXp: 15000,
}

export const mockAuthResponse = {
  user: {
    id: 'user-1',
    email: 'test@altoke.com',
    nickname: 'TestUser',
    avatarUrl: 'https://example.com/avatar.png',
  },
  token: 'mock-jwt-token-abc123',
}

export const mockFriendshipEntry: FriendshipEntry = {
  friendshipId: 'fs-1',
  friend: {
    id: 'user-2',
    nickname: 'Player2',
    avatarUrl: null,
    level: 3,
    xp: 300,
    currentStreak: 3,
  },
}

export const mockPendingRequest: PendingRequest = {
  id: 'req-1',
  requesterId: 'user-3',
  addresseeId: 'user-1',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  requester: {
    id: 'user-3',
    nickname: 'Player3',
    avatarUrl: null,
    level: 2,
    xp: 150,
    currentStreak: 1,
  },
}
