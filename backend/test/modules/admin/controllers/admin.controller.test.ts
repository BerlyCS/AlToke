import { Elysia } from 'elysia'
import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'bun:test'
import { adminController } from '../../../../src/modules/admin/controllers'
import { db } from '../../../../src/db'
import { sql } from 'drizzle-orm'

const app = new Elysia().use(adminController)

const databaseAvailable = await db
  .execute(sql`select 1`)
  .then(() => true)
  .catch(() => false)

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000'

let targetUserId: string

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
): Promise<{ status: number; json: any }> {
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.headers = { 'content-type': 'application/json' }
    init.body = JSON.stringify(body)
  }
  const res = await app.handle(new Request(`http://localhost${path}`, init))
  const json = await res.json()
  return { status: res.status, json }
}

describe.skipIf(!databaseAvailable)('Admin Controller', () => {
  beforeAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE 'admin-test-ctrl-%'`)
    targetUserId = await createUser('admin-test-ctrl')
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
      const { status, json } = await request('GET', '/admin/metrics')
      expect(status).toBe(200)
      expect(json.status).toBe(200)
      expect(json.data).toBeDefined()
      expect(typeof json.data.totalUsers).toBe('number')
      expect(typeof json.data.activeUsersDaily).toBe('number')
      expect(typeof json.data.tasksCompletedToday).toBe('number')
      expect(typeof json.data.totalTasks).toBe('number')
    })
  })

  describe('GET /admin/users', () => {
    it('should return 200 with a list of users', async () => {
      const { status, json } = await request('GET', '/admin/users')
      expect(status).toBe(200)
      expect(json.status).toBe(200)
      expect(Array.isArray(json.data.users)).toBe(true)
      expect(typeof json.data.total).toBe('number')
    })

    it('should respect pagination parameters', async () => {
      const { status, json } = await request('GET', '/admin/users?limit=5&offset=0')
      expect(status).toBe(200)
      expect(json.data.limit).toBe(5)
      expect(json.data.offset).toBe(0)
      expect(json.data.users.length).toBeLessThanOrEqual(5)
    })

    it('should default to limit 10 and offset 0', async () => {
      const { json } = await request('GET', '/admin/users')
      expect(json.data.limit).toBe(10)
      expect(json.data.offset).toBe(0)
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
      const { status, json } = await request('POST', `/admin/users/${targetUserId}/ban`, {
        reason: 'Test ban',
      })
      expect(status).toBe(200)
      expect(json.status).toBe(200)
      expect(json.data.success).toBe(true)
      expect(json.data.userId).toBe(targetUserId)
    })

    it('should return 400 when the user is already banned', async () => {
      await request('POST', `/admin/users/${targetUserId}/ban`, {
        reason: 'First ban',
      })
      const { status, json } = await request('POST', `/admin/users/${targetUserId}/ban`, {
        reason: 'Second ban',
      })
      expect(status).toBe(400)
      expect(json.status).toBe(400)
      expect(json.error).toBe('User is already banned')
    })

    it('should return 404 when the user does not exist', async () => {
      const { status, json } = await request('POST', `/admin/users/${NON_EXISTENT_ID}/ban`, {
        reason: 'Test ban',
      })
      expect(status).toBe(404)
      expect(json.status).toBe(404)
      expect(json.error).toBe('User not found')
    })
  })

  describe('POST /admin/users/:id/unban', () => {
    it('should unban a banned user and return 200', async () => {
      await request('POST', `/admin/users/${targetUserId}/ban`, {
        reason: 'Ban to unban',
      })
      const { status, json } = await request('POST', `/admin/users/${targetUserId}/unban`)
      expect(status).toBe(200)
      expect(json.status).toBe(200)
      expect(json.data.success).toBe(true)
      expect(json.data.userId).toBe(targetUserId)
    })

    it('should return 404 when the user does not exist', async () => {
      const { status, json } = await request('POST', `/admin/users/${NON_EXISTENT_ID}/unban`)
      expect(status).toBe(404)
      expect(json.status).toBe(404)
      expect(json.error).toBe('User not found')
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
