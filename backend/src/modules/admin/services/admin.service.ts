import { AdminRepository } from '../repositories'
import type {
  BanUserResponseType,
  ModerateProfileRequestType,
  SystemMetricsResponseType,
  UsersResponseType,
} from '../dto'

export class AdminService {
  /**
   * Ban a user
   */
  static async banUser(targetUserId: string) : Promise<BanUserResponseType> {
    const user = await AdminRepository.getUserById(targetUserId)
    if (!user) {
      throw new Error('User not found')
    }

    const isBanned = await AdminRepository.isUserBanned(targetUserId)
    if (isBanned) {
      throw new Error('User is already banned')
    }

    await AdminRepository.banUser(targetUserId)

    return {
      success: true,
      message: `User ${targetUserId} has been banned`,
      userId: targetUserId,
    }
  }

  /**
   * Moderate user profile
   */
  static async moderateProfile(targetUserId: string, request: ModerateProfileRequestType) {
    // Check if user exists
    const user = await AdminRepository.getUserById(targetUserId)
    if (!user) {
      throw new Error('User not found')
    }

    // Prepare updates
    const updates: Record<string, any> = {}
    if (request.nickname) updates.nickname = request.nickname
    if (request.bio) updates.bio = request.bio
    if (request.avatarUrl) updates.avatarUrl = request.avatarUrl

    // Update user profile
    await AdminRepository.updateUserProfile(targetUserId, updates)

    return {
      success: true,
      message: `User profile for ${targetUserId} has been moderated`,
      userId: targetUserId,
    }
  }

  /**
   * Get system metrics
   */
  static async getSystemMetrics(): Promise<SystemMetricsResponseType> {
    const [totalUsers, activeUsersDaily, tasksCompletedToday, totalTasks] = await Promise.all([
      AdminRepository.getTotalUsersCount(),
      AdminRepository.getActiveDailyUsers(),
      AdminRepository.getTasksCompletedToday(),
      AdminRepository.getTotalTasksCount(),
    ])

    return {
      totalUsers,
      activeUsersDaily,
      tasksCompletedToday,
      totalTasks,
    }
  }

  /**
   * Get user summary
   */
  static async getUserSummary(targetUserId: string) {
    const user = await AdminRepository.getUserById(targetUserId)
    if (!user) {
      throw new Error('User not found')
    }

    return {
      userId: user.id,
      nickname: user.nickname,
      level: user.level,
      xp: user.xp,
      lastActiveAt: user.lastActiveAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
    }
  }

  /**
   * Get all users with pagination
   */
  static async listUsers(limit: number = 10, offset: number = 0): Promise<UsersResponseType> {
    const users = await AdminRepository.getAllUsers(limit, offset)
    const total = await AdminRepository.getTotalUsersCount()

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
        nickname: user.nickname ?? undefined,
        bio: user.bio ?? null,
        role: user.role,
        level: user.level ?? 0,
        xp: user.xp ?? 0,
        lastActiveAt: user.lastActiveAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
    })),
      total,
      limit,
      offset,
    }
  }

  /**
   * Unban a user
   */
  static async unbanUser(targetUserId: string) {
    const user = await AdminRepository.getUserById(targetUserId)
    if (!user) {
      throw new Error('User not found')
    }

    await AdminRepository.unbanUser(targetUserId)

    return {
      success: true,
      message: `User ${targetUserId} has been unbanned`,
      userId: targetUserId,
    }
  }
}
