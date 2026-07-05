import { and, asc, between, desc, eq, gte, isNull, lt, sql } from 'drizzle-orm'
import { db } from '../../../db'
import {
  achievements,
  items,
  levelRewards,
  tasks,
  userAchievements,
  userInventories,
  xpTransactions,
  users,
} from '../../../db/schema'
import type {
  Achievement,
  Inventory,
  InventoryItem,
  LeaderboardEntry,
  UnlockedAchievement,
  UseItemResult,
  UserStats,
  XPTransaction,
} from '../domain/entities'

const toUserStats = (user: typeof users.$inferSelect): UserStats => ({
  userId: user.id,
  currentLevel: user.level ?? 1,
  totalXp: user.xp ?? 0,
  streakCount: user.currentStreak ?? 0,
  maxStreak: user.maxStreak ?? 0,
  streakFrozenUntil: user.streakFrozenUntil ?? null,
  overdueHighPriorityCount: user.overdueHighPriorityCount ?? 0,
  lastActiveDate: user.lastActiveAt ?? null,
})

const toAchievement = (achievement: typeof achievements.$inferSelect): Achievement => ({
  id: achievement.id,
  code: achievement.code,
  title: achievement.title,
  description: achievement.description,
  isSecret: achievement.isSecret,
  requiredXp: achievement.requiredXp,
})

const toInventoryItem = (
  row: typeof userInventories.$inferSelect & {
    item: typeof items.$inferSelect
  },
): InventoryItem => ({
  id: row.item.id,
  code: row.item.code,
  name: row.item.name,
  itemType: row.item.itemType,
  effect: row.item.effect ?? null,
  assetUrl: row.item.assetUrl ?? null,
  quantity: row.quantity,
  isEquipped: row.isEquipped,
})

