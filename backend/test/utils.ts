import { treaty } from '@elysiajs/eden'
import { app, type App } from '../src/index'

export const api = treaty<App>(app)

export async function createTestUserAndLogin() {
  const email = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`
  const password = 'password123'

  await api.api.auth.register.post({
    email,
    password,
    nickname: 'TestUser',
  })

  const { data, error } = await api.api.auth.login.post({
    email,
    password,
  })

  if (error || !data) {
    throw new Error('Failed to create test user')
  }

  return {
    email,
    token: data.token,
    userId: data.user.id,
  }
}
