import { describe, expect, it } from 'bun:test'

process.env.JWT_SECRET = 'test-jwt-secret'
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/altoke'

const getApp = async () => {
  const module = await import('../../../src/index')
  return module.app
}

describe('notification module mounting', () => {
  it('mounts notification routes under /api', async () => {
    const app = await getApp()
    const response = await app.handle(new Request('http://localhost/api/notifications/settings'))

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })
})