const startOfDay = (date: Date) => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const endOfDay = (date: Date) => {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

export class GamificationRepository {
  async saveStats(stats: UserStats): Promise<void> {
    await db
      .update(users)
      .set({
        level: stats.currentLevel,
        xp: stats.totalXp,
        currentStreak: stats.streakCount,
        maxStreak: stats.maxStreak,
        streakFrozenUntil: stats.streakFrozenUntil,
        overdueHighPriorityCount: stats.overdueHighPriorityCount,
        lastActiveAt: stats.lastActiveDate,
      })
      .where(eq(users.id, stats.userId))
  }

  async findStatsByUserId(userId: string): Promise<UserStats | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    return user ? toUserStats(user) : null
  }

  async getDailyXPTotal(userId: string, date: Date): Promise<number> {
    const [result] = await db
      .select({ total: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)` })
      .from(xpTransactions)
      .where(
        and(
          eq(xpTransactions.userId, userId),
          gte(xpTransactions.createdAt, startOfDay(date)),
          lt(xpTransactions.createdAt, new Date(endOfDay(date).getTime() + 1)),
        ),
      )

    return result?.total ?? 0
  }

  async saveXPTransaction(tx: XPTransaction): Promise<void> {
    await db.insert(xpTransactions).values({
      id: tx.id,
      userId: tx.userId,
      amount: tx.amount,
      source: tx.source,
      createdAt: tx.date,
    })
  }

  async getTopUsersByXp(limit: number): Promise<LeaderboardEntry[]> {
    const rows = await db
      .select()
      .from(users)
      .orderBy(desc(users.xp), asc(users.createdAt))
      .limit(limit)

    return rows.map((user, index) => ({
      userId: user.id,
      nickname: user.nickname ?? null,
      avatarUrl: user.avatarUrl ?? null,
      currentLevel: user.level ?? 1,
      totalXp: user.xp ?? 0,
      streakCount: user.currentStreak ?? 0,
      maxStreak: user.maxStreak ?? 0,
      rank: index + 1,
    }))
  }

  async getFriendsStats(userId: string): Promise<UserStats[]> {
    const rows = await db
      .select()
      .from(users)
      .where(sql`${users.id} <> ${userId}`)
      .orderBy(desc(users.xp))
      .limit(10)

    return rows.map(toUserStats)
  }

  async findInventoryByUserId(userId: string): Promise<Inventory | null> {
    const rows = await db
      .select({
        inventory: userInventories,
        item: items,
      })
      .from(userInventories)
      .innerJoin(items, eq(userInventories.itemId, items.id))
      .where(eq(userInventories.userId, userId))

    if (rows.length === 0) return null

    return {
      userId,
      items: rows.map((row) =>
        toInventoryItem({
          ...row.inventory,
          item: row.item,
        }),
      ),
    }
  }

  async findInventoryItem(userId: string, itemId: string) {
    const [row] = await db
      .select({
        inventory: userInventories,
        item: items,
      })
      .from(userInventories)
      .innerJoin(items, eq(userInventories.itemId, items.id))
      .where(and(eq(userInventories.userId, userId), eq(userInventories.itemId, itemId)))
      .limit(1)

    return row
  }

  async updateInventoryQuantity(userId: string, itemId: string, quantity: number) {
    const [existing] = await db
      .select()
      .from(userInventories)
      .where(and(eq(userInventories.userId, userId), eq(userInventories.itemId, itemId)))
      .limit(1)

    if (!existing) return null

    if (quantity <= 0) {
      await db.delete(userInventories).where(eq(userInventories.id, existing.id))
      return 0
    }

    await db.update(userInventories).set({ quantity }).where(eq(userInventories.id, existing.id))

    return quantity
  }

  async addInventoryItem(userId: string, itemId: string, quantity: number) {
    const [existing] = await db
      .select()
      .from(userInventories)
      .where(and(eq(userInventories.userId, userId), eq(userInventories.itemId, itemId)))
      .limit(1)

    if (!existing) {
      await db.insert(userInventories).values({ userId, itemId, quantity })
      return quantity
    }

    const nextQuantity = existing.quantity + quantity
    await db
      .update(userInventories)
      .set({ quantity: nextQuantity })
      .where(eq(userInventories.id, existing.id))
    return nextQuantity
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(
        and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)),
      )
      .limit(1)

    if (existing) return

    await db.insert(userAchievements).values({ userId, achievementId })
  }

  async findUnlockedAchievements(userId: string): Promise<UnlockedAchievement[]> {
    const rows = await db
      .select({
        unlock: userAchievements,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt))

    return rows.map((row) => ({
      achievement: toAchievement(row.achievement),
      unlockedAt: row.unlock.unlockedAt,
    }))
  }

  async listAchievements(): Promise<Achievement[]> {
    const rows = await db
      .select()
      .from(achievements)
      .orderBy(asc(achievements.requiredXp), asc(achievements.title))
    return rows.map(toAchievement)
  }

  async findAchievementByCode(code: string): Promise<Achievement | null> {
    const [row] = await db.select().from(achievements).where(eq(achievements.code, code)).limit(1)
    return row ? toAchievement(row) : null
  }

  async findAchievementById(id: string): Promise<Achievement | null> {
    const [row] = await db.select().from(achievements).where(eq(achievements.id, id)).limit(1)
    return row ? toAchievement(row) : null
  }

  async findItemById(id: string) {
    const [row] = await db.select().from(items).where(eq(items.id, id)).limit(1)
    return row ?? null
  }

  async findItemByCode(code: string) {
    const [row] = await db.select().from(items).where(eq(items.code, code)).limit(1)
    return row ?? null
  }

  async findLevelRewardByLevel(level: number) {
    const [row] = await db.select().from(levelRewards).where(eq(levelRewards.level, level)).limit(1)
    return row ?? null
  }

  async countOverdueHighPriorityTasks(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.priority, 'HIGH'),
          sql`${tasks.status} <> 'COMPLETED'`,
          sql`${tasks.dueDate} is not null`,
          sql`${tasks.dueDate} < now()`,
          isNull(tasks.deletedAt),
        ),
      )
    return result?.count ?? 0
  }

  async consumeInventoryItem(userId: string, itemId: string): Promise<UseItemResult | null> {
    const row = await this.findInventoryItem(userId, itemId)
    if (!row) return null

    const remainingQuantity = row.inventory.quantity - 1
    await this.updateInventoryQuantity(userId, itemId, remainingQuantity)

    return {
      userId,
      itemId,
      remainingQuantity: Math.max(remainingQuantity, 0),
      appliedEffect: row.item.effect ?? null,
    }
  }
}
