import { vi } from 'vitest'

export const mockAuthService = {
  login: vi.fn<(...args: any[]) => any>(),
  register: vi.fn<(...args: any[]) => any>(),
  googleLogin: vi.fn<(...args: any[]) => any>(),
  requestPasswordReset: vi.fn<(...args: any[]) => any>(),
  resetPassword: vi.fn<(...args: any[]) => any>(),
}

export const mockUserService = {
  getProfile: vi.fn<(...args: any[]) => any>(),
  updateProfile: vi.fn<(...args: any[]) => any>(),
  updatePrivacy: vi.fn<(...args: any[]) => any>(),
}

export const mockTaskService = {
  getAllTasks: vi.fn<(...args: any[]) => any>(),
  getActiveTasks: vi.fn<(...args: any[]) => any>(),
  createTask: vi.fn<(...args: any[]) => any>(),
  updateTask: vi.fn<(...args: any[]) => any>(),
  deleteTask: vi.fn<(...args: any[]) => any>(),
  completeTask: vi.fn<(...args: any[]) => any>(),
  getTrashedTasks: vi.fn<(...args: any[]) => any>(),
  restoreTask: vi.fn<(...args: any[]) => any>(),
}

export const mockTagService = {
  getAllTags: vi.fn<(...args: any[]) => any>(),
  createTag: vi.fn<(...args: any[]) => any>(),
  updateTag: vi.fn<(...args: any[]) => any>(),
  deleteTag: vi.fn<(...args: any[]) => any>(),
}

export const mockAdminService = {
  getMetrics: vi.fn<(...args: any[]) => any>(),
  getUsers: vi.fn<(...args: any[]) => any>(),
  banUser: vi.fn<(...args: any[]) => any>(),
  unBanUser: vi.fn<(...args: any[]) => any>(),
  getTaskMetrics: vi.fn<(...args: any[]) => any>(),
  getTopUsers: vi.fn<(...args: any[]) => any>(),
  getPerformanceMetrics: vi.fn<(...args: any[]) => any>(),
}

export const mockAiService = {
  getSuggestions: vi.fn<(...args: any[]) => any>(),
  sendFeedback: vi.fn<(...args: any[]) => any>(),
  predictOverload: vi.fn<(...args: any[]) => any>(),
}

export const mockNotificationService = {
  getSettings: vi.fn<(...args: any[]) => any>(),
  updateSettings: vi.fn<(...args: any[]) => any>(),
  getHistory: vi.fn<(...args: any[]) => any>(),
}

export const mockFriendshipService = {
  getFriends: vi.fn<(...args: any[]) => any>(),
  getPendingRequests: vi.fn<(...args: any[]) => any>(),
  sendRequest: vi.fn<(...args: any[]) => any>(),
  acceptRequest: vi.fn<(...args: any[]) => any>(),
  rejectRequest: vi.fn<(...args: any[]) => any>(),
  removeFriend: vi.fn<(...args: any[]) => any>(),
  searchUsers: vi.fn<(...args: any[]) => any>(),
}

export const mockGamificationService = {
  getLeaderboard: vi.fn<(...args: any[]) => any>(),
  getFriendsLeaderboard: vi.fn<(...args: any[]) => any>(),
  getAchievements: vi.fn<(...args: any[]) => any>(),
  getInventory: vi.fn<(...args: any[]) => any>(),
  useItem: vi.fn<(...args: any[]) => any>(),
}

vi.mock('@/services/auth.service', () => ({
  authService: mockAuthService,
}))

vi.mock('@/services/user.service', () => ({
  userService: mockUserService,
}))

vi.mock('@/services/task.service', () => ({
  taskService: mockTaskService,
}))

vi.mock('@/services/tag.service', () => ({
  tagService: mockTagService,
}))

vi.mock('@/services/admin.service', () => ({
  adminService: mockAdminService,
}))

vi.mock('@/services/ai.service', () => ({
  aiService: mockAiService,
}))

vi.mock('@/services/notification.service', () => ({
  notificationService: mockNotificationService,
}))

vi.mock('@/services/friendship.service', () => ({
  friendshipService: mockFriendshipService,
}))

vi.mock('@/services/gamification.service', () => ({
  gamificationService: mockGamificationService,
}))
