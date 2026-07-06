import { describe, expect, it } from 'bun:test'
import { api, isDatabaseAvailable } from './utils'

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
})
