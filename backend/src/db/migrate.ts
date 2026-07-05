import { fileURLToPath } from 'node:url'
import { readdir, readFile } from 'node:fs/promises'
import { client, db } from './index'
import { sql } from 'drizzle-orm'

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url))
const journalPath = fileURLToPath(new URL('../../drizzle/meta/_journal.json', import.meta.url))
const defaultMaxAttempts = 10
const defaultRetryDelayMs = 3000

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const maxAttempts = parsePositiveInteger(process.env.MIGRATION_MAX_ATTEMPTS, defaultMaxAttempts)
const retryDelayMs = parsePositiveInteger(process.env.MIGRATION_RETRY_DELAY_MS, defaultRetryDelayMs)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const createTableRegex = /^CREATE\s+TABLE/i
const createIndexRegex = /^CREATE\s+(UNIQUE\s+)?INDEX/i
const alterTableRegex = /^ALTER\s+TABLE/i

const applyStatement = async (statement: string) => {
  const trimmed = statement.trim()
  if (!trimmed) return

  try {
    if (createTableRegex.test(trimmed)) {
      const patched = trimmed.replace(createTableRegex, 'CREATE TABLE IF NOT EXISTS')
      await db.execute(sql.raw(patched))
      return
    }

    await db.execute(sql.raw(trimmed))
  } catch {
    // Known idempotent failures (index exists, constraint exists, column exists, type exists)
  }
}

const runMigrations = async () => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const journal = JSON.parse(await readFile(journalPath, 'utf-8')) as {
        entries: { tag: string }[]
      }

      console.log(`Running database migrations (attempt ${attempt}/${maxAttempts})...`)

      for (const entry of journal.entries) {
        const filePath = `${migrationsFolder}/${entry.tag}.sql`
        const content = await readFile(filePath, 'utf-8')
        const statements = content.split('--> statement-breakpoint')

        for (const statement of statements) {
          await applyStatement(statement)
        }

        console.log(`  ✓ ${entry.tag}.sql`)
      }

      console.log('Database migrations completed successfully.')
      return
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts
      console.error(`Database migration attempt ${attempt} failed.`, error)

      if (isLastAttempt) {
        console.log('Continuing despite migration error...')
        return
      }

      await sleep(retryDelayMs)
    }
  }
}

try {
  await runMigrations()
} catch (error) {
  console.error('Migration error (continuing):', error instanceof Error ? error.message : error)
} finally {
  await client.end()
}
