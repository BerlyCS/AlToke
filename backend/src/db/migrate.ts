import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { fileURLToPath } from 'node:url'
import { client, db } from './index'

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url))
const defaultMaxAttempts = 10
const defaultRetryDelayMs = 3000

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const maxAttempts = parsePositiveInteger(process.env.MIGRATION_MAX_ATTEMPTS, defaultMaxAttempts)
const retryDelayMs = parsePositiveInteger(process.env.MIGRATION_RETRY_DELAY_MS, defaultRetryDelayMs)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const runMigrations = async () => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`Running database migrations (attempt ${attempt}/${maxAttempts})...`)
      await migrate(db, { migrationsFolder })
      console.log('Database migrations completed successfully.')
      return
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts

      console.error(`Database migration attempt ${attempt} failed.`, error)

      if (isLastAttempt) {
        throw error
      }

      await sleep(retryDelayMs)
    }
  }
}

try {
  await runMigrations()
} finally {
  await client.end()
}
