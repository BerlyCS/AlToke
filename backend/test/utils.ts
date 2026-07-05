import { treaty } from '@elysiajs/eden'
import { sql } from 'drizzle-orm'
import { app, type App } from '../src/index'
import { db } from '../src/db'

export const api = treaty<App>(app)

let databaseAvailabilityPromise: Promise<boolean> | undefined

export function isDatabaseAvailable() {
  databaseAvailabilityPromise ??= db
    .execute(sql`select 1`)
    .then(() => true)
    .catch(() => false)

  return databaseAvailabilityPromise
}

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
