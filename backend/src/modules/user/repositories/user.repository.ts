import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { privacySettings, users } from '../../../db/schema'
import type { PrivacyConfig, User, UserRole } from '../domain'

type UserRow = typeof users.$inferSelect
type PrivacyRow = typeof privacySettings.$inferSelect

const toUserDomain = (user: UserRow): User => ({
  id: user.id,
  email: user.email,
  passwordHash: user.passwordHash ?? null,
  role: (user.role as UserRole) ?? 'USER',
  nickname: user.nickname ?? null,
  bio: user.bio ?? null,
  avatarUrl: user.avatarUrl ?? null,
  xp: user.xp ?? 0,
  level: user.level ?? 1,
  currentStreak: user.currentStreak ?? 0,
  maxStreak: user.maxStreak ?? 0,
  lastActiveAt: user.lastActiveAt ?? null,
  createdAt: user.createdAt,
})

const toPrivacyDomain = (privacy: PrivacyRow): PrivacyConfig => ({
  userId: privacy.userId,
  showLevel: privacy.showLevel ?? true,
  showStreak: privacy.showStreak ?? true,
  showAchievements: privacy.showAchievements ?? true,
})

export abstract class UserRepository {
  static async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return user ? toUserDomain(user) : null
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return user ? toUserDomain(user) : null
  }

  static async save(user: Omit<User, 'id' | 'createdAt'> & Partial<Pick<User, 'id'>>) {
    const [saved] = await db.insert(users).values(user).returning()
    return toUserDomain(saved)
  }

  static async update(user: User) {
    const [updated] = await db
      .update(users)
      .set({
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        nickname: user.nickname,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak,
        lastActiveAt: user.lastActiveAt,
      })
      .where(eq(users.id, user.id))
      .returning()

    return updated ? toUserDomain(updated) : null
  }

  static async updateProfile(
    userId: string,
    data: Partial<Pick<User, 'nickname' | 'bio' | 'avatarUrl'>>,
  ) {
    const [updated] = await db.update(users).set(data).where(eq(users.id, userId)).returning()

    return updated ? toUserDomain(updated) : null
  }

  static async findPrivacySettings(userId: string): Promise<PrivacyConfig | null> {
    const [privacy] = await db
      .select()
      .from(privacySettings)
      .where(eq(privacySettings.userId, userId))
      .limit(1)

    return privacy ? toPrivacyDomain(privacy) : null
  }

  static async updatePrivacySettings(userId: string, data: Partial<Omit<PrivacyConfig, 'userId'>>) {
    const [saved] = await db
      .insert(privacySettings)
      .values({
        userId,
        ...data,
      })
      .onConflictDoUpdate({
        target: privacySettings.userId,
        set: data,
      })
      .returning()

    return saved ? toPrivacyDomain(saved) : null
  }
}
