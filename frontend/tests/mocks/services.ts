import { vi } from 'vitest'

export const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  googleLogin: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}

export const mockUserService = {
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  updatePrivacy: vi.fn(),
}

export const mockTaskService = {
  getAllTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  completeTask: vi.fn(),
  getTrashedTasks: vi.fn(),
  restoreTask: vi.fn(),
}

export const mockTagService = {
  getAllTags: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
}

export const mockAdminService = {
  getMetrics: vi.fn(),
  getUsers: vi.fn(),
  banUser: vi.fn(),
  unBanUser: vi.fn(),
  getTaskMetrics: vi.fn(),
  getTopUsers: vi.fn(),
  getPerformanceMetrics: vi.fn(),
}

export const mockAiService = {
  getSuggestions: vi.fn(),
  sendFeedback: vi.fn(),
  predictOverload: vi.fn(),
}

export const mockNotificationService = {
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  getHistory: vi.fn(),
}

export const mockFriendshipService = {
  getFriends: vi.fn(),
  getPendingRequests: vi.fn(),
  sendRequest: vi.fn(),
  acceptRequest: vi.fn(),
  rejectRequest: vi.fn(),
  removeFriend: vi.fn(),
  searchUsers: vi.fn(),
}

export const mockGamificationService = {
  getLeaderboard: vi.fn(),
  getFriendsLeaderboard: vi.fn(),
  getAchievements: vi.fn(),
  getInventory: vi.fn(),
  useItem: vi.fn(),
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
