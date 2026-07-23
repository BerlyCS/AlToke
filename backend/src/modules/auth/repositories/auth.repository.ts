import { db } from '../../../db'
import { users, privacySettings, passwordResetTokens } from '../../../db/schema'
import { and, eq, gt, isNull } from 'drizzle-orm'

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0]

export class AuthRepository {
  static async findUserByEmail(email: string, tx?: TransactionClient) {
    const client = tx ?? db
    const result = await client.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0] || null
  }

  static async createUser(
    data: {
      email: string
      passwordHash?: string
      nickname?: string | null
      avatarUrl?: string | null
    },
    tx?: TransactionClient,
  ) {
    const client = tx ?? db
    const result = await client.insert(users).values(data).returning()
    return result[0] || null
  }

  static async createPrivacySettings(userId: string, tx?: TransactionClient) {
    const client = tx ?? db
    await client.insert(privacySettings).values({ userId })
  }

  static async findRecentResetToken(userId: string, since: Date, tx?: TransactionClient) {
    const client = tx ?? db
    const result = await client
      .select({ id: passwordResetTokens.id })
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.userId, userId), gt(passwordResetTokens.createdAt, since)))
      .limit(1)
    return result[0] || null
  }

  static async invalidateOldResetTokens(userId: string, now: Date, tx?: TransactionClient) {
    const client = tx ?? db
    await client
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)))
  }

  static async createResetToken(
    data: {
      userId: string
      tokenHash: string
      expiresAt: Date
    },
    tx?: TransactionClient,
  ) {
    const client = tx ?? db
    await client.insert(passwordResetTokens).values(data)
  }

  static async invalidateResetTokenByHash(tokenHash: string, now: Date, tx?: TransactionClient) {
    const client = tx ?? db
    await client
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)))
  }

  static async useResetToken(
    tokenHash: string,
    now: Date,
    tx?: TransactionClient,
  ): Promise<{ userId: string } | null> {
    const client = tx ?? db
    const result = await client
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      )
      .returning({ userId: passwordResetTokens.userId })
    return result[0] || null
  }

  static async updateUserPassword(userId: string, passwordHash: string, tx?: TransactionClient) {
    const client = tx ?? db
    await client.update(users).set({ passwordHash }).where(eq(users.id, userId))
  }

  static async invalidateRemainingResetTokens(userId: string, now: Date, tx?: TransactionClient) {
    const client = tx ?? db
    await client
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)))
  }

  static async transaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return db.transaction(fn)
  }
}
