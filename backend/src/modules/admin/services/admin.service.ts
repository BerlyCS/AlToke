import { desc, eq } from 'drizzle-orm'
import { status } from 'elysia'
import { db } from '../../../db'
import { privacySettings, users } from '../../../db/schema'
import { UserRepository } from '../../user/repositories'
import type { AdminUserResponse } from '../dto'

export class AdminService {
  static async listUsers(userId: string): Promise<AdminUserResponse[]> {
    const currentUser = await UserRepository.findById(userId)

    if (!currentUser) {
      throw status(401, 'Unauthorized')
    }

    if (currentUser.role !== 'ADMIN') {
      throw status(403, 'Forbidden')
    }

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        nickname: users.nickname,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
        xp: users.xp,
        level: users.level,
        currentStreak: users.currentStreak,
        maxStreak: users.maxStreak,
        lastActiveAt: users.lastActiveAt,
        createdAt: users.createdAt,
        showLevel: privacySettings.showLevel,
        showStreak: privacySettings.showStreak,
        showAchievements: privacySettings.showAchievements,
      })
      .from(users)
      .leftJoin(privacySettings, eq(users.id, privacySettings.userId))
      .orderBy(desc(users.createdAt))

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role === 'ADMIN' ? 'ADMIN' : 'USER',
      nickname: row.nickname,
      bio: row.bio,
      avatarUrl: row.avatarUrl,
      xp: row.xp ?? 0,
      level: row.level ?? null,
      currentStreak: row.currentStreak ?? null,
      maxStreak: row.maxStreak ?? null,
      lastActiveAt: row.lastActiveAt,
      createdAt: row.createdAt,
      privacy:
        row.showLevel === null && row.showStreak === null && row.showAchievements === null
          ? undefined
          : {
              showLevel: row.showLevel,
              showStreak: row.showStreak,
              showAchievements: row.showAchievements,
            },
    }))
  }
}
