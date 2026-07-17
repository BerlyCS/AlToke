import { sql } from 'drizzle-orm'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { client, db } from './index'

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url))
const journalPath = fileURLToPath(new URL('../../drizzle/meta/_journal.json', import.meta.url))

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const errorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return String(error)
  const cause = 'cause' in error ? error.cause : undefined
  return cause ? `${error.message}: ${errorMessage(cause)}` : error.message
}

const runStatement = async (statement: string) => {
  const trimmed = statement.trim()
  if (!trimmed) return

  if (/^CREATE\s+TABLE\b/i.test(trimmed)) {
    const patched = trimmed.replace(/^CREATE\s+TABLE\b/i, 'CREATE TABLE IF NOT EXISTS')
    await db.execute(sql.raw(patched))
    return
  }

  try {
    await db.execute(sql.raw(trimmed))
  } catch (e) {
    const msg = errorMessage(e)
    if (msg.includes('already exists') || msg.includes('duplicate')) return
    throw e
  }
}

const runMigrations = async () => {
  let connected = false

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const journal = JSON.parse(await readFile(journalPath, 'utf-8')) as {
        entries: { tag: string }[]
      }

      if (!connected) {
        console.log('Running database migrations...')
        connected = true
      }

      for (const entry of journal.entries) {
        const content = await readFile(`${migrationsFolder}/${entry.tag}.sql`, 'utf-8')
        const statements = content.split('--> statement-breakpoint')

        for (const statement of statements) {
          await runStatement(statement)
        }
      }

      console.log('Database migrations completed successfully.')
      return
    } catch (error) {
      const msg = errorMessage(error)

      if (
        msg.includes('ECONNREFUSED') ||
        msg.includes('Connection terminated') ||
        msg.includes('SASL')
      ) {
        console.log(`PostgreSQL not ready (attempt ${attempt}/30), retrying...`)
        await sleep(2000)
        continue
      }

      throw new Error(`Migration failed: ${msg}`, { cause: error })
    }
  }

  throw new Error('PostgreSQL did not become available after 30 attempts')
}

try {
  await runMigrations()
} finally {
  await client.end()
}
