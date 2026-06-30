import { status } from 'elysia'
import { db } from '../../db'
import { users, privacySettings } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { UserModel } from './model'

export abstract class UserService {
  static async getProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) {
      throw status(404, 'User not found' satisfies UserModel['userError'])
    }

    const [privacy] = await db
      .select()
      .from(privacySettings)
      .where(eq(privacySettings.userId, userId))
      .limit(1)

    const response = {
      ...user,
      privacy: privacy
        ? {
            showLevel: privacy.showLevel,
            showStreak: privacy.showStreak,
            showAchievements: privacy.showAchievements,
          }
        : undefined,
    }
    return response
  }

  static async updateProfile(userId: string, data: UserModel['updateProfileBody']) {
    const [user] = await db.update(users).set(data).where(eq(users.id, userId)).returning()
    if (!user) {
      throw status(404, 'User not found' satisfies UserModel['userError'])
    }

    const [privacy] = await db
      .select()
      .from(privacySettings)
      .where(eq(privacySettings.userId, userId))
      .limit(1)

    return {
      ...user,
      privacy: privacy
        ? {
            showLevel: privacy.showLevel,
            showStreak: privacy.showStreak,
            showAchievements: privacy.showAchievements,
          }
        : undefined,
    }
  }
}
