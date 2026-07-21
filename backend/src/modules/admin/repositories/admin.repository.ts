import { db } from '../../../db'
import { users, tasks } from '../../../db/schema'
import { eq, sql, and } from 'drizzle-orm'

export class AdminRepository {
  /**
   * Get all users with optional filtering
   */
  static async getAllUsers(limit?: number, offset?: number) {
    let query = db.select().from(users)
    if (limit) {
      query = query.limit(limit) as typeof query
    }
    if (offset) {
      query = query.offset(offset) as typeof query
    }
    return query.execute()
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(userId: string) {
    const result = await db.select().from(users).where(eq(users.id, userId))
    return result[0] || null
  }

  /**
   * Ban a user by setting their role
   */
  static async banUser(userId: string) {
    const result = await db
      .update(users)
      .set({ role: 'BANNED' })
      .where(eq(users.id, userId))
      .returning()

    return result[0] || null
  }

  /**
   * Update user profile fields
   */
  static async updateUserProfile(
    userId: string,
    updates: { nickname?: string; bio?: string; avatarUrl?: string },
  ) {
    if (Object.keys(updates).length === 0) {
      return this.getUserById(userId)
    }

    const result = await db.update(users).set(updates).where(eq(users.id, userId)).returning()

    return result[0] || null
  }

  /**
   * Get total number of users
   */
  static async getTotalUsersCount() {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users)
    return Number(result[0]?.count || 0)
  }

  /**
   * Get active users in the last 24 hours
   */
  static async getActiveDailyUsers() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, 'USER'), sql`${users.lastActiveAt} > ${oneDayAgo.toISOString()}`))
    return Number(result[0]?.count || 0)
  }

  /**
   * Get tasks completed today
   */
  static async getTasksCompletedToday() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.status, 'COMPLETED'), sql`${tasks.completedAt} > ${today.toISOString()}`))
    return Number(result[0]?.count || 0)
  }

  /**
   * Get total number of tasks
   */
  static async getTotalTasksCount() {
    const result = await db.select({ count: sql<number>`count(*)` }).from(tasks)
    return Number(result[0]?.count || 0)
  }

  /**
   * Get user task count
   */
  static async getUserTaskCount(userId: string) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.userId, userId))
    return Number(result[0]?.count || 0)
  }

  /**
   * Unban a user
   */
  static async unbanUser(userId: string) {
    const result = await db
      .update(users)
      .set({ role: 'USER' })
      .where(eq(users.id, userId))
      .returning()

    return result[0] || null
  }

  /**
   * Check if user is banned
   */
  static async isUserBanned(userId: string) {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.role, 'BANNED')))
    return result.length > 0
  }

  static async getTaskMetrics() {
    const result = await db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .groupBy(tasks.status)

    return result.map((row) => ({
      type: row.status,
      count: Number(row.count),
    }))
  }
}
