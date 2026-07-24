import { status } from 'elysia'
import { AuthRepository } from './repositories'
import type { AuthModel } from './model'
import { password as bunPassword } from 'bun'
import { OAuth2Client } from 'google-auth-library'
import { env } from '../../config/env'
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
    const existing = await AuthRepository.findUserByEmail(data.email)
    if (existing) {
      throw status(400, 'Email already in use' satisfies AuthModel['registerError'])
    }

    const hashedPassword = await bunPassword.hash(data.password)

    const user = await AuthRepository.createUser({
      email: data.email,
      passwordHash: hashedPassword,
      nickname: data.nickname,
    })

    await AuthRepository.createPrivacySettings(user!.id)

    await GamificationService.triggerAchievement(user!.id, 'first_login')

    return {
      id: user!.id,
      email: user!.email,
      nickname: user!.nickname,
      avatarUrl: user!.avatarUrl,
    }
  }

  static async login(data: AuthModel['loginBody']) {
    const user = await AuthRepository.findUserByEmail(data.email)

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

      const existingUser = await AuthRepository.findUserByEmail(payload.email)

      if (existingUser) {
        return {
          id: existingUser.id,
          email: existingUser.email,
          nickname: existingUser.nickname,
          avatarUrl: existingUser.avatarUrl,
        }
      }

      const newUser = await AuthRepository.createUser({
        email: payload.email,
        nickname: payload.name || null,
        avatarUrl: payload.picture || null,
      })

      await AuthRepository.createPrivacySettings(newUser!.id)

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
    const user = await AuthRepository.findUserByEmail(data.email)
    if (!user) return passwordResetResponse

    const now = new Date()
    const cooldownStart = new Date(now.getTime() - passwordResetCooldownMs)
    const recentRequest = await AuthRepository.findRecentResetToken(user.id, cooldownStart)

    if (recentRequest) return passwordResetResponse

    const token = randomBytes(32).toString('base64url')
    const tokenHash = hashResetToken(token)
    const expiresAt = new Date(now.getTime() + passwordResetTtlMs)

    await AuthRepository.transaction(async (tx) => {
      await AuthRepository.invalidateOldResetTokens(user.id, now, tx)
      await AuthRepository.createResetToken({ userId: user.id, tokenHash, expiresAt }, tx)
    })

    try {
      await EmailService.sendPasswordReset(user.email, token)
    } catch (error) {
      await AuthRepository.invalidateResetTokenByHash(tokenHash, new Date())
      console.error('PASSWORD RESET EMAIL ERROR:', error)
    }

    return passwordResetResponse
  }

  static async resetPassword(data: AuthModel['resetPasswordBody']) {
    const tokenHash = hashResetToken(data.token)
    const now = new Date()
    const hashedPassword = await bunPassword.hash(data.password)

    const reset = await AuthRepository.transaction(async (tx) => {
      const resetToken = await AuthRepository.useResetToken(tokenHash, now, tx)

      if (!resetToken) return false

      await AuthRepository.updateUserPassword(resetToken.userId, hashedPassword, tx)
      await AuthRepository.invalidateRemainingResetTokens(resetToken.userId, now, tx)

      return true
    })

    if (!reset) {
      throw status(400, 'Invalid or expired reset link' satisfies AuthModel['resetPasswordError'])
    }

    return { message: 'Password updated successfully.' } as const
  }
}
