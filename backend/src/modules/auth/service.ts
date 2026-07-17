import { status } from 'elysia'
import { db } from '../../db'
import { users, privacySettings, passwordResetTokens } from '../../db/schema'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { env } from '../../config/env'
import type { AuthModel } from './model'
import { password as bunPassword } from 'bun'
import { OAuth2Client } from 'google-auth-library'
import { GamificationService } from '../gamification/services'
import { createHash, randomBytes } from 'node:crypto'
import { EmailService } from '../email/email.service'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)
const passwordResetTtlMs = 30 * 60 * 1000
const passwordResetCooldownMs = 60 * 1000
const passwordResetResponse = {
  message: 'If an account exists, we sent password instructions.',
} as const

const hashResetToken = (token: string) => createHash('sha256').update(token).digest('hex')

export abstract class AuthService {
  static async register(data: AuthModel['registerBody']) {
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
    if (existing.length > 0) {
      throw status(400, 'Email already in use' satisfies AuthModel['registerError'])
    }

    const hashedPassword = await bunPassword.hash(data.password)

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: hashedPassword,
        nickname: data.nickname,
      })
      .returning()

    await db.insert(privacySettings).values({
      userId: user!.id,
    })

    await GamificationService.triggerAchievement(user!.id, 'first_login')

    return {
      id: user!.id,
      email: user!.email,
      nickname: user!.nickname,
      avatarUrl: user!.avatarUrl,
    }
  }

  static async login(data: AuthModel['loginBody']) {
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1)

    if (!user || !user.passwordHash) {
      throw status(401, 'Invalid credentials' satisfies AuthModel['authError'])
    }

    const isValid = await bunPassword.verify(data.password, user.passwordHash)
    if (!isValid) {
      throw status(401, 'Invalid credentials' satisfies AuthModel['authError'])
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
    }
  }

  static async googleLogin(data: AuthModel['googleLoginBody']) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: data.idToken,
        audience: env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()

      if (!payload || !payload.email) {
        throw status(401, 'Invalid credentials' satisfies AuthModel['authError'])
      }

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, payload.email))
        .limit(1)

      if (existingUser) {
        return {
          id: existingUser.id,
          email: existingUser.email,
          nickname: existingUser.nickname,
          avatarUrl: existingUser.avatarUrl,
        }
      }

      const [newUser] = await db
        .insert(users)
        .values({
          email: payload.email,
          nickname: payload.name || null,
          avatarUrl: payload.picture || null,
        })
        .returning()

      await db.insert(privacySettings).values({
        userId: newUser!.id,
      })

      return {
        id: newUser!.id,
        email: newUser!.email,
        nickname: newUser!.nickname,
        avatarUrl: newUser!.avatarUrl,
      }
    } catch (error) {
      console.error('GOOGLE LOGIN ERROR:', error)
      throw status(401, 'Invalid credentials' satisfies AuthModel['authError'])
    }
  }

  static async requestPasswordReset(data: AuthModel['forgotPasswordBody']) {
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
    if (!user) return passwordResetResponse

    const now = new Date()
    const cooldownStart = new Date(now.getTime() - passwordResetCooldownMs)
    const [recentRequest] = await db
      .select({ id: passwordResetTokens.id })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          gt(passwordResetTokens.createdAt, cooldownStart),
        ),
      )
      .limit(1)

    if (recentRequest) return passwordResetResponse

    const token = randomBytes(32).toString('base64url')
    const tokenHash = hashResetToken(token)
    const expiresAt = new Date(now.getTime() + passwordResetTtlMs)

    await db.transaction(async (tx) => {
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)))

      await tx.insert(passwordResetTokens).values({ userId: user.id, tokenHash, expiresAt })
    })

    try {
      await EmailService.sendPasswordReset(user.email, token)
    } catch (error) {
      // Do not leave a cooldown token behind when the message could not be delivered.
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(
          and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)),
        )
      console.error('PASSWORD RESET EMAIL ERROR:', error)
    }

    return passwordResetResponse
  }

  static async resetPassword(data: AuthModel['resetPasswordBody']) {
    const tokenHash = hashResetToken(data.token)
    const now = new Date()
    const hashedPassword = await bunPassword.hash(data.password)

    const reset = await db.transaction(async (tx) => {
      const [resetToken] = await tx
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

      if (!resetToken) return false

      await tx
        .update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.id, resetToken.userId))
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(
          and(
            eq(passwordResetTokens.userId, resetToken.userId),
            isNull(passwordResetTokens.usedAt),
          ),
        )

      return true
    })

    if (!reset) {
      throw status(400, 'Invalid or expired reset link' satisfies AuthModel['resetPasswordError'])
    }

    return { message: 'Password updated successfully.' } as const
  }
}
