import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'bun:test'
import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { userRoutes } from '../../../../../src/modules/user'
import { db } from '../../../../../src/db'
import { sql } from 'drizzle-orm'
import { resolveJwtSecret } from '../../../../../src/shared/auth/jwt-secret'

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret'

const app = new Elysia().use(userRoutes)

const databaseAvailable = await db
  .execute(sql`select 1`)
  .then(() => true)
  .catch(() => false)

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000'
const TEST_EMAIL_PREFIX = 'user-ctrl-test-'

const createToken = async (userId: string) => {
  const signer = new Elysia()
    .use(jwt({ name: 'jwt', secret: resolveJwtSecret() }))
    .get('/sign', async ({ jwt }) => {
      return await jwt.sign({ id: userId })
    })

  const res = await signer.handle(new Request('http://localhost/sign'))
  return (await res.text()) as string
}

async function request(
  method: string,
  path: string,
  options?: { token?: string; body?: unknown },
): Promise<{ status: number; json: any }> {
  const init: RequestInit = { method }
  const headers: Record<string, string> = {}
  if (options?.body !== undefined) {
    headers['content-type'] = 'application/json'
    init.body = JSON.stringify(options.body)
  }
  if (options?.token) {
    headers['authorization'] = `Bearer ${options.token}`
  }
  if (Object.keys(headers).length > 0) init.headers = headers

  const res = await app.handle(new Request(`http://localhost${path}`, init))
  const text = await res.text()
  let json: any
  try {
    json = text ? JSON.parse(text) : undefined
  } catch {
    json = text
  }
  return { status: res.status, json }
}

describe.skipIf(!databaseAvailable)('User Controller', () => {
  let testUserId: string
  let testEmail: string
  let token: string

  beforeAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE ${TEST_EMAIL_PREFIX + '%'}`)
    await db.execute(sql`DELETE FROM privacy_settings WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE ${TEST_EMAIL_PREFIX + '%'}
    )`)

    const result = await db.execute(sql`
      INSERT INTO users (id, email, password_hash, nickname, bio, avatar_url, role, level, xp)
      VALUES (
        gen_random_uuid(),
        ${TEST_EMAIL_PREFIX + Date.now() + '@test.com'},
        'hash',
        'Ctrl Test User',
        'Original bio',
        'https://example.com/original.png',
        'USER',
        3,
        500
      )
      RETURNING id, email
    `)

    testUserId = result[0]?.id as string
    testEmail = result[0]?.email as string
    token = await createToken(testUserId)

    await db.execute(sql`
      INSERT INTO privacy_settings (user_id, show_level, show_streak, show_achievements)
      VALUES (${testUserId}, true, true, true)
      ON CONFLICT (user_id) DO NOTHING
    `)
  })

  afterAll(async () => {
    await db.execute(sql`DELETE FROM privacy_settings WHERE user_id = ${testUserId}`)
    await db.execute(sql`DELETE FROM users WHERE id = ${testUserId}`)
  })

  beforeEach(async () => {
    await db.execute(sql`
      UPDATE users
      SET nickname = 'Ctrl Test User', bio = 'Original bio', avatar_url = 'https://example.com/original.png'
      WHERE id = ${testUserId}
    `)
    await db.execute(sql`
      INSERT INTO privacy_settings (user_id, show_level, show_streak, show_achievements)
      VALUES (${testUserId}, true, true, true)
      ON CONFLICT (user_id) DO UPDATE SET show_level = true, show_streak = true, show_achievements = true
    `)
  })

  describe('GET /users/me', () => {
    it('should reject unauthenticated access', async () => {
      const { status } = await request('GET', '/users/me')
      expect(status).toBe(401)
    })

    it('should reject an invalid bearer token', async () => {
      const { status } = await request('GET', '/users/me', { token: 'not-a-valid-token' })
      expect(status).toBe(401)
    })

    it('should return the authenticated user profile', async () => {
      const { status, json } = await request('GET', '/users/me', { token })
      expect(status).toBe(200)
      expect(json.id).toBe(testUserId)
      expect(json.email).toBe(testEmail)
      expect(json.nickname).toBe('Ctrl Test User')
    })
  })

  describe('GET /users/profile', () => {
    it('should return the profile for an authenticated user', async () => {
      const { status, json } = await request('GET', '/users/profile', { token })
      expect(status).toBe(200)
      expect(json.id).toBe(testUserId)
      expect(json.email).toBe(testEmail)
    })
  })

  describe('PATCH /users/me', () => {
    it('should update the nickname', async () => {
      const { status, json } = await request('PATCH', '/users/me', {
        token,
        body: { nickname: 'Patched Nickname' },
      })
      expect(status).toBe(200)
      expect(json.nickname).toBe('Patched Nickname')
    })

    it('should update bio and avatarUrl', async () => {
      const { status, json } = await request('PATCH', '/users/me', {
        token,
        body: { bio: 'Patched bio', avatarUrl: 'https://example.com/patched.png' },
      })
      expect(status).toBe(200)
      expect(json.bio).toBe('Patched bio')
      expect(json.avatarUrl).toBe('https://example.com/patched.png')
    })

    it('should reject unauthenticated updates', async () => {
      const { status } = await request('PATCH', '/users/me', {
        body: { nickname: 'Anonymous' },
      })
      expect(status).toBe(401)
    })
  })

  describe('PATCH /users/profile', () => {
    it('should update the profile', async () => {
      const { status, json } = await request('PATCH', '/users/profile', {
        token,
        body: { nickname: 'Profile Patched' },
      })
      expect(status).toBe(200)
      expect(json.nickname).toBe('Profile Patched')
    })
  })

  describe('PATCH /users/profile/privacy', () => {
    it('should update privacy settings', async () => {
      const { status, json } = await request('PATCH', '/users/profile/privacy', {
        token,
        body: { showLevel: false, showStreak: false, showAchievements: false },
      })
      expect(status).toBe(200)
      expect(json.privacy).toBeDefined()
      expect(json.privacy.showLevel).toBe(false)
      expect(json.privacy.showStreak).toBe(false)
      expect(json.privacy.showAchievements).toBe(false)
    })

    it('should hide level and streak on the public profile', async () => {
      await request('PATCH', '/users/profile/privacy', {
        token,
        body: { showLevel: false, showStreak: false },
      })

      const { status, json } = await request('GET', `/users/profile/${testUserId}`)
      expect(status).toBe(200)
      expect(json.level).toBeNull()
      expect(json.currentStreak).toBeNull()
      expect(json.maxStreak).toBeNull()
    })
  })

  describe('GET /users/profile/:id', () => {
    it('should return the public profile of an existing user', async () => {
      const { status, json } = await request('GET', `/users/profile/${testUserId}`)
      expect(status).toBe(200)
      expect(json.id).toBe(testUserId)
      expect(json.nickname).toBe('Ctrl Test User')
    })

    it('should return 404 for a non-existent user', async () => {
      const { status } = await request('GET', `/users/profile/${NON_EXISTENT_ID}`)
      expect(status).toBe(404)
    })
  })
})
