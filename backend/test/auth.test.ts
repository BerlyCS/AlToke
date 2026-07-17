import { describe, expect, it, spyOn } from 'bun:test'
import { createHash, randomBytes } from 'node:crypto'
import { api, isDatabaseAvailable } from './utils'
import { db } from '../src/db'
import { passwordResetTokens, users } from '../src/db/schema'
import { EmailService } from '../src/modules/email/email.service'
import { eq } from 'drizzle-orm'

const testUserEmail = `auth-test-${Date.now()}@example.com`
const databaseAvailable = await isDatabaseAvailable()

describe.skipIf(!databaseAvailable)('Auth API', () => {
  it('should register a new user', async () => {
    const { data, error, status } = await api.api.auth.register.post({
      email: testUserEmail,
      password: 'password123',
      nickname: 'AuthUser',
    })
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.token).toBeDefined()
    expect(data?.user?.email).toBe(testUserEmail)
  })

  it('should login the user', async () => {
    const { data, error, status } = await api.api.auth.login.post({
      email: testUserEmail,
      password: 'password123',
    })
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.token).toBeDefined()
  })

  it('returns the same response for unknown and existing addresses', async () => {
    const sendPasswordReset = spyOn(EmailService, 'sendPasswordReset').mockResolvedValue(undefined)

    const unknown = await api.api.auth['forgot-password'].post({
      email: `unknown-${Date.now()}@example.com`,
    })
    const existing = await api.api.auth['forgot-password'].post({ email: testUserEmail })

    expect(unknown.status).toBe(200)
    expect(existing.status).toBe(200)
    expect(existing.data).toEqual(unknown.data)
    expect(sendPasswordReset).toHaveBeenCalledWith(testUserEmail, expect.any(String))
    sendPasswordReset.mockRestore()
  })

  it('sets a password for an account without one and consumes its token', async () => {
    const email = `google-reset-${Date.now()}@example.com`
    const [user] = await db.insert(users).values({ email, nickname: 'Google user' }).returning()
    const token = randomBytes(32).toString('base64url')
    const tokenHash = createHash('sha256').update(token).digest('hex')

    await db.insert(passwordResetTokens).values({
      userId: user!.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    })

    const reset = await api.api.auth['reset-password'].post({ token, password: 'new-password123' })
    expect(reset.status).toBe(200)
    expect(reset.data?.message).toBe('Password updated successfully.')

    const login = await api.api.auth.login.post({ email, password: 'new-password123' })
    expect(login.status).toBe(200)
    expect(login.data?.token).toBeDefined()

    const [storedToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
    expect(storedToken?.usedAt).toBeDefined()

    const reused = await api.api.auth['reset-password'].post({
      token,
      password: 'another-password123',
    })
    expect(reused.status).toBe(400)
  })
})
