import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'bun:test'
import { adminController } from '../../../../../src/modules/admin/controllers'
import { db } from '../../../../../src/db'
import { sql } from 'drizzle-orm'
import { resolveJwtSecret } from '../../../../../src/shared/auth/jwt-secret'

process.env.JWT_SECRET = 'test-admin-ctrl-secret'

const app = new Elysia().use(adminController)

const databaseAvailable = await db
  .execute(sql`select 1`)
  .then(() => true)
  .catch(() => false)

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000'

let targetUserId: string
let adminToken: string

const createToken = async (userId: string) => {
  const signer = new Elysia()
    .use(jwt({ name: 'jwt', secret: resolveJwtSecret() }))
    .get('/sign', async ({ jwt }) => {
      return await jwt.sign({ id: userId })
    })

  const res = await signer.handle(new Request('http://localhost/sign'))
  return (await res.text()) as string
}

async function createUser(emailPrefix: string): Promise<string> {
  const result = await db.execute(sql`
    INSERT INTO users (id, email, password_hash, nickname, role)
    VALUES (
      gen_random_uuid(),
      ${emailPrefix + '-' + Date.now() + '@test.com'},
      'hash',
      'Test User',
      'USER'
    )
    RETURNING id
  `)
  return result[0]?.id as string
}

async function request(
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<{ status: number; json: any; text: string }> {
  const headers: Record<string, string> = {}
  if (body !== undefined) {
    headers['content-type'] = 'application/json'
  }
  if (token) {
    headers['authorization'] = `Bearer ${token}`
  }
  const init: RequestInit = {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }
  const res = await app.handle(new Request(`http://localhost${path}`, init))
  const text = await res.text()
  const contentType = res.headers.get('content-type') || ''
  let json: any = undefined
  if (contentType.includes('application/json')) {
    try {
      json = JSON.parse(text)
    } catch {}
  }
  return { status: res.status, json, text }
}

describe.skipIf(!databaseAvailable)('Admin Controller', () => {
  beforeAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE 'admin-test-ctrl-%'`)
    targetUserId = await createUser('admin-test-ctrl')
    adminToken = await createToken(targetUserId)
  })

  afterAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE 'admin-test-ctrl-%'`)
  })

  beforeEach(async () => {
    await db.execute(sql`
      UPDATE users SET role = 'USER' WHERE id = ${targetUserId}
    `)
  })

  describe('GET /admin/metrics', () => {
    it('should return 200 with metrics data', async () => {
      const { status, json } = await request('GET', '/admin/metrics', undefined, adminToken)
      expect(status).toBe(200)
      expect(typeof json.totalUsers).toBe('number')
      expect(typeof json.activeUsersDaily).toBe('number')
      expect(typeof json.tasksCompletedToday).toBe('number')
      expect(typeof json.totalTasks).toBe('number')
    })

    it('should return 401 without auth token', async () => {
      const { status } = await request('GET', '/admin/metrics')
      expect(status).toBe(401)
    })
  })

  describe('GET /admin/users', () => {
    it('should return 200 with a list of users', async () => {
      const { status, json } = await request('GET', '/admin/users', undefined, adminToken)
      expect(status).toBe(200)
      expect(Array.isArray(json.users)).toBe(true)
      expect(typeof json.total).toBe('number')
    })

    it('should respect pagination parameters', async () => {
      const { status, json } = await request(
        'GET',
        '/admin/users?limit=5&offset=0',
        undefined,
        adminToken,
      )
      expect(status).toBe(200)
      expect(json.limit).toBe(5)
      expect(json.offset).toBe(0)
      expect(json.users.length).toBeLessThanOrEqual(5)
    })

    it('should default to limit 10 and offset 0', async () => {
      const { json } = await request('GET', '/admin/users', undefined, adminToken)
      expect(json.limit).toBe(10)
      expect(json.offset).toBe(0)
    })
  })

  describe('GET /admin/users/:id', () => {
    it('should return 200 with user details for an existing user', async () => {
      const { status, json } = await request('GET', `/admin/users/${targetUserId}`)
      expect(status).toBe(200)
      expect(json.status).toBe(200)
      expect(json.data.userId).toBe(targetUserId)
    })

    it('should return 404 for a non-existent user', async () => {
      const { status, json } = await request('GET', `/admin/users/${NON_EXISTENT_ID}`)
      expect(status).toBe(404)
      expect(json.status).toBe(404)
      expect(json.error).toBe('User not found')
    })
  })

  describe('POST /admin/users/:id/ban', () => {
    it('should ban a user and return 200', async () => {
      const { status, json } = await request('POST', `/admin/users/${targetUserId}/ban`)
      expect(status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.userId).toBe(targetUserId)
    })

    it('should return error when the user is already banned', async () => {
      await request('POST', `/admin/users/${targetUserId}/ban`)
      const { status } = await request('POST', `/admin/users/${targetUserId}/ban`)
      expect(status).not.toBe(200)
    })

    it('should return error when the user does not exist', async () => {
      const { status } = await request('POST', `/admin/users/${NON_EXISTENT_ID}/ban`)
      expect(status).not.toBe(200)
    })
  })

  describe('POST /admin/users/:id/unban', () => {
    it('should unban a banned user and return 200', async () => {
      await request('POST', `/admin/users/${targetUserId}/ban`)
      const { status, json } = await request('POST', `/admin/users/${targetUserId}/unban`)
      expect(status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.userId).toBe(targetUserId)
    })

    it('should return error when the user does not exist', async () => {
      const { status } = await request('POST', `/admin/users/${NON_EXISTENT_ID}/unban`)
      expect(status).not.toBe(200)
    })
  })

  describe('POST /admin/users/:id/moderate', () => {
    it('should moderate a user profile and return 200', async () => {
      const { status, json } = await request('POST', `/admin/users/${targetUserId}/moderate`, {
        nickname: 'Moderated User',
        bio: 'Moderated bio',
        avatarUrl: 'https://example.com/avatar.png',
        reason: 'Test moderation',
      })
      expect(status).toBe(200)
      expect(json.status).toBe(200)
      expect(json.data.success).toBe(true)
      expect(json.data.userId).toBe(targetUserId)
    })

    it('should return 404 when the user does not exist', async () => {
      const { status, json } = await request('POST', `/admin/users/${NON_EXISTENT_ID}/moderate`, {
        reason: 'Test moderation',
      })
      expect(status).toBe(404)
      expect(json.status).toBe(404)
      expect(json.error).toBe('User not found')
    })
  })
})
